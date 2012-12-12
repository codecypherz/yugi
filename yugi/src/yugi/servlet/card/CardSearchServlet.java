package yugi.servlet.card;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import yugi.Config;
import yugi.PMF;
import yugi.model.Card;
import yugi.model.index.NameToCard;
import yugi.servlet.ResponseStatusCode;

import com.google.appengine.api.datastore.KeyFactory;

public class CardSearchServlet extends HttpServlet {

	private static final long serialVersionUID = -7949770734191635842L;
	private static final Logger logger = Logger.getLogger(CardSearchServlet.class.getName());

	/**
	 * This handles all card search queries.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		// Get the text parameter.
		String name = Config.getCardName(req);
		if (name == null || name.isEmpty()) {
			logger.severe("Name is required for now.");
			sendResponse(resp, null);
			return;
		}

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			HashSet<Card> cards = new HashSet<Card>();
			
			// Look up the card keys using the name index.
			String token = name.toUpperCase();
			NameToCard nameToCard = null;
			try {
				nameToCard = pm.getObjectById(NameToCard.class, token);
			} catch (Exception e) {
				// Will happen if nothing was found - just move on.
				logger.info("No cards found for: " + token);
			}
			
			// Do a lookup for each card to which the token maps.
			if (nameToCard != null) {
				// TODO Enforce some sort of limit here - this could be quite large
				// for a token like "THE"
				for (String cardKey : nameToCard.getCardKeys()) {
					Card card = pm.getObjectById(Card.class, KeyFactory.stringToKey(cardKey));
					cards.add(card);
				}
			}
			
			// Write the response back to the client.
			sendResponse(resp, cards);
			
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to query", e);
			resp.setStatus(ResponseStatusCode.INTERNAL_SERVER_ERROR.getCode());
		} finally {
			pm.close();
		}
	}
	
	/**
	 * Sends the response by writing the cards out as JSON.
	 * @param resp The response.
	 * @param cards The list of cards to write back to the client.
	 * @throws IOException Thrown if IO fails.
	 */
	private void sendResponse(HttpServletResponse resp, Set<Card> cards)
	throws IOException {
		resp.setContentType("text/json");
		
		JSONObject jsonObject = new JSONObject();
		JSONArray jsonCards = new JSONArray();
		
		if (cards != null) {
			for (Card card : cards) {
				jsonCards.put(card.toJson());
			}
		}
		
		jsonObject.put("cards", jsonCards);
		resp.getWriter().write(jsonObject.toString());
	}
}
