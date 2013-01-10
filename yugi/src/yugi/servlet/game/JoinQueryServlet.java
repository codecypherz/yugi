package yugi.servlet.game;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import yugi.PMF;
import yugi.model.GameSession;
import yugi.service.GameService;
import yugi.servlet.ResponseStatusCode;

public class JoinQueryServlet extends HttpServlet {

	private static final long serialVersionUID = 4279017733941892955L;
	private static final Logger logger = Logger.getLogger(JoinQueryServlet.class.getName());

	private static final GameService gameService = GameService.getInstance();
	
	/**
	 * This is the request for games to join.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException {

		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			
			// Query for all games.
			List<GameSession> games = gameService.getAllGames(pm);
			
			// Convert the list of games into JSON games.
			List<JSONObject> jsonGames = new ArrayList<JSONObject>();
			for (GameSession game : games) {
				jsonGames.add(game.toJson());
			}
	
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("games", new JSONArray(jsonGames));
			res.setContentType("text/json");
			res.getWriter().write(jsonObject.toString());

		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to write the JSON result.", e);
			res.setStatus(ResponseStatusCode.INTERNAL_SERVER_ERROR.getCode());
		} finally {
			pm.close();
		}
	}
}
