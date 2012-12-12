/**
 * The message containing information about the other player for the player that
 * just joined.
 */

goog.provide('yugi.game.message.JoinResponse');

goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');



/**
 * The message containing information about the other player for the player that
 * just joined.
 * @constructor
 * @extends {yugi.game.message.Message}
 */
yugi.game.message.JoinResponse = function() {
  goog.base(this, yugi.game.message.MessageType.JOIN_RESPONSE);
};
goog.inherits(yugi.game.message.JoinResponse, yugi.game.message.Message);


/**
 * @type {string}
 * @private
 */
yugi.game.message.JoinResponse.prototype.name_ = '';


/**
 * @type {string}
 * @private
 */
yugi.game.message.JoinResponse.prototype.deckKey_ = '';


/**
 * @type {string}
 * @private
 */
yugi.game.message.JoinResponse.prototype.deckName_ = '';


/**
 * @param {string} name The player's name.
 */
yugi.game.message.JoinResponse.prototype.setName = function(name) {
  this.name_ = name;
};


/**
 * @return {string} The player's name.
 */
yugi.game.message.JoinResponse.prototype.getName = function() {
  return this.name_;
};


/**
 * @return {string} The server side key for the deck.
 */
yugi.game.message.JoinResponse.prototype.getDeckKey = function() {
  return this.deckKey_;
};


/**
 * @param {string} deckKey The deck key to set.
 */
yugi.game.message.JoinResponse.prototype.setDeckKey = function(deckKey) {
  this.deckKey_ = deckKey;
};


/**
 * @return {string} The deck name.
 */
yugi.game.message.JoinResponse.prototype.getDeckName = function() {
  return this.deckName_;
};


/**
 * @param {string} deckName The deck name.
 */
yugi.game.message.JoinResponse.prototype.setDeckName = function(deckName) {
  this.deckName_ = deckName;
};


/** @override */
yugi.game.message.JoinResponse.prototype.toJson = function() {
  var message = goog.base(this, 'toJson');

  message['n'] = this.name_;
  message['dk'] = this.deckKey_;
  message['dn'] = this.deckName_;

  return message;
};


/** @override */
yugi.game.message.JoinResponse.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);

  this.name_ = json['n'];
  this.deckKey_ = json['dk'];
  this.deckName_ = json['dn'];
};
