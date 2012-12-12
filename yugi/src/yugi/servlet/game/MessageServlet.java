package yugi.servlet.game;

import java.io.BufferedReader;
import java.io.IOException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import yugi.Config;
import yugi.PMF;
import yugi.handler.Handler;
import yugi.handler.ReflectorHandler;
import yugi.message.Message;
import yugi.model.GameSession;
import yugi.servlet.ResponseStatusCode;

import com.google.appengine.api.datastore.KeyFactory;

/**
 * All clients post messages through this servlet.  This servlet is responsible
 * for deserializing and dispatching handling accordingly.
 */
public class MessageServlet extends HttpServlet {

	private static final long serialVersionUID = -7849407805778980239L;
	private static final Logger logger = Logger.getLogger(MessageServlet.class.getName());

	private static final String TYPE = "type";
	private static final String USER = "user";
	private static final String MESSAGE = "message";

	/**
	 * This maps a message type to the handler that is interested.
	 */
	private final HashMap<Message.Type, Handler> typeToHandler;

	/**
	 * This handler is used to reflect messages blindly from one client to the
	 * other.
	 */
	private final ReflectorHandler reflectorHandler;
	
	/**
	 * Constructor.
	 */
	public MessageServlet() {
		super();

		typeToHandler = new HashMap<Message.Type, Handler>();

		// The reflector handler will be used for all unhandled types.
		reflectorHandler = new ReflectorHandler();
		
		// Register other message handlers.
		// Future handling looks like this:
		// typeToHandler.put(Message.Type.TYPE, new TypeHandler());
		// where TypeHandler extends Handler.
	}

	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
	throws IOException {

		// Try to read in the JSON posted to the servlet.
		BufferedReader reader = req.getReader();
		StringBuilder sb = new StringBuilder();
		try {
			String line = reader.readLine();
			while (line != null) {
				sb.append(line + "\n");
				line = reader.readLine();
			}
		} catch (Exception e) {
			logger.severe("Failed to parse the deck JSON: " + e.getMessage());
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		} finally {
			reader.close();
		}
		
		// Make sure the game key parameter exists.
		String gameKey = Config.getGameKey(req);
		PersistenceManager pm = PMF.get().getPersistenceManager();
		GameSession game = null;
		try {
			game = pm.getObjectById(GameSession.class, KeyFactory.stringToKey(gameKey));
		} catch (JDOObjectNotFoundException notFoundException) {
			logger.log(Level.WARNING, "Could not find the game with key = " +
					gameKey, notFoundException);
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to lookup the game with key = " +
					gameKey, e);
		} finally {
			pm.close();
		}

		if (game != null) {
			try {
				String jsonString = sb.toString();
				boolean success = processMessage(game, jsonString);
				if (!success) {
					logger.severe("Failed to process this message: " + jsonString);
					resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
				}
			} catch (ParseException e) {
				logger.log(Level.SEVERE, "Failed to parse some JSON", e);
				resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			}
		} else {
			logger.severe("No JSON message found in the request.");
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());			
		}
	}

	/**
	 * Processes the given JSON string.
	 * @param game The game object.
	 * @param jsonString The message in raw JSON format.
	 * @return True if message was processed successfully, false otherwise.
	 * @throws ParseException Thrown if the JSON string fails to parse.
	 */
	private boolean processMessage(GameSession game, String jsonString) throws ParseException {

		// TODO Use the client ID in the player's cookie instead of the user
		// field in the message.
		
		// Parse the JSON.
		JSONObject jsonObject = new JSONObject(jsonString);

		// Figure out the message type.
		String type = jsonObject.getString(TYPE);
		Message.Type messageType = null;
		try {
			messageType = Message.Type.valueOf(type.toUpperCase());
		} catch (IllegalArgumentException e) {
			// Don't throw an exception if the enum isn't found.  This is expected
			// if the server doesn't care about the message type.
		}

		// Figure out the user that sent the message.
		String user = jsonObject.getString(USER);
		if (user == null) {
			logger.severe("The message with type=" + type + " had no user.");
			return false;
		}

		// Parse the internal message.
		JSONObject messageObject = jsonObject.getJSONObject(MESSAGE);
		if (messageObject == null) {
			logger.severe("The message with type=" + type + " had no payload.");
			return false;
		}

		// Figure out the handler that should be used.  Use reflector by default.
		Handler handler = reflectorHandler;
		
		// Don't look for another handler unless the server recognizes the type
		// of message this is.
		if (messageType != null) {
			
			// If there is a message handler for this type, use that instead.
			Handler messageHandler = typeToHandler.get(messageType);
			if (messageHandler != null) {
				handler = messageHandler;
			}
		}

		// Try to handle the message.
		try {
			handler.handle(game, user, messageObject);
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to handle a " + messageType +
					" message.", e);
			return false;
		}

		// If we got here, then we processed the message successfully.
		return true;
	}
}
