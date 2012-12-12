package yugi.query;

import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import yugi.PMF;
import yugi.model.GameSession;

/**
 * A set of convenience methods by which to query GameSession information.
 */
public class Game {

	/**
	 * Finds the game that has one of the players using this client ID.
	 * @param clientId The player's client ID.
	 * @return The game to which the client ID is associated, if any.
	 */
	public static GameSession getForClientId(String clientId) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		GameSession game = null;
		try {
			game = queryByClientId(pm, "player1ClientId", clientId);
			if (game == null) {
				game = queryByClientId(pm, "player2ClientId", clientId);
			}
		} finally {
			pm.close();
		}
		return game;
	}
	
	/**
	 * Helper method to query by a specific client ID field.
	 * @param pm The persistence manager.
	 * @param clientIdField The field by which to query.
	 * @param clientId The ID of the client.
	 * @return The game, if found - null otherwise.
	 */
	private static GameSession queryByClientId(
			PersistenceManager pm, String clientIdField, String clientId) {
		Query q = pm.newQuery(GameSession.class);
	    q.setFilter(clientIdField + " == clientIdParam");
	    q.declareParameters("String clientIdParam");

	    try {
	        @SuppressWarnings("unchecked")
			List<GameSession> results = (List<GameSession>) q.execute(clientId);
	        if (!results.isEmpty()) {
	        	return results.get(0);
	        } else {
	            return null;
	        }
	    } finally {
	        q.closeAll();
	    }
	}
}
