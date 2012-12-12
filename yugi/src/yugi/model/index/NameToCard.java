package yugi.model.index;

import java.util.HashSet;

import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable
public class NameToCard {

	@PrimaryKey
	@Persistent
	private String nameToken;

	@Persistent
	private HashSet<String> cardKeys = new HashSet<String>();

	public String getNameToken() {
		return nameToken;
	}
	public void setNameToken(String nameToken) {
		this.nameToken = nameToken;
	}
	
	public HashSet<String> getCardKeys() {
		return cardKeys;
	}
	public void setCardKeys(HashSet<String> cardKeys) {
		this.cardKeys = cardKeys;
	}
	public void addCardKey(String cardKey) {
		cardKeys.add(cardKey);
	}
	public void removeCardKey(String cardKey) {
		cardKeys.remove(cardKey);
	}
	public int getNumCards() {
		return cardKeys.size();
	}
	
	@Override
	public boolean equals(Object object) {
		if (!(object instanceof NameToCard)) {
			return false;
		}
		NameToCard other = (NameToCard) object;
		return nameToken.equals(other.nameToken);
	}
	
	@Override
	public int hashCode() {
		return nameToken.hashCode();
	}
}
