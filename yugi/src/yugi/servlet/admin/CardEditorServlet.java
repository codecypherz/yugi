package yugi.servlet.admin;

import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.Config.HtmlParam;
import yugi.Config.Mode;
import yugi.PMF;
import yugi.Screen;
import yugi.index.Indexer;
import yugi.model.Card;
import yugi.servlet.ResponseStatusCode;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.images.ImagesService;
import com.google.appengine.api.images.ImagesServiceFactory;

public class CardEditorServlet extends HttpServlet {

	private static final long serialVersionUID = -2086224340036481139L;
	private static final Logger logger = Logger.getLogger(CardEditorServlet.class.getName());

	private enum FieldName {
		ATTACK,
		CARD_KEY,
		DEFENSE,
		DESCRIPTION,
		EFFECT,
		IMAGE_FILE,
		LEVEL,
		MONSTER_ATTRIBUTE,
		MONSTER_EXTRA_TYPE,
		MONSTER_TYPE,
		NAME,
		SPELL_TYPE,
		TRAP_TYPE,
		TYPE
	}

	// Initialize some private members.
	private final BlobstoreService blobstoreService =
			BlobstoreServiceFactory.getBlobstoreService();
	private final ImagesService imagesService =
			ImagesServiceFactory.getImagesService();
	
	/**
	 * This is request for the application.  This only writes back the HTML.
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		// Get the card key from the request.
		String cardKey = Config.getCardKey(req);
		if (cardKey == null) {
			cardKey = "";
		}

		// Set the URL for blobstore uploads.
		String uploadUrl = blobstoreService.createUploadUrl(
				Config.Servlet.ADMIN_CARD.getPath());

		Map<HtmlParam, String> paramMap = new HashMap<HtmlParam, String>();
		paramMap.put(HtmlParam.UPLOAD_URL, uploadUrl);
		paramMap.put(HtmlParam.CARD_KEY, cardKey);

		ServletUtil.writeScreen(req, resp, Screen.CARD, paramMap);
	}

	/**
	 * Saving card data goes through posts to this servlet.  This servlet gets
	 * hit after a successful blobstore form upload.
	 */
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
	throws IOException {

		// Get the blob key for the image that was uploaded.
		BlobKey blobKey = getBlobKey(req);

		// Try to parse the rest of the form data.
		String cardKey = null;
		try {
			cardKey = parseAndSave(req, resp, blobKey);
		} catch (Exception e) {
			// If any exception happens, clean up the blob that was just created.
			logger.log(Level.SEVERE, "Failed to save the card", e);
			logger.severe("Failed to save the card: " + e.getMessage());
			e.printStackTrace();
			if (blobKey != null) {
				logger.severe("Deleting the blob that was uploaded.");
				blobstoreService.delete(blobKey);
			}
		}

		// The card key will be null if anything failed.
		if (cardKey == null) {
			// TODO Give the user a nicer fail page, but for now just send them
			// back to the card creation screen.
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			redirect(req, resp, null);
			return;
		}
		
		// Everything succeeded.  Send the user back to the card edit screen
		// with the card key.
		redirect(req, resp, cardKey);
	}
	
	/**
	 * Gets the blob key from the request.
	 * @param req The request.
	 * @return The blob key if an image is being uploaded, null otherwise.
	 */
	private BlobKey getBlobKey(HttpServletRequest req) {

		// Make sure there is a blob being uploaded.
		Map<String, List<BlobKey>> blobs = blobstoreService.getUploads(req);
		if (blobs == null) {
			logger.info("Found no blobs being uploaded.");
			return null;
		}
		
		// Make sure there is a blob under the right name.
		List<BlobKey> blobKeys = blobs.get("image_file");
		if (blobKeys != null && blobKeys.size() > 0) {
			BlobKey blobKey = blobKeys.get(0);
			
			logger.info("Card being uploaded with this blob key: " + blobKey.toString());
			return blobKey;
		}
		
		logger.info("Did not find a blob for the image_file field.");
		return null;
	}
	
	/**
	 * Parses the rest of the request data and saves the card.
	 * @param req The request.
	 * @param resp The response.
	 * @param blobKey The key to the blob.
	 * @return The
	 * @throws Exception Thrown if anything fails. 
	 */
	private String parseAndSave(HttpServletRequest req, HttpServletResponse resp,
			BlobKey blobKey)
	throws Exception {

		logger.info("Getting ready to parse all of the card data from the request.");

		// Create a new card to store the data.
		Card newCard = new Card();
		String cardKey = null;

		// Set the effect value defaulted to false since the form won't even
		// include the input checkbox unless checked.
		newCard.setEffect(false);

		// Build the URL that will be used to serve the image.  The client will
		// reference this and have zero knowledge of the blob key.  Cards being
		// edited can optionally upload the image.
		if (blobKey != null) {
			
			// Try to get the image serving URL.
			String imageServingUrl = null;
			try {
				imageServingUrl = imagesService.getServingUrl(blobKey);
			} catch (IllegalArgumentException iae) {
				// This exception is expected when there is no image being
				// uploaded.  This is allowed to happen on an edit, so business
				// should carry on as usual here.  For whatever reason, AppEngine
				// decides to behave differently in dev vs. prod here.  In prod,
				// a blob key is always generated despite no image being uploaded.
			}

			// Use the image serving URL as the signal for a successful upload.
			if (imageServingUrl != null) {
				logger.info("There was an image uploaded, so setting the blob key to this: " +
						blobKey.toString());
				newCard.setImageBlobKey(blobKey);
				newCard.setImageSource(imageServingUrl);
			}
		}
		
		// Loop through all the form values to build out the card.
		@SuppressWarnings("unchecked")
		Enumeration<String> paramNames = req.getParameterNames();
		while (paramNames.hasMoreElements()) {
			
			// Figure out all the info about this parameter
			String paramName = (String) paramNames.nextElement();
			String[] paramValues = req.getParameterValues(paramName);
	    	String fieldNameString = paramName.toUpperCase();
	    	FieldName fieldName = FieldName.valueOf(fieldNameString);
	    	
	    	// Make sure the server found a match in the enum.
	    	if (fieldName == null) {
	    		// Just log the error and skip this field.
				logger.severe("Unknown field name: " + fieldNameString);
				continue;
	    	}
	    	logger.finer("Processing this field: " + fieldNameString);

	    	// Get the exact value of the parameter.
	    	String stringValue = null;
	    	if (paramValues != null && paramValues.length > 0) {
	    		stringValue = paramValues[0].trim();
	    	}
	    	logger.finer("Here is the string value of the field: " + stringValue);

    		// Skip this field if there is nothing.
    		if (stringValue == null || stringValue.isEmpty()) {
    			logger.fine("Skipping this field because there was no value set.");
    			continue;
    		}

	    	// Parse differently for each field.
	    	switch (fieldName) {
	    	case ATTACK:
	    		newCard.setAttack(stringValue);
	    		break;
	    	case CARD_KEY:
	    		cardKey = stringValue;
	    		break;
	    	case DEFENSE:
	    		newCard.setDefense(stringValue);
	    		break;
	    	case DESCRIPTION:
	    		newCard.setDescription(stringValue);
	    		break;
	    	case EFFECT:
	    		// The mere presence of the input field means it was checked.
	    		newCard.setEffect(true);
	    		break;
	    	case LEVEL:
	    		newCard.setLevel(stringValue);
	    		break;
	    	case MONSTER_ATTRIBUTE:
	    		newCard.setAttribute(stringValue);
	    		break;
	    	case MONSTER_EXTRA_TYPE:
	    		newCard.setExtraMonsterType(stringValue);
	    		break;
	    	case MONSTER_TYPE:
	    		newCard.setMonsterType(stringValue);
	    		break;
	    	case NAME:
	    		newCard.setName(stringValue);
	    		newCard.setUpperName(stringValue.toUpperCase());
	    		break;
	    	case SPELL_TYPE:
	    		newCard.setSpellType(stringValue);
	    		break;
	    	case TRAP_TYPE:
	    		newCard.setTrapType(stringValue);
	    		break;
	    	case TYPE:
	    		newCard.setType(stringValue);
	    		break;
	    	default:
	    		logger.warning("Did not handle field with name: " + fieldName);
	    		break;
	    	}
		}
		logger.info("Finished parsing the form data.");

		// Either create a new card or update the existing one.
		if (cardKey == null) {

			// No card key, so that means a new card will be created.
			// Make sure the card doesn't yet exist.
			String existingCardKey = getExistingCardKey(newCard.getUpperName());
			if (existingCardKey != null) {
				logger.severe("Card that failed: " + newCard.toString());
				throw new Exception(newCard.getName() + " already exists!");
			}
			
			// The card doesn't yet exist, so proceed.
			createNewCard(newCard);
			cardKey = newCard.getKeyAsString();
			
			// The card key must exist at this point because it is used to
			// redirect the client to the edit page for the newly created card.
			// If the key doesn't exist here, it means that saving the card
			// actually failed, but an exception wasn't thrown (shouldn't happen).
			if (cardKey == null) {
				logger.severe("Card that failed: " + newCard.toString());
				throw new Exception("The new card did not have a card key after saving.");
			}
		} else {

			// Update the existing one and make sure the keys match afterward.
			String existingCardKey = updateExistingCard(cardKey, newCard);
			if (!cardKey.equals(existingCardKey)) {
				logger.severe("Card that failed: " + newCard.toString());
				throw new Exception("The card being updated had a different key.");
			}
		}

		// Everything is done, so return the card key.
		return cardKey;
	}
	
	/**
	 * Checks to see if the given card already exists.
	 * @param name The name to check.
	 * @return The existing card key or null if no card was found.
	 */
	private String getExistingCardKey(String name) {
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
	 * Persists the new card.
	 * @param card The new card to persist.
	 * @throws Exception Thrown if any error occurs.
	 */
	private void createNewCard(Card card) throws Exception {

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
	
	/**
	 * Updates the existing card with the new card info.
	 * @param cardKey The card key of the existing card.
	 * @param card The object containing the new information.
	 * @return The key of the existing card.
	 * @throws Exception Thrown if anything fails.
	 */
	private String updateExistingCard(String cardKey, Card card)
	throws Exception {
		
		logger.info("Updating the card with this card key: " + cardKey);
		
		// Look up the existing card.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			BlobKey blobKeyToDelete = null;
			BlobKey newBlobKey = card.getImageBlobKey();
			
			// Look up the existing card.
			Card existingCard = pm.getObjectById(Card.class, KeyFactory.stringToKey(cardKey));
			if (newBlobKey != null) {
				blobKeyToDelete = existingCard.getImageBlobKey();
			}
			
			// See if the card name changed (we don't care about capitalization changes).
			String oldName = existingCard.getName().toUpperCase();
			String newName = card.getName().toUpperCase();
			if (!newName.equals(oldName)) {
				Indexer.updateNameIndex(oldName, newName, cardKey, pm);
			}
			
			// See if the description changed (case does not matter).
			String oldDescription = existingCard.getDescription().toUpperCase();
			String newDescription = card.getDescription().toUpperCase();
			if (!newDescription.equals(oldDescription)) {
				Indexer.updateDescriptionIndex(oldDescription, newDescription, cardKey, pm);
			}
			
			// Merge the new card info with the existing card.
			existingCard.merge(card);
			
			// Make sure everything is still valid.
			if (!existingCard.isValid()) {
				throw new Exception(
						"Failed to update the card because something was invalid.");
			}
			
			// Persist the changes.
			pm.makePersistent(existingCard);
			
			// Now clean up the old image blobstore entry if a new image was uploaded.
			// If it isn't cleaned up, it is now orphaned and space is permanently wasted.
			if (blobKeyToDelete != null) {
				logger.info("A new image was uploaded, so the old blobstore entry is being deleted: " +
						blobKeyToDelete.toString());
				BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
				blobstoreService.delete(blobKeyToDelete);
			}
			
			return existingCard.getKeyAsString();
			
		} finally {
			pm.close();
		}
	}
	
	/**
	 * Redirects the client to the card editor servlet for the card with the key.
	 * @param req The request.
	 * @param resp The response.
	 * @param cardKey The card key.
	 * @throws IOException
	 */
	private void redirect(HttpServletRequest req, HttpServletResponse resp, String cardKey)
	throws IOException {

		// The base path is the admin card screen.
		String redirect = Config.Servlet.ADMIN_CARD.getPath();
		
		// Include the card key if it is there.
		if (cardKey != null) {
			redirect += "?" + Config.UrlParameter.CARD_KEY.name().toLowerCase() + "=" + cardKey;
			// Make sure to append the mode parameter.
			Mode mode = Config.getMode(req);
			if (mode != null) {
				redirect +=
						"&" + Config.UrlParameter.MODE.name().toLowerCase() +
						"=" + mode.toString().toLowerCase();
			}
		} else {
			// No card key, so just include the mode param if necessary.
			Mode mode = Config.getMode(req);
			if (mode != null) {
				redirect +=
						"?" + Config.UrlParameter.MODE.name().toLowerCase() +
						"=" + mode.toString().toLowerCase();
			}
		}
		
		// Redirect to the constructed URL.
		resp.sendRedirect(redirect);
	}
}
