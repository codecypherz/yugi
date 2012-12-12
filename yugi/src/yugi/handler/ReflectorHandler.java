package yugi.handler;

import java.util.logging.Logger;

import org.json.JSONObject;

import yugi.model.GameSession;
import yugi.net.ChannelUtil;

/**
 * Blindly reflects a message from one client to another.
 */
public class ReflectorHandler implements Handler {

	private static final Logger logger = Logger.getLogger(ReflectorHandler.class.getName());

	@Override
	public void handle(GameSession game, String user, JSONObject messageJson) {
		
		// Just send the message to the other player.
		if (user.equals(game.getPlayer1())) {
			ChannelUtil.sendToPlayer(game, game.getPlayer2(), messageJson);
		} else if (user.equals(game.getPlayer2())) {
			ChannelUtil.sendToPlayer(game, game.getPlayer1(), messageJson);
		} else {
			logger.severe("Did not know what to do with a message from " + user);
		}
	}
}
