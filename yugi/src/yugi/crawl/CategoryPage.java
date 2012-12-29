package yugi.crawl;

import java.util.HashSet;
import java.util.Set;
import java.util.logging.Logger;

public class CategoryPage {

	private static final Logger logger = Logger.getLogger(CategoryPage.class.getName());

	private static final String URL_PREFIX = "http://yugioh.wikia.com";

	private String url;
	private Set<String> cardUrls;
	private CategoryPage nextPage;
	
	/**
	 * Constructs the category page.
	 * @param url The URL for the page.
	 */
	public CategoryPage(String url) {
		this.url = url;
		cardUrls = new HashSet<String>();
	}
	
	public String getUrl() {
		return url;
	}

	public Set<String> getCardUrls() {
		return cardUrls;
	}
	
	public CategoryPage getNextPage() {
		return nextPage;
	}
	
	/**
	 * Makes the HTTP request at the URL and parses card URLs from the response.
	 */
	public void requestAndParse() throws ParseException {
		logger.info("Requesting and parsing this URL: " + url);
		String contents = PageUtil.get(url);
		if (contents == null) {
			throw new ParseException("Failed to get the page contents.");
		}
		
		int cardStartPoint = findNextPage(contents);
		int cardEndPoint = findCardEndPoint(contents, cardStartPoint);
		if (cardEndPoint < 0) {
			throw new ParseException("Failed to find the card end point.");
		}
		
		int currentIndex = cardStartPoint;
		while (currentIndex > 0 && currentIndex < cardEndPoint) {
			currentIndex = findNextCardUrl(contents, currentIndex, cardEndPoint);
		}
		logger.info("Finished parsing. Found " + cardUrls.size() + " card URLs.");
	}
	
	/**
	 * Finds the next page URL and creates the next CategoryPage if found.
	 * @param contents The contents to search.
	 * @return The index in contents immediately following the next page URL.
	 */
	private int findNextPage(String contents) {
		int previousIndex = contents.indexOf("previous 200");
		
		String str = "(<a href=\"";
		int i = contents.indexOf(str, previousIndex);
		if (i < 0 || (i - previousIndex) > 300) {
			// Navigation termination!
			// If not found, or found greater than 300 characters away,
			// consider not found and continue the search for cards on the now
			// last page.
			return contents.indexOf("next 200") + 10;
		} else {
			
			// There's a next page, so set it.
			int start = i + str.length();
			int finish = contents.indexOf("\"", start);
			String nextPageUrl = URL_PREFIX + contents.substring(start, finish);
			nextPage = new CategoryPage(nextPageUrl);
			return finish + 1;			
		}
	}
	
	/**
	 * Finds the card end point by searching the contents from the start point.
	 * @param contents The contents to search.
	 * @param startPoint The start point.
	 * @return The card end point.
	 */
	private int findCardEndPoint(String contents, int startPoint) {
		// This will be the first previous 200 link.
		return contents.indexOf("(<a href=\"", startPoint);
	}
	
	/**
	 * Finds the next card URL in the contents from the start point, but ignores
	 * the URL if the index is found to be at or after the end index.
	 * @param contents The contents to search.
	 * @param index The start index.
	 * @param endIndex The end index.
	 * @return The new start index.
	 */
	private int findNextCardUrl(String contents, int index, int endIndex) {
		if (index >= endIndex) {
			return endIndex;
		}
		String str = "<a href=\"";
		int i = contents.indexOf(str, index);
		if (i >= endIndex) {
			return endIndex;
		}
		int start = i + str.length();
		int finish = contents.indexOf("\"", start);
		String cardUrl = URL_PREFIX + contents.substring(start, finish);
		cardUrls.add(cardUrl);
		return finish + 1;
	}
}
