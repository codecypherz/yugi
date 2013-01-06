package yugi.servlet.deck;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.Config.HtmlParam;
import yugi.Screen;
import yugi.model.Deck;
import yugi.service.DeckService;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class DeckEditorServlet extends HttpServlet {

	private static final long serialVersionUID = -2648481454846402248L;
	private static final Logger logger = Logger.getLogger(DeckEditorServlet.class.getName());
	
	DeckService deckService = DeckService.getInstance();
	UserService userService = UserServiceFactory.getUserService();

	/**
	 * This is the request for the application.  This only writes back the HTML.
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException {

		// TODO Can't I just use some AppEngine configuration for this?
		// The user must be authenticated to use this servlet.
		User user = userService.getCurrentUser();
		if (user == null) {
			
			// TODO Redirect to the deck viewer instead.
			
			ServletUtil.writeLoginScreen(req, res);
			return;
		}
		
		// Get the deck key from the request to see if the deck already exists.
		String deckKey = Config.getDeckKey(req);

		// If no deck key, create a new deck.
		if (deckKey == null) {

			// Determine if the new deck is a structure deck.
			if (Config.isStructureRequest(req)) {

				// Only administrators are allowed to create structure decks.
				if (userService.isUserAdmin()) {
					Deck deck = deckService.newStructureDeck();
					deckKey = KeyFactory.keyToString(deck.getKey());					
				} else {
					
					// TODO Make the structure deck editor a separate servlet
					// in order to get the normal authentication flows through
					// AppEngine.
					logger.warning("This user tried to create a structure deck: " + user.getUserId());
					res.getWriter().write(
							"<p>Error: Only administrators can create structure decks.</p>");
					return;
				}
			} else {
				
				// No deck key and it's not for a structure deck, so we are
				// creating a normal new deck for the current user.
				Deck deck = deckService.newDeck(user);
				deckKey = KeyFactory.keyToString(deck.getKey());
			}
		} else {

			// There's a deck key, so let's make sure the user is allowed to
			// edit this deck before writing back the response.
			Deck deck = deckService.getDeck(deckKey);
			if (deck == null) {
				res.getWriter().write(
						"<p>Error: No deck found with that key.</p>");
				return;
			}
			
			if (!deckService.userHasWriteAccess(deck)) {
				
				// TODO Redirect to the deck viewer instead.
				
				logger.warning("This user tried to edit a deck that they didn't have access to: " + user.getUserId());
				res.getWriter().write(
						"<p>Error: You do not have permission to edit this deck.</p>");
				return;
			}
		}

		// If we got here, then the user is allowed to create/edit the deck.
		Map<HtmlParam, String> paramMap = new HashMap<HtmlParam, String>();
		paramMap.put(HtmlParam.DECK_KEY, deckKey);
		paramMap.put(HtmlParam.READ_ONLY, "false");
		
		ServletUtil.writeScreen(req, res, Screen.DECK_EDITOR, paramMap);
	}
}
