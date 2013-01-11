/**
 * Handles the synchronization data response.
 */

goog.provide('yugi.game.handler.JoinResponse');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('yugi.game.message.MessageType');



/**
 * Handles the synchronization data response.
 * @param {!yugi.game.net.Channel} channel The channel for communication.
 * @param {!yugi.game.model.Game} game The game model.
 * @param {!yugi.game.model.Chat} chat The chat model.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.handler.JoinResponse = function(channel, game, chat) {
  goog.base(this);

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

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  handler.listen(channel,
      yugi.game.message.MessageType.JOIN_RESPONSE,
      this.onJoinResponse_);
};
goog.inherits(yugi.game.handler.JoinResponse, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.handler.JoinResponse.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.handler.JoinResponse');


/**
 * Called when the other client sends their synchronization data.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.handler.JoinResponse.prototype.onJoinResponse_ = function(e) {
  this.logger.info('Received a join response.');

  var message = /** @type {!yugi.game.message.JoinResponse} */ (e.message);

  // Set the opponent data.
  var opponent = this.game_.getOpponent();
  var name = message.getName();
  opponent.setName(name);
  opponent.setConnected(true);
  this.game_.markOpponentJoined();

  // If the opponent selected their deck, select it here too.
  var deckKey = message.getDeckKey();
  if (deckKey) {
    this.chat_.sendSystemLocal(name + ' has already selected a deck.');
    opponent.selectDeck(deckKey);
  } else {
    this.chat_.sendSystemLocal(name + ' needs to select their deck.');
  }
};
