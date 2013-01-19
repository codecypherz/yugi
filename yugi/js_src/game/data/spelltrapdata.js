/**
 * The minimum set of data to send when synchronizing game state.
 */

goog.provide('yugi.game.data.SpellTrapData');

goog.require('yugi.game.data.CardData');
goog.require('yugi.model.Serializable');



/**
 * The minimum set of data to send when synchronizing game state.
 * @constructor
 * @extends {yugi.game.data.CardData}
 * @implements {yugi.model.Serializable}
 */
yugi.game.data.SpellTrapData = function() {
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this.isFaceUp_ = false;
};
goog.inherits(yugi.game.data.SpellTrapData, yugi.game.data.CardData);


/**
 * @return {boolean} True if the card is face up or not.
 */
yugi.game.data.SpellTrapData.prototype.isFaceUp = function() {
  return this.isFaceUp_;
};


/**
 * @param {boolean} isFaceUp True if the card is face up or not.
 */
yugi.game.data.SpellTrapData.prototype.setFaceUp = function(isFaceUp) {
  this.isFaceUp_ = isFaceUp;
};


/** @override */
yugi.game.data.SpellTrapData.prototype.toJson = function() {
  var json = goog.base(this, 'toJson');
  // Make sure this key is unique in the parent set.
  json['f'] = this.isFaceUp_;
  return json;
};


/** @override */
yugi.game.data.SpellTrapData.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);
  this.isFaceUp_ = json['f'];
};


/**
 * Static helper function for creating spell/trap data from a card.
 * @param {!yugi.model.SpellCard|!yugi.model.TrapCard} card The card.
 * @return {!yugi.game.data.SpellTrapData} The spell/trap data for the card.
 */
yugi.game.data.SpellTrapData.createFromCard = function(card) {
  var spellTrapData = new yugi.game.data.SpellTrapData();
  spellTrapData.setKey(card.getKey());
  spellTrapData.setFaceUp(card.isFaceUp());
  spellTrapData.setCounters(card.getCounters());
  return spellTrapData;
};


/**
 * Static helper function to set values on the card from the data.
 * @param {!yugi.model.SpellCard|!yugi.model.TrapCard} card The card on which to
 *     set data.
 * @param {!yugi.game.data.SpellTrapData} data The data to set on the card.
 */
yugi.game.data.SpellTrapData.setCardFromData = function(card, data) {
  yugi.game.data.CardData.setCardFromData(card, data);
  card.setFaceUp(data.isFaceUp());
};
