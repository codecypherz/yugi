package yugi.servlet.deck;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.Config.HtmlParam;
import yugi.Screen;
import yugi.servlet.ResponseStatusCode;
import yugi.servlet.ServletUtil;

public class DeckViewerServlet extends HttpServlet {
	
	private static final long serialVersionUID = -5474401166446145144L;
	private static final Logger logger = Logger.getLogger(DeckViewerServlet.class.getName());
	
	/**
	 * This is the request for the deck viewer page.
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException {
		
		// No authentication is required to view a deck.
		
		// Get the deck key from the request.
		String deckKey = Config.getDeckKey(req);
		
		if (deckKey == null) {
			
			// If no deck key, return an error response.
			logger.severe("No deck key specified.");
    		res.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}
		
		// Write the page.
		Map<HtmlParam, String> paramMap = new HashMap<HtmlParam, String>();
		paramMap.put(HtmlParam.DECK_KEY, deckKey);
		paramMap.put(HtmlParam.READ_ONLY, "true");
		
		ServletUtil.writeScreen(req, res, Screen.DECK_EDITOR, paramMap);
	}
}
