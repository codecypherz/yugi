package yugi.message;

import org.json.JSONObject;

/**
 * The message that is sent when a client connects to the game.  This message is
 * reused in a couple contexts:
 * 
 * 1.) This message is sent from the client to the server when the channel
 *     connection is established.
 *     
 * 2.) This message is sent from the server to the client when the *other*
 *     player has joined the game. 
 */
public class ConnectedMessage extends Message {

	private static final String PLAYER = "player";
	private final String player;

	public ConnectedMessage(String player) {
		super(Message.Type.CONNECTED);
		this.player = player;
	}
	
	public ConnectedMessage(JSONObject jsonObject) {
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
