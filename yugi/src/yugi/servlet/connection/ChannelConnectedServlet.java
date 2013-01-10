package yugi.servlet.connection;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.PMF;
import yugi.message.ConnectedMessage;
import yugi.message.Message;
import yugi.message.Message.Type;
import yugi.model.GameSession;
import yugi.net.ChannelUtil;
import yugi.service.GameService;

import com.google.appengine.api.channel.ChannelPresence;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;

/**
 * Handles the event where clients successfully connect to their channel.
 */
public class ChannelConnectedServlet extends HttpServlet {
	private static final long serialVersionUID = -4023972523268676461L;
	private static final Logger logger = Logger.getLogger(ChannelConnectedServlet.class.getName());
	
	private static GameService gameService = GameService.getInstance();
	
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
	throws IOException {
		ChannelService channelService = ChannelServiceFactory.getChannelService();
		ChannelPresence presence = channelService.parsePresence(req);
		String clientId = presence.clientId();
		logger.info(clientId + " just connected");

		GameSession game = gameService.getForClientId(clientId);
		if (game == null) {
			logger.severe("Failed to find the game for this client: " + clientId);
			return;
		}

		// Mark the player as connected, but check for weird state.
		if (clientId.equals(game.getPlayer1ClientId())) {
			if (game.isPlayer1Connected()) {
				logger.severe("Player 1 was already connected.  Game: " +
						game.toString());
			} else {

				// Mark the player as connected and tell the other player.
				game.setPlayer1Connected(true);
				ConnectedMessage message = new ConnectedMessage(game.getPlayer1());
				ChannelUtil.sendToClient(game.getPlayer2ClientId(), message);
				
				// See if this player was previously connected.
				if (game.wasPlayer1Connected() && game.isPlayer2Connected()) {
					// Player 1 needs synchronization data from Player 2.
					sendSynchronizationMessages(game.getPlayer1ClientId(), game.getPlayer2ClientId());
				}
				
				// Don't forget to mark this player as having been connected.
				game.setPlayer1WasConnected(true);

			}
		} else if (clientId.equals(game.getPlayer2ClientId())) {
			if (game.isPlayer2Connected()) {
				logger.severe("Player 2 was already connected.  Game: " +
						game.toString());
			} else {
				
				// Mark the player as connected and tell the other player.
				game.setPlayer2Connected(true);
				ConnectedMessage message = new ConnectedMessage(game.getPlayer2());
				ChannelUtil.sendToClient(game.getPlayer1ClientId(), message);
				
				// See if this player was previously connected.
				if (game.wasPlayer2Connected() && game.isPlayer1Connected()) {
					// Player 2 needs synchronization data from Player 1.
					sendSynchronizationMessages(game.getPlayer2ClientId(), game.getPlayer1ClientId());
				}
				
				// Don't forget to mark this player as having been connected.
				game.setPlayer2WasConnected(true);

			}
		} else {
			logger.severe("The player didn't match any player in the game.  " +
					"Game: " + game.toString());
		}

		// Save the game state.
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
	 * Sends messages that enable synchronization.
	 * @param reconnectedPlayer The player that reconnected.
	 * @param connectedPlayer The player that is already connected.
	 */
	private void sendSynchronizationMessages(String reconnectedClientId, String connectedClientId) {

		// Tell the reconnected player to wait for synchronization data.
		ChannelUtil.sendToClient(reconnectedClientId, new Message(Type.WAIT_FOR_SYNC));

		// Tell the connected player to send their synchronization data.
		ChannelUtil.sendToClient(connectedClientId, new Message(Type.SYNC_REQUEST));
	}
}
