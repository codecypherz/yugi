package yugi.servlet.game;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.Config.CookieName;
import yugi.Config.HtmlParam;
import yugi.PMF;
import yugi.Screen;
import yugi.model.GameSession;
import yugi.servlet.ResponseStatusCode;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;
import com.google.appengine.api.datastore.KeyFactory;

/**
 * Servlet responsible for joining games.
 */
public class JoinGameServlet extends HttpServlet {

	private static final long serialVersionUID = -2913910228648599370L;
	private static final Logger logger = Logger.getLogger(JoinGameServlet.class.getName());

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		// To join the game, you must have the game key of the game to join and
		// specify the name you desire as a player.
		String gameKey = Config.getGameKey(req);
		String playerName = Config.getPlayerName(req);

		// Make sure the parameters were passed and valid.
		if (gameKey == null || playerName == null) {
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}

		// See if the game exists, then join it.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		GameSession game = null;
		String playerClientId = null;
		try {

			// TODO This lookup will fail if a user refreshes the page while
			// waiting for another player to join.  A better way to solve this
			// might be to just delay game destruction on player disconnect.  If
			// we do this, then we'll have to flag the game to not be destroyed
			// once a reconnect happens.
			game = pm.getObjectById(GameSession.class, KeyFactory.stringToKey(gameKey));

			// Get the player's ID in the cookie, if it has one.
			playerClientId = getPlayerClientId(req);
			
			if (playerClientId == null) {
				
				// If the player has no player ID, then they are a new participant.
				playerClientId = join(game, gameKey, playerName);
				
			} else {
				
				// If the player has an ID, then it could be from another game or
				// from this game.  First, check to see if the player is just joining
				// the same game again, otherwise check for an open spot and update
				// the player's ID.
				
				if (playerClientId.equals(game.getPlayer1ClientId()) ||
					playerClientId.equals(game.getPlayer2ClientId())) {
					
					// The player is already in the game, so they are
					// reconnecting.  Game synchronization is kicked off once
					// the ConnectedHandler is notified of the channel being
					// established with the reconnected player.
					logger.info("Player " + playerName + " rejoined their game.");
					
				} else {
					
					// The player is not in the game, so try to join it and get
					// a different ID.  This is the common case where a user has
					// played a game in the past and is trying to play a new game.
					playerClientId = join(game, gameKey, playerName);
				}
			}
		} catch (JDOObjectNotFoundException e) {
			logger.log(Level.SEVERE, "Could not find the game", e);
			redirectWithError(req, resp, Config.Error.GAME_NOT_FOUND, game);
			return;
		} catch (GameFullException gfe) {
			logger.warning("Player " + playerName + " tried to join " +
					"the game with game key = " + gameKey + ", but it was full.");
			redirectWithError(req, resp, Config.Error.GAME_FULL, game);
			return;
		} finally {
			pm.close();
		}

		// Create the channel token to be used for this client.
		ChannelService channelService = ChannelServiceFactory.getChannelService();
		String channelToken = channelService.createChannel(playerClientId);

		// Write the response back to the client.
	    Map<HtmlParam, String> paramMap = new HashMap<HtmlParam, String>();
		paramMap.put(HtmlParam.GAME_KEY, KeyFactory.keyToString(game.getKey()));
		paramMap.put(HtmlParam.CHANNEL_TOKEN, channelToken);
		paramMap.put(HtmlParam.PLAYER_NAME, playerName);
		
		resp.addCookie(new Cookie(CookieName.PLAYER_ID.name(), playerClientId));
		
		ServletUtil.writeScreen(req, resp, Screen.GAME, paramMap);
	}
	
	/**
	 * Tries to let the player with the given name join the game.  It is assumed
	 * that the player has not already joined the game.
	 * @param game The game to join.
	 * @param gameKey The game's key as a string.
	 * @param playerName The name with which to join the game.
	 * @return The player's generated ID for the game.
	 * @throws GameFullException Thrown if the game is already full.
	 */
	private String join(GameSession game, String gameKey, String playerName)
	throws GameFullException{
		
		String playerClientId = null;
		
		if (game.getPlayer1() == null) {
			game.setPlayer1(playerName);
			playerClientId = gameKey + "1";
			logger.info("Player " + playerName + " joined as player 1.");
			game.setPlayer1ClientId(playerClientId);
		} else if (game.getPlayer2() == null) {
			game.setPlayer2(playerName);
			playerClientId = gameKey + "2";
			logger.info("Player " + playerName + " joined as player 2.");
			game.setPlayer2ClientId(playerClientId);
		}
		
		// The game is considered full if a player ID was not assigned.
		if (playerClientId == null) {
			throw new GameFullException();
		}
		
		// The player joined successfully because they now have a player ID for this game.
		return playerClientId;
	}
	
	/**
	 * Gets the player's client ID from their cookie.
	 * @param req The request from which to fetch the cookie.
	 * @return The player's ID, if found.
	 */
	private String getPlayerClientId(HttpServletRequest req) {
		Cookie[] cookies = req.getCookies();
		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if (cookie.getName().equalsIgnoreCase(CookieName.PLAYER_ID.name())) {
					return cookie.getValue();
				}
			}
		}
		return null;
	}
	
	/**
	 * The exception thrown if there is an attempt to join a game that is full. 
	 */
	private class GameFullException extends Exception {
		private static final long serialVersionUID = -8868716127385908827L;
	}
	
	/**
	 * Redirects the client back to the landing page with the given error.
	 * @param resp The response that will be redirected.
	 * @param error The error that occurred.
	 * @param game The game that might or might not have been looked up.
	 * @throws IOException Thrown if the redirect fails.
	 */
	private void redirectWithError(HttpServletRequest req, HttpServletResponse resp,
			Config.Error error, GameSession game)
	throws IOException {
		
		Map<Config.UrlParameter, String> params = new HashMap<Config.UrlParameter, String>();
		params.put(Config.UrlParameter.ERROR, error.name());
		if (game != null) {
			params.put(Config.UrlParameter.GAME_NAME, game.getName());	
		}
		resp.sendRedirect(ServletUtil.createUrl(req, Config.Servlet.LANDING, params));
	}
}
