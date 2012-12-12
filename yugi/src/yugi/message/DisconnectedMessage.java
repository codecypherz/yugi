package yugi.message;

import org.json.JSONObject;

/**
 * The message that is sent when a client disconnects from the game.  This
 * message is reused in a couple contexts:
 * 
 * 1.) This message is sent from the client to the server when the channel
 *     gets disconnected.
 *     
 * 2.) This message is sent from the server to the client when the *other*
 *     player has disconnected from the game.
 */
public class DisconnectedMessage extends Message {

	private static final String PLAYER = "player";
	private final String player;

	public DisconnectedMessage(String player) {
		super(Message.Type.DISCONNECTED);
		this.player = player;
	}
	
	public DisconnectedMessage(JSONObject jsonObject) {
		this(jsonObject.getString(PLAYER));
	}

	public String getPlayer() {
		return player;
	}
	
	@Override
	public JSONObject toJson() {
		JSONObject json = super.toJson();
		json.put(PLAYER, player);
		return json;
	}
}
