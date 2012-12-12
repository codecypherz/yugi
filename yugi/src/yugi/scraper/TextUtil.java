package yugi.scraper;

public class TextUtil {

	private static final String LINK_BEGIN = "<a href";
	private static final String LINK_END = "</a>";
	
	/**
	 * Removes all "a tags" from the text leaving the values of those "a tags"
	 * in place.
	 * @param text The text to de-link.
	 * @return The de-linked text.
	 */
	public static String delink(String text) {
		
		StringBuilder sb = new StringBuilder();
		
		int currentIndex = 0;
		int linkIndex = text.indexOf(LINK_BEGIN);
		while (linkIndex >= 0) {
			sb.append(text.substring(currentIndex, linkIndex));

			// Find the content of the link tag.
			int contentIndex = text.indexOf(">", linkIndex) + 1;
			int contentEndIndex = text.indexOf(LINK_END, contentIndex);
			if (contentEndIndex < 0) {
				// This would be strange.  Just stop parsing, I guess.
				break;
			}
			
			sb.append(text.substring(contentIndex, contentEndIndex));
			currentIndex = contentEndIndex + LINK_END.length();
			
			// Look for the next link.
			linkIndex = text.indexOf(LINK_BEGIN, currentIndex);
		}
		
		sb.append(text.substring(currentIndex));
		
		return sb.toString();
	}
}
