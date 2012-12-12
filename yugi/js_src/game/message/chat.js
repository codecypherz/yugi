/**
 * The message used to send chats.
 */

goog.provide('yugi.game.message.Chat');

goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');



/**
 * A chat message sent to a user.
 * @constructor
 * @extends {yugi.game.message.Message}
 */
yugi.game.message.Chat = function() {
  goog.base(this, yugi.game.message.MessageType.CHAT);
};
goog.inherits(yugi.game.message.Chat, yugi.game.message.Message);


/**
 * @type {string}
 * @private
 */
yugi.game.message.Chat.prototype.sender_ = '';


/**
 * @type {string}
 * @private
 */
yugi.game.message.Chat.prototype.text_ = '';


/**
 * @return {string} The chat message sender.
 */
yugi.game.message.Chat.prototype.getSender = function() {
  return this.sender_;
};


/**
 * @param {string} sender The chat message sender.
 */
yugi.game.message.Chat.prototype.setSender = function(sender) {
  this.sender_ = sender;
};


/**
 * @return {string} The chat message content.
 */
yugi.game.message.Chat.prototype.getText = function() {
  return this.text_;
};


/**
 * @param {string} text The chat message content.
 */
yugi.game.message.Chat.prototype.setText = function(text) {
  this.text_ = text;
};


/** @override */
yugi.game.message.Chat.prototype.toJson = function() {
  var message = goog.base(this, 'toJson');
  message['sender'] = this.getSender();
  message['text'] = this.getText();
  return message;
};


/** @override */
yugi.game.message.Chat.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);

  this.sender_ = json['sender'];
  this.text_ = json['text'];
};
