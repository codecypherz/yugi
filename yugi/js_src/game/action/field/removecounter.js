/**
 * Action for removing a counter from a card.
 */

goog.provide('yugi.game.action.field.RemoveCounter');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * Action for removing a counter from a card.
 * @param {!yugi.model.Card} card The card.
 * @param {!yugi.game.model.Player} player The player model.
 * @param {!yugi.model.Counter} counter The model for the counter.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.field.RemoveCounter = function(card, player, counter) {
  goog.base(this, 'Remove this counter');

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
goog.inherits(yugi.game.action.field.RemoveCounter, yugi.model.Action);


/** @override */
yugi.game.action.field.RemoveCounter.prototype.fire = function() {

  // Remove the counter then dispose it.
  this.card_.removeCounter(this.counter_);
  goog.dispose(this.counter_);

  this.chat_.sendSystemRemote(this.player_.getName() + ' removed a counter.');

  // Synchronize the new game state.
  this.syncService_.sendPlayerState();
};
