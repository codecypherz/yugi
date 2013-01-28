/**
 * The graveyard for a player.
 */

goog.provide('yugi.game.model.player.Graveyard');

goog.require('goog.debug.Logger');
goog.require('yugi.model.Area');
goog.require('yugi.model.CardList');



/**
 * The graveyard for a player.
 * @param {boolean} isOpponent True if the player is the opponent.
 * @constructor
 * @extends {yugi.model.CardList}
 */
yugi.game.model.player.Graveyard = function(isOpponent) {

  // Determine the area.
  var area = isOpponent ?
      yugi.model.Area.OPP_GRAVEYARD : yugi.model.Area.PLAYER_GRAVEYARD;

  goog.base(this, area);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.model.player.Graveyard');
};
goog.inherits(yugi.game.model.player.Graveyard, yugi.model.CardList);


/** @override */
yugi.game.model.player.Graveyard.prototype.add = function(card, opt_front) {

  // Cards are added to the top always for the graveyard.
  goog.base(this, 'add', card, true);

  this.logger.info('Added a card to ' + this.getArea());
};
