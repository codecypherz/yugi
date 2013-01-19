/**
 * The message used to transfer a card between players.
 */

goog.provide('yugi.game.message.DeclareAttack');

goog.require('yugi.game.data.CardData');
goog.require('yugi.game.data.PlayerData');
goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');



/**
 * The message used to transfer a card between players.
 * @constructor
 * @extends {yugi.game.message.Message}
 */
yugi.game.message.DeclareAttack = function() {
  goog.base(this, yugi.game.message.MessageType.DECLARE_ATTACK);

  /**
   * @type {!yugi.game.data.CardData}
   * @private
   */
  this.declaringCardData_ = new yugi.game.data.CardData();

  /**
   * @type {number}
   * @private
   */
  this.declaringZone_ = -1;

  /**
   * @type {!yugi.game.data.CardData}
   * @private
   */
  this.targetCardData_ = new yugi.game.data.CardData();

  /**
   * @type {number}
   * @private
   */
  this.targetZone_ = -1;

  /**
   * @type {!yugi.game.data.PlayerData}
   * @private
   */
  this.targetPlayerData_ = new yugi.game.data.PlayerData();
};
goog.inherits(yugi.game.message.DeclareAttack, yugi.game.message.Message);


/**
 * @return {!yugi.game.data.CardData} The card data.
 */
yugi.game.message.DeclareAttack.prototype.getDeclaringCardData = function() {
  return this.declaringCardData_;
};


/**
 * @param {!yugi.game.data.CardData} data The card data.
 */
yugi.game.message.DeclareAttack.prototype.setDeclaringCardData = function(
    data) {
  this.declaringCardData_ = data;
};


/**
 * @return {number} The declaring zone.
 */
yugi.game.message.DeclareAttack.prototype.getDeclaringZone = function() {
  return this.declaringZone_;
};


/**
 * @param {number} zone The declaring zone.
 */
yugi.game.message.DeclareAttack.prototype.setDeclaringZone = function(zone) {
  this.declaringZone_ = zone;
};


/**
 * @return {!yugi.game.data.CardData} The card data.
 */
yugi.game.message.DeclareAttack.prototype.getTargetCardData = function() {
  return this.targetCardData_;
};


/**
 * @param {!yugi.game.data.CardData} data The card data.
 */
yugi.game.message.DeclareAttack.prototype.setTargetCardData = function(
    data) {
  this.targetCardData_ = data;
};


/**
 * @return {number} The target zone.
 */
yugi.game.message.DeclareAttack.prototype.getTargetZone = function() {
  return this.targetZone_;
};


/**
 * @param {number} zone The target zone.
 */
yugi.game.message.DeclareAttack.prototype.setTargetZone = function(zone) {
  this.targetZone_ = zone;
};


/**
 * @return {!yugi.game.data.PlayerData} The player data.
 */
yugi.game.message.DeclareAttack.prototype.getTargetPlayerData = function() {
  return this.targetPlayerData_;
};


/**
 * @param {!yugi.game.data.PlayerData} data The player data.
 */
yugi.game.message.DeclareAttack.prototype.setTargetPlayerData = function(data) {
  this.targetPlayerData_ = data;
};


/** @override */
yugi.game.message.DeclareAttack.prototype.toJson = function() {
  var message = goog.base(this, 'toJson');

  message['dc'] = this.declaringCardData_.toJson();
  message['dz'] = this.declaringZone_;
  message['tc'] = this.targetCardData_.toJson();
  message['tz'] = this.targetZone_;
  message['tp'] = this.targetPlayerData_.toJson();

  return message;
};


/** @override */
yugi.game.message.DeclareAttack.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);

  this.declaringCardData_.setFromJson(json['dc']);
  this.declaringZone_ = json['dz'];
  this.targetCardData_.setFromJson(json['tc']);
  this.targetZone_ = json['tz'];
  this.targetPlayerData_.setFromJson(json['tp']);
};
