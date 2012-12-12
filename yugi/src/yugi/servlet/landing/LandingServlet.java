package yugi.servlet.landing;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Screen;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class LandingServlet extends HttpServlet {

	private static final long serialVersionUID = 4557589374360550557L;

	UserService userService = UserServiceFactory.getUserService();

	/**
	 * This is request for the application.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		
		ServletUtil.writeScreen(req, resp, Screen.LANDING);
	}
}
