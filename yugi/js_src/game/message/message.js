/**
 * Base class for all messages.
 */

goog.provide('yugi.game.message.Message');

goog.require('goog.object');
goog.require('goog.string');
goog.require('yugi.game.message.MessageType');
goog.require('yugi.model.Serializable');



/**
 * Assembles the basic message.
 * @param {!yugi.game.message.MessageType} type The type of message.
 * @constructor
 * @implements {yugi.model.Serializable}
 */
yugi.game.message.Message = function(type) {

  /**
   * @type {!yugi.game.message.MessageType}
   * @private
   */
  this.type_ = type;
};


/**
 * @return {!yugi.game.message.MessageType} The type of message.
 */
yugi.game.message.Message.prototype.getType = function() {
  return this.type_;
};


/** @override */
yugi.game.message.Message.prototype.toJson = function() {
  return {
    'type': this.type_
  };
};


/** @override */
yugi.game.message.Message.prototype.setFromJson = function(json) {
  // The type is set in the constructor of the individual messages.
};


/**
 * @param {!Object} json The message JSON from which to extract the type.
 * @return {?yugi.game.message.MessageType} The type of message or null if no
 *     type was found.
 */
yugi.game.message.Message.getTypeFromJson = function(json) {

  // Get the type string from the JSON object.
  var typeString = json['type'];
  if (!typeString) {
    return null;
  }

  // The type was there, so look for a match in the enum.
  return /** @type {yugi.game.message.MessageType} */ (goog.object.findValue(
      yugi.game.message.MessageType,
      function(value, key, object) {
        return goog.string.caseInsensitiveCompare(value, typeString) == 0;
      }));
};
