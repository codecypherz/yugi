/**
 * Handles events related to player connection.
 */

goog.provide('yugi.game.handler.Connection');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('yugi.game.message.JoinResponse');
goog.require('yugi.game.message.MessageType');



/**
 * Handles events related to player connection.
 * @param {!yugi.game.net.Channel} channel The channel for communication.
 * @param {!yugi.game.model.Game} game The game object.
 * @param {!yugi.game.model.Chat} chat The chat model.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.handler.Connection = function(channel, game, chat) {
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
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = chat;

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  // Listen for connection/disconnection events.
  this.handler_.listen(this.channel_,
      yugi.game.message.MessageType.CONNECTED,
      this.onConnected_);
  this.handler_.listen(this.channel_,
      yugi.game.message.MessageType.DISCONNECTED,
      this.onDisconnected_);
};
goog.inherits(yugi.game.handler.Connection, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.handler.Connection.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.handler.Connection');


/**
 * Called when another player connects to the game.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.handler.Connection.prototype.onConnected_ = function(e) {
  this.logger.info('Received a connected message.');

  var message = /** @type {!yugi.game.message.Connected} */ (e.message);

  // Get the opponent that just connected.
  var opponentName = message.getPlayer();

  // Tell the user about the opponent that just connected.
  if (this.game_.hasOpponentJoined()) {
    this.logger.info('The opponent reconnected.');
    this.chat_.sendSystemLocal(opponentName + ' has reconnected.');
  } else {
    this.logger.info('The opponent joined for the first time.');

    // The opponent connected for the first time, so create and set the opponent
    // player object.
    var opponent = this.game_.getOpponent();
    opponent.setName(opponentName);
    opponent.setConnected(true);
    this.game_.setOpponent(opponent);
    this.chat_.sendSystemLocal(opponentName + ' joined the game.');
    this.chat_.sendSystemLocal(opponentName + ' needs to select their deck.');

    // The opponent needs to be told about a few things about this player.
    this.logger.info('Sending a join response.');
    var player = this.game_.getPlayer();
    var joinResponse = new yugi.game.message.JoinResponse();
    joinResponse.setName(player.getName());
    joinResponse.setDeckKey(player.getDeck().getKey());
    joinResponse.setDeckName(player.getDeck().getName());
    this.channel_.send(joinResponse);
  }
};


/**
 * Called when another player disconnects from the game.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.handler.Connection.prototype.onDisconnected_ = function(e) {
  this.logger.info('Received a disconnected message.');

  var message = /** @type {!yugi.game.message.Disconnected} */ (e.message);

  // Get the opponent that just connected.
  var opponentName = message.getPlayer();

  // It would be weird to receive a disconnect message for the opponent when
  // we don't know of any opponent.
  if (!this.game_.hasOpponentJoined()) {
    this.logger.severe('Received a disconnect message for an opponent when ' +
        'no opponent has ever joined the game.');
    return;
  }

  // Make sure the names match, otherwise that's weird.
  var opponent = this.game_.getOpponent();
  if (opponentName != opponent.getName()) {
    this.logger.severe('Received a disconnect message for some other opponent');
    return;
  }

  // Tell the user their opponent just disconnected.
  opponent.setConnected(false);
  this.chat_.sendSystemLocal(opponentName + ' has disconnected.');
};
