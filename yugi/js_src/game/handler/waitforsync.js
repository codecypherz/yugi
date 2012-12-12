/**
 * Handles the message requesting this client wait for synchronization data.
 */

goog.provide('yugi.game.handler.WaitForSync');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('yugi.game.message.MessageType');



/**
 * Handles the message requesting this client wait for synchronization data.
 * @param {!yugi.game.net.Channel} channel The channel for communication.
 * @param {!yugi.game.model.Synchronization} synchronization The model for
 *     synchronization.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.handler.WaitForSync = function(channel, synchronization) {
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
      yugi.game.message.MessageType.WAIT_FOR_SYNC,
      this.onWaitForSync_);
};
goog.inherits(yugi.game.handler.WaitForSync, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.handler.WaitForSync.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.handler.WaitForSync');


/**
 * Called when the server sends the wait for sync message.  This will happen if
 * the server has determined that this client has reconnected to the game.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.handler.WaitForSync.prototype.onWaitForSync_ = function(e) {
  this.logger.info('Received a request to wait for synchronization.');

  // Tell the model to start waiting for synchronization data.  This will
  // trigger the appropriate event that will be handled at the UI layer to
  // ultimately let the user know they need to wait for the synchronization data
  this.synchronization_.wait();
};
