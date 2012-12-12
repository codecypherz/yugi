package yugi.message;

import org.json.JSONObject;

/**
 * The generic message.  All messages have this stuff in common.
 */
public class Message {

	/**
	 * The set of message types that the server cares about.
	 */
	public enum Type {
		CONNECTED,
		DISCONNECTED,
		SYNC_REQUEST,
		WAIT_FOR_SYNC
	}

	private Type type;
	
	/**
	 * Default constructor.
	 */
	public Message (Type type) {
		this.type = type;
	}

	public Type getType() {
		return type;
	}
	
	/**
	 * Converts the message into a JSON object.
	 * @return The message in JSON format.
	 */
	public JSONObject toJson() {
		JSONObject json = new JSONObject();
		json.put("type", type.name());
		return json;
	}
}
