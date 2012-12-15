/**
 * Utilities for decks.
 */

goog.provide('yugi.util.deck');

goog.require('goog.Uri');
goog.require('goog.string');
goog.require('yugi.Config');


/**
 * Checks to see if the URL is for a structure deck or not.
 * @param {string} url The URL to check.
 * @return {boolean} True if the URL is for a structure deck.
 */
yugi.util.deck.isStructureDeckRequest = function(url) {
  var uri = goog.Uri.parse(url);
  var structure = uri.getParameterValue(yugi.Config.UrlParameter.STRUCTURE);
  if (structure && !goog.string.isEmptySafe(structure)) {
    return 'true' == goog.string.trim(structure).toLowerCase();
  }
  return false;
};


/**
 * Makes the request a structure deck request or not.
 * @param {!goog.Uri} uri The request to make a structure deck request or not.
 * @param {boolean} structure True if the request should be a structure deck
 *     request.
 */
yugi.util.deck.setStructureDeckRequest = function(uri, structure) {
  uri.setParameterValue(yugi.Config.UrlParameter.STRUCTURE, String(structure));
};
