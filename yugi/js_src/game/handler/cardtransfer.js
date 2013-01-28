/**
 * Handles events related to card transfer.
 */

goog.provide('yugi.game.handler.CardTransfer');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('yugi.game.message.CardTransfer');
goog.require('yugi.game.message.MessageType');
goog.require('yugi.model.Area');
goog.require('yugi.model.MonsterCard');
goog.require('yugi.model.SpellCard');



/**
 * Handles events related to card transfer.
 * @param {!yugi.game.net.Channel} channel The channel for communication.
 * @param {!yugi.game.model.Game} game The game object.
 * @param {!yugi.game.model.Chat} chat The chat model.
 * @param {!yugi.game.service.Sync} syncService The synchronization service.
 * @param {!yugi.model.CardCache} cardCache The card cache.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.handler.CardTransfer =
    function(channel, game, chat, syncService, cardCache) {
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

  /**
   * @type {!yugi.game.service.Sync}
   * @private
   */
  this.syncService_ = syncService;

  /**
   * @type {!yugi.model.CardCache}
   * @private
   */
  this.cardCache_ = cardCache;

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  // Listen for connection/disconnection events.
  this.handler_.listen(channel,
      yugi.game.message.MessageType.CARD_TRANSFER,
      this.onCardTransfer_);
};
goog.inherits(yugi.game.handler.CardTransfer, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.handler.CardTransfer.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.handler.CardTransfer');


/**
 * Called when a card transfer is received.  The card is constructed and placed
 * in the correct location for the player.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.handler.CardTransfer.prototype.onCardTransfer_ = function(e) {
  this.logger.info('Received a card transfer request.');

  var message = /** @type {!yugi.game.message.CardTransfer} */ (e.message);

  // Construct a card based on the card data.
  var cardData = message.getCardData();
  var card = this.cardCache_.get(cardData.getKey());
  cardData.syncToCard(card);

  // Grab references to things for convenience and brevity.
  var player = this.game_.getPlayer();
  var field = player.getField();
  var hand = player.getHand();
  var pName = player.getName();
  var oName = this.game_.getOpponent().getName();
  var cName = card.getName();

  var destination = message.getDestination();

  // Make the card face up and normal.
  card.setFaceUp(true);
  card.setRotated(false);

  // Now add the card to the right place.
  switch (destination) {
    case yugi.game.message.CardTransfer.Location.FIELD:

      // Put the card in different places depending on the type of card.
      if (card instanceof yugi.model.MonsterCard) {
        if (field.hasEmptyMonsterZone()) {
          var zone = field.setMonsterCard(card);
          this.chat_.sendSystemRemote(oName + ' transferred ' + cName +
              ' to ' + pName + '\'s monster zone ' + (zone + 1) + '.');
        } else {
          hand.add(card);
          this.chat_.sendSystemRemote(oName + ' transferred ' + cName +
              ' to ' + pName + '\'s hand because there was not a free ' +
              'monster zone.');
        }
      } else if (card instanceof yugi.model.SpellCard &&
          card.getSpellType() == yugi.model.SpellCard.Type.FIELD) {
        var fieldArea = yugi.model.Area.PLAYER_FIELD;
        var oldFieldCard = field.setCard(fieldArea, null);
        if (oldFieldCard) {
          player.getGraveyard().add(oldFieldCard);
          this.chat_.sendSystemRemote(oName + ' transferred ' + cName +
              ' to ' + pName + '\'s field zone which sent ' +
              oldFieldCard.getName() + ' to the graveyard.');
        } else {
          this.chat_.sendSystemRemote(oName + ' transferred ' + cName +
              ' to ' + pName + '\'s field zone.');
        }
        field.setCard(fieldArea, card);
      } else {
        if (field.hasEmptySpellTrapZone()) {
          var zone = field.setSpellTrapCard(
              /** @type {!yugi.model.SpellCard|!yugi.model.TrapCard} */ (card));
          this.chat_.sendSystemRemote(oName + ' transferred ' + cName +
              ' to ' + pName + '\'s spell/trap zone ' + (zone + 1) + '.');
        } else {
          hand.add(card);
          this.chat_.sendSystemRemote(oName + ' transferred ' + cName +
              ' to ' + pName + '\'s hand because there was not a free ' +
              'spell/trap zone.');
        }
      }
      break;

    case yugi.game.message.CardTransfer.Location.HAND:

      // Add the new card to the hand.
      hand.add(card);
      this.chat_.sendSystemRemote(
          oName + ' transferred ' + cName + ' to ' + pName + '\'s hand.');
      break;

    default:
      throw Error('No known destination: ' + destination);
  }

  // The success case modified the player state, so sync it up.
  this.syncService_.sendPlayerState();
};
