package yugi.model;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.json.JSONArray;
import org.json.JSONObject;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

@PersistenceCapable
public class Deck {

	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent
	private String userId;

	@Persistent
	private Boolean isStructure;

	@Persistent
	private String name;

	@Persistent
	private String mainCardKey;

	@Persistent
	private List<String> mainCardKeys = new ArrayList<String>();

	@Persistent
	private List<String> extraCardKeys = new ArrayList<String>();
	
	@Persistent
	private List<String> sideCardKeys = new ArrayList<String>();
	
	/**
	 * The types of subsets of cards within the deck.
	 */
	public enum Type {
		MAIN,
		EXTRA,
		SIDE
	}
	
	public Key getKey() {
		return key;
	}
	
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}

	public Boolean isStructure() {
		return isStructure;
	}
	public void setStructure(Boolean isStructure) {
		this.isStructure = isStructure;
	}

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	
	public String getMainCardKey() {
		return mainCardKey;
	}
	public void setMainCardKey(String mainCardKey) {
		this.mainCardKey = mainCardKey;
	}

	public List<String> getMainCardKeys() {
		return mainCardKeys;
	}
	public void setMainCardKeys(List<String> mainCardKeys) {
		this.mainCardKeys = mainCardKeys;
	}
	
	public List<String> getExtraCardKeys() {
		return extraCardKeys;
	}
	public void setExtraCardKeys(List<String> extraCardKeys) {
		this.extraCardKeys = extraCardKeys;
	}
	
	public List<String> getSideCardKeys() {
		return sideCardKeys;
	}
	public void setSideCardKeys(List<String> sideCardKeys) {
		this.sideCardKeys = sideCardKeys;
	}
	
	public void merge(Deck deck) {
		setName(deck.getName());
		setMainCardKey(deck.getMainCardKey());
		setMainCardKeys(deck.getMainCardKeys());
		setExtraCardKeys(deck.getExtraCardKeys());
		setSideCardKeys(deck.getSideCardKeys());
	}
	
	public boolean isValid() {
		return name != null && !name.isEmpty();
	}
	
	public JSONObject toJson(Card mainCard) {
		return toJson(mainCard, null, null, null);
	}
	
	public JSONObject toJson(Card mainCard,
			List<Card> mainCards, List<Card> extraCards, List<Card> sideCards) {
		
		JSONObject json = new JSONObject();
		json.put("key", KeyFactory.keyToString(key));
		json.put("user-id", userId);
		// TODO: Remove this once all decks have this flag set.
		if (isStructure == null) {
			json.put("is-structure", false);
		} else {
			json.put("is-structure", isStructure);
		}
		json.put("name", name);
		
		if (mainCard != null) {
			json.put("main-card", mainCard.toJson());
		}
		
		setCardJsonArray(json, mainCards, "main-cards");
		setCardJsonArray(json, extraCards, "extra-cards");
		setCardJsonArray(json, sideCards, "side-cards");
		
		return json;
	}
	
	/**
	 * Converts the card list and puts in on the deck JSON object.
	 * @param deckJson The deck's JSON representation.
	 * @param cards The list of cards to put.  Does nothing if the list is null.
	 * @param listKey The key to associate the array.
	 */
	private void setCardJsonArray(JSONObject deckJson, List<Card> cards, String listKey) {
		if (cards != null) {
			JSONArray cardArray = new JSONArray();
			for (Card card : cards) {
				cardArray.put(card.toJson());
			}
			deckJson.put(listKey, cardArray);
		}
	}
	
	public void setFromJson(JSONObject json) {
		setName(json.getString("name"));
		
		String mainCardJsonKey = "main-card";
		if (json.has(mainCardJsonKey) && !json.isNull(mainCardJsonKey)) {
			Card mainCard = new Card();
			mainCard.setFromJson(json.getJSONObject("main-card"));
			setMainCardKey(mainCard.getKeyAsString());
		}

		// Clear the existing key lists.
		mainCardKeys = new ArrayList<String>();
		extraCardKeys = new ArrayList<String>();
		sideCardKeys = new ArrayList<String>();

		// Set the new cards.
		addCardKeys(json.getJSONArray("main-cards"), mainCardKeys);
		addCardKeys(json.getJSONArray("extra-cards"), extraCardKeys);
		addCardKeys(json.getJSONArray("side-cards"), sideCardKeys);
	}
	
	private void addCardKeys(JSONArray array, List<String> cardKeys) {
		for (int i = 0; i < array.length(); i++) {
			Card card = new Card();
			card.setFromJson(array.getJSONObject(i));
			cardKeys.add(card.getKeyAsString());
		}
	}
}
