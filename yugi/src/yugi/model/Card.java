package yugi.model;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.json.JSONObject;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Text;

@PersistenceCapable
public class Card {

	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent
	private String name;

	/**
	 * Only used for case-insensitive queries.
	 */
	@Persistent
	private String upperName;
	
	@Persistent
	private Text description;

	@Persistent
	private Type type;
	
	@Persistent
	private BlobKey imageBlobKey;
	
	@Persistent
	private String imageSource;
	
	// Spell Card members

	@Persistent
	private SpellType spellType;
	
	// Trap Card members
	
	@Persistent
	private TrapType trapType;
	
	// Monster Card members
	
	@Persistent
	private Attribute attribute;
	
	@Persistent
	private MonsterType monsterType;
	
	@Persistent
	private ExtraMonsterType extraMonsterType;
	
	@Persistent
	private Integer attack;

	@Persistent
	private Integer defense;

	@Persistent
	private Integer level;
	
	@Persistent
	private Boolean effect;

	public void setKey(Key key) {
		this.key = key;
	}
	public void setKey(String keyString) {
		setKey(KeyFactory.stringToKey(keyString));
	}
	public Key getKey() {
		return key;
	}
	public String getKeyAsString() {
		return KeyFactory.keyToString(key);
	}

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	
	public String getUpperName() {
		return upperName;
	}
	public void setUpperName(String upperName) {
		this.upperName = upperName;
	}
	
	public String getDescription() {
		return description.getValue();
	}
	public void setDescription(String description) {
		this.description = new Text(description);
	}
	
	public Type getType() {
		return type;
	}
	public String getTypeAsString() {
		return type != null ? type.name().toLowerCase() : null;
	}
	public void setType(Type type) {
		this.type = type;
	}
	public void setType(String typeString) {
		type = Type.valueOf(typeString.toUpperCase());
	}
	
	public BlobKey getImageBlobKey() {
		return imageBlobKey;
	}
	public void setImageBlobKey(BlobKey imageBlobKey) {
		this.imageBlobKey = imageBlobKey;
	}
	
	public String getImageSource() {
		return imageSource;
	}
	public void setImageSource(String imageSource) {
		this.imageSource = imageSource;
	}
	
	// Spell card accessors/modifiers.
	public SpellType getSpellType() {
		return spellType;
	}
	public String getSpellTypeAsString() {
		return spellType != null ? spellType.name().toLowerCase() : null;
	}
	public void setSpellType(SpellType spellType) {
		this.spellType = spellType;
	}
	public void setSpellType(String spellTypeString) {
		spellType = SpellType.valueOf(spellTypeString.toUpperCase());
	}
	
	// Trap card accessors/modifiers.
	public TrapType getTrapType() {
		return trapType;
	}
	public String getTrapTypeAsString() {
		return trapType != null ? trapType.name().toLowerCase() : null;
	}
	public void setTrapType(TrapType trapType) {
		this.trapType = trapType;
	}
	public void setTrapType(String trapTypeString) {
		trapType = TrapType.valueOf(trapTypeString.toUpperCase());
	}
	
	// Monster card accessors/modifiers.
	public Attribute getAttribute() {
		return attribute;
	}
	public String getAttributeAsString() {
		return attribute != null ? attribute.name().toLowerCase() : null;
	}
	public void setAttribute(Attribute attribute) {
		this.attribute = attribute;
	}
	public void setAttribute(String attributeString) {
		attribute = Attribute.valueOf(attributeString.toUpperCase());
	}
	
	public MonsterType getMonsterType() {
		return monsterType;
	}
	public String getMonsterTypeAsString() {
		return monsterType != null ? monsterType.getText() : null;
	}
	public void setMonsterType(MonsterType monsterType) {
		this.monsterType = monsterType;
	}
	public void setMonsterType(String monsterTypeString) {
		for (MonsterType monsterType : MonsterType.values()) {
			if (monsterType.getText().equalsIgnoreCase(monsterTypeString)) {
				this.monsterType = monsterType;
				return;
			}
		}
	}
	
	public ExtraMonsterType getExtraMonsterType() {
		return extraMonsterType;
	}
	public String getExtraMonsterTypeAsString() {
		return extraMonsterType != null ? extraMonsterType.getText() : null;
	}
	public void setExtraMonsterType(ExtraMonsterType extraMonsterType) {
		this.extraMonsterType = extraMonsterType;
	}
	public void setExtraMonsterType(String extraMonsterTypeString) {
		for (ExtraMonsterType extraMonsterType : ExtraMonsterType.values()) {
			if (extraMonsterType.getText().equalsIgnoreCase(extraMonsterTypeString)) {
				this.extraMonsterType = extraMonsterType;
				return;
			}
		}
	}
	
	public Integer getAttack() {
		return attack;
	}
	public String getAttackAsString() {
		if (attack == null) {
			return null;
		}
		if (attack == VARIABLE_NUMBER) {
			return VARIABLE_STRING;
		}
		return Integer.toString(attack);
	}
	public void setAttack(int attack) {
		this.attack = attack;
	}
	public void setAttack(String stringAttack) {
		// If it's the variable string, we're done.
		if (stringAttack.equals(VARIABLE_STRING)) {
			attack = VARIABLE_NUMBER;
			return;
		}
		
		// Try to parse the string to a number.
		try {
			attack = Integer.parseInt(stringAttack);
		} catch (NumberFormatException nfe) {
			// Do nothing here.
		}
	}

	public Integer getDefense() {
		return defense;
	}
	public String getDefenseAsString() {
		if (defense == null) {
			return null;
		}
		if (defense == VARIABLE_NUMBER) {
			return VARIABLE_STRING;
		}
		return Integer.toString(defense);
	}
	public void setDefense(int defense) {
		this.defense = defense;
	}
	public void setDefense(String stringDefense) {
		// If it's the variable string, we're done.
		if (stringDefense.equals(VARIABLE_STRING)) {
			defense = VARIABLE_NUMBER;
			return;
		}
		
		// Try to parse the string to a number.
		try {
			defense = Integer.parseInt(stringDefense);
		} catch (NumberFormatException nfe) {
			// Do nothing here.
		}
	}

	public Integer getLevel() {
		return level;
	}
	public String getLevelAsString() {
		return level != null ? level.toString() : null;
	}
	public void setLevel(int level) {
		this.level = level;
	}
	public void setLevel(String levelString) {
		try {
			level = Integer.parseInt(levelString);
		} catch (NumberFormatException nfe) {
			// Do nothing here.
		}
	}
	
	public Boolean isEffect() {
		return effect;
	}
	public String getEffectAsString() {
		return effect != null ? Boolean.toString(effect) : null;
	}
	public void setEffect(boolean effect) {
		this.effect = effect;
	}
	public void setEffect(String effectString) {
		this.effect = Boolean.parseBoolean(effectString);
	}
	
	public JSONObject toJson() {
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("key", getKeyAsString());
		jsonObject.put("name", getName());
		jsonObject.put("description", getDescription());
		jsonObject.put("image-source", getImageSource());
		jsonObject.put("type", getTypeAsString());
		
		// Spell card members.
		jsonObject.put("spell-type", getSpellTypeAsString());
		
		// Trap card members.
		jsonObject.put("trap-type", getTrapTypeAsString());
		
		// Monster card members.
		jsonObject.put("monster-type", getMonsterTypeAsString());
		jsonObject.put("monster-extra-type", getExtraMonsterTypeAsString());
		jsonObject.put("attribute", getAttributeAsString());
		jsonObject.put("level", getLevelAsString());
		jsonObject.put("attack", getAttackAsString());
		jsonObject.put("defense", getDefenseAsString());
		jsonObject.put("effect", getEffectAsString());
		
		return jsonObject;
	}
	
	public void setFromJson(JSONObject json) {
		setKey(json.getString("key"));
		setName(json.getString("name"));
		setDescription(json.getString("description"));
		setImageSource(json.getString("image-source"));
		setType(json.getString("type"));
		
		switch (this.getType()) {
		case MONSTER:
			setMonsterType(json.getString("monster-type"));
			setExtraMonsterType(json.getString("monster-extra-type"));
			setAttribute(json.getString("attribute"));
			setLevel(json.getString("level"));
			setAttack(json.getString("attack"));
			setDefense(json.getString("defense"));
			setEffect(json.getString("effect"));
			break;
		case SPELL:
			setSpellType(json.getString("spell-type"));
			break;
		case TRAP:
			setTrapType(json.getString("trap-type"));
			break;
		}
	}
	
	public boolean isValid() {
		// Validate the basics.
		if (name == null || name.isEmpty() ||
				upperName == null || upperName.isEmpty() ||
				description == null || description.getValue() == null ||
				description.getValue().isEmpty() ||
				imageBlobKey == null || imageSource == null ||
				type == null) {
			return false;
		}

		// Validate the sub-card specifics.
		switch (type) {
		case MONSTER:
			if (monsterType == null ||
					attribute == null ||
					level == null || level <= 0 ||
					attack == null || (attack < 0 && attack != VARIABLE_NUMBER) ||
					defense == null || (defense < 0 && defense != VARIABLE_NUMBER)) {
				return false;
			}
			break;
		case SPELL:
			if (spellType == null) {
				return false;
			}
			break;
		case TRAP:
			if (trapType == null) {
				return false;
			}
			break;
		default:
			// No type!
			return false;
		}
		
		// Everything passed.
		return true;
	}
	
	public void merge(Card card) {
		// Common card stuff.
		setName(card.getName());
		setUpperName(card.getUpperName());
		setDescription(card.getDescription());
		setType(card.getType());
		
		// Only set the image if one is there.
		if (card.getImageBlobKey() != null) {
			setImageBlobKey(card.getImageBlobKey());
		}
		if (card.getImageSource() != null && !card.getImageSource().isEmpty()) {
			setImageSource(card.getImageSource());
		}
		
		// Set type specific info.
		switch (card.getType()) {
		case MONSTER:
			setAttribute(card.getAttribute());
			setMonsterType(card.getMonsterType());
			setExtraMonsterType(card.getExtraMonsterType());
			setLevel(card.getLevel());
			setAttack(card.getAttack());
			setDefense(card.getDefense());
			setEffect(card.isEffect());
			break;
		case SPELL:
			setSpellType(card.getSpellType());
			break;
		case TRAP:
			setTrapType(card.getTrapType());
			break;
		default:
			break;
		}
		
	}

	/**
	 * The types of cards.
	 */
	public enum Type {
		MONSTER,
		SPELL,
		TRAP
	}

	/**
	 * The types of spell cards.
	 */
	public enum SpellType {
		CONTINUOUS,
		EQUIP,
		FIELD,
		NORMAL,
		QUICKPLAY,
		RITUAL
	}
	
	/**
	 * The types of trap cards.
	 */
	public enum TrapType {
		CONTINUOUS,
		COUNTER,
		NORMAL
	}
	
	/**
	 * Monster attributes.
	 */
	public enum Attribute {
		DARK,
		DIVINE,
		EARTH,
		FIRE,
		LIGHT,
		WATER,
		WIND
	}

	/**
	 * Monster types.
	 */
	public enum MonsterType {
		AQUA("Aqua"),
		ARCHETYPE("Archetype"),
		BLACK_MAGIC("Black Magic"),
		BEAST("Beast"),
		BEAST_WARRIOR("Beast Warrior"),
		CREATOR_GOD("Creator God"),
		DINOSAUR("Dinosaur"),
		DIVINE_BEAST("Divine Beast"),
		DRAGON("Dragon"),
		FAIRY("Fairy"),
		FIEND("Fiend"),
		FISH("Fish"),
		HUMAN("Human"),
		ILLUSION_MAGIC("Illusion Magic"),
		IMMORTAL("Immortal"),
		INSECT("Insect"),
		MACHINE("Machine"),
		PLANT("Plant"),
		PSYCHIC("Psychic"),
		PYRO("Pyro"),
		REPTILE("Reptile"),
		ROCK("Rock"),
		SEA_SERPENT("Sea Serpent"),
		SERIES("Series"),
		SPELLCASTER("Spellcaster"),
		THUNDER("Thunder"),
		WARRIOR("Warrior"),
		WHITE_MAGIC("White Magic"),
		WINGED_BEAST("Winged Beast"),
		ZOMBIE("Zombie");

		private String text;
		private MonsterType(String text) {
			this.text = text;
		}
		public String getText() {
			return text;
		}
	}

	/**
	 * Extra monster types.
	 */
	public enum ExtraMonsterType {
		DARK_TUNER("Dark Tuner"),
		DARK_SYNCHRO("Dark Synchro"),
		FUSION("Fusion"),
		GEMINI("Gemini"),
		RITUAL("Ritual"),
		SPIRIT("Spirit"),
		SYNCHRO("Synchro"),
		TOON("Toon"),
		TUNER("Tuner"),
		UNION("Union"),
		XYZ("Xyz");

		private String text;
		private ExtraMonsterType(String text) {
			this.text = text;
		}
		public String getText() {
			return text;
		}
	}

	/**
	 * The constant used for attack and defense when the value would read "?".
	 */
	private static int VARIABLE_NUMBER = -1;
	
	/**
	 * The constant used for attack and defense when the value would read "?".
	 */
	private static String VARIABLE_STRING = "?";

	@Override
	public String toString() {
		String desc = description != null ? description.getValue() : null;
		return "Key: " + getKey() +
				"\nName: " + getName() +
				"\nDescription: " + desc +
				"\nType: " + getTypeAsString() +
				"\nImageSource: " + getImageSource() +
				"\nSpellType: " + getSpellTypeAsString() +
				"\nTrapType: " + getTrapTypeAsString() +
				"\nMonsterType: " + getMonsterTypeAsString() +
				"\nAttribute: " + getAttributeAsString() +
				"\nExtraMonsterType: " + getExtraMonsterTypeAsString() +
				"\nLevel: " + getLevelAsString() +
				"\nEffect: " + getEffectAsString() +
				"\nAttack: " + getAttackAsString() +
				"\nDefense: " + getDefenseAsString();
	}
	
	@Override
	public boolean equals(Object object) {
		if (!(object instanceof Card)) {
			return false;
		}
		Card other = (Card) object;
		return key.equals(other.key);
	}
	
	@Override
	public int hashCode() {
		return key.hashCode();
	}
}
