/**
 * Action for setting the cover card of the deck.
 */

goog.provide('yugi.deck.editor.model.CoverAction');

goog.require('yugi.model.Action');



/**
 * Action for setting the cover card of the deck.
 * @param {!yugi.model.Card} card The card to remove.
 * @param {!yugi.deck.editor.model.Constructor} constructor The constructor.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.deck.editor.model.CoverAction = function(card, constructor) {
  goog.base(this, 'Set as cover');

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
goog.inherits(yugi.deck.editor.model.CoverAction, yugi.model.Action);


/** @override */
yugi.deck.editor.model.CoverAction.prototype.fire = function() {
  this.constructor_.setCoverCard(this.card_);
};
