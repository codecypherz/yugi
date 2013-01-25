/**
 * Represents a snapshot of a game from one client's perspective.  This is the
 * minimum amount of data required for another client to synchronize its data.
 */

goog.provide('yugi.game.data.GameData');

goog.require('goog.Disposable');
goog.require('yugi.game.data.PlayerData');
goog.require('yugi.model.Serializable');



/**
 * Represents a snapshot of a game from one client's perspective.  This is the
 * minimum amount of data required for another client to synchronize its data.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {yugi.model.Serializable}
 */
yugi.game.data.GameData = function() {
  goog.base(this);

  /**
   * The game's key on the server.
   * @type {string}
   * @private
   */
  this.key_ = '';

  /**
   * @type {boolean}
   * @private
   */
  this.opponentJoined_ = false;

  /**
   * The "self" player or this client's player.
   * @type {!yugi.game.data.PlayerData}
   * @private
   */
  this.playerData_ = new yugi.game.data.PlayerData();

  /**
   * The player's opponent.
   * @type {!yugi.game.data.PlayerData}
   * @private
   */
  this.opponentData_ = new yugi.game.data.PlayerData();
};
goog.inherits(yugi.game.data.GameData, goog.Disposable);


/**
 * @return {string} The server's game key.
 */
yugi.game.data.GameData.prototype.getKey = function() {
  return this.key_;
};


/**
 * @param {string} key The server's game key.
 */
yugi.game.data.GameData.prototype.setKey = function(key) {
  this.key_ = key;
};


/**
 * @return {!yugi.game.data.PlayerData} The player.
 */
yugi.game.data.GameData.prototype.getPlayerData = function() {
  return this.playerData_;
};


/**
 * @param {!yugi.game.data.PlayerData} playerData The player.
 */
yugi.game.data.GameData.prototype.setPlayerData = function(playerData) {
  this.playerData_ = playerData;
};


/**
 * @return {!yugi.game.data.PlayerData} The player's opponent.
 */
yugi.game.data.GameData.prototype.getOpponentData = function() {
  return this.opponentData_;
};


/**
 * @param {!yugi.game.data.PlayerData} opponentData The player's opponent.
 */
yugi.game.data.GameData.prototype.setOpponentData = function(opponentData) {
  this.opponentData_ = opponentData;
};


/**
 * @return {boolean} True if the opponent has joined or not.
 */
yugi.game.data.GameData.prototype.getOpponentJoined = function() {
  return this.opponentJoined_;
};


/**
 * @param {boolean} opponentJoined True if the opponent has joined or not.
 */
yugi.game.data.GameData.prototype.setOpponentJoined =
    function(opponentJoined) {
  this.opponentJoined_ = opponentJoined;
};


/** @override */
yugi.game.data.GameData.prototype.toJson = function() {
  var json = {};
  json['k'] = this.key_;
  json['p'] = this.playerData_.toJson();
  json['o'] = this.opponentData_.toJson();
  json['oj'] = this.opponentJoined_;
  return json;
};


/** @override */
yugi.game.data.GameData.prototype.setFromJson = function(json) {
  this.key_ = json['k'];

  var playerData = new yugi.game.data.PlayerData();
  playerData.setFromJson(json['p']);
  this.playerData_ = playerData;

  var opponentData = new yugi.game.data.PlayerData();
  opponentData.setFromJson(json['o']);
  this.opponentData_ = opponentData;

  this.opponentJoined_ = json['oj'];
};
