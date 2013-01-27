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
goog.require('yugi.model.SpellCard');
goog.require('yugi.model.TrapCard');



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

  if (this.game_.getPlayer().getField().isZone(targetArea)) {
    this.onZoneDrop_(sourceCard, targetArea);
  } else if (targetArea == yugi.model.Area.PLAYER_FIELD) {
    this.onFieldCardDrop_(sourceCard, targetArea);
  } else {
    // The rest of the target areas are lists of cards.
    this.onListDrop_(sourceCard, targetArea);
  }

  // Send the sync data for the player.
  this.syncService_.sendPlayerState();
};


/**
 * Handles dropping the card in a valid zone.
 * @param {!yugi.model.Card} sourceCard The source card.
 * @param {!yugi.model.Area} targetArea The target area.
 * @private
 */
yugi.game.ui.dragdrop.DropHandler.prototype.onZoneDrop_ = function(
    sourceCard, targetArea) {

  // Do nothing unless the target zone is empty.
  var field = this.game_.getPlayer().getField();
  if (!field.isZoneEmpty(targetArea)) {
    return;
  }

  // First, remove the card.
  this.removeCard_(sourceCard);

  // Do card transfer if one of the opponent monster zones was the target.
  if (yugi.model.Area.OPP_MONSTER_ZONES.contains(targetArea)) {
    var cardTransferMessage = new yugi.game.message.CardTransfer();
    cardTransferMessage.setCardData(
        yugi.game.data.CardData.createFromCard(sourceCard));
    cardTransferMessage.setDestination(
        yugi.game.message.CardTransfer.Location.FIELD);
    this.channel_.send(cardTransferMessage);
    return;
  }

  // Don't change the card's flipped or rotated value if it's from the field.
  if (!field.isZone(sourceCard.getLocation().getArea())) {
    if (yugi.model.Area.SPELL_TRAP_ZONES.contains(targetArea) &&
        sourceCard instanceof yugi.model.TrapCard) {
      // Trap cards played in a spell/trap zone are set by default.
      sourceCard.setFaceUp(false);
    } else {
      // Everything else is face up by default.
      sourceCard.setFaceUp(true);
    }

    // No card should be rotated by default.
    sourceCard.setRotated(false);
  }

  // Set the new card.
  field.setCardInZone(targetArea, sourceCard);
};


/**
 * Handles dropping the card in the field card area.
 * @param {!yugi.model.Card} sourceCard The source card.
 * @param {!yugi.model.Area} targetArea The target area.
 * @private
 */
yugi.game.ui.dragdrop.DropHandler.prototype.onFieldCardDrop_ = function(
    sourceCard, targetArea) {

  // Only a field card can be dropped onto the field card area.
  if (!(sourceCard instanceof yugi.model.SpellCard) ||
      sourceCard.getSpellType() != yugi.model.SpellCard.Type.FIELD) {
    return;
  }

  // Remove the card.
  this.removeCard_(sourceCard);

  // Send the old field card to the graveyard if there was already one there.
  var field = this.game_.getPlayer().getField();
  var existingFieldCard = field.getFieldCard();
  if (existingFieldCard) {
    field.getGraveyard().add(existingFieldCard, true);
  }

  // The new field card is placed face up and not rotated.
  sourceCard.setFaceUp(true);
  sourceCard.setRotated(false);
  field.setFieldCard(sourceCard);
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
  this.removeCard_(sourceCard);

  // No list has rotated cards.
  sourceCard.setRotated(false);

  // Most lists are face up.
  sourceCard.setFaceUp(true);

  var player = this.game_.getPlayer();
  var field = player.getField();

  switch (targetArea) {
    case yugi.model.Area.PLAYER_GRAVEYARD:
      field.getGraveyard().add(sourceCard, true);
      break;
    case yugi.model.Area.PLAYER_HAND:
      player.getHand().add(sourceCard);
      break;
    case yugi.model.Area.PLAYER_BANISH:
      field.getBanish().add(sourceCard, true);
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


/**
 * Removes the card from it's current location as part of the move.
 * @param {!yugi.model.Card} card The card to remove.
 * @private
 */
yugi.game.ui.dragdrop.DropHandler.prototype.removeCard_ = function(card) {

  var area = card.getLocation().getArea();
  var game = this.game_;
  var player = game.getPlayer();
  var field = player.getField();

  if (field.isZone(area)) {
    field.removeCardInZone(area);
  } else {
    switch (card.getLocation().getArea()) {
      case yugi.model.Area.PLAYER_BANISH:
        field.getBanish().remove(card);
        break;
      case yugi.model.Area.PLAYER_DECK:
        player.getDeck().getMainCardList().remove(card);
        break;
      case yugi.model.Area.PLAYER_EXTRA_DECK:
        player.getDeck().getExtraCardList().remove(card);
        break;
      case yugi.model.Area.PLAYER_FIELD:
        field.setFieldCard(null);
        break;
      case yugi.model.Area.PLAYER_GRAVEYARD:
        field.getGraveyard().remove(card);
        break;
      case yugi.model.Area.PLAYER_HAND:
        player.getHand().remove(card);
        break;
    }
  }
};
