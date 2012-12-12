package yugi.scraper;

import java.util.HashSet;
import java.util.Set;

import yugi.model.Card;

public class CardProcessor {

	private Card card;
	private String content;
	private int nextIndex;
	
	/**
	 * Default constructor.
	 */
	public CardProcessor() {
		card = new Card();
		content = "";
		nextIndex = 0;
	}
	
	/**
	 * Processes the URL for information about the card.
	 * @param url The URL to visit for card information.
	 * @return The card object representing the information processed.
	 */
	public Card process(String url) throws Exception {
		
		// Download the web page.
		content = UrlUtil.getContent(url);
		if (content == null) {
			throw new Exception("Could not get the content from the URL.");
		}

		// TODO Determine monster, spell, trap
		
		setName();
		setAttribute();
		setTypes();
		setLevel();
		setAttackAndDefense();
		setDescription();
		
		return card;
	}
	
	/**
	 * Sets the name on the card.
	 */
	private void setName() {
		int headerIndex = content.indexOf("<th class=\"cardtable-header\"");
		int endOfHeaderIndex = content.indexOf(">", headerIndex);
		int nameIndex = endOfHeaderIndex + 1;
		int nameEndIndex = content.indexOf("<br", nameIndex);
		String name = content.substring(nameIndex, nameEndIndex);
		card.setName(name);
		nextIndex = nameEndIndex;
	}
	
	/**
	 * Sets the attribute on the card.
	 */
	private void setAttribute() {
		Section attributeSection = getSection("Attribute", content, nextIndex);
		String text = attributeSection.text;
		int attributeValueIndex = text.indexOf("<a href");
		int attributeIndex = text.indexOf(">", attributeValueIndex) + 1;
		int attributeEndIndex = text.indexOf("</a>", attributeIndex);
		String attribute = text.substring(attributeIndex, attributeEndIndex);
		card.setAttribute(attribute);
		nextIndex = attributeSection.endIndex;
	}
	
	/**
	 * Sets the types on the card.
	 */
	private void setTypes() {
		Section typesSection = getSection("Types", content, nextIndex);
		String text = typesSection.text;
		
		Set<String> types = new HashSet<String>();
		int tagBeginIndex = text.indexOf("<a href");
		while (tagBeginIndex >= 0) {
			int typeIndex = text.indexOf(">", tagBeginIndex) + 1;
			int typeEndIndex = text.indexOf("</a>", typeIndex);
			types.add(text.substring(typeIndex, typeEndIndex));
			tagBeginIndex = text.indexOf("<a href", typeEndIndex);
		}
		
		for (String type : types) {
			if (type.equals("Effect")) {
				card.setEffect(true);
			}
			// TODO Figure this out for fusion and others.
			card.setMonsterType(type);
		}
		
		nextIndex = typesSection.endIndex;
	}
	
	/**
	 * Sets the level on the card.
	 */
	private void setLevel() {
		Section section = getSection("Level", content, nextIndex);
		String text = section.text;
		int levelValueIndex = text.indexOf("<a href");
		int levelIndex = text.indexOf(">", levelValueIndex) + 1;
		int levelEndIndex = text.indexOf("</a>", levelIndex);
		String level = text.substring(levelIndex, levelEndIndex);
		card.setLevel(level);
		nextIndex = section.endIndex;
	}
	
	/**
	 * Sets the attack and defense on the card.
	 */
	private void setAttackAndDefense() {
		Section section = getSection("ATK", content, nextIndex);
		String text = section.text;
		
		int attackValueIndex = text.indexOf("<a href");
		int attackIndex = text.indexOf(">", attackValueIndex) + 1;
		int attackEndIndex = text.indexOf("</a>", attackIndex);
		String attack = text.substring(attackIndex, attackEndIndex);
		card.setAttack(attack);
		
		int defenseValueIndex = text.indexOf("<a href", attackEndIndex);
		int defenseIndex = text.indexOf(">", defenseValueIndex) + 1;
		int defenseEndIndex = text.indexOf("</a>", defenseIndex);
		String defense = text.substring(defenseIndex, defenseEndIndex);
		card.setDefense(defense);
		
		nextIndex = section.endIndex;
	}
	
	/**
	 * Sets the description on the card.
	 */
	private void setDescription() {
		int sectionIndex = content.indexOf("Card Descriptions", nextIndex);
		int tdIndex = content.indexOf("<td class=\"navbox-list\"", sectionIndex);
		int descriptionIndex = content.indexOf(">", tdIndex) + 1;
		int descriptionEndIndex = content.indexOf("</td>", descriptionIndex);
		String rawDescription = content.substring(descriptionIndex, descriptionEndIndex);
		String description = TextUtil.delink(rawDescription);
		
		// Replace special characters because the DB doesn't like certain ones.
		description = description.replaceAll("●", "\n-");
		
		card.setDescription(description);
		nextIndex = descriptionEndIndex;
	}
	
	/**
	 * Gets a section of the card page pertaining to the section name.
	 * @param sectionName The name of the section (i.e. "Attribute" or "Types")
	 * @param content The entire page's content.
	 * @param searchIndex The point in the content to start searching.
	 * @return The parsed section of the content.
	 */
	private Section getSection(String sectionName, String content, int searchIndex) {
		int sectionHeaderIndex = content.indexOf(sectionName, searchIndex);
		int tdIndex = content.indexOf("<td", sectionHeaderIndex);
		int tdEndIndex = content.indexOf(">", tdIndex);
		int startIndex = tdEndIndex + 1;
		int endIndex = content.indexOf("</td>", startIndex);
		String text = content.substring(startIndex, endIndex);
		return new Section(endIndex, text);
	}
	
	/**
	 * Represents a single section in the web page.
	 */
	private class Section {
		public final int endIndex;
		public final String text;
		
		public Section(int endIndex, String text) {
			this.endIndex = endIndex;
			this.text = text;
		}
	}
}
