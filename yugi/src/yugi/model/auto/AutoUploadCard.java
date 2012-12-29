package yugi.model.auto;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

@PersistenceCapable
public class AutoUploadCard {
	
	/**
	 * The various statuses for this auto upload card entry.
	 */
	public enum Status {
		COMPLETE,
		ERROR,
		INITIAL
	}
	
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;
	
	@Persistent
	private String url;
	
	@Persistent
	private Status status;
	
	@Persistent
	private Boolean exists;
	
	@Persistent
	private String cardKey;
	
	@Persistent
	private String error;
	
	public Key getKey() {
		return key;
	}
	public String getKeyAsString() {
		return KeyFactory.keyToString(key);
	}
	
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	
	public Status getStatus() {
		return status;
	}
	public void setStatus(Status status) {
		this.status = status;
	}
	
	public Boolean getExists() {
		return exists;
	}
	public void setExists(Boolean exists) {
		this.exists = exists;
	}
	
	public String getCardKey() {
		return cardKey;
	}
	public void setCardKey(String cardKey) {
		this.cardKey = cardKey;
	}
	
	public String getError() {
		return error;
	}
	public void setError(String error) {
		this.error = error;
	}
}
