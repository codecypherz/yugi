package yugi.model;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

@PersistenceCapable
public class GameSession {

	/**
	 * This is the unique ID assigned by AppEngine's datastore.
	 */
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	/**
	 * This is the name the user gave the game itself (e.g. Game of Awesomeness).
	 */
	@Persistent
	private String name;

	/**
	 * This is the name the player provided for themselves.
	 */
	@Persistent
	private String player1;
	
	/**
	 * This is the ID that is stored in the cookie.  It identifies the player
	 * specifically fo this game and the scheme used is gameKey + "1".  This is
	 * used if/when the player rejoins their game.
	 */
	@Persistent
	private String player1ClientId;

	/**
	 * TODO This may not be needed after moving to the new connection servlets.
	 * Whether the player is currently connected or not.
	 */
	@Persistent
	private boolean player1Connected;
	
	/**
	 * This is used to determine if synchronization is needed.  In other words,
	 * if this player was once connected, it now needs to ask the other client
	 * for the game state.
	 */
	@Persistent
	private boolean player1WasConnected;
	
	/**
	 * The name the second player gave themselves.
	 */
	@Persistent
	private String player2;
	
	/**
	 * This is the ID that is stored in the cookie.  It identifies the player
	 * specifically fo this game and the scheme used is gameKey + "2".  This is
	 * used if/when the player rejoins their game.
	 */
	@Persistent
	private String player2ClientId;
	
	/**
	 * TODO This may not be needed after moving to the new connection servlets.
	 * Whether the player is currently connected or not.
	 */
	@Persistent
	private boolean player2Connected;
	
	/**
	 * This is used to determine if synchronization is needed.  In other words,
	 * if this player was once connected, it now needs to ask the other client
	 * for the game state.
	 */
	@Persistent
	private boolean player2WasConnected;
	
	public GameSession(String name) {
		this.name = name;
	}

	public Key getKey() {
		return key;
	}

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}

	public String getPlayer1() {
		return player1;
	}
	public void setPlayer1(String player1) {
		this.player1 = player1;
	}
	
	public String getPlayer2() {
		return player2;
	}
	public void setPlayer2(String player2) {
		this.player2 = player2;
	}

	public String getPlayer1ClientId() {
		return player1ClientId;
	}
	public void setPlayer1ClientId(String player1ClientId) {
		this.player1ClientId = player1ClientId;
	}
	
	public String getPlayer2ClientId() {
		return player2ClientId;
	}
	public void setPlayer2ClientId(String player2ClientId) {
		this.player2ClientId = player2ClientId;
	}
	
	public boolean isPlayer1Connected() {
		return player1Connected;
	}
	public void setPlayer1Connected(boolean player1Connected) {
		this.player1Connected = player1Connected;
	}
	
	public boolean isPlayer2Connected() {
		return player2Connected;
	}
	public void setPlayer2Connected(boolean player2Connected) {
		this.player2Connected = player2Connected;
	}
	
	public boolean wasPlayer1Connected() {
		return player1WasConnected;
	}
	public void setPlayer1WasConnected(boolean player1WasConnected) {
		this.player1WasConnected = player1WasConnected;
	}
	
	public boolean wasPlayer2Connected() {
		return player2WasConnected;
	}
	public void setPlayer2WasConnected(boolean player2WasConnected) {
		this.player2WasConnected = player2WasConnected;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		
		sb.append("Key: ");
		if (key == null) {
			sb.append(key);
		} else {
			sb.append(KeyFactory.keyToString(key));
		}
		
		sb.append("\n");
		sb.append("Player 1: name = ");
		sb.append(player1);
		sb.append(" client id = ");
		sb.append(player1ClientId);
		sb.append(" connected = ");
		sb.append(player1Connected);
		
		sb.append("\n");
		sb.append("Player 2: name = ");
		sb.append(player2);
		sb.append(" client id = ");
		sb.append(player2ClientId);
		sb.append(" connected = ");
		sb.append(player2Connected);
		
		return sb.toString();
	}
}
