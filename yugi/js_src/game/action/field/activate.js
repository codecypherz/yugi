/**
 * Action for activating a spell or trap card on the field.
 */

goog.provide('yugi.game.action.field.Activate');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * Action for activating a spell or trap card on the field.
 * @param {!yugi.model.Card} card The card.
 * @param {!yugi.game.model.player.Player} player The player model.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.field.Activate = function(card, player) {
  goog.base(this, 'Activate');

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
goog.inherits(yugi.game.action.field.Activate, yugi.model.Action);


/** @override */
yugi.game.action.field.Activate.prototype.fire = function() {

  // Just activate the card by flipping it face up.
  this.card_.setFaceUp(true);

  this.chat_.sendSystemRemote(this.player_.getName() + ' activated ' +
      this.card_.getName() + '.');

  // Synchronize the new game state.
  this.syncService_.sendPlayerState();
};
