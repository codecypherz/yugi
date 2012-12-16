package yugi.servlet.deck;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import yugi.Config;
import yugi.PMF;
import yugi.model.Card;
import yugi.model.Deck;
import yugi.service.CardService;
import yugi.service.DeckService;
import yugi.servlet.ResponseStatusCode;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class DeckServlet extends HttpServlet {

	private static final long serialVersionUID = -6507153157705937766L;
	private static final Logger logger = Logger.getLogger(DeckServlet.class.getName());

	private static CardService cardService = CardService.getInstance();
	private static DeckService deckService = DeckService.getInstance();
	private static UserService userService = UserServiceFactory.getUserService();

	/**
	 * This is the request for a deck.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		// Get the deck key from the request.
		String deckKey = Config.getDeckKey(req);
		if (deckKey == null) {
			logger.severe("No deck key specified.");
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}
		
		// Look up the deck based on the key.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		Deck deck;
		List<Card> mainCards = new ArrayList<Card>();
		List<Card> extraCards = new ArrayList<Card>();
		List<Card> sideCards = new ArrayList<Card>();
		Card mainCard = null;
		try {
			deck = deckService.getDeck(pm, deckKey);

			// Look up all the card objects.
			for (String cardKey : deck.getMainCardKeys()) {
				mainCards.add(cardService.getCard(pm, cardKey));
			}
			for (String cardKey : deck.getExtraCardKeys()) {
				extraCards.add(cardService.getCard(pm, cardKey));
			}
			for (String cardKey : deck.getSideCardKeys()) {
				sideCards.add(cardService.getCard(pm, cardKey));
			}
			
			// Look up the main card.
			String mainCardKey = deck.getMainCardKey();
			if (mainCardKey != null && !mainCardKey.isEmpty()) {
				mainCard = cardService.getCard(pm, mainCardKey);	
			}

		} catch (JDOObjectNotFoundException e) {
			e.printStackTrace();
			logger.severe(e.getMessage());
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		} finally {
			pm.close();
		}
		
		// Write the info back to the client.
		JSONObject json = deck.toJson(mainCard, mainCards, extraCards, sideCards);
		resp.setContentType("text/json");
		resp.getWriter().write(json.toString());
	}
	
	/**
	 * This is a request to save a deck.
	 */
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
	throws IOException {
		
		BufferedReader reader = req.getReader();
		JSONObject deckJson = null;

		// Try to read in the JSON posted to the servlet.
		try {
			StringBuilder sb = new StringBuilder();
			String line = reader.readLine();
			while (line != null) {
				sb.append(line + "\n");
				line = reader.readLine();
			}
			deckJson = new JSONObject(sb.toString());
		} catch (Exception e) {
			logger.severe("Failed to parse the deck JSON: " + e.getMessage());
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		} finally {
			reader.close();
		}
	    
		Deck newDeck = new Deck();
		newDeck.setFromJson(deckJson);
		String deckKey = deckJson.getString("key");

		// Make sure there is a deck key.
		if (deckKey == null || deckKey.trim().isEmpty()) {
			logger.severe("No deck key for the save deck request.");
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}

		// Validate the deck.
		if (!newDeck.isValid()) {
			logger.severe("Invalid deck - cannot save.");
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}

		// Now that the deck has been validated, make sure this user is allowed
		// to update the deck.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			// Always update.  The deck key can never be null or empty.
			Deck deck = deckService.getDeck(pm, deckKey);
			if (deck == null) {
				// This should happen if there's a programming error or an evil
				// client.
				logger.severe("Invalid deck key when saving: " + deckKey);
				resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
				return;
			}
			
			// Before actually modifying the deck, make sure the user is allowed.
			if (deckService.userHasWriteAccess(deck)) {
				deck.merge(newDeck);
				logger.info("Updating an existing deck.");
		        pm.makePersistent(deck);
			} else {
				User user = userService.getCurrentUser();
				String userId = user != null ? user.getUserId() : "anonymous";
				logger.warning("This user tried to edit a deck that they didn't have access to.  " +
						"User: " + userId + ", Deck: " + deckKey);
				resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
				return;
			}
	    } finally {
	        pm.close();
	    }
	}
}
