package yugi.servlet.admin.task;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.PMF;
import yugi.crawl.Crawler;
import yugi.model.auto.AutoUploadCard;
import yugi.model.auto.AutoUploadCard.Status;

public class CrawlTaskServlet extends HttpServlet {

	private static final long serialVersionUID = -8988647333132967590L;
	
	private static final Logger logger = Logger.getLogger(CrawlTaskServlet.class.getName());

	/**
	 * This task will crawl to create the auto upload card entries.  This can be
	 * made as a regular request and does not have to be a task because it
	 * completes in less than 60 seconds (the time limit for a regular use
	 * request).
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		long startTime = System.currentTimeMillis();
		logger.info("Starting crawler");
		
		Crawler crawler = new Crawler();
		crawler.start();
		
		long totalTime = (System.currentTimeMillis() - startTime) / 1000;
		logger.info("Finished crawling");
		logger.info("Found " + crawler.getCardUrls().size() + " card URLs.");

		logger.info("Creating the auto upload card objects.");
		List<AutoUploadCard> autoUploadCards = new ArrayList<AutoUploadCard>();
		for (String cardUrl : crawler.getCardUrls()) {
			AutoUploadCard autoUploadCard = new AutoUploadCard();
			autoUploadCard.setUrl(cardUrl);
			autoUploadCard.setStatus(Status.INITIAL);
			autoUploadCard.setExists(false);
			autoUploadCards.add(autoUploadCard);
		}
		
		logger.info("Persisting the auto upload cards.");
		PersistenceManager pm = PMF.get().getPersistenceManager();			
		try {
			pm.makePersistentAll(autoUploadCards);
		} finally {
			pm.close();
		}
		logger.info("Finished persisting.");
		
		logger.info("It all took " + totalTime + " seconds to complete");
	}
}
