/**
 * The message used to signal to the server that the user is now connected to
 * the game.
 */

goog.provide('yugi.game.message.Connected');

goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');



/**
 * The message used to signal to the server that the user is now connected to
 * the game.
 * @constructor
 * @extends {yugi.game.message.Message}
 */
yugi.game.message.Connected = function() {
  goog.base(this, yugi.game.message.MessageType.CONNECTED);
};
goog.inherits(yugi.game.message.Connected, yugi.game.message.Message);


/**
 * @type {string}
 * @private
 */
yugi.game.message.Connected.prototype.player_ = '';


/**
 * @param {string} player The player to set.
 */
yugi.game.message.Connected.prototype.setPlayer = function(player) {
  this.player_ = player;
};


/**
 * @return {string} The player that is now connected.
 */
yugi.game.message.Connected.prototype.getPlayer = function() {
  return this.player_;
};


/** @override */
yugi.game.message.Connected.prototype.toJson = function() {
  var message = goog.base(this, 'toJson');
  message['player'] = this.getPlayer();
  return message;
};


/** @override */
yugi.game.message.Connected.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);

  this.player_ = json['player'];
};
