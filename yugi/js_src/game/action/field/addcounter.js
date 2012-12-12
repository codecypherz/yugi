/**
 * Action for adding a counter to a card.
 */

goog.provide('yugi.game.action.field.AddCounter');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * Action for adding a counter to a card.
 * @param {!yugi.model.Card} card The card.
 * @param {!yugi.game.model.Player} player The player model.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.field.AddCounter = function(card, player) {
  goog.base(this, 'Add New Counter');

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.card_ = card;

  /**
   * @type {!yugi.game.model.Player}
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
goog.inherits(yugi.game.action.field.AddCounter, yugi.model.Action);


/** @override */
yugi.game.action.field.AddCounter.prototype.fire = function() {

  // Add the counter.
  this.card_.addCounter();

  this.chat_.sendSystemRemote(this.player_.getName() + ' added a new counter.');

  // Synchronize the new game state.
  this.syncService_.sendPlayerState();
};
