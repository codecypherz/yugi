/**
 * Action for resetting the game.
 */

goog.provide('yugi.game.action.Reset');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * Action for resetting the game.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.Reset = function() {
  goog.base(this, 'Reset your side');

  var game = yugi.game.model.Game.get();

  /**
   * @type {!yugi.game.model.player.Player}
   * @private
   */
  this.player_ = game.getPlayer();

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
goog.inherits(yugi.game.action.Reset, yugi.model.Action);


/** @override */
yugi.game.action.Reset.prototype.fire = function() {

  // Confirm the action.
  if (!confirm(
      'Return all of your cards to the deck and reset your life points?')) {
    return;
  }

  // Reset the player.
  this.player_.reset();

  // Tell the opponent about it.
  this.chat_.sendSystemRemote(this.player_.getName() +
      ' reset their cards and shuffled their deck.');

  // Synchronize the new player state.
  this.syncService_.sendPlayerState();
};
