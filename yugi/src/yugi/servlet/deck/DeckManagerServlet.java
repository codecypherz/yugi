package yugi.servlet.deck;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Screen;
import yugi.servlet.ServletUtil;

public class DeckManagerServlet extends HttpServlet {

	private static final long serialVersionUID = 2854995977277290164L;
	
	/**
	 * This is the request for the application.  This only writes back the HTML.
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		ServletUtil.writeScreen(req, resp, Screen.DECK_MANAGER);
	}
}
