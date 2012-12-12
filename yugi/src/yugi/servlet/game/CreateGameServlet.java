package yugi.servlet.game;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.PMF;
import yugi.model.GameSession;
import yugi.servlet.ResponseStatusCode;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.datastore.KeyFactory;

/**
 * Servlet responsible for creating new games.
 */
public class CreateGameServlet extends HttpServlet {

	private static final long serialVersionUID = 4156515370295760L;
	private static final Logger logger = Logger.getLogger(CreateGameServlet.class.getName());

	/**
	 * This is essentially the entry point to the game portion of the program.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		// Grab the game name and player name from the URL.
		String gameName = Config.getGameName(req);
		String playerName = Config.getPlayerName(req);

		// Make sure the parameters were passed and valid.
		if (gameName == null || playerName == null) {
			resp.setStatus(ResponseStatusCode.BAD_REQUEST.getCode());
			return;
		}

		// Create the new game.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		GameSession game;
		try {
			logger.info("Creating a new game.");
			game = new GameSession(gameName);
			pm.makePersistent(game);
		} finally {
			pm.close();
		}

		// Now that the game is created, use the join servlet to actually join it.
		Map<Config.UrlParameter, String> params = new HashMap<Config.UrlParameter, String>();
		params.put(Config.UrlParameter.GAME_KEY, KeyFactory.keyToString(game.getKey()));
		params.put(Config.UrlParameter.PLAYER_NAME, playerName);
		String redirect = ServletUtil.createUrl(req, Config.Servlet.JOIN_GAME, params);

		resp.sendRedirect(redirect);
	}
}
