package yugi.scraper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * This class knows how to download a web page and parse for card links.
 */
public class CardLinksProcessor {

	private final Set<String> cardLinks;
	private String nextLink;
	
	public CardLinksProcessor() {
		cardLinks = new HashSet<String>();
	}

	public Set<String> getCardLinks() {
		return cardLinks;
	}
	
	public String getNextLink() {
		return nextLink;
	}
	
	public void process(String url) throws Exception {
		
		System.out.println("Processing the following URL for card links: " + url);
		
		// Download the web page.
		String content = UrlUtil.getContent(url);
		if (content == null) {
			throw new Exception("Could not get the content from the URL.");
		}
		
		// Find the text that contains all the card links.
		int pagesDiv = content.indexOf("<div id=\"mw-pages\">");
		if (pagesDiv < 0) {
			throw new Exception("Failed to find the root div to the card link table.");
		}
		
		int endOfPagesDiv = content.indexOf("<div class=\"pagingLinks\">", pagesDiv);
		if (endOfPagesDiv < 0) {
			throw new Exception("Failed to find the end of the root div to the card link table.");
		}
		
		String cardLinkText = content.substring(pagesDiv, endOfPagesDiv);
		cardLinks.addAll(findAllLinks(cardLinkText));
		
		// Find the text that contains the next link.
		int nextLinkSpan = content.indexOf("<span class=\"nextLink\">", endOfPagesDiv);
		if (nextLinkSpan < 0) {
			throw new Exception("Failed to find paging links div.");
		}
		
		int endOfNextLinkSpan = content.indexOf("<script>", nextLinkSpan);
		if (endOfNextLinkSpan < 0) {
			throw new Exception("Failed to find the end of the next link span.");
		}
		
		String nextLinkText = content.substring(nextLinkSpan, endOfNextLinkSpan);
		List<String> nextLinks = findAllLinks(nextLinkText);
		if (nextLinks.size() == 1) {
			nextLink = nextLinks.get(0);
		}
	}
	
	/**
	 * Finds all the links it can in the given text.
	 * @param text The text in which to search for links.
	 * @return The list of links found in the text.
	 */
	private List<String> findAllLinks(String text) {
		List<String> links = new ArrayList<String>();
		
		String aTagBegin = "<a ";
		
		String hrefBegin = "href=\"";
		String hrefEnd = "\"";
		
		int aTagBeginIndex = text.indexOf(aTagBegin);
		while (aTagBeginIndex >= 0) {
			
			// Now that we have the location of an a tag, look for the href.
			int hrefBeginIndex = text.indexOf(hrefBegin, aTagBeginIndex);
			
			// If there is no href in the a tag, then look for another a tag.
			if (hrefBeginIndex < 0) {
				aTagBeginIndex = text.indexOf(aTagBegin, aTagBeginIndex + aTagBegin.length());
				continue;
			}
			
			// Look for the end of the href.
			int linkBeginIndex = hrefBeginIndex + hrefBegin.length();
			int linkEndIndex = text.indexOf(hrefEnd, linkBeginIndex);
			
			// If we don't find the end of the href, then stop parsing the text.
			if (linkEndIndex < 0) {
				break;
			}
			
			// Grab the link and unescape any HTML entity escaped characters.
			// Example: "&amp;" should be converted to "&".
			String link = text.substring(linkBeginIndex, linkEndIndex);
			link = link.replaceAll("&amp;", "&");
			
			links.add(link);
			
			// Search for the next a tag.
			aTagBeginIndex = text.indexOf(aTagBegin, linkEndIndex);
		}
		
		return links;
	}
}
