/**
 * The minimum set of data to send when synchronizing game state.
 */

goog.provide('yugi.game.data.MonsterData');

goog.require('yugi.game.data.CardData');
goog.require('yugi.model.MonsterCard');
goog.require('yugi.model.Serializable');



/**
 * The minimum set of data to send when synchronizing game state.
 * @constructor
 * @extends {yugi.game.data.CardData}
 * @implements {yugi.model.Serializable}
 */
yugi.game.data.MonsterData = function() {
  goog.base(this);

  /**
   * @type {!yugi.model.MonsterCard.Position}
   * @private
   */
  this.position_ = yugi.model.MonsterCard.Position.UNKNOWN;
};
goog.inherits(yugi.game.data.MonsterData, yugi.game.data.CardData);


/**
 * @return {!yugi.model.MonsterCard.Position} The monster position.
 */
yugi.game.data.MonsterData.prototype.getPosition = function() {
  return this.position_;
};


/**
 * @param {!yugi.model.MonsterCard.Position} position The monster position.
 */
yugi.game.data.MonsterData.prototype.setPosition = function(position) {
  this.position_ = position;
};


/** @override */
yugi.game.data.MonsterData.prototype.toJson = function() {
  var json = goog.base(this, 'toJson');
  // Make sure this key is unique in the parent set.
  json['p'] = this.position_;
  return json;
};


/** @override */
yugi.game.data.MonsterData.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);
  this.position_ = json['p'];
};


/**
 * Static helper function for creating monster data from a card.
 * @param {!yugi.model.MonsterCard} card The card.
 * @return {!yugi.game.data.MonsterData} The monster data for the card.
 */
yugi.game.data.MonsterData.createFromCard = function(card) {
  var monsterData = new yugi.game.data.MonsterData();
  monsterData.setKey(card.getKey());
  monsterData.setPosition(card.getPosition());
  monsterData.setCounters(card.getCounters());
  return monsterData;
};


/**
 * Static helper function to set values on the card from the data.
 * @param {!yugi.model.MonsterCard} card The card on which to set data.
 * @param {!yugi.game.data.MonsterData} data The data to set on the card.
 */
yugi.game.data.MonsterData.setCardFromData = function(card, data) {
  card.setPosition(data.getPosition());
  card.setCounters(data.getCounters());
};
