package yugi.service;

import java.util.List;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import yugi.PMF;
import yugi.model.GameSession;

import com.google.appengine.api.datastore.KeyFactory;

/**
 * Service for querying/modifying game data.
 */
public class GameService {

	private static final Logger logger = Logger.getLogger(GameService.class.getName());
	
	private static GameService instance;
	
	/**
	 * Singleton accessor.
	 * @return The game service.
	 */
	public static GameService getInstance() {
		if (instance == null) {
			instance = new GameService();
		}
		return instance;
	}
	
	/**
	 * Creates a new game.
	 * @param gameName The name of the game.
	 * @return The newly created game.
	 */
	public GameSession newGame(String gameName) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		GameSession game;
		try {
			logger.info("Creating a new game.");
			game = new GameSession(gameName);
			pm.makePersistent(game);
			return game;
		} finally {
			pm.close();
		}
	}
	
	/**
	 * Fetches the game information for the given key.
	 * @param pm The persistence manager.
	 * @param gameKey The game's key.
	 * @return The game for the given key or null if the key is invalid.
	 */
	public GameSession getGame(PersistenceManager pm, String gameKey) {
		if (gameKey != null && !gameKey.isEmpty()) {
			try {
				return pm.getObjectById(GameSession.class, KeyFactory.stringToKey(gameKey));
			} catch (JDOObjectNotFoundException e) {
				logger.severe("Failed to find a game with this key: " + gameKey);
				return null;
			}
		}
		return null;
	}
	
	/**
	 * Gets all the games.
	 * @param pm The persistence manager.
	 * @return All games that exist.
	 */
	@SuppressWarnings("unchecked")
	public List<GameSession> getAllGames(PersistenceManager pm) {
		Query query = pm.newQuery(GameSession.class);
		try {
			return (List<GameSession>) query.execute(true);
		} finally {
			query.closeAll();
		}
	}
	
	/**
	 * Finds the game that has one of the players using this client ID.
	 * @param clientId The player's client ID.
	 * @return The game to which the client ID is associated, if any.
	 */
	public GameSession getForClientId(String clientId) {
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
	private GameSession queryByClientId(
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
