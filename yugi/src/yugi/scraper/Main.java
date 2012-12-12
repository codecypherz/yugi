package yugi.scraper;

/**
 * Harness for the program.
 */
public class Main {

	/**
	 * Turn this flag off when you want to do a live run.
	 */
	public static final boolean LOCAL = true;
	
	/**
	 * The host of the web site.
	 */
	public static final String HOST = "http://yugioh.wikia.com";
	
	/**
	 * Entry point to the program.
	 * @param args ignored.
	 */
	public static void main(String[] args) {
		Scraper scraper = new Scraper();
		
		// The scraper should be able to pull 4,940 cards from the site.
		scraper.scrape("http://yugioh.wikia.com/wiki/Category:TCG_cards");
	}
}
