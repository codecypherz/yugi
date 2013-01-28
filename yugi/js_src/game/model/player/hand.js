/**
 * The hand for a player.
 */

goog.provide('yugi.game.model.player.Hand');

goog.require('goog.debug.Logger');
goog.require('yugi.model.Area');
goog.require('yugi.model.CardList');



/**
 * The hand for a player.
 * @param {boolean} isOpponent True if the player is the opponent.
 * @constructor
 * @extends {yugi.model.CardList}
 */
yugi.game.model.player.Hand = function(isOpponent) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.model.player.Hand');

  // Set the area for the hand.
  if (isOpponent) {
    this.setArea(yugi.model.Area.OPP_HAND);
  } else {
    this.setArea(yugi.model.Area.PLAYER_HAND);
  }
};
goog.inherits(yugi.game.model.player.Hand, yugi.model.CardList);
