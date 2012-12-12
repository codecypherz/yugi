/**
 * Defines something as capable of being serialized to and from JSON.
 */

goog.provide('yugi.model.Serializable');



/**
 * @interface
 */
yugi.model.Serializable = function() { };


/**
 * Converts this object to an object with un-obfuscated keys.  This enables the
 * server to decode the message.
 * @return {!Object} The representation of this object with un-obfuscated keys.
 */
yugi.model.Serializable.prototype.toJson;


/**
 * Sets all the fields from the JSON object.
 * @param {!Object} json The JSON object representing the message.
 */
yugi.model.Serializable.prototype.setFromJson;
