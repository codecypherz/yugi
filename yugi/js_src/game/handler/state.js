/**
 * Handles the state message.
 */

goog.provide('yugi.game.handler.State');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('yugi.game.message.MessageType');
goog.require('yugi.game.message.State');



/**
 * Handles the state message.
 * @param {!yugi.game.net.Channel} channel The channel for communication.
 * @param {!yugi.game.model.Game} game The game object.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.handler.State = function(channel, game) {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = game;

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  handler.listen(channel,
      yugi.game.message.MessageType.STATE,
      this.onState_);
};
goog.inherits(yugi.game.handler.State, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.handler.State.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.handler.State');


/**
 * Called when another client has sent some state to this one.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.handler.State.prototype.onState_ = function(e) {
  this.logger.info('Received the other client\'s state message.');

  // Make sure this client is ready to do this.
  if (!this.game_.getPlayer().isDeckLoaded() ||
      !this.game_.getOpponent().isDeckLoaded()) {
    throw new Error('Cannot handle state messages until both decks are loaded');
  }

  var message = /** @type {!yugi.game.message.State} */ (e.message);
  var data = message.getData();

  switch (message.getDataType()) {

    case yugi.game.message.State.Type.GAME:
      this.logger.info('Setting the game state.');
      this.game_.setFromData(
          /** @type {!yugi.game.data.GameData} */ (data));
      break;

    case yugi.game.message.State.Type.PLAYER:
      this.logger.info('Setting the opponent\'s state.');
      this.game_.getOpponent().setFromData(
          /** @type {!yugi.game.data.PlayerData} */ (data));
      break;

    default:
      throw new Error('Failed to handle state message with this data type: ' +
          message.getDataType());
  }
};
