/**
 * Handles the request to send synchronization data.
 */

goog.provide('yugi.game.handler.SyncRequest');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('yugi.game.message.MessageType');
goog.require('yugi.game.message.SyncResponse');



/**
 * Handles the request to send synchronization data.
 * @param {!yugi.game.net.Channel} channel The channel for communication.
 * @param {!yugi.game.model.Game} game The game object.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.handler.SyncRequest = function(channel, game) {
  goog.base(this);

  /**
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = channel;

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  this.handler_.listen(this.channel_,
      yugi.game.message.MessageType.SYNC_REQUEST,
      this.onSyncRequest_);
};
goog.inherits(yugi.game.handler.SyncRequest, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.handler.SyncRequest.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.handler.SyncRequest');


/**
 * Called when asked to send synchronization data to the other client.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.handler.SyncRequest.prototype.onSyncRequest_ = function(e) {
  this.logger.info('Received a synchronization request.');

  var message = new yugi.game.message.SyncResponse();
  message.setGameData(this.game_.toData());
  this.channel_.send(message);
  this.logger.info('Sent the synchronization response.');
};
