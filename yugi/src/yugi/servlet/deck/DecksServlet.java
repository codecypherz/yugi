package yugi.servlet.deck;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
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
import yugi.model.Deck;
import yugi.service.CardService;
import yugi.service.DeckService;
import yugi.servlet.ResponseStatusCode;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class DecksServlet extends HttpServlet {

	private static final long serialVersionUID = -2144543303475151703L;
	private static final Logger logger = Logger.getLogger(DecksServlet.class.getName());

	CardService cardService = CardService.getInstance();
	DeckService deckService = DeckService.getInstance();
	UserService userService = UserServiceFactory.getUserService();

	/**
	 * This is the request for decks.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException {

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {

			List<Deck> decks = null;
			if (Config.isStructureRequest(req)) {
				// Get the structure decks.  Anyone should be allowed to view
				// structure decks, even anonymously.
				decks = deckService.getStructureDecks(pm);
			} else {
				// Make sure the user is logged in.
				User user = userService.getCurrentUser();
				if (user == null) {
					ServletUtil.writeLoginScreen(req, res);
					return;
				}
				
				// Get the decks for the current user.
				decks = deckService.getDecks(pm, user);
			}

			// Convert the list of decks into JSON.
			ArrayList<JSONObject> jsonDecks = new ArrayList<JSONObject>();
			if (!decks.isEmpty()) {
				for (Deck deck : decks) {
					
					// Look up the main card.
					Card mainCard = cardService.getCard(pm, deck.getMainCardKey());
					jsonDecks.add(deck.toJson(mainCard));
				}
			}

			JSONObject json = new JSONObject();
			json.put("decks", new JSONArray(jsonDecks));
			res.setContentType("text/json");
			res.getWriter().write(json.toString());

		} catch (Exception e) {
			logger.severe("Failed to fetch the decks.");
			res.setStatus(ResponseStatusCode.INTERNAL_SERVER_ERROR.getCode());
		} finally {
			pm.close();
		}
	}
}
