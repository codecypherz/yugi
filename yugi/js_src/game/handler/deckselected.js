/**
 * Handles the deck selected message.
 */

goog.provide('yugi.game.handler.DeckSelected');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('yugi.game.message.MessageType');



/**
 * Handles the deck selected message.
 * @param {!yugi.game.net.Channel} channel The channel for communication.
 * @param {!yugi.game.model.Game} game The game model.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.handler.DeckSelected = function(channel, game) {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = game;

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  handler.listen(channel,
      yugi.game.message.MessageType.DECK_SELECTED,
      this.onDeckSelected_);
};
goog.inherits(yugi.game.handler.DeckSelected, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.handler.DeckSelected.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.handler.DeckSelected');


/**
 * Called when the other player selects a deck.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.handler.DeckSelected.prototype.onDeckSelected_ = function(e) {
  this.logger.info('Received a deck selected message.');

  var message = /** @type {!yugi.game.message.DeckSelected} */ (e.message);

  // Make sure the message object is valid.
  var deckKey = message.getDeckKey();
  if (!deckKey) {
    throw new Error('No deck key in the message.');
  }

  this.game_.getOpponent().selectDeck(deckKey);
};
