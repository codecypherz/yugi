package yugi.servlet.deck;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.Config.Servlet;
import yugi.Config.UrlParameter;
import yugi.PMF;
import yugi.model.Deck;
import yugi.service.DeckService;
import yugi.servlet.ResponseStatusCode;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class DeckCopyServlet extends HttpServlet {
	
	private static final long serialVersionUID = 7245491843011427756L;
	private static final Logger logger = Logger.getLogger(DeckCopyServlet.class.getName());
	
	private static DeckService deckService = DeckService.getInstance();
	private static UserService userService = UserServiceFactory.getUserService();
	
	/**
	 * This is the request to copy a deck to the current user's deck list.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException {
		
		// TODO Can't I just use some AppEngine configuration for this?
		// The user must be authenticated to use this servlet.
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
			
			// Fetch the existing deck.
			Deck deck = deckService.getDeck(pm, deckKey);
			
			// Create a new deck and copy all the data.
			logger.info("Creating a new user deck from this deck: " + deck.getKey());
			Deck deckCopy = new Deck();
			deckCopy.setUserId(user.getUserId());
			deckCopy.setStructure(false);
			deckCopy.setName("Copy of " + deck.getName());
			deckCopy.setMainCardKey(deck.getMainCardKey());
			deckCopy.setMainCardKeys(deck.getMainCardKeys());
			deckCopy.setSideCardKeys(deck.getSideCardKeys());
			deckCopy.setExtraCardKeys(deck.getExtraCardKeys());
			
			// Save the copy.
			pm.makePersistent(deckCopy);
			
			// Now redirect the user to the deck editor.
			Map<UrlParameter, String> params = new HashMap<UrlParameter, String>();
			params.put(UrlParameter.DECK_KEY, KeyFactory.keyToString(deckCopy.getKey()));
			String deckEditorUrl = ServletUtil.createUrl(
					req, Servlet.DECK_EDITOR.getPath(), params);
			res.sendRedirect(deckEditorUrl);
			
		} catch (JDOObjectNotFoundException e) {
			e.printStackTrace();
			logger.severe(e.getMessage());
			res.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		} finally {
			pm.close();
		}
	}
}
