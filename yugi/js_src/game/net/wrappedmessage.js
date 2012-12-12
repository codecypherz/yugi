/**
 * The wrapper for all messages.  This is the format of all messages that get
 * sent to the server.
 */

goog.provide('yugi.game.net.WrappedMessage');



/**
 * Assembles the wrapped message.
 * @param {!yugi.game.message.MessageType} type The type of message.
 * @param {string} user The user that sent the message.
 * @param {!yugi.game.message.Message} message The message to be sent.
 * @constructor
 */
yugi.game.net.WrappedMessage = function(type, user, message) {

  /**
   * @type {!yugi.game.message.MessageType}
   * @private
   */
  this.type_ = type;

  /**
   * @type {string}
   * @private
   */
  this.user_ = user;

  /**
   * @type {!yugi.game.message.Message}
   * @private
   */
  this.message_ = message;
};


/**
 * @return {!yugi.game.message.MessageType} The type of message.
 */
yugi.game.net.WrappedMessage.prototype.getType = function() {
  return this.type_;
};


/**
 * @return {string} The user that sent the message.
 */
yugi.game.net.WrappedMessage.prototype.getUser = function() {
  return this.user_;
};


/**
 * @return {!yugi.game.message.Message} The message payload.
 */
yugi.game.net.WrappedMessage.prototype.getMessage = function() {
  return this.message_;
};


/**
 * Converts this object to an object with un-obfuscated keys.  This enables the
 * server to decode the message.
 * @return {!Object} The representation of this object with un-obfuscated keys.
 */
yugi.game.net.WrappedMessage.prototype.toJson = function() {
  return {
    'type': this.type_,
    'user': this.user_,
    'message': this.message_.toJson()
  };
};
