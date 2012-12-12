/**
 * The message indicating the player has chosen a deck.
 */

goog.provide('yugi.game.message.DeckSelected');

goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');



/**
 * The message indicating the player has chosen a deck.
 * @constructor
 * @extends {yugi.game.message.Message}
 */
yugi.game.message.DeckSelected = function() {
  goog.base(this, yugi.game.message.MessageType.DECK_SELECTED);
};
goog.inherits(yugi.game.message.DeckSelected, yugi.game.message.Message);


/**
 * @type {string}
 * @private
 */
yugi.game.message.DeckSelected.prototype.deckKey_ = '';


/**
 * @param {string} deckKey The deck key.
 */
yugi.game.message.DeckSelected.prototype.setDeckKey = function(deckKey) {
  this.deckKey_ = deckKey;
};


/**
 * @return {string} The deck key.
 */
yugi.game.message.DeckSelected.prototype.getDeckKey = function() {
  return this.deckKey_;
};


/** @override */
yugi.game.message.DeckSelected.prototype.toJson = function() {
  var message = goog.base(this, 'toJson');
  message['key'] = this.deckKey_;
  return message;
};


/** @override */
yugi.game.message.DeckSelected.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);
  this.deckKey_ = json['key'];
};
