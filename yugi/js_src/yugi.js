/**
 * Base yugi utilities.
 */

goog.provide('yugi');

goog.require('goog.events');


/**
 * Generates a unique ID based on this string.
 * @param {string} idString The string on which to base the ID.
 * @return {string} The unique ID.
 */
yugi.uniqueId = function(idString) {
  return goog.events.getUniqueId(idString);
};
