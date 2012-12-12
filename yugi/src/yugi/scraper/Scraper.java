package yugi.scraper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import yugi.model.Card;

public class Scraper {

	public Scraper() {
		
	}
	
	public void scrape(String mainUrl) {
		
		// Parse all potential card links from the main URL.
		long start = System.currentTimeMillis();
		System.out.println("Finding all card links...");
		Set<String> cardLinks = new HashSet<String>();
		try {
			cardLinks = getCardLinks(mainUrl);
		} catch (Exception e) {
			e.printStackTrace();
		}
		long finish = System.currentTimeMillis();
		System.out.println("Finished.  Found " + cardLinks.size() + " card links in " + ((finish - start) / 1000.0) + " seconds.");
		
		try {
			CardProcessor cardProcessor = new CardProcessor();
			Card card = cardProcessor.process(
					"file:///home/james/Downloads/yugioh.wikia.com/Arcana_Force_XIV_-_Temperance");
			System.out.println("Here's the card:");
			System.out.println(card.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		// Try to create cards from all of the parsed links.
		List<Card> cards = new ArrayList<Card>();
		for (String cardLink : cardLinks) {
			try {
				cards.add(scrapeCard(cardLink));
			} catch (Exception e) {
				System.out.println("Failed to parse a card from this link: " + cardLink);
				e.printStackTrace();
			}
		}

		// Upload the cards to appengine.
		for (Card card : cards) {
			try {
				uploadCard(card);
			} catch (Exception e) {
				System.out.println("Failed to upload this card: " + card.toString());
				e.printStackTrace();
			}
		}
	}
	
	/**
	 * Recursively searches the web page at the given URL for card links.  If it finds a link
	 * to more card links, it will follow the link and continue searching.  Only when all
	 * potential links have been exhausted will this function return.
	 * @param url
	 * @return
	 * @throws Exception
	 */
	private Set<String> getCardLinks(String url) {
		Set<String> cardLinks = new HashSet<String>();
		
		String nextLink = url;
		while (nextLink != null) {
			
			// Don't actually follow live links in LOCAL mode.
			if (Main.LOCAL && nextLink.startsWith("http")) {
				System.out.println("Skipping this live link: " + nextLink);
				break;
			}
			
			if (!nextLink.startsWith(Main.HOST)) {
				nextLink = Main.HOST + nextLink;
			}
			
			CardLinksProcessor processor = new CardLinksProcessor();
			
			try {
				processor.process(nextLink);				
			} catch (Exception e) {
				e.printStackTrace();
			}
			
			// Add to the full set of card links.
			cardLinks.addAll(processor.getCardLinks());
			
			// Continue the loop until there are no more links to follow.
			nextLink = processor.getNextLink();
			if (nextLink == null) {
				System.out.println("No further links to follow.");
			}
		}
		
		return cardLinks;
	}
	
	private Card scrapeCard(String cardLink) {
		Card card = new Card();
		// TODO
		return card;
	}
	
	private void uploadCard(Card card) throws Exception {
		if (!card.isValid()) {
			throw new Exception("Card was not valid.");
		}
		// TODO
	}
}
