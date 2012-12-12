/**
 * Handles the synchronization data response.
 */

goog.provide('yugi.game.handler.SyncResponse');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('yugi.game.message.MessageType');



/**
 * Handles the synchronization data response.
 * @param {!yugi.game.net.Channel} channel The channel for communication.
 * @param {!yugi.game.model.Synchronization} synchronization The model for
 *     synchronization.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.handler.SyncResponse = function(channel, synchronization) {
  goog.base(this);

  /**
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = channel;

  /**
   * @type {!yugi.game.model.Synchronization}
   * @private
   */
  this.synchronization_ = synchronization;

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  this.handler_.listen(this.channel_,
      yugi.game.message.MessageType.SYNC_RESPONSE,
      this.onSyncResponse_);
};
goog.inherits(yugi.game.handler.SyncResponse, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.handler.SyncResponse.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.handler.SyncResponse');


/**
 * Called when the other client sends their synchronization data.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.handler.SyncResponse.prototype.onSyncResponse_ = function(e) {
  this.logger.info('Received a synchronization response.');

  var message = /** @type {!yugi.game.message.SyncResponse} */ (e.message);

  // Don't handle the SyncResponse unless we were expecting it.
  if (!this.synchronization_.isWaiting()) {
    this.logger.severe(
        'Received a SyncResponse when we weren\'t waiting for one.');
    return;
  }

  // Make sure the game object is valid.
  var gameData = message.getGameData();
  if (!gameData) {
    this.logger.severe('Could not synchronize game state because the game ' +
        'state message did not have a game data object.');
    return;
  }

  // Start the synchronization process now that we have data.
  this.synchronization_.start(gameData);
};
