package yugi.crawl;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

public class PageUtil {

	private static final Logger logger = Logger.getLogger(PageUtil.class.getName());
	
	/**
	 * Makes an HTTP GET request at the URL and waits synchronously for the
	 * response.  The response is then fully read into memory and the result
	 * returned as a string, so use with caution.
	 * @param url The URL for which to make the HTTP GET request.
	 * @return The response as a string.
	 */
	public static String get(String urlString) {
		try {
			URL url = new URL(urlString);
			BufferedReader reader = new BufferedReader(
					new InputStreamReader(url.openStream()));
			String line;
			StringBuilder sb = new StringBuilder();
			while ((line = reader.readLine()) != null) {
				sb.append(line);
			}
			return sb.toString();
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to get this URL: " + urlString, e);
		}
		return null;
	}
}
