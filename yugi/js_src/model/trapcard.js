/**
 * The model for a trap card in Yugioh.
 */

goog.provide('yugi.model.TrapCard');
goog.provide('yugi.model.TrapCard.Type');

goog.require('goog.object');
goog.require('goog.string');
goog.require('yugi.model.Card');



/**
 * The model for a trap card in Yugioh.
 * @constructor
 * @extends {yugi.model.Card}
 */
yugi.model.TrapCard = function() {
  goog.base(this, yugi.model.Card.Type.TRAP);
};
goog.inherits(yugi.model.TrapCard, yugi.model.Card);


/**
 * The set of trap card types.
 * @enum {string}
 */
yugi.model.TrapCard.Type = {
  CONTINUOUS: 'Continuous',
  COUNTER: 'Counter',
  NORMAL: 'Normal'
};


/**
 * The type of trap card.
 * @type {!yugi.model.TrapCard.Type}
 * @private
 */
yugi.model.TrapCard.prototype.trapType_;


/**
 * Whether the card is face up or not.
 * @type {boolean}
 * @private
 */
yugi.model.TrapCard.prototype.isFaceUp_ = false;


/** @override */
yugi.model.TrapCard.prototype.clone = function() {
  var card = new yugi.model.TrapCard();
  card.setFromCard(this);
  return card;
};


/**
 * @return {!yugi.model.TrapCard.Type} The type of trap card.
 */
yugi.model.TrapCard.prototype.getTrapType = function() {
  return this.trapType_;
};


/**
 * @param {!yugi.model.TrapCard.Type} trapType The type of trap card.
 */
yugi.model.TrapCard.prototype.setTrapType = function(trapType) {
  this.trapType_ = trapType;
};


/**
 * @param {string} typeString The string to match.
 * @private
 */
yugi.model.TrapCard.prototype.setTrapTypeFromString_ = function(typeString) {
  var trapType = /** @type {yugi.model.TrapCard.Type} */ (goog.object.findValue(
      yugi.model.TrapCard.Type,
      function(value, key, object) {
        return goog.string.caseInsensitiveCompare(value, typeString) == 0;
      }));
  if (trapType) {
    this.setTrapType(trapType);
  }
};


/**
 * @return {boolean} True if the card is face up or not.
 */
yugi.model.TrapCard.prototype.isFaceUp = function() {
  return this.isFaceUp_;
};


/**
 * @param {boolean} isFaceUp True if the card is face up or not.
 */
yugi.model.TrapCard.prototype.setFaceUp = function(isFaceUp) {
  if (this.isFaceUp_ == isFaceUp) {
    return;
  }
  this.isFaceUp_ = isFaceUp;
  this.dispatchEvent(yugi.model.Card.EventType.POSITION_CHANGED);
};


/** @override */
yugi.model.TrapCard.prototype.toJson = function() {
  var json = goog.base(this, 'toJson');
  json['trap-type'] = this.getTrapType();
  json['fup'] = this.isFaceUp_;
  return json;
};


/** @override */
yugi.model.TrapCard.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);
  this.setTrapTypeFromString_(json['trap-type']);
  this.isFaceUp_ = json['fup'] || false;
};


/** @override */
yugi.model.TrapCard.prototype.setFromCard = function(card) {
  goog.base(this, 'setFromCard', card);

  card = /** @type {!yugi.model.TrapCard} */ (card);
  this.setTrapType(card.trapType_);
  this.setFaceUp(card.isFaceUp_);
};
