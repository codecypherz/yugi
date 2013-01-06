package yugi.servlet.deck;

import java.io.IOException;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.PMF;
import yugi.model.Deck;
import yugi.service.DeckService;
import yugi.servlet.ResponseStatusCode;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class DeckDeleteServlet extends HttpServlet {

	private static final long serialVersionUID = 5250236203257786794L;
	private static final Logger logger = Logger.getLogger(DeckDeleteServlet.class.getName());
	
	private static DeckService deckService = DeckService.getInstance();
	private static UserService userService = UserServiceFactory.getUserService();
	
	/**
	 * Just deletes decks with the given key.
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException {
		
		// The user must be signed in to delete anything.
		User user = userService.getCurrentUser();
		if (user == null) {
			ServletUtil.writeLoginScreen(req, res);
			return;
		}

		// Get the deck key from the request.
		String deckKey = Config.getDeckKey(req);
		if (deckKey == null) {
			logger.severe("No deck key specified.");
			res.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}

		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Deck deck = deckService.getDeck(pm, deckKey);
			if (deck == null) {
				// This should happen if there's a programming error or an evil
				// client.
				logger.severe("Invalid deck key when deleting: " + deckKey);
				res.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
				return;
			}

			// Make sure the user is allowed to modify this deck.
			if (deckService.userHasWriteAccess(deck)) {
				logger.info("Deleting " + deck.getName() + " (" + deckKey + ")");
				pm.deletePersistent(deck);
			} else {
				logger.warning("This user tried to delete a deck that they didn't have access to.  " +
						"User: " + user.getUserId() + ", Deck: " + deckKey);
				res.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			}

		} finally {
			pm.close();
		}
	}
}
