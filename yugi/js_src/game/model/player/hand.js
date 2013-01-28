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

  // Determine the area.
  var area = isOpponent ?
      yugi.model.Area.OPP_HAND : yugi.model.Area.PLAYER_HAND;

  goog.base(this, area);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.model.player.Hand');
};
goog.inherits(yugi.game.model.player.Hand, yugi.model.CardList);
