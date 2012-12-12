package yugi.servlet.landing;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import yugi.PMF;
import yugi.model.GameSession;
import yugi.servlet.ResponseStatusCode;

import com.google.appengine.api.datastore.KeyFactory;

public class JoinQueryServlet extends HttpServlet {

	private static final long serialVersionUID = 4279017733941892955L;
	private static final Logger logger = Logger.getLogger(JoinQueryServlet.class.getName());

	/**
	 * This is the request for games to join.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		// Query for all games that can be joined right now.
		PersistenceManager pm = PMF.get().getPersistenceManager();
		Query query = pm.newQuery(GameSession.class);

		@SuppressWarnings("unchecked")
		List<GameSession> games = (List<GameSession>) query.execute();

		try {

			// Convert the list of games into JSON games.
			ArrayList<JsonGame> jsonGames = new ArrayList<JsonGame>();
			if (!games.isEmpty()) {
				for (GameSession game : games) {
					jsonGames.add(new JsonGame(game));
				}
			}
	
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("games", new JSONArray(jsonGames));
			resp.setContentType("text/json");
			resp.getWriter().write(jsonObject.toString());

		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to write the JSON result.", e);
			resp.setStatus(ResponseStatusCode.INTERNAL_SERVER_ERROR.getCode());
		} finally {
			query.closeAll();
			pm.close();
		}
	}

	/**
	 * Class that knows how to convert a game object into a JSONObject.
	 */
	private class JsonGame extends JSONObject {
		public JsonGame(GameSession game) {
			this.put("key", KeyFactory.keyToString(game.getKey()));
			this.put("name", game.getName());
		}
	}
}
