/**
 * The minimum set of data to send when synchronizing game state.
 */

goog.provide('yugi.game.data.FieldData');

goog.require('goog.Disposable');
goog.require('yugi.data.CardListData');
goog.require('yugi.game.data.CardData');
goog.require('yugi.model.Serializable');
goog.require('yugi.model.util');



/**
 * The minimum set of data to send when synchronizing game state.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {yugi.model.Serializable}
 */
yugi.game.data.FieldData = function() {
  goog.base(this);

  /**
   * @type {!Array.<!yugi.game.data.CardData>}
   * @private
   */
  this.monsters_ = new Array(5);

  /**
   * @type {!Array.<!yugi.game.data.CardData>}
   * @private
   */
  this.spellTraps_ = new Array(5);

  /**
   * @type {!yugi.data.CardListData}
   * @private
   */
  this.graveyardData_ = new yugi.data.CardListData();

  /**
   * @type {!yugi.data.CardListData}
   * @private
   */
  this.banishData_ = new yugi.data.CardListData();

  /**
   * @type {yugi.game.data.CardData}
   * @private
   */
  this.fieldCardData_ = null;
};
goog.inherits(yugi.game.data.FieldData, goog.Disposable);


/**
 * @return {!Array.<!yugi.game.data.CardData>} The monster data.
 */
yugi.game.data.FieldData.prototype.getMonsters = function() {
  return this.monsters_;
};


/**
 * @param {!Array.<!yugi.game.data.CardData>} monsters The monster data.
 */
yugi.game.data.FieldData.prototype.setMonsters = function(monsters) {
  this.monsters_ = monsters;
};


/**
 * @return {!Array.<!yugi.game.data.CardData>} The spell/trap data.
 */
yugi.game.data.FieldData.prototype.getSpellTraps = function() {
  return this.spellTraps_;
};


/**
 * @param {!Array.<!yugi.game.data.CardData>} spellTraps The data.
 */
yugi.game.data.FieldData.prototype.setSpellTraps = function(spellTraps) {
  this.spellTraps_ = spellTraps;
};


/**
 * @return {!yugi.data.CardListData} The player's graveyard.
 */
yugi.game.data.FieldData.prototype.getGraveyardData = function() {
  return this.graveyardData_;
};


/**
 * @param {!yugi.data.CardListData} graveyardData The player's graveyard.
 */
yugi.game.data.FieldData.prototype.setGraveyardData = function(graveyardData) {
  this.graveyardData_ = graveyardData;
};


/**
 * @return {!yugi.data.CardListData} The player's banish pile.
 */
yugi.game.data.FieldData.prototype.getBanishData = function() {
  return this.banishData_;
};


/**
 * @param {!yugi.data.CardListData} banishData The player's banish pile.
 */
yugi.game.data.FieldData.prototype.setBanishData = function(banishData) {
  this.banishData_ = banishData;
};


/**
 * @return {yugi.game.data.CardData} The player's field card.
 */
yugi.game.data.FieldData.prototype.getFieldCardData = function() {
  return this.fieldCardData_;
};


/**
 * @param {yugi.game.data.CardData} fieldCardData The player's field card.
 */
yugi.game.data.FieldData.prototype.setFieldCardData = function(fieldCardData) {
  this.fieldCardData_ = fieldCardData;
};


/** @override */
yugi.game.data.FieldData.prototype.toJson = function() {
  var json = {};
  json['ma'] = yugi.model.util.toJsonArray(this.monsters_);
  json['sta'] = yugi.model.util.toJsonArray(this.spellTraps_);
  json['g'] = this.graveyardData_.toJson();
  json['b'] = this.banishData_.toJson();
  json['f'] = this.fieldCardData_ ? this.fieldCardData_.toJson() : null;
  return json;
};


/** @override */
yugi.game.data.FieldData.prototype.setFromJson = function(json) {

  // Monsters
  var monsterJsonArr = json['ma'];
  var monsters = new Array(monsterJsonArr.length);
  for (var i = 0; i < monsterJsonArr.length; i++) {
    var monsterJson = monsterJsonArr[i];
    if (monsterJson) {
      var data = new yugi.game.data.CardData();
      data.setFromJson(monsterJson);
      monsters[i] = data;
    } else {
      monsters[i] = null;
    }
  }
  this.monsters_ = monsters;

  // Spell/Trap
  var spellTrapJsonArr = json['sta'];
  var spellTraps = new Array(spellTrapJsonArr.length);
  for (var i = 0; i < spellTrapJsonArr.length; i++) {
    var spellTrapJson = spellTrapJsonArr[i];
    if (spellTrapJson) {
      var data = new yugi.game.data.CardData();
      data.setFromJson(spellTrapJson);
      spellTraps[i] = data;
    } else {
      spellTraps[i] = null;
    }
  }
  this.spellTraps_ = spellTraps;

  // Graveyard
  var graveyardData = new yugi.data.CardListData();
  graveyardData.setFromJson(json['g']);
  this.graveyardData_ = graveyardData;

  // Banish
  var banishData = new yugi.data.CardListData();
  banishData.setFromJson(json['b']);
  this.banishData_ = banishData;

  // Field card
  var fieldCardDataJson = json['f'];
  if (fieldCardDataJson) {
    var data = new yugi.game.data.CardData();
    data.setFromJson(fieldCardDataJson);
    this.fieldCardData_ = data;
  } else {
    this.fieldCardData_ = null;
  }
};
