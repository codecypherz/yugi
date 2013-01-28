/**
 * Action for setting a spell or trap card on the field again.
 */

goog.provide('yugi.game.action.field.Set');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * Action for setting a spell or trap card on the field again.
 * @param {!yugi.model.Card} card The card.
 * @param {!yugi.game.model.player.Player} player The player model.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.field.Set = function(card, player) {
  goog.base(this, 'Set');

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.card_ = card;

  /**
   * @type {!yugi.game.model.player.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.game.service.Sync}
   * @private
   */
  this.syncService_ = yugi.game.service.Sync.get();

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = yugi.game.model.Chat.get();
};
goog.inherits(yugi.game.action.field.Set, yugi.model.Action);


/** @override */
yugi.game.action.field.Set.prototype.fire = function() {

  // Just set the card again by flipping it face down.
  this.card_.setFaceUp(false);

  this.chat_.sendSystemRemote(this.player_.getName() + ' set ' +
      this.card_.getName() + ' again.');

  // Synchronize the new game state.
  this.syncService_.sendPlayerState();
};
