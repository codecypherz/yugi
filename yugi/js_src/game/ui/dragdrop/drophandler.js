/**
 * Handles card drop events.
 */

goog.provide('yugi.game.ui.dragdrop.DropHandler');

goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('yugi.game.data.CardData');
goog.require('yugi.game.message.CardTransfer');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.net.Channel');
goog.require('yugi.game.service.Sync');
goog.require('yugi.game.ui.dragdrop.DragDrop');
goog.require('yugi.model.Area');



/**
 * Handles card drop events.
 * @constructor
 * @extends {goog.events.EventHandler}
 */
yugi.game.ui.dragdrop.DropHandler = function() {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger(
      'yugi.game.ui.dragdrop.DropHandler');

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

  /**
   * @type {!yugi.game.ui.dragdrop.DragDrop}
   * @private
   */
  this.dragDrop_ = yugi.game.ui.dragdrop.DragDrop.get();

  this.listen(this.dragDrop_,
      yugi.game.ui.dragdrop.DragDrop.EventType.DROP,
      this.onDrop_);
};
goog.inherits(yugi.game.ui.dragdrop.DropHandler, goog.events.EventHandler);


/**
 * Called when a card is dropped somewhere.
 * @param {!yugi.game.ui.dragdrop.DragDrop.DropEvent} e The drop event.
 * @private
 */
yugi.game.ui.dragdrop.DropHandler.prototype.onDrop_ = function(e) {

  // Convenient aliases.
  var sourceCard = e.sourceCard;
  var targetArea = e.targetData.getArea();

  // Don't do anything if dragged to the same location.
  if (sourceCard.getLocation().getArea() == targetArea) {
    return;
  }

  // TODO Figure out the chat messaging.  This should be done by making an
  // actual graveyard model instead of just using a card list.  Then this new
  // graveyard model can do all the correct chat things including always adding
  // to the top or bottom etc.  Do this for all the card stacks and stuff.

  if (this.game_.getPlayer().getField().hasArea(targetArea)) {
    this.onFieldDrop_(sourceCard, targetArea);
  } else if (yugi.model.Area.OPP_MONSTER_ZONES.contains(targetArea)) {
    this.onOppMonsterDrop_(sourceCard, targetArea);
  } else {
    // The rest of the target areas are lists of cards.
    this.onListDrop_(sourceCard, targetArea);
  }

  // Send the sync data for the player.
  this.syncService_.sendPlayerState();
};


/**
 * Handles dropping the card on the field.
 * @param {!yugi.model.Card} sourceCard The source card.
 * @param {!yugi.model.Area} targetArea The target area.
 * @private
 */
yugi.game.ui.dragdrop.DropHandler.prototype.onFieldDrop_ = function(
    sourceCard, targetArea) {

  // Do nothing unless the target zone is empty.
  var field = this.game_.getPlayer().getField();
  if (!field.isEmpty(targetArea)) {
    return;
  }

  // If it is the field card area, then make sure only field cards go there.
  if (yugi.model.Area.PLAYER_FIELD == targetArea &&
      !field.isFieldCard(sourceCard)) {
    return;
  }

  // First, remove the card.
  this.game_.getPlayer().removeCard(sourceCard);

  // Don't change the card's face up or rotated value if it's from the field.
  if (!field.hasArea(sourceCard.getLocation().getArea())) {
    sourceCard.setFaceUp(true);
    sourceCard.setRotated(false);
  }

  // Set the new card.
  field.setCard(targetArea, sourceCard);
};


/**
 * Handles dropping the card on the opponent's monster zone.
 * @param {!yugi.model.Card} sourceCard The source card.
 * @param {!yugi.model.Area} targetArea The target area.
 * @private
 */
yugi.game.ui.dragdrop.DropHandler.prototype.onOppMonsterDrop_ = function(
    sourceCard, targetArea) {

  // Make sure the opponent has room for the card.
  if (!this.game_.getOpponent().getField().isEmpty(targetArea)) {
    return;
  }

  // First, remove the card.
  this.game_.getPlayer().removeCard(sourceCard);

  // Transfer the card to the opponent.
  var cardTransferMessage = new yugi.game.message.CardTransfer();
  cardTransferMessage.setCardData(
      yugi.game.data.CardData.createFromCard(sourceCard));
  cardTransferMessage.setDestination(
      yugi.game.message.CardTransfer.Location.FIELD);
  this.channel_.send(cardTransferMessage);
};


/**
 * Handles dropping the card onto a list or stack.
 * @param {!yugi.model.Card} sourceCard The source card.
 * @param {!yugi.model.Area} targetArea The target area.
 * @private
 */
yugi.game.ui.dragdrop.DropHandler.prototype.onListDrop_ = function(
    sourceCard, targetArea) {

  // Remove the card since no list has a limit.
  this.game_.getPlayer().removeCard(sourceCard);

  // No list has rotated cards.
  sourceCard.setRotated(false);

  // Most lists are face up.
  sourceCard.setFaceUp(true);

  var player = this.game_.getPlayer();
  var field = player.getField();

  switch (targetArea) {
    case yugi.model.Area.PLAYER_GRAVEYARD:
      player.getGraveyard().add(sourceCard, true);
      break;
    case yugi.model.Area.PLAYER_HAND:
      player.getHand().add(sourceCard);
      break;
    case yugi.model.Area.PLAYER_BANISH:
      player.getBanish().add(sourceCard, true);
      break;
    case yugi.model.Area.PLAYER_DECK:
      sourceCard.setFaceUp(false);
      var mainCards = player.getDeck().getMainCardList();
      mainCards.add(sourceCard);
      mainCards.shuffle();
      break;
    case yugi.model.Area.PLAYER_EXTRA_DECK:
      sourceCard.setFaceUp(false);
      var extraCards = player.getDeck().getExtraCardList();
      extraCards.add(sourceCard);
      break;
  }
};
