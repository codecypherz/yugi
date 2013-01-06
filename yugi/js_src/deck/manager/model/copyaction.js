/**
 * Action for copying a deck.
 */

goog.provide('yugi.deck.manager.model.CopyAction');

goog.require('yugi.Config');
goog.require('yugi.model.Action');
goog.require('yugi.service.url');



/**
 * The action for copying a deck.
 * @param {!yugi.model.Deck} deck The deck to copy.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.deck.manager.model.CopyAction = function(deck) {
  goog.base(this, 'Create a copy');

  /**
   * @type {!yugi.model.Deck}
   * @private
   */
  this.deck_ = deck;
};
goog.inherits(yugi.deck.manager.model.CopyAction, yugi.model.Action);


/** @override */
yugi.deck.manager.model.CopyAction.prototype.fire = function() {

  var uri = yugi.service.url.build(
      yugi.Config.ServletPath.DECK_COPY,
      yugi.Config.UrlParameter.DECK_KEY, this.deck_.getKey());
  window.location.href = uri.toString();
};
