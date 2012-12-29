package yugi.crawl;

import java.util.HashSet;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class knows how to crawl to create auto upload card entries.
 */
public class Crawler {

	private static final Logger logger = Logger.getLogger(Crawler.class.getName());

	private final String START_POINT = "http://yugioh.wikia.com/wiki/Category:TCG_cards";
	
	private Set<String> cardUrls;
	
	public Crawler() {
		cardUrls = new HashSet<String>();
	}
	
	/**
	 * Starts the crawl.
	 */
	public void start() {
		logger.info("Starting crawl.");
		
		CategoryPage page = new CategoryPage(START_POINT);
		while (page != null) {
			try {
				page.requestAndParse();
				cardUrls.addAll(page.getCardUrls());
				page = page.getNextPage();
			} catch (Exception e) {
				logger.log(Level.SEVERE,
						"Failed to parse this category page\n" + page.getUrl(), e);
				break;
			}
		}
	}
	
	public Set<String> getCardUrls() {
		return cardUrls;
	}
}
