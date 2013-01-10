package yugi.servlet.game;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.Config;
import yugi.model.GameSession;
import yugi.service.GameService;
import yugi.servlet.ResponseStatusCode;
import yugi.servlet.ServletUtil;

import com.google.appengine.api.datastore.KeyFactory;

/**
 * Servlet responsible for creating new games.
 */
public class CreateGameServlet extends HttpServlet {

	private static final long serialVersionUID = 4156515370295760L;

	private static final GameService gameService = GameService.getInstance();
	
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
		GameSession game = gameService.newGame(gameName);

		// Now that the game is created, use the join servlet to actually join it.
		// This will allow the user to refresh the page and get the desired behavior.
		Map<Config.UrlParameter, String> params = new HashMap<Config.UrlParameter, String>();
		params.put(Config.UrlParameter.GAME_KEY, KeyFactory.keyToString(game.getKey()));
		params.put(Config.UrlParameter.PLAYER_NAME, playerName);
		String redirect = ServletUtil.createUrl(req, Config.Servlet.JOIN_GAME, params);

		resp.sendRedirect(redirect);
	}
}
