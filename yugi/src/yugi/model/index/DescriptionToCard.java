package yugi.model.index;

import java.util.HashSet;

import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable
public class DescriptionToCard {

	@PrimaryKey
	@Persistent
	private String descriptionToken;

	@Persistent
	private HashSet<String> cardKeys = new HashSet<String>();

	public String getDescriptionToken() {
		return descriptionToken;
	}
	public void setDescriptionToken(String descriptionToken) {
		this.descriptionToken = descriptionToken;
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
		if (!(object instanceof DescriptionToCard)) {
			return false;
		}
		DescriptionToCard other = (DescriptionToCard) object;
		return descriptionToken.equals(other.descriptionToken);
	}
	
	@Override
	public int hashCode() {
		return descriptionToken.hashCode();
	}
}
