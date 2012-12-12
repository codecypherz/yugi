/**
 * Service for dispatching game state.
 */

goog.provide('yugi.game.service.Sync');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('yugi.game.message.State');



/**
 * Service for dispatching game state.
 * @param {!yugi.game.net.Channel} channel The channel of communication.
 * @param {!yugi.game.model.Game} game The game object.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.service.Sync = function(channel, game) {

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
};
goog.inherits(yugi.game.service.Sync, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.service.Sync.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.service.Sync');


/**
 * @type {!yugi.game.service.Sync}
 * @private
 */
yugi.game.service.Sync.instance_;


/**
 * Registers an instance of the chat model.
 * @param {!yugi.game.net.Channel} channel The channel of communication.
 * @param {!yugi.game.model.Game} game The game object.
 * @return {!yugi.game.service.Sync} The registered instance.
 */
yugi.game.service.Sync.register = function(channel, game) {
  yugi.game.service.Sync.instance_ = new yugi.game.service.Sync(channel, game);
  return yugi.game.service.Sync.get();
};


/**
 * @return {!yugi.game.service.Sync} The chat model.
 */
yugi.game.service.Sync.get = function() {
  return yugi.game.service.Sync.instance_;
};


/**
 * Sends this client's game state to the other client.
 */
yugi.game.service.Sync.prototype.sendGameState = function() {
  this.logger.info('Sending this client\'s game state.');

  var message = new yugi.game.message.State();
  message.setDataType(yugi.game.message.State.Type.GAME);
  message.setData(this.game_.toData());
  this.channel_.send(message);
};


/**
 * Sends this client's player state to the other client.
 */
yugi.game.service.Sync.prototype.sendPlayerState = function() {
  this.logger.info('Sending this client\'s player state.');

  var message = new yugi.game.message.State();
  message.setDataType(yugi.game.message.State.Type.PLAYER);
  message.setData(this.game_.getPlayer().toData());
  this.channel_.send(message);
};
