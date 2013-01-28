/**
 * The banish pile for a player.
 */

goog.provide('yugi.game.model.player.Banish');

goog.require('goog.debug.Logger');
goog.require('yugi.model.Area');
goog.require('yugi.model.CardList');



/**
 * The banish pile for a player.
 * @param {boolean} isOpponent True if the player is the opponent.
 * @constructor
 * @extends {yugi.model.CardList}
 */
yugi.game.model.player.Banish = function(isOpponent) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.model.player.Banish');

  // Set the area for the banish.
  if (isOpponent) {
    this.setArea(yugi.model.Area.OPP_BANISH);
  } else {
    this.setArea(yugi.model.Area.PLAYER_BANISH);
  }
};
goog.inherits(yugi.game.model.player.Banish, yugi.model.CardList);


/** @override */
yugi.game.model.player.Banish.prototype.add = function(card, opt_front) {

  // Cards are added to the top always for the banish pile.
  goog.base(this, 'add', card, true);

  this.logger.info('Added a card to ' + this.getArea());
};
