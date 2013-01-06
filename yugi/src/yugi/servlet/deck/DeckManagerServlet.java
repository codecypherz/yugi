package yugi.servlet.deck;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.Config.HtmlParam;
import yugi.Screen;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class DeckManagerServlet extends HttpServlet {
	
	private static final long serialVersionUID = 2854995977277290164L;
	
	private static UserService userService = UserServiceFactory.getUserService();
	
	/**
	 * This is the request for the application.  This only writes back the HTML.
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException {
		
		// Mark the page as read only if the request is for structure decks and
		// the user is not an administrator.
		Map<HtmlParam, String> paramMap = new HashMap<HtmlParam, String>();
		if (isReadOnly(req)) {
			paramMap.put(HtmlParam.READ_ONLY, "true");
		} else if (!userService.isUserLoggedIn()) {
			// It's not read only, so check if the user is logged in.  You need
			// to be logged in to manage decks of any sort.
			ServletUtil.writeLoginScreen(req, res);
			return;
		}
		
		ServletUtil.writeScreen(req, res, Screen.DECK_MANAGER, paramMap);
	}
	
	/**
	 * Figures out if the deck manager should be in read only mode.
	 * @param req The request.
	 * @return True if the screen should be read only.
	 */
	private boolean isReadOnly(HttpServletRequest req) {
		
		// Structure deck management is handled specially.
		if (Config.isStructureRequest(req)) {
			
			// Only a signed in admin can edit structure decks.
			if (userService.isUserLoggedIn() && userService.isUserAdmin()) {
				return false;
			}
			
			// Structure decks are read only by default.
			return true;
		}
		
		// Deck manager is editable by default since it will be for this user's
		// set of decks.
		return false;
	}
}
