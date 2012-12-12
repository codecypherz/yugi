package yugi.handler;

import org.json.JSONObject;

import yugi.model.GameSession;

/**
 * A handler handles some kind of message.
 */
public interface Handler {

	/**
	 * Handles the message.
	 * @param game The game for which this message pertains.
	 * @param user The user that sent the message.
	 * @param messageJson The raw message to handle.
	 */
	void handle(GameSession game, String user, JSONObject messageJson);
}
