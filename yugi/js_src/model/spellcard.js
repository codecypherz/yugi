/**
 * The model for a spell card in Yugioh.
 */

goog.provide('yugi.model.SpellCard');
goog.provide('yugi.model.SpellCard.Type');

goog.require('goog.object');
goog.require('goog.string');
goog.require('yugi.model.Card');



/**
 * The model for a spell card in Yugioh.
 * @constructor
 * @extends {yugi.model.Card}
 */
yugi.model.SpellCard = function() {
  goog.base(this, yugi.model.Card.Type.SPELL);
};
goog.inherits(yugi.model.SpellCard, yugi.model.Card);


/**
 * The type of spell card this is.
 * @type {!yugi.model.SpellCard.Type}
 * @private
 */
yugi.model.SpellCard.prototype.spellType_;


/**
 * The set of spell card types.
 * @enum {string}
 */
yugi.model.SpellCard.Type = {
  CONTINUOUS: 'Continuous',
  EQUIP: 'Equip',
  FIELD: 'Field',
  NORMAL: 'Normal',
  QUICKPLAY: 'Quickplay',
  RITUAL: 'Ritual'
};


/** @override */
yugi.model.SpellCard.prototype.clone = function() {
  var card = new yugi.model.SpellCard();
  card.setFromCard(this);
  return card;
};


/**
 * @return {!yugi.model.SpellCard.Type} The type of spell card.
 */
yugi.model.SpellCard.prototype.getSpellType = function() {
  return this.spellType_;
};


/**
 * @param {!yugi.model.SpellCard.Type} spellType The type of spell card.
 */
yugi.model.SpellCard.prototype.setSpellType = function(spellType) {
  this.spellType_ = spellType;
};


/**
 * @param {string} typeString The string to match.
 * @private
 */
yugi.model.SpellCard.prototype.setSpellTypeFromString_ = function(typeString) {
  var type = /** @type {yugi.model.SpellCard.Type} */ (goog.object.findValue(
      yugi.model.SpellCard.Type,
      function(value, key, object) {
        return goog.string.caseInsensitiveCompare(value, typeString) == 0;
      }));
  if (type) {
    this.setSpellType(type);
  }
};


/** @override */
yugi.model.SpellCard.prototype.toJson = function() {
  var json = goog.base(this, 'toJson');
  json['spell-type'] = this.getSpellType();
  return json;
};


/** @override */
yugi.model.SpellCard.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);
  this.setSpellTypeFromString_(json['spell-type']);
};


/** @override */
yugi.model.SpellCard.prototype.setFromCard = function(card) {
  goog.base(this, 'setFromCard', card);

  card = /** @type {!yugi.model.SpellCard} */ (card);
  this.setSpellType(card.spellType_);
};
