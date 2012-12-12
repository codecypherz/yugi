/**
 * This is the UI for rendering and interacting with a banish pile.
 */

goog.provide('yugi.game.ui.field.Banish');

goog.require('yugi.game.action.Browse');
goog.require('yugi.game.action.CardTransfer');
goog.require('yugi.game.action.ListToField');
goog.require('yugi.game.action.ListToList');
goog.require('yugi.game.message.CardTransfer');
goog.require('yugi.game.model.Browser');
goog.require('yugi.game.ui.field.Stack');
goog.require('yugi.model.CardList');
goog.require('yugi.model.MonsterCard');
goog.require('yugi.model.util');



/**
 * This is the UI for a banish pile.
 * @param {!yugi.game.model.Player} player The player.
 * @constructor
 * @extends {yugi.game.ui.field.Stack}
 */
yugi.game.ui.field.Banish = function(player) {
  goog.base(this, true, player.isOpponent());

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  this.setActions([]);
};
goog.inherits(yugi.game.ui.field.Banish, yugi.game.ui.field.Stack);


/** @override */
yugi.game.ui.field.Banish.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.player_.getField().getBanishedCards(),
      yugi.model.CardList.EventType.CARDS_CHANGED,
      this.onCardsChanged_);

  this.onCardsChanged_();
};


/** @override */
yugi.game.ui.field.Banish.prototype.getLabel = function() {
  return 'Banish';
};


/**
 * Called when cards have changed.
 * @private
 */
yugi.game.ui.field.Banish.prototype.onCardsChanged_ = function() {
  var banishedCards = this.player_.getField().getBanishedCards();

  var actions = [];

  actions.push(new yugi.game.action.Browse(
      yugi.game.model.Browser.Type.BANISHED_CARDS,
      banishedCards,
      goog.bind(this.createActions_, this),
      this.player_.isOpponent()));

  this.setActions(actions);
  this.setCards(banishedCards.getCards());
};


/**
 * Creates actions for the given card.
 * @param {!yugi.model.Card} card The card for which to create actions.
 * @return {!Array.<!yugi.model.Action>} The set of actions for the card.
 * @private
 */
yugi.game.ui.field.Banish.prototype.createActions_ = function(card) {

  // TODO Implement opponent actions.
  var player = this.player_;
  if (player.isOpponent()) {
    return [];
  }

  var actions = [];
  var banish = player.getField().getBanishedCards();
  var cName = card.getName();
  var pName = player.getName();

  // You can bring monster cards out to the field.
  if (card instanceof yugi.model.MonsterCard) {
    actions.push(new yugi.game.action.ListToField(
        'Special Summon in face-up attack',
        card, player, banish,
        pName + ' Special Summoned ' + cName +
        ' from the banish pile',
        undefined, yugi.model.MonsterCard.Position.FACE_UP_ATTACK));
    actions.push(new yugi.game.action.ListToField(
        'Special Summon in face-up defense',
        card, player, banish,
        pName + ' Special Summoned ' + cName +
        ' from the banish pile',
        undefined, yugi.model.MonsterCard.Position.FACE_UP_DEFENSE));
    actions.push(new yugi.game.action.ListToField(
        'Special Summon in face-down defense',
        card, player, banish,
        pName + ' Special Summoned ' + cName +
        ' from the banish pile',
        undefined, yugi.model.MonsterCard.Position.FACE_DOWN_DEFENSE));
  }

  // Extra deck cards can not enter the hand.
  if (!yugi.model.util.isExtraDeckCard(card)) {
    actions.push(new yugi.game.action.ListToList('Return to hand',
        card, banish, player.getHand(),
        pName + ' brought ' + cName + ' from the banish pile to their hand.'));
  }

  // You can send any card to the graveyard.
  actions.push(new yugi.game.action.ListToList('Send to graveyard',
      card, banish, player.getField().getGraveyard(),
      pName + ' sent ' + cName + ' from the banish pile to the graveyard.',
      true));

  // Return to deck.
  if (yugi.model.util.isExtraDeckCard(card)) {
    actions.push(new yugi.game.action.ListToList('Return to deck',
        card, banish, player.getDeck().getExtraCardList(),
        pName + ' returned ' + cName + ' to the deck.',
        true));
  } else {
    actions.push(new yugi.game.action.ListToList('Shuffle into deck',
        card, banish, player.getDeck().getMainCardList(),
        pName + ' returned ' + cName + ' to the deck and shuffled.',
        true, true));
  }

  actions.push(new yugi.game.action.CardTransfer(
      card, yugi.game.message.CardTransfer.Location.HAND));

  return actions;
};
