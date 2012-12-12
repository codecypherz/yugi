/**
 * The message used to signal to the server that the user has disconnected from
 * the server.
 */

goog.provide('yugi.game.message.Disconnected');

goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');



/**
 * The message used to signal to the server that the user has disconnected from
 * the server.
 * @constructor
 * @extends {yugi.game.message.Message}
 */
yugi.game.message.Disconnected = function() {
  goog.base(this, yugi.game.message.MessageType.DISCONNECTED);
};
goog.inherits(yugi.game.message.Disconnected, yugi.game.message.Message);


/**
 * @type {string}
 * @private
 */
yugi.game.message.Disconnected.prototype.player_ = '';


/**
 * @param {string} player The player to set.
 */
yugi.game.message.Disconnected.prototype.setPlayer = function(player) {
  this.player_ = player;
};


/**
 * @return {string} The player that is now disconnected.
 */
yugi.game.message.Disconnected.prototype.getPlayer = function() {
  return this.player_;
};


/** @override */
yugi.game.message.Disconnected.prototype.toJson = function() {
  var message = goog.base(this, 'toJson');
  message['player'] = this.getPlayer();
  return message;
};


/** @override */
yugi.game.message.Disconnected.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);

  this.player_ = json['player'];
};
