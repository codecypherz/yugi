/**
 * The model for a monster card in Yugioh.
 */

goog.provide('yugi.model.MonsterCard');
goog.provide('yugi.model.MonsterCard.Attribute');
goog.provide('yugi.model.MonsterCard.ExtraType');
goog.provide('yugi.model.MonsterCard.Type');

goog.require('goog.object');
goog.require('goog.string');
goog.require('yugi.model.Card');



/**
 * The model for a monster card in Yugioh.
 * @constructor
 * @extends {yugi.model.Card}
 */
yugi.model.MonsterCard = function() {
  goog.base(this, yugi.model.Card.Type.MONSTER);

  /**
   * The level of the monster.
   * @type {number}
   * @private
   */
  this.level_ = 0;

  /**
   * True if the monster is an effect monster, false otherwise.
   * @type {boolean}
   * @private
   */
  this.effect_ = false;

  /**
   * The monster's attack.
   * @type {number}
   * @private
   */
  this.attack_ = yugi.model.MonsterCard.VARIABLE_NUMBER;

  /**
   * The monster's defense.
   * @type {number}
   * @private
   */
  this.defense_ = yugi.model.MonsterCard.VARIABLE_NUMBER;
};
goog.inherits(yugi.model.MonsterCard, yugi.model.Card);


/**
 * The attribute of a monster card (i.e. fire or water).
 * @type {!yugi.model.MonsterCard.Attribute}
 * @private
 */
yugi.model.MonsterCard.prototype.attribute_;


/**
 * The type of monster card (i.e. spellcaster or zombie).
 * @type {!yugi.model.MonsterCard.Type}
 * @private
 */
yugi.model.MonsterCard.prototype.monsterType_;


/**
 * The extra type for this monster. (i.e. ritual, toon, or xyz)
 * @type {!yugi.model.MonsterCard.ExtraType}
 * @private
 */
yugi.model.MonsterCard.prototype.extraType_;


/**
 * Monster attributes.
 * @enum {string}
 */
yugi.model.MonsterCard.Attribute = {
  DARK: 'Dark',
  DIVINE: 'Divine',
  EARTH: 'Earth',
  FIRE: 'Fire',
  LIGHT: 'Light',
  WATER: 'Water',
  WIND: 'Wind'
};


/**
 * Monster types.
 * @enum {string}
 */
yugi.model.MonsterCard.Type = {
  AQUA: 'Aqua',
  ARCHETYPE: 'Archetype',
  BLACK_MAGIC: 'Black Magic',
  BEAST: 'Beast',
  BEAST_WARRIOR: 'Beast Warrior',
  CREATOR_GOD: 'Creator God',
  DINOSAUR: 'Dinosaur',
  DIVINE_BEAST: 'Divine Beast',
  DRAGON: 'Dragon',
  FAIRY: 'Fairy',
  FIEND: 'Fiend',
  FISH: 'Fish',
  HUMAN: 'Human',
  ILLUSION_MAGIC: 'Illision Magic',
  IMMORTAL: 'Immortal',
  INSECT: 'Insect',
  MACHINE: 'Machine',
  PLANT: 'Plant',
  PSYCHIC: 'Psychic',
  PYRO: 'Pyro',
  REPTILE: 'Reptile',
  ROCK: 'Rock',
  SEA_SERPENT: 'Sea Serpent',
  SERIES: 'Series',
  SPELLCASTER: 'Spellcaster',
  THUNDER: 'Thunder',
  WARRIOR: 'Warrior',
  WHITE_MAGIC: 'White Magic',
  WINGED_BEAST: 'Winged Beast',
  ZOMBIE: 'Zombie'
};


/**
 * Monster extra types.
 * @enum {string}
 */
yugi.model.MonsterCard.ExtraType = {
  DARK_TUNER: 'Dark Tuner',
  DARK_SYNCHRO: 'Dark Synchro',
  FUSION: 'Fusion',
  GEMINI: 'Gemini',
  RITUAL: 'Ritual',
  SPIRIT: 'Spirit',
  SYNCHRO: 'Synchro',
  TOON: 'Toon',
  TUNER: 'Tuner',
  UNION: 'Union',
  XYZ: 'Xyz'
};


/**
 * The constant used for attack and defense when the value would read "?" on the
 * card.
 * @type {number}
 * @const
 */
yugi.model.MonsterCard.VARIABLE_NUMBER = -1;


/**
 * The constant used for attack and defense when the value would read "?" on the
 * card.
 * @type {string}
 * @const
 */
yugi.model.MonsterCard.VARIABLE_STRING = '?';


/** @override */
yugi.model.MonsterCard.prototype.clone = function() {
  var card = new yugi.model.MonsterCard();
  card.setFromCard(this);
  return card;
};


/**
 * @return {!yugi.model.MonsterCard.Attribute} The attribute.
 */
yugi.model.MonsterCard.prototype.getAttribute = function() {
  return this.attribute_;
};


/**
 * @param {!yugi.model.MonsterCard.Attribute} attribute The attribute.
 */
yugi.model.MonsterCard.prototype.setAttribute = function(attribute) {
  this.attribute_ = attribute;
};


/**
 * Sets the attribute from the string.
 * @param {string} attributeString The attribute as a string.
 * @private
 */
yugi.model.MonsterCard.prototype.setAttributeFromString_ =
    function(attributeString) {
  var attribute = /** @type {yugi.model.MonsterCard.Attribute} */ (
      goog.object.findValue(yugi.model.MonsterCard.Attribute,
          function(value, key, object) {
            return goog.string.caseInsensitiveCompare(
                value, attributeString) == 0;
          }));
  if (attribute) {
    this.setAttribute(attribute);
  }
};


/**
 * @return {!yugi.model.MonsterCard.Type} The type.
 */
yugi.model.MonsterCard.prototype.getMonsterType = function() {
  return this.monsterType_;
};


/**
 * @param {!yugi.model.MonsterCard.Type} monsterType The monster type.
 */
yugi.model.MonsterCard.prototype.setMonsterType = function(monsterType) {
  this.monsterType_ = monsterType;
};


/**
 * Sets the monster type from the string.
 * @param {string} typeString The monster type as a string.
 * @private
 */
yugi.model.MonsterCard.prototype.setMonsterTypeFromString_ =
    function(typeString) {
  var type = /** @type {yugi.model.MonsterCard.Type} */ (
      goog.object.findValue(yugi.model.MonsterCard.Type,
          function(value, key, object) {
            return goog.string.caseInsensitiveCompare(value, typeString) == 0;
          }));
  if (type) {
    this.setMonsterType(type);
  }
};


/**
 * @return {!yugi.model.MonsterCard.ExtraType} The extra type.
 */
yugi.model.MonsterCard.prototype.getExtraType = function() {
  return this.extraType_;
};


/**
 * @param {!yugi.model.MonsterCard.ExtraType} extraType The extra type.
 */
yugi.model.MonsterCard.prototype.setExtraType = function(extraType) {
  this.extraType_ = extraType;
};


/**
 * Sets the monster extra type from the string.
 * @param {string} typeString The monster extra type as a string.
 * @private
 */
yugi.model.MonsterCard.prototype.setExtraTypeFromString_ =
    function(typeString) {
  var type = /** @type {yugi.model.MonsterCard.ExtraType} */ (
      goog.object.findValue(yugi.model.MonsterCard.ExtraType,
          function(value, key, object) {
            return goog.string.caseInsensitiveCompare(value, typeString) == 0;
          }));
  if (type) {
    this.setExtraType(type);
  }
};


/**
 * @return {number} The level of the card.
 */
yugi.model.MonsterCard.prototype.getLevel = function() {
  return this.level_;
};


/**
 * @param {number} level The level to set.
 */
yugi.model.MonsterCard.prototype.setLevel = function(level) {
  this.level_ = level;
};


/**
 * @param {string} levelString The level to set.
 * @private
 */
yugi.model.MonsterCard.prototype.setLevelFromString_ = function(levelString) {
  var level = parseInt(levelString, 10);
  if (!isNaN(level)) {
    this.setLevel(level);
  }
};


/**
 * @return {number} The attack of the card.
 */
yugi.model.MonsterCard.prototype.getAttack = function() {
  return this.attack_;
};


/**
 * @return {string} The attack as a string.
 */
yugi.model.MonsterCard.prototype.getAttackAsString = function() {
  if (this.attack_ == yugi.model.MonsterCard.VARIABLE_NUMBER) {
    return yugi.model.MonsterCard.VARIABLE_STRING;
  }
  return this.attack_ + '';
};


/**
 * @param {number} attack The attack to set.
 */
yugi.model.MonsterCard.prototype.setAttack = function(attack) {
  this.attack_ = attack;
};


/**
 * @param {string} attackString The attack to set.
 * @private
 */
yugi.model.MonsterCard.prototype.setAttackFromString_ = function(attackString) {
  var attack = yugi.model.MonsterCard.attackOrDefenseFromString(attackString);
  if (goog.isDefAndNotNull(attack)) {
    this.setAttack(attack);
  }
};


/**
 * @return {number} The defense of the card.
 */
yugi.model.MonsterCard.prototype.getDefense = function() {
  return this.defense_;
};


/**
 * @return {string} The defense as a string.
 */
yugi.model.MonsterCard.prototype.getDefenseAsString = function() {
  if (this.defense_ == yugi.model.MonsterCard.VARIABLE_NUMBER) {
    return yugi.model.MonsterCard.VARIABLE_STRING;
  }
  return this.defense_ + '';
};


/**
 * @param {number} defense The defense to set.
 */
yugi.model.MonsterCard.prototype.setDefense = function(defense) {
  this.defense_ = defense;
};


/**
 * @param {string} defenseString The defense to set.
 * @private
 */
yugi.model.MonsterCard.prototype.setDefenseFromString_ =
    function(defenseString) {
  var defense = yugi.model.MonsterCard.attackOrDefenseFromString(defenseString);
  if (goog.isDefAndNotNull(defense)) {
    this.setDefense(defense);
  }
};


/**
 * @return {boolean} True if this is an effect monster, false otherwise.
 */
yugi.model.MonsterCard.prototype.isEffect = function() {
  return this.effect_;
};


/**
 * @param {boolean} effect True if the monster is an effect card.
 */
yugi.model.MonsterCard.prototype.setEffect = function(effect) {
  this.effect_ = effect;
};


/**
 * @param {string} effectString The effect boolean as a string.
 * @private
 */
yugi.model.MonsterCard.prototype.setEffectFromString_ = function(effectString) {
  this.setEffect(
      goog.string.caseInsensitiveCompare(effectString, 'true') == 0);
};


/** @override */
yugi.model.MonsterCard.prototype.toJson = function() {
  var json = goog.base(this, 'toJson');
  json['monster-type'] = this.getMonsterType();
  json['monster-extra-type'] = this.getExtraType();
  json['attribute'] = this.getAttribute();
  json['level'] = this.getLevel();
  json['attack'] = this.getAttack();
  json['defense'] = this.getDefense();
  json['effect'] = this.isEffect();
  return json;
};


/** @override */
yugi.model.MonsterCard.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);
  this.setAttributeFromString_(json['attribute']);
  this.setMonsterTypeFromString_(json['monster-type']);
  this.setExtraTypeFromString_(json['monster-extra-type']);
  this.setLevelFromString_(json['level']);
  this.setEffectFromString_(json['effect']);
  this.setAttackFromString_(json['attack']);
  this.setDefenseFromString_(json['defense']);
};


/** @override */
yugi.model.MonsterCard.prototype.setFromCard = function(card) {
  goog.base(this, 'setFromCard', card);

  card = /** @type {!yugi.model.MonsterCard} */ (card);
  this.setAttribute(card.attribute_);
  this.setMonsterType(card.monsterType_);
  this.setExtraType(card.extraType_);
  this.setLevel(card.level_);
  this.setEffect(card.effect_);
  this.setAttack(card.attack_);
  this.setDefense(card.defense_);
};


/**
 * @param {string} string The attack or defense string.
 * @return {?number} The parsed number or null if parsing fails.
 */
yugi.model.MonsterCard.attackOrDefenseFromString = function(string) {
  if (string == yugi.model.MonsterCard.VARIABLE_STRING) {
    return yugi.model.MonsterCard.VARIABLE_NUMBER;
  }

  var num = parseInt(string, 10);
  if (isNaN(num)) {
    return null;
  }
  return num;
};
