package yugi.servlet.connection;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.PMF;
import yugi.message.DisconnectedMessage;
import yugi.model.GameSession;
import yugi.net.ChannelUtil;
import yugi.query.Game;

import com.google.appengine.api.channel.ChannelPresence;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;

/**
 * Handles the event where clients disconnect from their channel.
 */
public class ChannelDisconnectedServlet extends HttpServlet {
	private static final long serialVersionUID = -5765351299311083314L;
	private static final Logger logger = Logger.getLogger(ChannelDisconnectedServlet.class.getName());
	
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
	throws IOException {
		ChannelService channelService = ChannelServiceFactory.getChannelService();
		ChannelPresence presence = channelService.parsePresence(req);
		String clientId = presence.clientId();
		logger.info(clientId + " just disconnected");
		
		GameSession game = Game.getForClientId(clientId);
		if (game == null) {
			logger.severe("Failed to find the game for this client: " + clientId);
			return;
		}
		
		// Mark the player as disconnected.
		if (clientId.equals(game.getPlayer1ClientId())) {
			if (game.isPlayer1Connected()) {
				game.setPlayer1Connected(false);
				
				// Tell player 2 that player 1 just disconnected.
				DisconnectedMessage message = new DisconnectedMessage(game.getPlayer1());
				ChannelUtil.sendToClient(game.getPlayer2ClientId(), message);
			}
		} else if (clientId.equals(game.getPlayer2ClientId())) {
			if (game.isPlayer2Connected()) {
				game.setPlayer2Connected(false);
				
				// Tell player 1 that player 2 just disconnected.
				DisconnectedMessage message = new DisconnectedMessage(game.getPlayer2());
				ChannelUtil.sendToClient(game.getPlayer1ClientId(), message);
			}
		} else {
			logger.severe("The client ID didn't match any player client ID in " +
		            "the game.  Game: " + game.toString());
		}
		
		// Always either save the game or delete the game.
		saveOrDelete(game);
	}

	/**
	 * Checks to see if both players are disconnected and deletes the game if
	 * they are.
	 * @param game The game to delete.
	 */
	private void saveOrDelete(GameSession game) {
		
		// Don't delete the game if either player is still connected.
		if (game.isPlayer1Connected() || game.isPlayer2Connected()) {
			// Save the new disconnected state instead.
			save(game);
		} else {
			// Neither player is connected, so delete the game.
			delete(game);
		}
	}

	/**
	 * Saves the game.
	 * @param game The game to save.
	 */
	private void save(GameSession game) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			logger.info("Saving the game state.");
			pm.makePersistent(game);
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to save the game", e);
		} finally {
			pm.close();
		}
	}
	
	/**
	 * Deletes the game.
	 * @param game The game to delete.
	 */
	private void delete(GameSession game) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			logger.info("Deleting a game since neither player is connected.");
			
			// Need to look up the game here because the game could be in a
			// transient state otherwise.
			game = pm.getObjectById(GameSession.class, game.getKey());
			pm.deletePersistent(game);
			
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to delete the game", e);
		} finally {
			pm.close();
		}
	}
}
