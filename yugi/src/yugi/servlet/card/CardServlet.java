package yugi.servlet.card;

import java.io.IOException;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import yugi.Config;
import yugi.PMF;
import yugi.model.Card;
import yugi.servlet.ResponseStatusCode;

import com.google.appengine.api.datastore.KeyFactory;

/**
 * Retrieves card information for a given card.
 */
public class CardServlet extends HttpServlet {

	private static final long serialVersionUID = -6928972420445961296L;
	private static final Logger logger = Logger.getLogger(CardServlet.class.getName());

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		// Get the card key from the request.
		String cardKey = Config.getCardKey(req);
		if (cardKey == null) {
			logger.severe("No card key specified.");
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}
		
		// Look up the card based on the key.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		Card card;
		try {
			card = pm.getObjectById(Card.class, KeyFactory.stringToKey(cardKey));
		} catch (JDOObjectNotFoundException e) {
			logger.severe(e.getMessage());
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		} finally {
			pm.close();
		}
		
		// Write the card back to the client.
		JSONObject jsonObject = card.toJson();
		resp.setContentType("text/json");
		resp.getWriter().write(jsonObject.toString());
	}
}
