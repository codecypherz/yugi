package yugi.scraper;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;

public class UrlUtil {

	/**
	 * Gets the content of the web page at the given URL.
	 * @param urlString The web address of the page.
	 * @return The raw, unparsed content of the web page.
	 */
	public static String getContent(String urlString) {
		
		URL url;
		try {
			url = new URL(urlString);			
		} catch (MalformedURLException e) {
			e.printStackTrace();
			return null;
		}
		
		BufferedReader in = null;
		try {
			in = new BufferedReader(new InputStreamReader(url.openStream()));

	        StringBuilder sb = new StringBuilder();
	        String inputLine;
	        while ((inputLine = in.readLine()) != null) {
	            sb.append(inputLine);
	        }
	        return sb.toString();
	        
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (IOException e2) {
					e2.printStackTrace();
				}
			}
		}
        
        return null;
	}
	
	/**
	 * Gets the content of the web page at the given URL.
	 * @param urlString The web address of the page.
	 * @return The raw, unparsed content of the web page.
	 */
	/*
	public static String getContent(String urlString) {
		
		// Try to parse the URL.
		URL url;
		try {
			url = new URL(urlString);			
		} catch (MalformedURLException e) {
			e.printStackTrace();
			return null;
		}
		
		// Try to read in from the connection.
		URLConnection urlConnection = null;
		InputStream inputStream = null;
		BufferedInputStream bufferedInputStream = null;
		try {
			urlConnection = url.openConnection();
			inputStream = urlConnection.getInputStream();
			bufferedInputStream = new BufferedInputStream(inputStream);
			
			StringBuilder sb = new StringBuilder();
			byte[] buffer = new byte[4096];
			while (bufferedInputStream.read(buffer) > 0) {
				sb.append(new String(buffer));
			}
			
			return sb.toString();
			
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (inputStream != null) {
				try {
					inputStream.close();
				} catch (IOException e2) {
					e2.printStackTrace();
				}
			}
			if (bufferedInputStream != null) {
				try {
					bufferedInputStream.close();
				} catch (IOException e2) {
					e2.printStackTrace();
				}
			}
		}
		
		return null;
	}
	*/
}
