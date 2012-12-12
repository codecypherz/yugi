/**
 * Action for deleting a deck.
 */

goog.provide('yugi.deck.manager.model.DeleteAction');

goog.require('yugi.model.Action');



/**
 * The action for deleting a deck.
 * @param {!yugi.model.Deck} deck The deck to delete.
 * @param {!yugi.deck.manager.model.Decks} decksModel The decks model.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.deck.manager.model.DeleteAction = function(deck, decksModel) {
  goog.base(this, 'Delete');

  /**
   * @type {!yugi.model.Deck}
   * @private
   */
  this.deck_ = deck;

  /**
   * @type {!yugi.deck.manager.model.Decks}
   * @private
   */
  this.decksModel_ = decksModel;
};
goog.inherits(yugi.deck.manager.model.DeleteAction, yugi.model.Action);


/** @override */
yugi.deck.manager.model.DeleteAction.prototype.fire = function() {

  // Confirm the delete.
  if (!confirm('Delete this deck?')) {
    return;
  }

  // Delegate the delete.
  this.decksModel_.deleteDeck(this.deck_);
};
