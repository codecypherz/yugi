/**
 * The model for a deck in Yugioh.
 */

goog.provide('yugi.model.Deck');
goog.provide('yugi.model.Deck.EventType');
goog.provide('yugi.model.Deck.Type');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('yugi.model.CardList');
goog.require('yugi.model.Serializable');
goog.require('yugi.model.util');
goog.require('yugi.ui.Image');



/**
 * The model for a deck in Yugioh.
 * @constructor
 * @implements {yugi.model.Serializable}
 * @extends {goog.events.EventTarget}
 */
yugi.model.Deck = function() {

  /**
   * The key for this deck on the server.
   * @type {string}
   * @private
   */
  this.key_ = '';

  /**
   * The name given to the deck by the user.
   * @type {string}
   * @private
   */
  this.name_ = '';

  /**
   * The card that represents this deck.
   * @type {yugi.model.Card}
   * @private
   */
  this.mainCard_ = null;

  /**
   * The list of main cards in this deck.  The official rules at the time of
   * writing this code restrict the number of cards from [40-60].
   * @type {!yugi.model.CardList}
   * @private
   */
  this.mainCardList_ = new yugi.model.CardList();

  /**
   * The list of extra cards in this deck.  These are for Fusion, Synchro, and
   * Xyz monsters.
   * @type {!yugi.model.CardList}
   * @private
   */
  this.extraCardList_ = new yugi.model.CardList();

  /**
   * The list of side cards in this deck.  These cards can be swapped with the
   * main or extra cards between duels in a given match.  At the time of writing
   * this code, the count was restricted from (1-15].
   * @type {!yugi.model.CardList}
   * @private
   */
  this.sideCardList_ = new yugi.model.CardList();
};
goog.inherits(yugi.model.Deck, goog.events.EventTarget);


/**
 * The types of sets of cards within a deck.
 * @enum {string}
 */
yugi.model.Deck.Type = {
  MAIN: 'Main',
  EXTRA: 'Extra',
  SIDE: 'Side'
};


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.model.Deck.EventType = {
  NAME_CHANGED: goog.events.getUniqueId('name-changed')
};


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.model.Deck.prototype.logger =
    goog.debug.Logger.getLogger('yugi.model.Deck');


/**
 * Returns a new copy of the deck.  This is a deep copy.
 * @return {!yugi.model.Deck} The deck copy.
 */
yugi.model.Deck.prototype.clone = function() {
  var deck = new yugi.model.Deck();
  deck.setKey(this.key_);
  deck.setName(this.name_);
  deck.setMainCard(this.mainCard_.clone());
  deck.setMainCardList(this.mainCardList_.clone());
  deck.setExtraCardList(this.extraCardList_.clone());
  deck.setSideCardList(this.sideCardList_.clone());
  return deck;
};


/**
 * Clones the given array of cards.
 * @param {!Array.<!yugi.model.Card>} cards The cards to clone.
 * @return {!Array.<!yugi.model.Card>} The cloned cards.
 * @private
 */
yugi.model.Deck.prototype.cloneCards_ = function(cards) {
  var clonedCards = [];
  goog.array.forEach(cards, function(card) {
    clonedCards.push(card.clone());
  });
  return clonedCards;
};


/**
 * @return {string} The server side key for this deck.
 */
yugi.model.Deck.prototype.getKey = function() {
  return this.key_;
};


/**
 * @param {string} key The key to set.
 */
yugi.model.Deck.prototype.setKey = function(key) {
  this.key_ = key;
};


/**
 * @return {string} The name of the deck.
 */
yugi.model.Deck.prototype.getName = function() {
  return this.name_;
};


/**
 * @param {string} name The name to set.
 */
yugi.model.Deck.prototype.setName = function(name) {
  if (this.name_ == name) {
    return;
  }
  this.name_ = name;
  this.dispatchEvent(yugi.model.Deck.EventType.NAME_CHANGED);
};


/**
 * @return {yugi.model.Card} The card that represents the deck.
 */
yugi.model.Deck.prototype.getMainCard = function() {
  return this.mainCard_;
};


/**
 * @param {yugi.model.Card} card The card that represents the deck.
 */
yugi.model.Deck.prototype.setMainCard = function(card) {
  this.mainCard_ = card;
};


/**
 * @return {string} The URL for the image of the deck.
 * @param {number} height The height of the image.
 */
yugi.model.Deck.prototype.getImageSource = function(height) {
  if (this.mainCard_) {
    return this.mainCard_.getImageSource(height);
  }
  return yugi.ui.Image.CARD_BACK;
};


/**
 * Gets all cards (in all parts of the deck) and returns them as a single array.
 * @return {!Array.<!yugi.model.Card>} All cards in the deck.
 */
yugi.model.Deck.prototype.getAllCards = function() {
  return goog.array.concat(
      this.extraCardList_.getCards(),
      this.sideCardList_.getCards(),
      this.mainCardList_.getCards());
};


/**
 * Fetches cards from the given deck type.
 * @param {!yugi.model.Deck.Type} deckType The type of deck for which to get
 *     cards.
 * @return {!Array.<!yugi.model.Card>} The list of cards in the deck of the
 *     given type.
 */
yugi.model.Deck.prototype.getCards = function(deckType) {
  return this.getCardList(deckType).getCards();
};


/**
 * Fetches the card list for the given deck type.
 * @param {!yugi.model.Deck.Type} deckType The type of deck for which to get
 *     cards.
 * @return {!yugi.model.CardList} The list of cards in the deck of the given
 *     type.
 */
yugi.model.Deck.prototype.getCardList = function(deckType) {
  switch (deckType) {
    case yugi.model.Deck.Type.EXTRA:
      return this.extraCardList_;
    case yugi.model.Deck.Type.SIDE:
      return this.sideCardList_;
    case yugi.model.Deck.Type.MAIN:
      // Fall through.
    default:
      return this.mainCardList_;
  }
};


/**
 * @return {!Array.<!yugi.model.Card>} The list of main cards in this deck.
 */
yugi.model.Deck.prototype.getMainCards = function() {
  return this.getCards(yugi.model.Deck.Type.MAIN);
};


/**
 * @return {!Array.<!yugi.model.Card>} The list of extra cards in this deck.
 */
yugi.model.Deck.prototype.getExtraCards = function() {
  return this.getCards(yugi.model.Deck.Type.EXTRA);
};


/**
 * @return {!Array.<!yugi.model.Card>} The list of side cards in this deck.
 */
yugi.model.Deck.prototype.getSideCards = function() {
  return this.getCards(yugi.model.Deck.Type.SIDE);
};


/**
 * @return {!yugi.model.CardList} The list of main cards in this deck.
 */
yugi.model.Deck.prototype.getMainCardList = function() {
  return this.mainCardList_;
};


/**
 * Sets the list of cards.
 * @param {!yugi.model.CardList} cardList The list of cards.
 */
yugi.model.Deck.prototype.setMainCardList = function(cardList) {
  this.mainCardList_ = cardList;
};


/**
 * @return {!yugi.model.CardList} The list of extra cards in this deck.
 */
yugi.model.Deck.prototype.getExtraCardList = function() {
  return this.extraCardList_;
};


/**
 * Sets the list of cards.
 * @param {!yugi.model.CardList} cardList The list of cards.
 */
yugi.model.Deck.prototype.setExtraCardList = function(cardList) {
  this.extraCardList_ = cardList;
};


/**
 * @return {!yugi.model.CardList} The list of side cards in this deck.
 */
yugi.model.Deck.prototype.getSideCardList = function() {
  return this.sideCardList_;
};


/**
 * Sets the list of cards.
 * @param {!yugi.model.CardList} cardList The list of cards.
 */
yugi.model.Deck.prototype.setSideCardList = function(cardList) {
  this.sideCardList_ = cardList;
};


/**
 * @param {!yugi.model.Card} card The card to add to the deck.
 * @param {!yugi.model.Deck.Type} deckType The set of cards to which to add.
 */
yugi.model.Deck.prototype.add = function(card, deckType) {
  this.logger.info('Adding ' + card.getName() +
      ' to the ' + deckType + ' deck.');
  this.getCardList(deckType).add(card);
};


/**
 * Adds a card to the top of the main cards pile.
 * @param {!yugi.model.Card} card The card to add.
 */
yugi.model.Deck.prototype.addToTop = function(card) {
  this.logger.info('Adding ' + card.getName() + ' to the top of the deck.');
  this.mainCardList_.add(card, true);
};


/**
 * @param {!yugi.model.Card} cardToRemove The card to remove from the deck.
 * @param {!yugi.model.Deck.Type} deckType The set of cards from which to
 *     remove the card.
 * @return {boolean} True if the card was removed or not.
 */
yugi.model.Deck.prototype.remove = function(cardToRemove, deckType) {

  // Remove the card from the appropriate list.
  var cards = this.getCardList(deckType);
  var removed = cards.remove(cardToRemove);

  // If the card being removed is the main card, then nullify the reference.
  if (this.mainCard_ && this.mainCard_.equals(cardToRemove)) {
    this.mainCard_ = null;
  }

  return removed;
};


/**
 * Removes the first card from the main deck.
 * @return {!yugi.model.Card} The card that was just drawn.
 */
yugi.model.Deck.prototype.draw = function() {
  this.logger.info('Drawing a card');
  return this.mainCardList_.removeFirst();
};


/**
 * Shuffles the cards in the main deck.
 */
yugi.model.Deck.prototype.shuffle = function() {
  this.logger.info('Shuffling the main cards.');
  this.mainCardList_.shuffle();
};


/**
 * Sorts the deck.
 */
yugi.model.Deck.prototype.sort = function() {
  this.mainCardList_.sort();
  this.extraCardList_.sort();
  this.sideCardList_.sort();
};


/**
 * Returns all the cards to the deck.
 * @param {!Array.<!yugi.model.Card>} cards The cards to return.
 */
yugi.model.Deck.prototype.returnAll = function(cards) {
  goog.array.forEach(cards, function(card) {
    this.returnCard(card);
  }, this);
};


/**
 * Adds this card back to the deck.  The card could be returned to the main deck
 * or the extra deck depending on the type of card.
 * @param {!yugi.model.Card} card The card being returned to the deck.
 */
yugi.model.Deck.prototype.returnCard = function(card) {
  if (yugi.model.util.isExtraDeckCard(card)) {
    this.extraCardList_.add(card);
  } else {
    this.mainCardList_.add(card);
  }
};


/** @override */
yugi.model.Deck.prototype.toJson = function() {

  // Convert the cards to JSON.
  var mainCards = new Array();
  var extraCards = new Array();
  var sideCards = new Array();

  goog.array.forEach(this.getMainCards(), function(card) {
    mainCards.push(card.toJson());
  });
  goog.array.forEach(this.getExtraCards(), function(card) {
    extraCards.push(card.toJson());
  });
  goog.array.forEach(this.getSideCards(), function(card) {
    sideCards.push(card.toJson());
  });

  var mainCardJson = this.getMainCard() ? this.getMainCard().toJson() : null;

  return {
    'key': this.getKey(),
    'name': this.getName(),
    'main-card': mainCardJson,
    'main-cards': mainCards,
    'extra-cards': extraCards,
    'side-cards': sideCards
  };
};


/** @override */
yugi.model.Deck.prototype.setFromJson = function(json) {
  this.setKey(json['key']);
  this.setName(json['name']);

  this.mainCardList_ = new yugi.model.CardList();
  this.extraCardList_ = new yugi.model.CardList();
  this.sideCardList_ = new yugi.model.CardList();

  var mainCardJson = json['main-card'];
  var mainCard = null;
  if (mainCardJson) {
    mainCard = yugi.model.util.cardFromJson(mainCardJson);
  }

  var mainCards = /** @type {!Array.<!Object>} */ (json['main-cards']);
  var extraCards = /** @type {!Array.<!Object>} */ (json['extra-cards']);
  var sideCards = /** @type {!Array.<!Object>} */ (json['side-cards']);

  this.addCardsFromJson_(mainCards, this.mainCardList_, mainCard);
  this.addCardsFromJson_(extraCards, this.extraCardList_, mainCard);
  this.addCardsFromJson_(sideCards, this.sideCardList_, mainCard);

  // See if there are any cards fetched along with the deck.  If not, set the
  // main card.
  if (this.mainCardList_.getCards().length == 0 &&
      this.extraCardList_.getCards().length == 0 &&
      this.sideCardList_.getCards().length == 0 &&
      goog.isDefAndNotNull(mainCard)) {
    this.setMainCard(mainCard);
  }
};


/**
 * Adds the cards to the list from the json.
 * @param {!Array.<!Object>} cardJsonArr The card json array.
 * @param {!yugi.model.CardList} cardList The list of cards to which to add.
 * @param {yugi.model.Card} mainCard The main card, if set in the deck.
 * @private
 */
yugi.model.Deck.prototype.addCardsFromJson_ = function(cardJsonArr, cardList,
    mainCard) {
  var mainCardName = mainCard ? mainCard.getName() : '';
  if (cardJsonArr) {
    goog.array.forEach(cardJsonArr, function(cardJson) {
      if (cardJson) {
        var card = yugi.model.util.cardFromJson(cardJson);
        if (!card) {
          throw new Error('Failed to create a card from JSON in the deck.');
        }
        cardList.add(card);

        // If the card names match, set the main card reference.
        if (card.getName() == mainCardName) {
          this.setMainCard(card);
        }
      }
    }, this);
  }
};


/**
 * Sets the information from the given deck on this deck.
 * @param {!yugi.model.Deck} deck The deck from which to set.
 */
yugi.model.Deck.prototype.setFromDeck = function(deck) {
  this.key_ = deck.getKey();
  this.name_ = deck.getName();
  this.mainCard_ = deck.getMainCard();
  this.mainCardList_.setFromCardList(deck.getMainCardList());
  this.extraCardList_.setFromCardList(deck.getExtraCardList());
  this.sideCardList_.setFromCardList(deck.getSideCardList());
};
