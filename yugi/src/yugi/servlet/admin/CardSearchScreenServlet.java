package yugi.servlet.admin;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Screen;
import yugi.servlet.ServletUtil;

public class CardSearchScreenServlet extends HttpServlet {

	private static final long serialVersionUID = -4931453478313518066L;
	
	/**
	 * This is request for the application.  This only writes back the HTML.
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		ServletUtil.writeScreen(req, resp, Screen.SEARCH);
	}
}
