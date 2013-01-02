package yugi.servlet.deck;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config.HtmlParam;
import yugi.Screen;
import yugi.servlet.ServletUtil;

public class DecksViewerServlet extends HttpServlet {
	
	private static final long serialVersionUID = 4146754279223717117L;

	/**
	 * This is the request for the application.  This only writes back the HTML.
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		// The decks viewer always marks the screen as read only.
		Map<HtmlParam, String> paramMap = new HashMap<HtmlParam, String>();
		paramMap.put(HtmlParam.READ_ONLY, "true");
		
		ServletUtil.writeScreen(req, resp, Screen.DECK_MANAGER, paramMap);
	}
}
