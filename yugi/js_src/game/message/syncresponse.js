/**
 * The message containing information necessary for synchronization.
 */

goog.provide('yugi.game.message.SyncResponse');

goog.require('yugi.game.data.GameData');
goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');



/**
 * The message containing information necessary for synchronization.
 * @constructor
 * @extends {yugi.game.message.Message}
 */
yugi.game.message.SyncResponse = function() {
  goog.base(this, yugi.game.message.MessageType.SYNC_RESPONSE);
};
goog.inherits(yugi.game.message.SyncResponse, yugi.game.message.Message);


/**
 * @type {yugi.game.data.GameData}
 * @private
 */
yugi.game.message.SyncResponse.prototype.gameData_;


/**
 * @return {yugi.game.data.GameData} The game data.
 */
yugi.game.message.SyncResponse.prototype.getGameData = function() {
  return this.gameData_;
};


/**
 * @param {!yugi.game.data.GameData} gameData The game data to set.
 */
yugi.game.message.SyncResponse.prototype.setGameData = function(gameData) {
  this.gameData_ = gameData;
};


/** @override */
yugi.game.message.SyncResponse.prototype.toJson = function() {
  var message = goog.base(this, 'toJson');
  if (goog.isDefAndNotNull(this.gameData_)) {
    message['game'] = this.gameData_.toJson();
  } else {
    message['game'] = null;
  }
  return message;
};


/** @override */
yugi.game.message.SyncResponse.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);

  var gameJson = json['game'];
  if (gameJson) {
    var gameData = new yugi.game.data.GameData();
    gameData.setFromJson(gameJson);
    this.gameData_ = gameData;
  } else {
    this.gameData_ = null;
  }
};
