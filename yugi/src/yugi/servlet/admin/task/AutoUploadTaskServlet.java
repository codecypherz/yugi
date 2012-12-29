package yugi.servlet.admin.task;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.PMF;
import yugi.crawl.CardPage;
import yugi.crawl.ImageUtil;
import yugi.model.Card;
import yugi.model.auto.AutoUploadCard;
import yugi.model.auto.AutoUploadCard.Status;
import yugi.service.CardService;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.images.ImagesService;
import com.google.appengine.api.images.ImagesServiceFactory;
import com.google.appengine.api.images.ServingUrlOptions;

public class AutoUploadTaskServlet extends HttpServlet {

	private static final long serialVersionUID = -4178524771029457894L;

	private static final Logger logger = Logger.getLogger(
			AutoUploadTaskServlet.class.getName());
	
	private static final BlobstoreService blobstoreService =
			BlobstoreServiceFactory.getBlobstoreService();
	private static final ImagesService imagesService =
			ImagesServiceFactory.getImagesService();
	private static final CardService cardService = CardService.getInstance();
	
	/**
	 * This will visit the card URL and create the card entry if the card did
	 * not already exist.
	 */
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		// Mark the task as successful.  This is so tasks are not automatically
		// rescheduled.  The chance of it working the second time is not high.
		// What is being done instead is modifying the auto upload card record
		// to either be marked as ERROR or COMPLETE.  The task maker will ignore
		// those.
		resp.setStatus(200);

		// Grab the auto upload card key.
		String key = req.getParameter("key");
		if (key == null) {
			logger.severe("No key specified for this task.");
			return;
		}
		
		// Process the auto upload card with the given key.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			process(pm, key);
		} finally {
			pm.close();
		}
	}
	
	/**
	 * Processes the card with the given auto upload card key.
	 * @param pm The persistence manager.
	 * @param key The key for the auto upload card.
	 */
	private void process(PersistenceManager pm, String key) {
		
		// Find the auto upload card first.
		AutoUploadCard autoUploadCard = pm.getObjectById(
				AutoUploadCard.class, KeyFactory.stringToKey(key));
		if (autoUploadCard == null) {
			logger.severe("Failed to find the auto upload card for this key: " + key);
			return;
		}

		String url = autoUploadCard.getUrl();
		logger.info("Starting auto card upload task for this URL: " + url);
		
		// Parse the page for card information.
		CardPage cardPage = new CardPage(url);
		try {
			cardPage.requestAndParse();
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to parse the card page.", e);
			fail(pm, autoUploadCard, e.getMessage());
			return;
		}
		Card card = cardPage.getParsedCard();
		
		// Check to see if the card already exists.
		String existingCardKey = cardService.getExistingCardKey(card.getUpperName());
		if (existingCardKey != null) {
			logger.info("The card already existed.  Card Name: " + card.getName());
			markExisted(pm, autoUploadCard, existingCardKey);
			return;
		}
		
		// Create the image blob from the parsed image URL.
		BlobKey blobKey = ImageUtil.createImage(cardPage.getParsedImageUrl());
		if (blobKey == null) {
			fail(pm, autoUploadCard, "Failed to create the image blob.");
			return;
		}
		
		// Try to save the new card.
		try {
			ServingUrlOptions options = ServingUrlOptions.Builder.withBlobKey(blobKey);
			String imageServingUrl = imagesService.getServingUrl(options);
			card.setImageBlobKey(blobKey);
			card.setImageSource(imageServingUrl);
			cardService.createNewCard(card);
		} catch (Exception e) {
			// If any exception occurs, delete the blob that was just created.
			logger.log(Level.SEVERE, "Failed to save the card.  Deleting blob", e);
			fail(pm, autoUploadCard, e.getMessage());
			blobstoreService.delete(blobKey);
			return;
		}
		
		// Everything finished successfully, so mark complete.
		markSuccessful(pm, autoUploadCard, card);
		logger.info("Successfully added this card: " + card.getName());
	}
	
	/**
	 * Marks the auto upload as successful.
	 * @param pm The persistence manager.
	 * @param autoUploadCard The auto upload card.
	 * @param savedCard The saved card.
	 */
	private void markSuccessful(
			PersistenceManager pm, AutoUploadCard autoUploadCard, Card savedCard) {
		autoUploadCard.setExists(false);
		autoUploadCard.setCardKey(savedCard.getKeyAsString());
		autoUploadCard.setStatus(Status.COMPLETE);
		pm.makePersistent(autoUploadCard);
	}
	
	/**
	 * Makes the auto upload card as already existing.
	 * @param pm The persistence manager.
	 * @param autoUploadCard The auto upload card.
	 * @param existingCardKey The existing card key.
	 */
	private void markExisted(
			PersistenceManager pm, AutoUploadCard autoUploadCard, String existingCardKey) {
		autoUploadCard.setExists(true);
		autoUploadCard.setCardKey(existingCardKey);
		autoUploadCard.setStatus(Status.COMPLETE);
		pm.makePersistent(autoUploadCard);
	}
	
	/**
	 * Fails the upload and sets the error message and status on the auto upload
	 * card.
	 * @param pm The persistence manager.
	 * @param autoUploadCard The auto upload card.
	 * @param message The error message.
	 */
	private void fail(
			PersistenceManager pm, AutoUploadCard autoUploadCard, String message) {
		logger.severe(message);
		autoUploadCard.setError(message);
		autoUploadCard.setStatus(Status.ERROR);
		pm.makePersistent(autoUploadCard);
	}
}
