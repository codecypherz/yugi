/**
 * Action for giving a card to the opponent.
 */

goog.provide('yugi.game.action.CardTransfer');

goog.require('yugi.game.data.MonsterData');
goog.require('yugi.game.data.SpellTrapData');
goog.require('yugi.game.message.CardTransfer');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.net.Channel');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');
goog.require('yugi.model.Card');
goog.require('yugi.model.MonsterCard');



/**
 * Action for giving a card to the opponent.
 * @param {!yugi.model.Card} card The card being transferred.
 * @param {!yugi.game.message.CardTransfer.Location} destination The
 *     destination of the card.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.CardTransfer = function(card, destination) {
  goog.base(this, 'Give to opponent');

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.card_ = card;

  /**
   * @type {!yugi.game.message.CardTransfer.Location}
   * @private
   */
  this.destination_ = destination;

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = yugi.game.model.Game.get();

  /**
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = yugi.game.net.Channel.get();

  /**
   * @type {!yugi.game.service.Sync}
   * @private
   */
  this.syncService_ = yugi.game.service.Sync.get();
};
goog.inherits(yugi.game.action.CardTransfer, yugi.model.Action);


/** @override */
yugi.game.action.CardTransfer.prototype.fire = function() {

  // Remove the card from the player completely.
  var removed = this.game_.getPlayer().removeCard(this.card_);
  if (!removed) {
    throw Error('Failed to remove the card when attempting to transfer.');
  }

  // Now that the card is removed, synchronize this player's state with the
  // opponent.
  this.syncService_.sendPlayerState();

  // Create the card data for the opponent.
  var cardData = null;
  var cardType = null;
  if (this.card_ instanceof yugi.model.MonsterCard) {
    cardData = yugi.game.data.MonsterData.createFromCard(this.card_);
    cardType = yugi.model.Card.Type.MONSTER;
  } else {
    cardData = yugi.game.data.SpellTrapData.createFromCard(
        /** @type {!yugi.model.SpellCard|!yugi.model.TrapCard} */ (this.card_));

    // Card type doesn't actually matter here - it only matters if it is monster
    // or not.  Ultimately, this is required by the card transfer message to
    // properly deserialize the card data object.  You can't make this part of
    // the card data itself because you still wouldn't know which object to
    // instantiate without first deserializing.
    cardType = yugi.model.Card.Type.SPELL;
  }

  // Create and send the message so the opponent can add it to their model and
  // send their state to synchronize everything.  The opponent will send the
  // appropriate chat message once everything has worked.
  var cardTransferMessage = new yugi.game.message.CardTransfer();
  cardTransferMessage.setCardData(cardData);
  cardTransferMessage.setCardType(cardType);
  cardTransferMessage.setDestination(this.destination_);
  this.channel_.send(cardTransferMessage);
};
