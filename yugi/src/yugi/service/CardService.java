package yugi.service;

import java.util.List;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import yugi.PMF;
import yugi.index.Indexer;
import yugi.model.Card;

import com.google.appengine.api.datastore.KeyFactory;

/**
 * Service for querying/persisting for cards.
 */
public class CardService {

	private static final Logger logger = Logger.getLogger(CardService.class.getName());

	private static CardService instance;
	
	/**
	 * Singleton accessor.
	 * @return The card service.
	 */
	public static CardService getInstance() {
		if (instance == null) {
			instance = new CardService();
		}
		return instance;
	}
	
	private CardService() {
		
	}

	/**
	 * Fetches the card's information for the given key.
	 * @param cardKey The card's key.
	 * @return The card for the given key or null if the key is invalid.
	 */
	public Card getCard(String cardKey) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			return getCard(pm, cardKey);
		} finally {
			pm.close();
		}
	}
	
	/**
	 * Fetches the card's information for the given key.
	 * @param pm The persistence manager.
	 * @param cardKey The card's key.
	 * @return The card for the given card key or null if the key is invalid.
	 */
	public Card getCard(PersistenceManager pm, String cardKey) {
		if (cardKey != null && !cardKey.isEmpty()) {
			try {
				return pm.getObjectById(Card.class, KeyFactory.stringToKey(cardKey));
			} catch (JDOObjectNotFoundException e) {
				logger.severe("Failed to find a card with this key: " + cardKey);
				return null;
			}
		}
		return null;
	}
	
	/**
	 * Checks to see if the given card already exists.
	 * @param name The name to check.
	 * @return The existing card key or null if no card was found.
	 */
	public String getExistingCardKey(String name) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Query query = pm.newQuery(Card.class);
			query.setFilter("upperName == nameParam");
			query.declareParameters("String nameParam");

			@SuppressWarnings("unchecked")
			List<Card> cards = (List<Card>) query.execute(name.toUpperCase());
			if (!cards.isEmpty()) {
				return cards.get(0).getKeyAsString();
			}
			return null;
		} finally {
			pm.close();
		}
	}
	
	/**
	 * Persists the new card as well as the corresponding indices.
	 * @param card The new card to persist.
	 * @throws Exception Thrown if any error occurs.
	 */
	public void createNewCard(Card card) throws Exception {

		// Validate the new card.
		if (!card.isValid()) {
			throw new Exception("Failed to create the card because something was invalid.");
		}
		
		// Persist the new card.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			pm.makePersistent(card);
			String cardKey = card.getKeyAsString();

			// Create the index entries for the card.
			Indexer.createNameIndex(card.getName(), cardKey, pm);
			Indexer.createDescriptionIndex(card.getDescription(), cardKey, pm);
			
		} finally {
			pm.close();
		}
	}
}
