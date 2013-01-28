/**
 * Action for decrementing a counter on a card.
 */

goog.provide('yugi.game.action.field.DecrementCounter');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * Action for decrementing a counter on a card.
 * @param {!yugi.model.Card} card The card.
 * @param {!yugi.game.model.player.Player} player The player model.
 * @param {!yugi.model.Counter} counter The model for the counter.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.field.DecrementCounter = function(card, player, counter) {
  goog.base(this, 'Subtract 1 from this counter');

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
   * @type {!yugi.model.Counter}
   * @private
   */
  this.counter_ = counter;

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
goog.inherits(yugi.game.action.field.DecrementCounter, yugi.model.Action);


/** @override */
yugi.game.action.field.DecrementCounter.prototype.fire = function() {

  // Subtract 1 from the counter.
  this.counter_.decrement();

  this.chat_.sendSystemRemote(
      this.player_.getName() + ' subtracted a counter.');

  // Synchronize the new game state.
  this.syncService_.sendPlayerState();
};
