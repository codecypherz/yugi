/**
 * Various shared model utilities.
 */

goog.provide('yugi.model.util');

goog.require('yugi.Config');
goog.require('yugi.model.Card');
goog.require('yugi.model.MonsterCard');
goog.require('yugi.model.SpellCard');
goog.require('yugi.model.TrapCard');
goog.require('yugi.service.url');


// TODO Move these game starting/joining bits to a model somewhere.  This domain
// logic should not be in a static util class.


/**
 * Starts a new game.
 * @param {string} playerName The name of the player.
 * @param {string} gameName The name of the game.
 */
yugi.model.util.startNewGame = function(playerName, gameName) {
  yugi.service.url.navigate(
      yugi.Config.ServletPath.CREATE_GAME,
      yugi.Config.UrlParameter.GAME_NAME, gameName,
      yugi.Config.UrlParameter.PLAYER_NAME, playerName);
};


/**
 * Joins an existing game.
 * @param {string} playerName The name of the player.
 * @param {string} key The key to the game to join.
 */
yugi.model.util.joinGame = function(playerName, key) {
  yugi.service.url.navigate(
      yugi.Config.ServletPath.JOIN_GAME,
      yugi.Config.UrlParameter.GAME_KEY, key,
      yugi.Config.UrlParameter.PLAYER_NAME, playerName);
};


/**
 * Converts the JSON into a card object.
 * @param {!Object} json The card JSON.
 * @return {yugi.model.Card} The newly created card, or null if parsing failed.
 */
yugi.model.util.cardFromJson = function(json) {

  // Sanity check.
  if (!goog.isDefAndNotNull(json)) {
    return null;
  }

  // Get the card type.
  var cardType = yugi.model.Card.getTypeFromString(json['type']);
  if (!cardType) {
    return null;
  }

  // Parse the JSON into a card object.
  var card;
  if (cardType == yugi.model.Card.Type.MONSTER) {
    card = new yugi.model.MonsterCard();
  } else if (cardType == yugi.model.Card.Type.SPELL) {
    card = new yugi.model.SpellCard();
  } else if (cardType == yugi.model.Card.Type.TRAP) {
    card = new yugi.model.TrapCard();
  }

  // Validate the card.
  if (!card) {
    return null;
  }

  // Set all the values from the JSON object.
  card.setFromJson(json);

  return /** @type {!yugi.model.Card} */ (card);
};


/**
 * Creates a JSON array from the serializables.
 * @param {!Array.<yugi.model.Serializable>} objects The objects to serialize.
 * @return {!Array.<Object>} The serialized objects.
 */
yugi.model.util.toJsonArray = function(objects) {
  var jsonArray = new Array(objects.length);
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i];
    jsonArray[i] = object ? object.toJson() : null;
  }
  return jsonArray;
};


/**
 * Converts an array of cards to an array of card keys.
 * @param {!Array.<yugi.model.Card>} cards The array to convert.
 * @return {!Array.<string>} The card keys.
 */
yugi.model.util.cardsToCardKeys = function(cards) {
  var cardKeys = new Array(cards.length);
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    cardKeys[i] = card ? card.getKey() : null;
  }
  return cardKeys;
};


/**
 * Converts an array of card keys to an array of cards.
 * @param {!Array.<string>} cardKeys The array of card keys to convert.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 * @return {!Array.<yugi.model.Card>} The array of converted cards.
 */
yugi.model.util.cardKeysToCards = function(cardKeys, cardCache) {
  var cards = new Array(cardKeys.length);
  for (var i = 0; i < cardKeys.length; i++) {
    var cardKey = cardKeys[i];
    cards[i] = null;
    if (cardKey) {
      var card = cardCache.get(cardKeys[i]);
      if (card) {
        cards[i] = card;
      } else {
        throw new Error('Failed to find a card for this key: ' + cardKey);
      }
    }
  }
  return cards;
};


/**
 * Takes a JSON array of cards and converts them to an array of cards.
 * @param {!Array.<Object>} jsonArray The array to convert.
 * @return {!Array.<yugi.model.Card>} The array of converted cards.
 */
yugi.model.util.jsonArrayToCards = function(jsonArray) {
  var cards = new Array(jsonArray.length);
  for (var i = 0; i < jsonArray.length; i++) {
    var jsonObject = jsonArray[i];
    if (jsonObject) {
      cards[i] = yugi.model.util.cardFromJson(jsonObject);
    } else {
      cards[i] = null;
    }
  }
  return cards;
};


/**
 * Checks to see if this card belongs in the extra deck or not.
 * @param {!yugi.model.Card} card The card to check.
 * @return {boolean} True if this card belongs in the extra deck or not.
 */
yugi.model.util.isExtraDeckCard = function(card) {
  if (card instanceof yugi.model.MonsterCard) {
    var extraType = card.getExtraType();
    return extraType == yugi.model.MonsterCard.ExtraType.FUSION ||
        extraType == yugi.model.MonsterCard.ExtraType.SYNCHRO ||
        extraType == yugi.model.MonsterCard.ExtraType.XYZ;
  }
  return false;
};
