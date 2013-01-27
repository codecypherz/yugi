/**
 * The graveyard for a player.
 */

goog.provide('yugi.game.model.field.Graveyard');

goog.require('goog.debug.Logger');
goog.require('yugi.model.Area');
goog.require('yugi.model.CardList');



/**
 * The graveyard for a player.
 * @param {boolean} isOpponent True if the player is the opponent.
 * @constructor
 * @extends {yugi.model.CardList}
 */
yugi.game.model.field.Graveyard = function(isOpponent) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.model.field.Graveyard');

  // Set the area for the graveyard.
  if (isOpponent) {
    this.setArea(yugi.model.Area.OPP_GRAVEYARD);
  } else {
    this.setArea(yugi.model.Area.PLAYER_GRAVEYARD);
  }
};
goog.inherits(yugi.game.model.field.Graveyard, yugi.model.CardList);


/** @override */
yugi.game.model.field.Graveyard.prototype.add = function(card, opt_front) {

  // Cards are added to the top always for the graveyard.
  goog.base(this, 'add', card, true);

  this.logger.info('Added a card to ' + this.getArea());
};
