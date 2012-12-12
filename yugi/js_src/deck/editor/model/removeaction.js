/**
 * Action for removing a card from the deck.
 */

goog.provide('yugi.deck.editor.model.RemoveAction');

goog.require('yugi.model.Action');



/**
 * Action for removing a card from the deck.
 * @param {!yugi.model.Card} card The card to remove.
 * @param {!yugi.deck.editor.model.Constructor} constructor The constructor.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.deck.editor.model.RemoveAction = function(card, constructor) {
  goog.base(this, 'Remove');

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.card_ = card;

  /**
   * @type {!yugi.deck.editor.model.Constructor}
   * @private
   */
  this.constructor_ = constructor;
};
goog.inherits(yugi.deck.editor.model.RemoveAction, yugi.model.Action);


/** @override */
yugi.deck.editor.model.RemoveAction.prototype.fire = function() {
  this.constructor_.removeCard(this.card_);
};
