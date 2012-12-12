/**
 * The minimum set of data to send when synchronizing game state.
 */

goog.provide('yugi.game.data.PlayerData');

goog.require('goog.Disposable');
goog.require('yugi.data.CardListData');
goog.require('yugi.game.data.DeckData');
goog.require('yugi.game.data.FieldData');
goog.require('yugi.model.Serializable');



/**
 * The minimum set of data to send when synchronizing game state.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {yugi.model.Serializable}
 */
yugi.game.data.PlayerData = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.data.DeckData}
   * @private
   */
  this.deckData_ = new yugi.game.data.DeckData();

  /**
   * @type {!yugi.data.CardListData}
   * @private
   */
  this.handData_ = new yugi.data.CardListData();

  /**
   * @type {!yugi.game.data.FieldData}
   * @private
   */
  this.fieldData_ = new yugi.game.data.FieldData();
};
goog.inherits(yugi.game.data.PlayerData, goog.Disposable);


/**
 * The name of the player.
 * @type {string}
 * @private
 */
yugi.game.data.PlayerData.prototype.name_ = '';


/**
 * The connection status of this player.
 * @type {boolean}
 * @private
 */
yugi.game.data.PlayerData.prototype.connected_ = false;


/**
 * True if the player has selected their deck or not.
 * @type {boolean}
 * @private
 */
yugi.game.data.PlayerData.prototype.deckSelected_ = false;


/**
 * True if this player is the opponent, false otherwise.
 * @type {boolean}
 * @private
 */
yugi.game.data.PlayerData.prototype.isOpponent_ = false;


/**
 * @type {number}
 * @private
 */
yugi.game.data.PlayerData.prototype.lifePoints_ = 0;


/**
 * @return {string} The player's name.
 */
yugi.game.data.PlayerData.prototype.getName = function() {
  return this.name_;
};


/**
 * @param {string} name The name of the player.
 */
yugi.game.data.PlayerData.prototype.setName = function(name) {
  this.name_ = name;
};


/**
 * @return {boolean} True if this player is the opponent or not.
 */
yugi.game.data.PlayerData.prototype.isOpponent = function() {
  return this.isOpponent_;
};


/**
 * @param {boolean} isOpponent True if this player is the opponent or not.
 */
yugi.game.data.PlayerData.prototype.setOpponent = function(isOpponent) {
  this.isOpponent_ = isOpponent;
};


/**
 * @param {!yugi.game.data.DeckData} deckData The deck data to set.
 */
yugi.game.data.PlayerData.prototype.setDeckData = function(deckData) {
  this.deckData_ = deckData;
};


/**
 * @return {!yugi.game.data.DeckData} The player's deck data.
 */
yugi.game.data.PlayerData.prototype.getDeckData = function() {
  return this.deckData_;
};


/**
 * @param {boolean} deckSelected True if the deck is selected or not.
 */
yugi.game.data.PlayerData.prototype.setDeckSelected = function(deckSelected) {
  this.deckSelected_ = deckSelected;
};


/**
 * @return {boolean} True if this player has selected their deck or not.
 */
yugi.game.data.PlayerData.prototype.isDeckSelected = function() {
  return this.deckSelected_;
};


/**
 * @return {!yugi.data.CardListData} The player's hand.
 */
yugi.game.data.PlayerData.prototype.getHandData = function() {
  return this.handData_;
};


/**
 * @param {!yugi.data.CardListData} handData The player's hand.
 */
yugi.game.data.PlayerData.prototype.setHandData = function(handData) {
  this.handData_ = handData;
};


/**
 * @return {!yugi.game.data.FieldData} The player's field.
 */
yugi.game.data.PlayerData.prototype.getFieldData = function() {
  return this.fieldData_;
};


/**
 * @param {!yugi.game.data.FieldData} fieldData The player's field.
 */
yugi.game.data.PlayerData.prototype.setFieldData = function(fieldData) {
  this.fieldData_ = fieldData;
};


/**
 * @param {boolean} connected True if the player is connected or not.
 */
yugi.game.data.PlayerData.prototype.setConnected = function(connected) {
  this.connected_ = connected;
};


/**
 * @return {boolean} True if the player is connected or not.
 */
yugi.game.data.PlayerData.prototype.isConnected = function() {
  return this.connected_;
};


/**
 * @param {number} lifePoints The life points for the player.
 */
yugi.game.data.PlayerData.prototype.setLifePoints = function(lifePoints) {
  this.lifePoints_ = lifePoints;
};


/**
 * @return {number} The life points for the player.
 */
yugi.game.data.PlayerData.prototype.getLifePoints = function() {
  return this.lifePoints_;
};


/** @override */
yugi.game.data.PlayerData.prototype.toJson = function() {
  var json = {};
  json['n'] = this.name_;
  json['d'] = this.deckData_.toJson();
  json['o'] = this.isOpponent_;
  json['ds'] = this.deckSelected_;
  json['h'] = this.handData_.toJson();
  json['f'] = this.fieldData_.toJson();
  json['c'] = this.connected_;
  json['lp'] = this.lifePoints_;
  return json;
};


/** @override */
yugi.game.data.PlayerData.prototype.setFromJson = function(json) {
  this.name_ = json['n'];

  var deckData = new yugi.game.data.DeckData();
  deckData.setFromJson(json['d']);
  this.deckData_ = deckData;
  this.deckSelected_ = json['ds'];

  var handData = new yugi.data.CardListData();
  handData.setFromJson(json['h']);
  this.handData_ = handData;

  var fieldData = new yugi.game.data.FieldData();
  fieldData.setFromJson(json['f']);
  this.fieldData_ = fieldData;

  this.connected_ = json['c'];
  this.isOpponent_ = json['o'];
  this.lifePoints_ = json['lp'];
};
