package yugi.crawl;

import java.util.logging.Logger;

import yugi.model.Card;
import yugi.model.Card.ExtraMonsterType;
import yugi.model.Card.MonsterType;
import yugi.model.Card.SpellType;
import yugi.model.Card.TrapType;
import yugi.model.Card.Type;

public class CardPage {

	private static final Logger logger = Logger.getLogger(CardPage.class.getName());
	
	private String url;
	private Card parsedCard;
	private String parsedImageUrl;
	
	public CardPage(String url) {
		this.url = url;
	}
	
	public Card getParsedCard() {
		return parsedCard;
	}
	
	public String getParsedImageUrl() {
		return parsedImageUrl;
	}
	
	public void requestAndParse() throws ParseException {
		logger.info("Requesting and parsing this URL: " + url);
		String contents = PageUtil.get(url);
		if (contents == null) {
			throw new ParseException("Failed to get the page contents.");
		}
		
		parse(contents);
	}
	
	public void parse(String contents) throws ParseException {
		parsedCard = new Card();
		
		// General
		findCardName(contents);
		findCardImageUrl(contents);
		int descIndex = findDescription(contents);
		
		// Spell/Trap only
		findType(contents, descIndex);
		findProperty(contents, descIndex);
		
		// Monster only
		findAttribute(contents, descIndex);
		findTypes(contents, descIndex);
		findLevel(contents, descIndex);
		findRank(contents, descIndex); // No level should exist (XYZ only)
		findAttackDefense(contents, descIndex);
	}
	
	private void findCardName(String contents) {
		String str = "<th class=\"cardtable-header\"";
		int i = contents.indexOf(str);
		int start = contents.indexOf(">", i) + 1;
		int finish = contents.indexOf("<", start);
		parsedCard.setName(contents.substring(start, finish));
		parsedCard.setUpperName(parsedCard.getName().toUpperCase());
	}
	
	private void findCardImageUrl(String contents) {
		String str = "class=\"cardtable-cardimage\"";
		int i = contents.indexOf(str);
		str = "<a href=\"";
		int start = contents.indexOf(str, i) + str.length();
		int finish = contents.indexOf("\"", start);
		parsedImageUrl = contents.substring(start, finish);
	}
	
	private int findDescription(String contents) {
		String str = "Card description";
		int i = contents.indexOf(str);
		i = contents.indexOf("class=\"navbox-list\"", i);
		int start = contents.indexOf(">", i) + 1;
		int finish = contents.indexOf("</td>", start);
		String rawDescription = contents.substring(start, finish);
		
		String desc = rawDescription
				// Convert all <br> to new lines.
				.replaceAll("<br>", "\n")
				// Convert all tags to nothing.
				.replaceAll("<.+?>", "")
				// Convert all unicode to a new line and a dash.  This is really
				// just for the black circles that are found on cards that have
				// multiple scenarios or options.
				.replaceAll("\\p{C}", "UNICODE_REPLACED")
				.replaceAll("UNICODE_REPLACED.{3}", "\n-");

		parsedCard.setDescription(desc);
		return start;
	}
	
	private void findType(String contents, int descIndex) throws ParseException {
		String str = "Type</th>";
		int i = contents.indexOf(str);
		if (i < 0) {
			return;
		}
		str = "<a href=\"";
		i = contents.indexOf(str, i);
		int start = contents.indexOf(">", i) + 1;
		if (start >= descIndex) {
			return;
		}
		int finish = contents.indexOf("<", start);
		String spellOrTrap = contents.substring(start, finish).toLowerCase();
		if (spellOrTrap.equals("spell card")) {
			setCardType(Type.SPELL);
		} else if (spellOrTrap.equals("trap card")) {
			setCardType(Type.TRAP);
		}
	}
	
	private void findProperty(String contents, int descIndex) throws ParseException {
		String str = "Property</a>";
		int i = contents.indexOf(str);
		if (i < 0) {
			return;
		}
		str = "<a href=\"";
		i = contents.indexOf(str, i);
		int start = contents.indexOf(">", i) + 1;
		if (start >= descIndex) {
			return;
		}
		int finish = contents.indexOf("<", start);
		String propertyString = contents.substring(start, finish).toUpperCase();
		if (parsedCard.getType() == Type.SPELL) {
			if (propertyString.equals("QUICK-PLAY")) {
				propertyString = "QUICKPLAY";
			}
			try {
				parsedCard.setSpellType(SpellType.valueOf(propertyString));					
			} catch (IllegalArgumentException e) {
				throw new ParseException(
						"Failed to identify this spell type: " + propertyString);
			}
		} else if (parsedCard.getType() == Type.TRAP) {
			try {
				parsedCard.setTrapType(TrapType.valueOf(propertyString));					
			} catch (IllegalArgumentException e) {
				throw new ParseException(
						"Failed to identify this trap type: " + propertyString);
			}
		}
	}
	
	private void findAttribute(String contents, int descIndex) throws ParseException {
		String str = "Attribute</a>";
		int i = contents.indexOf(str);
		if (i < 0) {
			return;
		}
		str = "<a href=\"";
		i = contents.indexOf(str, i);
		int start = contents.indexOf(">", i) + 1;
		if (start >= descIndex) {
			return;
		}
		int finish = contents.indexOf("<", start);
		parsedCard.setAttribute(contents.substring(start, finish));
		setCardType(Type.MONSTER);
	}
	
	private void findTypes(String contents, int descIndex) throws ParseException {
		String str = "Types</a>";
		int i = contents.indexOf(str);
		if (i < 0) {
			// No "Types" found, so search for "Type".
			i = contents.indexOf("Type</a>");
			if (i < 0) {
				return; // Nothing found at this point means there is no type.
			}
		}
		if (i >= descIndex) {
			return;
		}
		int end = contents.indexOf("</td>", i);
		while (i > 0 && i < end) {
			str = "<a href=\"";
			i = contents.indexOf(str, i);
			if (i < 0 || i >= end) {
				i = end;
				continue;
			}
			int start = contents.indexOf(">", i) + 1;
			int finish = contents.indexOf("<", start);
			String typeString = contents.substring(start, finish).toUpperCase();
			
			if (typeString.equals("EFFECT")) {
				parsedCard.setEffect(true);
			} else {
				typeString = typeString.replaceAll("-", "_");
				typeString = typeString.replaceAll(" ", "_");
				try {
					parsedCard.setMonsterType(MonsterType.valueOf(typeString));					
				} catch (IllegalArgumentException e) { } // Squash enum not found.
				
				try {
					parsedCard.setExtraMonsterType(ExtraMonsterType.valueOf(typeString));					
				} catch (IllegalArgumentException e) { } // Squash enum not found.
			}

			i = finish + 1;
		}

		setCardType(Type.MONSTER);
	}
	
	private void findLevel(String contents, int descIndex) throws ParseException {
		String str = "Level</a>";
		int i = contents.indexOf(str);
		if (i < 0) {
			return;
		}
		str = "<a href=\"";
		i = contents.indexOf(str, i);
		int start = contents.indexOf(">", i) + 1;
		if (start >= descIndex) {
			return;
		}
		int finish = contents.indexOf("<", start);
		parsedCard.setLevel(contents.substring(start, finish));
		setCardType(Type.MONSTER);
	}
	
	private void findRank(String contents, int descIndex) throws ParseException {
		String str = "Rank</a>";
		int i = contents.indexOf(str);
		if (i < 0) {
			return;
		}
		str = "<a href=\"";
		i = contents.indexOf(str, i);
		int start = contents.indexOf(">", i) + 1;
		if (start >= descIndex) {
			return;
		}
		int finish = contents.indexOf("<", start);
		if (parsedCard.getLevel() != null) {
			throw new ParseException(
					"Found both a level and a rank for this card.");
		}
		parsedCard.setLevel(contents.substring(start, finish));
		setCardType(Type.MONSTER);
	}
	
	private void findAttackDefense(String contents, int descIndex) throws ParseException {
		String str = ">DEF</a>";
		int i = contents.indexOf(str);
		if (i < 0) {
			return;
		}
		
		str = "<a href=\"";
		i = contents.indexOf(str, i);
		int start = contents.indexOf(">", i) + 1;
		if (start >= descIndex) {
			return;
		}
		int finish = contents.indexOf("<", start);
		parsedCard.setAttack(contents.substring(start, finish));
		
		str = "<a href=\"";
		i = contents.indexOf(str, finish);
		start = contents.indexOf(">", i) + 1;
		finish = contents.indexOf("<", start);
		parsedCard.setDefense(contents.substring(start, finish));
		
		setCardType(Type.MONSTER);
	}
	
	private void setCardType(Type type) throws ParseException {
		Type t = parsedCard.getType();
		if (t != null && t != type) {
			throw new ParseException(
					"Found the card to be both a " + t + " and a " + type);
		}
		parsedCard.setType(type);
		
		if (type == Type.MONSTER) {
			if (parsedCard.isEffect() == null) {
				parsedCard.setEffect(false); // No effect by default.
			}
		}
	}
}
