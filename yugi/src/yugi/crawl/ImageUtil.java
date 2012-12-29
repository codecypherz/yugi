package yugi.crawl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileService;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;

public class ImageUtil {

	private static final Logger logger = Logger.getLogger(ImageUtil.class.getName());

	private static final String MIME_TYPE_JPEG = "image/jpeg";
	private static final String MIME_TYPE_PNG = "image/png";

	private static final FileService fileService = FileServiceFactory.getFileService();
	
	/**
	 * Reads the image in from the URL and stores it in blob store.  The key to
	 * the new blob is returned.
	 * @param imageUrl The URL from which to read the image.
	 * @return The blob key for the image.
	 */
	public static BlobKey createImage(String imageUrl) {
		
		// Figure out the mime type so the image is served properly.
		String imageMimeType = getImageMimeType(imageUrl);
		
		// Read in the bytes and make sure it succeede.
		byte[] imageBytes = getImageBytes(imageUrl);
		if (imageBytes == null) {
			return null;
		}
		
		try {
			// Now for the trick.  Write the image using the file service while
			// giving it the correct mime type.  Then return the blob key for
			// that.
			AppEngineFile imageFile = fileService.createNewBlobFile(imageMimeType);
			FileWriteChannel writeChannel = fileService.openWriteChannel(
					imageFile, true);
			writeChannel.write(ByteBuffer.wrap(imageBytes));
			writeChannel.closeFinally();
			return fileService.getBlobKey(imageFile);
		} catch (IOException e) {
			logger.log(Level.SEVERE, "Failed to create the image blob", e);
		}
		return null;
	}
	
	/**
	 * Gets the image's mime type based on the URL (which will be treated like
	 * a file name).
	 * @param imageUrl The image URL.
	 * @return The mime type to use for the image.
	 */
	private static String getImageMimeType(String imageUrl) {
		imageUrl = imageUrl.toLowerCase();
		if (imageUrl.endsWith(".jpg") || imageUrl.endsWith(".jpeg")) {
			return MIME_TYPE_JPEG;
		} else if (imageUrl.endsWith(".png")) {
			return MIME_TYPE_PNG;
		}
		return MIME_TYPE_JPEG;
	}
	
	/**
	 * Gets the image bytes for the image at the URL.
	 * @param imageUrl The URL of the image.
	 * @return The bytes representing the image.
	 */
	private static byte[] getImageBytes(String imageUrl) {
		try {
			ByteArrayOutputStream bais = new ByteArrayOutputStream();
			URL url = new URL(imageUrl);
			InputStream is = url.openStream();
			byte[] byteChunk = new byte[4096];
			int n;
			while ((n = is.read(byteChunk)) > 0) {
				bais.write(byteChunk, 0, n);
			}
			return bais.toByteArray();
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to get this URL: " + imageUrl, e);
		}
		return null;
	}
}
