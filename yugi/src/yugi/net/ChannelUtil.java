package yugi.net;

import java.util.logging.Logger;

import org.json.JSONObject;

import yugi.message.Message;
import yugi.model.GameSession;

import com.google.appengine.api.channel.ChannelMessage;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;

public class ChannelUtil {

	private static final Logger logger = Logger.getLogger(ChannelUtil.class.getName());
	
	private static ChannelService channelService = ChannelServiceFactory.getChannelService();

	/**
	 * Sends a message to the given client.
	 * @param clientId The client's ID.
	 * @param message The message to send.
	 */
	public static void sendToClient(String clientId, Message message) {
		// This is okay - fail silently in case the other client doesn't exist.
		if (clientId == null) {
			return;
		}
		sendMessage(clientId, message.toJson());
	}
	
	/**
	 * Sends the message to the given player.
	 * @param game The game the player belongs to.
	 * @param player The player that will receive the message.
	 * @param message The message to send.
	 */
	@Deprecated
	public static void sendToPlayer(GameSession game, String player, Message message) {
		
		// Sanity check.
		if (game == null) {
			logger.severe("The game was null.");
			return;
		}
		if (message == null) {
			logger.severe("The message was null.");
			return;
		}

		// If the player is null, just stop now.  This is not an error.
		if (player == null) {
			return;
		}
		
		// TODO THIS WILL BREAK IF PLAYERS CHOOSE THE SAME NAME - FIX THIS.
		String playerClientId = game.getPlayer1ClientId();
		if (player.equals(game.getPlayer2())) {
			playerClientId = game.getPlayer2ClientId();
		}
	
		// Send the message as JSON.
		sendMessage(playerClientId, message.toJson());
	}
	
	/**
	 * Sends raw JSON to the given player.
	 * @param game The game the player belongs to.
	 * @param player The player that will receive the JSON.
	 * @param json The JSON object to send.
	 */
	@Deprecated
	public static void sendToPlayer(GameSession game, String player, JSONObject json) {
		
		// Sanity check.
		if (game == null) {
			logger.severe("The game was null.");
			return;
		}
		if (json == null) {
			logger.severe("The message was null.");
			return;
		}
		
		// If the player is null, just stop now.  This is not an error.
		if (player == null) {
			return;
		}
				
		// TODO THIS WILL BREAK IF PLAYERS CHOOSE THE SAME NAME - FIX THIS.
		String playerClientId = game.getPlayer1ClientId();
		if (player.equals(game.getPlayer2())) {
			playerClientId = game.getPlayer2ClientId();
		}
		
		// Send the JSON.
		sendMessage(playerClientId, json);
	}
	
	/**
	 * Sends a message using the channel service.
	 * @param channelKey The channel key over which to send the data.
	 * @param json The JSON to send.
	 */
	private static void sendMessage(String channelKey, JSONObject json) {
		
		if (json == null) {
			logger.severe("No JSON to send to the client.");
			return;
		}
		
		// Send the message.
		channelService.sendMessage(new ChannelMessage(channelKey, json.toString()));
	}
}
