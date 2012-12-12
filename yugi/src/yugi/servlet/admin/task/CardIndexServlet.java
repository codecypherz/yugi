package yugi.servlet.admin.task;

import java.io.IOException;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.Extent;
import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.PMF;
import yugi.index.Indexer;
import yugi.model.Card;
import yugi.model.index.DescriptionToCard;
import yugi.model.index.NameToCard;

public class CardIndexServlet extends HttpServlet {

	private static final long serialVersionUID = 7932877838165991842L;
	private static final Logger logger = Logger.getLogger(CardIndexServlet.class.getName());

	/**
	 * This job will index all cards by their name.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		// Some statistics.
		int deletedNameEntries = 0;
		int deletedDescriptionEntries = 0;
		int cardsIterated = 0;
		int sizeOfNameIndex = 0;
		int sizeOfDescriptionIndex = 0;
		
		try {
			// Delete everything.
			deletedNameEntries = deleteNameIndex();
			deletedDescriptionEntries = deleteDescriptionIndex();
			
			// Create the new index.
			int[] result = createEntries();
			cardsIterated = result[0];
			sizeOfNameIndex = result[1];
			sizeOfDescriptionIndex = result[2];
			
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Something failed while indexing", e);
			resp.getWriter().write("Indexing failed: " + e.getMessage());
			return;
		}
		
		resp.getWriter().println("Name indexing complete.");
		resp.getWriter().println();
		resp.getWriter().println("Name index entries deleted: " + deletedNameEntries);
		resp.getWriter().println("Description index entries deleted: " + deletedDescriptionEntries);
		resp.getWriter().println();
		resp.getWriter().println("Number of cards: " + cardsIterated);
		resp.getWriter().println("Size of Name Index: " + sizeOfNameIndex);
		resp.getWriter().println("Size of Description Index: " + sizeOfDescriptionIndex);
	}
	
	/**
	 * Deletes all name index entries.
	 * @throws Exception
	 */
	private int deleteNameIndex() throws Exception {
		logger.info("Deleting the existing name index...");
		int entriesDeleted = 0;
		PersistenceManager pm = PMF.get().getPersistenceManager();
		Extent<NameToCard> extent = pm.getExtent(NameToCard.class, false);
		try {
			for (NameToCard nameToCard : extent) {
				pm.deletePersistent(nameToCard);
				entriesDeleted++;
			}
		} finally {
			extent.closeAll();
			pm.close();
		}
		logger.info("Finished deleting the name index.");
		return entriesDeleted;
	}
	
	/**
	 * Deletes all description index entries.
	 * @throws Exception
	 */
	private int deleteDescriptionIndex() throws Exception {
		logger.info("Deleting the existing description index...");
		int entriesDeleted = 0;
		PersistenceManager pm = PMF.get().getPersistenceManager();
		Extent<DescriptionToCard> extent = pm.getExtent(DescriptionToCard.class, false);
		try {
			for (DescriptionToCard descriptionToCard : extent) {
				pm.deletePersistent(descriptionToCard);
				entriesDeleted++;
			}
		} finally {
			extent.closeAll();
			pm.close();
		}
		logger.info("Finished deleting the description index.");
		return entriesDeleted;
	}
	
	/**
	 * Creates all the name index entries.
	 * @return The results.
	 * @throws Exception
	 */
	private int[] createEntries() throws Exception {
		logger.info("Creating the new index...");
		
		int cardsIterated = 0;
		
		HashMap<String, NameToCard> nameMap = new HashMap<String, NameToCard>();
		HashMap<String, DescriptionToCard> descriptionMap = new HashMap<String, DescriptionToCard>();
		
		PersistenceManager pm = PMF.get().getPersistenceManager();
		Extent<Card> extent = pm.getExtent(Card.class, false);
		try {
			
			// Loop through each card.
			for (Card card : extent) {
				
				try {
					// Grab the key as a string for storage.
					String cardKey = card.getKeyAsString();
					
					// Tokenize the card name.
					String[] nameTokens = Indexer.tokenizeName(card.getName());
					
					// Loop through each token and add to the appropriate entry.
					for (String token : nameTokens) {
						NameToCard entry = nameMap.get(token);
						
						// Create an entry if one doesn't yet exist.
						if (entry == null) {
							entry = new NameToCard();
							entry.setNameToken(token);
							nameMap.put(token, entry);
						}
						
						// Always add the card.
						entry.addCardKey(cardKey);
					}
					
					// Tokenize the description.
					String[] descriptionTokens = Indexer.tokenizeText(card.getDescription());
					
					// Loop through each token and add to the appropriate entry.
					for (String token : descriptionTokens) {
						DescriptionToCard entry = descriptionMap.get(token);
						
						// Create an entry if one doesn't yet exist.
						if (entry == null) {
							entry = new DescriptionToCard();
							entry.setDescriptionToken(token);
							descriptionMap.put(token, entry);
						}
						
						// Always add the card.
						entry.addCardKey(cardKey);
					}
					
					// Increment.
					cardsIterated++;
					
				} catch (Exception e) {
					logger.log(Level.SEVERE, "Failed to index a card.", e);
					continue;
				}
			}
			
			// Now persist all name index entries.
			logger.info("Persisting the new index...");
			pm.makePersistentAll(nameMap.values());
			pm.makePersistentAll(descriptionMap.values());
			logger.info("Finished persisting the new index.");
			
		} finally {
			extent.closeAll();
			pm.close();
		}
		
		return new int[] {cardsIterated, nameMap.size(), descriptionMap.size()};
	}
}
