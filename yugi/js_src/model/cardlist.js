/**
 * Keeps state for list of cards.
 */

goog.provide('yugi.model.CardList');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.string');
goog.require('yugi.data.CardListData');
goog.require('yugi.model.Card');
goog.require('yugi.model.util');



/**
 * Keeps state for list of cards.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.model.CardList = function() {
  goog.base(this);

  /**
   * @type {!Array.<!yugi.model.Card>}
   * @private
   */
  this.cards_ = [];
};
goog.inherits(yugi.model.CardList, goog.events.EventTarget);


/**
 * The set of events dispatched by this model.
 * @enum {string}
 */
yugi.model.CardList.EventType = {
  CARDS_CHANGED: goog.events.getUniqueId('cards-changed')
};


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.model.CardList.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.model.CardList');


/**
 * Creates a copy of this card list.  This is a deep copy.
 * @return {!yugi.model.CardList} The copy of this card list.
 */
yugi.model.CardList.prototype.clone = function() {
  var cardList = new yugi.model.CardList();
  var cards = [];
  goog.array.forEach(this.cards_, function(card) {
    cards.push(card.clone());
  });
  cardList.setCards(cards);
  return cardList;
};


/**
 * @return {!Array.<!yugi.model.Card>} The cards in the list.
 */
yugi.model.CardList.prototype.getCards = function() {
  return this.cards_;
};


/**
 * @param {!Array.<!yugi.model.Card>} cards The cards in the list.
 */
yugi.model.CardList.prototype.setCards = function(cards) {
  this.cards_ = cards;
  this.dispatchEvent(yugi.model.CardList.EventType.CARDS_CHANGED);
};


/**
 * Adds a card to the list.
 * @param {!yugi.model.Card} card The card to add.
 * @param {boolean=} opt_front True if adding to the front of the list or not.
 */
yugi.model.CardList.prototype.add = function(card, opt_front) {
  if (opt_front) {
    goog.array.insertAt(this.cards_, card, 0);
  } else {
    this.cards_.push(card);
  }
  this.dispatchEvent(yugi.model.CardList.EventType.CARDS_CHANGED);
};


/**
 * Removes all cards from this list.
 * @return {!Array.<!yugi.model.Card>} The cards that were removed.
 */
yugi.model.CardList.prototype.removeAll = function() {
  var cards = this.cards_;
  this.cards_ = [];
  this.dispatchEvent(yugi.model.CardList.EventType.CARDS_CHANGED);
  return cards;
};


/**
 * Removes the given card from the list.
 * @param {!yugi.model.Card} cardToRemove The card to remove.
 * @return {boolean} True if the card was removed or not.
 */
yugi.model.CardList.prototype.remove = function(cardToRemove) {

  // Remove the card.
  var removed = goog.array.removeIf(this.cards_, function(card) {
    return card.equals(cardToRemove);
  });

  // If it was removed, dispatch the event.
  if (removed) {
    this.dispatchEvent(yugi.model.CardList.EventType.CARDS_CHANGED);
  }
  return removed;
};


/**
 * Removes the first card in the list.  Do not call this method unless you have
 * some cards in the list.
 * @return {!yugi.model.Card} The removed card.
 */
yugi.model.CardList.prototype.removeFirst = function() {

  // Make sure there's a card to remove.
  if (this.cards_.length == 0) {
    throw new Error('There were no cards when trying to remove the first one.');
  }

  // Remove the card.
  var card = this.cards_[0];
  goog.array.removeAt(this.cards_, 0);

  // Dispatch, then return.
  this.dispatchEvent(yugi.model.CardList.EventType.CARDS_CHANGED);
  return card;
};


/**
 * Shuffles the list of cards.
 */
yugi.model.CardList.prototype.shuffle = function() {
  goog.array.shuffle(this.cards_);
  this.dispatchEvent(yugi.model.CardList.EventType.CARDS_CHANGED);
};


/**
 * Sorts the list of cards.
 */
yugi.model.CardList.prototype.sort = function() {
  goog.array.sort(this.cards_, function(card1, card2) {

    // The first tier of sorting is card type.
    var typeComparison = goog.string.caseInsensitiveCompare(
        card1.getType(), card2.getType());
    if (typeComparison == 0) {

      // Since the types are equal, there needs to be a second tier sort.
      switch (card1.getType()) {

        // Monsters sort by attack.
        case yugi.model.Card.Type.MONSTER:
          var monsterCard1 = /** @type {!yugi.model.MonsterCard} */ (card1);
          var monsterCard2 = /** @type {!yugi.model.MonsterCard} */ (card2);
          var attack1 = monsterCard1.getAttack();
          var attack2 = monsterCard2.getAttack();
          if (attack1 < attack2) {
            return 1;
          } else if (attack1 == attack2) {
            // Third tier of sorting is by name.
            return goog.string.caseInsensitiveCompare(
                card1.getName(), card2.getName());
          } else {
            return -1;
          }

        // Spells sort by spell type.
        case yugi.model.Card.Type.SPELL:
          var spellCard1 = /** @type {!yugi.model.SpellCard} */ (card1);
          var spellCard2 = /** @type {!yugi.model.SpellCard} */ (card2);
          var spellTypeComparison = goog.string.caseInsensitiveCompare(
              spellCard1.getSpellType(), spellCard2.getSpellType());
          if (spellTypeComparison == 0) {
            // Third tier of sorting is by name.
            return goog.string.caseInsensitiveCompare(
                card1.getName(), card2.getName());
          }
          return spellTypeComparison;

        // Traps sort by trap type.
        case yugi.model.Card.Type.TRAP:
          var trapCard1 = /** @type {!yugi.model.TrapCard} */ (card1);
          var trapCard2 = /** @type {!yugi.model.TrapCard} */ (card2);
          var trapTypeComparison = goog.string.caseInsensitiveCompare(
              trapCard1.getTrapType(), trapCard2.getTrapType());
          if (trapTypeComparison == 0) {
            // Third tier of sorting is by name.
            return goog.string.caseInsensitiveCompare(
                card1.getName(), card2.getName());
          }
          return trapTypeComparison;
      }
    }
    return typeComparison;
  });
  this.dispatchEvent(yugi.model.CardList.EventType.CARDS_CHANGED);
};


/**
 * Converts this object to a data object.
 * @return {!yugi.data.CardListData} The converted data object.
 */
yugi.model.CardList.prototype.toData = function() {
  var handData = new yugi.data.CardListData();
  handData.setCardKeys(yugi.model.util.cardsToCardKeys(this.cards_));
  return handData;
};


/**
 * Sets this state based on the given data.
 * @param {!yugi.data.CardListData} cardListData The card list data.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 */
yugi.model.CardList.prototype.setFromData = function(cardListData, cardCache) {
  this.setCards(cardCache.getList(cardListData.getCardKeys()));
};


/**
 * Sets this card list based on the given one.
 * @param {!yugi.model.CardList} cardList The card list.
 */
yugi.model.CardList.prototype.setFromCardList = function(cardList) {
  this.setCards(cardList.getCards());
};
