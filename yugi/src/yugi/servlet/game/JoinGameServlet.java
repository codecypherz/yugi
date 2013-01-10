package yugi.servlet.game;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

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
import yugi.service.GameService;
import yugi.servlet.ResponseStatusCode;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;

/**
 * Servlet responsible for joining games.
 */
public class JoinGameServlet extends HttpServlet {
	
	private static final long serialVersionUID = -2913910228648599370L;
	private static final Logger logger = Logger.getLogger(JoinGameServlet.class.getName());
	
	private static final ChannelService channelService = ChannelServiceFactory.getChannelService();
	private static final GameService gameService = GameService.getInstance();
	
	public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException {
		
		// To join the game, you must have the game key of the game to join and
		// specify the name you desire as a player.
		String gameKey = Config.getGameKey(req);
		String playerName = Config.getPlayerName(req);
		
		// Make sure the parameters were passed and valid.
		if (gameKey == null || playerName == null) {
			res.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}
		
		// Get the existing client ID, if one exists.
		String existingClientId = getPlayerClientId(req);
		
		// See if the game exists, then join it.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		GameSession game = null;
		String clientId = null;
		try {

			// TODO This lookup will fail if a user refreshes the page while
			// waiting for another player to join.  A better way to solve this
			// might be to just delay game destruction on player disconnect.  If
			// we do this, then we'll have to flag the game to not be destroyed
			// once a reconnect happens.
			game = gameService.getGame(pm, gameKey);
			if (game == null) {
				res.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
				return;
			}
			
			// See if the player is reconnecting.
			if (isReconnecting(existingClientId, game)) {
				logger.info("Player " + playerName +
						" is reconnecting to " + game.getKeyAsString());
				clientId = existingClientId;
			} else {
				
				// The player is not reconnecting, just doing a simple join.
				
				// Make sure the game is not full.
				if (isGameFull(game)) {
					logger.warning("Player " + playerName + " tried to join " +
							"the game with game key = " + gameKey + ", but it was full.");
					// TODO Write an error page.  Don't redirect to the landing.
					redirectWithError(req, res, Config.Error.GAME_FULL, game);
					return;
				}
				
				// Join the game and get the player ID that was generated.
				clientId = join(game, playerName);
				
				// Save the game since the state changed.
				pm.makePersistent(game);
				logger.info("Finished saving the game.");
			}
		} finally {
			pm.close();
		}
		
		// Double check that the client ID was set.
		if (clientId == null) {
			logger.severe("Failed to set the client ID");
			res.setStatus(ResponseStatusCode.INTERNAL_SERVER_ERROR.getCode());
			return;
		}
		
		// Create the channel token to be used for this client.
		String channelToken = channelService.createChannel(clientId);
		
		// Write the response back to the client.
	    Map<HtmlParam, String> paramMap = new HashMap<HtmlParam, String>();
		paramMap.put(HtmlParam.GAME_KEY, game.getKeyAsString());
		paramMap.put(HtmlParam.CHANNEL_TOKEN, channelToken);
		paramMap.put(HtmlParam.PLAYER_NAME, playerName);
		
		res.addCookie(new Cookie(CookieName.PLAYER_ID.name(), clientId));
		
		ServletUtil.writeScreen(req, res, Screen.GAME, paramMap);
	}
	
	/**
	 * Checks to see if the player identified by the client ID is reconnecting
	 * to the given game.
	 * @param clientId The client ID of the potentially reconnecting player.
	 * @param game The game to check against.
	 * @return True if the client is reconnecting.
	 */
	private boolean isReconnecting(String clientId, GameSession game) {
		if (clientId == null) {
			return false;
		} else {
			// Reconnecting if the client ID equals either existing one.
			return clientId.equals(game.getPlayer1ClientId()) ||
					clientId.equals(game.getPlayer2ClientId());
		}
	}
	
	/**
	 * Checks to see if the game is full.
	 * @param game The game to check.
	 * @return True if the game is full, false otherwise.
	 */
	private boolean isGameFull(GameSession game) {
		return game.getPlayer1ClientId() != null &&
				game.getPlayer2ClientId() != null;
	}
	
	/**
	 * Joins the game and returns the player's client ID.
	 * @param game The game.
	 * @param playerName The name of the player.
	 * @return The generated client ID.
	 */
	private String join(GameSession game, String playerName) {
		
		String gameKey = game.getKeyAsString();
		if (game.getPlayer1ClientId() == null) {
			logger.info("Player " + playerName + " joined as player 1.");
			String clientId = gameKey + "1";
			game.setPlayer1(playerName);
			game.setPlayer1ClientId(clientId);
			return clientId;
		} else if (game.getPlayer2ClientId() == null) {
			logger.info("Player " + playerName + " joined as player 2.");
			String clientId = gameKey + "2";
			game.setPlayer2(playerName);
			game.setPlayer2ClientId(clientId);
			return clientId;
		}
		
		// Error condition.
		return null;
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
