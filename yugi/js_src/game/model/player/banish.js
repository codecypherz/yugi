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

  // Determine the area.
  var area = isOpponent ?
      yugi.model.Area.OPP_BANISH : yugi.model.Area.PLAYER_BANISH;

  goog.base(this, area);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.model.player.Banish');
};
goog.inherits(yugi.game.model.player.Banish, yugi.model.CardList);


/** @override */
yugi.game.model.player.Banish.prototype.add = function(card, opt_front) {

  // Cards are added to the top always for the banish pile.
  goog.base(this, 'add', card, true);

  this.logger.info('Added a card to ' + this.getArea());
};
