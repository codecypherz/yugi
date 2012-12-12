package yugi.index;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import javax.jdo.PersistenceManager;

import yugi.model.index.DescriptionToCard;
import yugi.model.index.NameToCard;

/**
 * Responsible for the indexing of cards in the system.
 */
public class Indexer {

	/**
	 * The regular expression used to split text.
	 */
	private static final String SPLITTER = "[ .,;:?!-]+";

	/**
	 * Tokenizes the given name.
	 * @param nameToTokenize The name to tokenize.
	 * @return The tokens in the name.
	 */
	public static String[] tokenizeName(String nameToTokenize) {
		if (nameToTokenize != null && !nameToTokenize.trim().isEmpty()) {
			
			// Make lookups case insensitive.
			String name = nameToTokenize.trim().toUpperCase();
			
			// There should be no duplicate tokens.
			HashSet<String> tokenSet = new HashSet<String>();

			// Split on everything.
			String[] tokens = name.split(SPLITTER);
			
			// Permutate the tokens and add them all to the set.
			ArrayList<String> permutations = permutate(0, tokens);
			for (String permutation : permutations) {
				tokenSet.add(permutation);
				
				// For each permutation, also remove all <'s> for the index.
				String modifiedPermutation = permutation.replaceAll("'S", "");
				tokenSet.add(modifiedPermutation);
			}
			
			return tokenSet.toArray(new String[tokenSet.size()]);
		}
		return new String[0];
	}
	
	/**
	 * Creates a permutation of the tokens.
	 * @param start Where to start in the array.
	 * @param tokens The tokens to permutate.
	 * @return The permutations.
	 */
	private static ArrayList<String> permutate(int start, String[] tokens) {
		ArrayList<String> list = new ArrayList<String>();

		// Base case.
		if (start >= tokens.length) {
			return list;
		}
		
		// Grab the first token.
		String token = tokens[start];
		list.add(token);
		
		// Append the first token to the rest in a rolling fashion.
		for (int i = start + 1; i < tokens.length; i++) {
			token += " " + tokens[i];
			list.add(token);
		}
		
		// Process the rest of the tokens.
		list.addAll(permutate(start + 1, tokens));
		return list;
	}
	
	/**
	 * Tokenizes the given text.
	 * @param textToTokenize The text to tokenize.
	 * @return The tokens in the text.
	 */
	public static String[] tokenizeText(String textToTokenize) {
		if (textToTokenize != null && !textToTokenize.trim().isEmpty()) {
			
			// Make lookups case insensitive.
			String text = textToTokenize.trim().toUpperCase();
			
			// There should be no duplicate tokens.
			Set<String> tokens = new HashSet<String>();
			
			// Split the text.
			String[] rawTokens = text.split(SPLITTER);
			for (String token : rawTokens) {
				tokens.add(token);

				// Add a token if it is abbreviated.
				int index = token.indexOf("'S");
				if (index >= 0) {
					tokens.add(token.substring(0, index));
				}
			}
			return tokens.toArray(new String[tokens.size()]);
		}
		return new String[0];
	}
	
	/**
	 * Creates the name index for the given name and card key.
	 * @param name The name.
	 * @param cardKey The card key.
	 * @param pm The persistence manager.
	 */
	public static void createNameIndex(String name, String cardKey, PersistenceManager pm) {
		String[] nameTokens = Indexer.tokenizeName(name);
		ArrayList<NameToCard> nameToCards = new ArrayList<NameToCard>();
		for (String token : nameTokens) {
			NameToCard nameToCard = getNameToCard(token, pm);
			if (nameToCard == null) {
				nameToCard = new NameToCard();
				nameToCard.setNameToken(token);
			}
			nameToCard.addCardKey(cardKey);
			nameToCards.add(nameToCard);
		}
		pm.makePersistentAll(nameToCards);
	}
	
	/**
	 * Creates the description index for the given description and card key.
	 * @param description The description.
	 * @param cardKey The card key.
	 * @param pm The persistence manager.
	 */
	public static void createDescriptionIndex(String description, String cardKey,
			PersistenceManager pm) {
		String[] descriptionTokens = Indexer.tokenizeText(description);
		ArrayList<DescriptionToCard> descriptionToCards = new ArrayList<DescriptionToCard>();
		for (String token : descriptionTokens) {
			DescriptionToCard descriptionToCard = getDescriptionToCard(token, pm);
			if (descriptionToCard == null) {
				descriptionToCard = new DescriptionToCard();
				descriptionToCard.setDescriptionToken(token);
			}
			descriptionToCard.addCardKey(cardKey);
			descriptionToCards.add(descriptionToCard);
		}
		pm.makePersistentAll(descriptionToCards);
	}
	
	/**
	 * Updates the name index by first deleting the reference to the card key in
	 * all the tokens that match, then adding the card key to all the new tokens.
	 * @param oldName The old card name.
	 * @param newName The new card name.
	 * @param cardKey The existing card key.
	 * @param pm The persistence manager.
	 */
	public static void updateNameIndex(String oldName, String newName, String cardKey,
			PersistenceManager pm) {
		
		// Remove all references to this card from the existing index.
		deleteNameIndex(oldName, cardKey, pm);
		
		// Create new entries for the new text.
		createNameIndex(newName, cardKey, pm);
	}
	
	/**
	 * Updates the description index by first deleting the reference to the card
	 * key in all the tokens that match, then adding the card key to all the new
	 * tokens.
	 * @param oldDescription The old card description.
	 * @param newDescription The new card description.
	 * @param cardKey The existing card key.
	 * @param pm The persistence manager.
	 */
	public static void updateDescriptionIndex(String oldDescription, String newDescription,
			String cardKey, PersistenceManager pm) {
		
		// Remove all references to this card from the existing index.
		deleteDescriptionIndex(oldDescription, cardKey, pm);
		
		// Create new entries for the new text.
		createDescriptionIndex(newDescription, cardKey, pm);
	}
	
	/**
	 * Deletes the name index entries for this card.
	 * @param oldName The old card name.
	 * @param cardKey The existing card key.
	 * @param pm The persistence manager.
	 */
	public static void deleteNameIndex(String oldName, String cardKey,
			PersistenceManager pm) {
		String[] nameTokens = Indexer.tokenizeName(oldName);
		ArrayList<NameToCard> toUpdate = new ArrayList<NameToCard>();
		ArrayList<NameToCard> toDelete = new ArrayList<NameToCard>();
		for (String token : nameTokens) {
			NameToCard nameToCard = getNameToCard(token, pm);
			if (nameToCard != null) {
				nameToCard.removeCardKey(cardKey);
				if (nameToCard.getNumCards() == 0) {
					toDelete.add(nameToCard);
				} else {
					toUpdate.add(nameToCard);
				}
			}
		}
		pm.makePersistentAll(toUpdate);
		pm.deletePersistentAll(toDelete);
	}
	
	/**
	 * Deletes the description index entries for this card.
	 * @param oldDescription The old card description.
	 * @param cardKey The existing card key.
	 * @param pm The persistence manager.
	 */
	public static void deleteDescriptionIndex(String oldDescription, String cardKey,
			PersistenceManager pm) {
		String[] descriptionTokens = Indexer.tokenizeText(oldDescription);
		ArrayList<DescriptionToCard> toUpdate = new ArrayList<DescriptionToCard>();
		ArrayList<DescriptionToCard> toDelete = new ArrayList<DescriptionToCard>();
		for (String token : descriptionTokens) {
			DescriptionToCard descriptionToCard = getDescriptionToCard(token, pm);
			if (descriptionToCard != null) {
				descriptionToCard.removeCardKey(cardKey);
				if (descriptionToCard.getNumCards() == 0) {
					toDelete.add(descriptionToCard);
				} else {
					toUpdate.add(descriptionToCard);
				}
			}
		}
		pm.makePersistentAll(toUpdate);
		pm.deletePersistentAll(toDelete);
	}
	
	/**
	 * Finds the name index entry for the given token or null if not found.
	 * @param token The token for which to search.
	 * @param pm The persistence manager used for lookups.
	 * @return The existing entry or null if not found.
	 */
	public static NameToCard getNameToCard(String token, PersistenceManager pm) {
		try {
			return pm.getObjectById(NameToCard.class, token);
		} catch (Exception e) {
			// Will happen if nothing was found - just move on.
		}
		return null;
	}
	
	/**
	 * Finds the description index entry for the given token or null if not found.
	 * @param token The token for which to search.
	 * @param pm The persistence manager used for lookups.
	 * @return The existing entry, or null if not found.
	 */
	public static DescriptionToCard getDescriptionToCard(String token,
			PersistenceManager pm) {
		try {
			return pm.getObjectById(DescriptionToCard.class, token);
		} catch (Exception e) {
			// Will happen if nothing was found - just move on.
		}
		return null;
	}
}
