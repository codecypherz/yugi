package yugi.servlet.admin;

import java.io.IOException;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.PMF;
import yugi.index.Indexer;
import yugi.model.Card;
import yugi.servlet.ResponseStatusCode;

import com.google.appengine.api.datastore.KeyFactory;

public class CardDeleteServlet extends HttpServlet {

	private static final long serialVersionUID = -5452573357537811882L;
	private static final Logger logger = Logger.getLogger(CardDeleteServlet.class.getName());
	
	/**
	 * Just deletes cards with the given key.
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		// Get the card key from the request.
		String cardKey = Config.getCardKey(req);
		if (cardKey == null) {
			logger.severe("No card key specified.");
    		resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}

		// Delete the card.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Card card = pm.getObjectById(Card.class, KeyFactory.stringToKey(cardKey));
			logger.info("Deleting " + card.getName() + " (" + cardKey + ")");
			
			// Clean up the index.
			Indexer.deleteNameIndex(card.getName(), cardKey, pm);
			Indexer.deleteDescriptionIndex(card.getDescription(), cardKey, pm);

			// Delete the card.
			pm.deletePersistent(card);
			
		} catch (JDOObjectNotFoundException e) {
			logger.severe(e.getMessage());
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		} finally {
			pm.close();
		}
	    
	    // Redirect back to create new card.
		resp.sendRedirect(Config.Servlet.ADMIN_CARD.getPath());
	}
}
