/**
 * Factory for creating actions.
 */

goog.provide('yugi.game.action.Factory');

goog.require('yugi.game.action.CardTransfer');
goog.require('yugi.game.action.FieldToList');
goog.require('yugi.game.action.field.Activate');
goog.require('yugi.game.action.field.AddCounter');
goog.require('yugi.game.action.field.Set');
goog.require('yugi.game.message.CardTransfer');



/**
 * Creator of actions.
 * @constructor
 */
yugi.game.action.Factory = function() { };
goog.addSingletonGetter(yugi.game.action.Factory);


/**
 * Creates field actions for spell/trap cards.
 * @param {!yugi.model.Card} card The card.
 * @param {!yugi.game.model.Player} player The player to which the card belongs.
 * @param {number} zone The zone in which the card resides (ignored for field).
 * @return {!Array.<!yugi.model.Action>} The actions for the card.
 */
yugi.game.action.Factory.prototype.createFieldSpellTrapActions =
    function(card, player, zone) {

  var field = player.getField();
  var deck = player.getDeck().getMainCardList();
  var pName = player.getName();
  var cName = card.isFaceUp() ? card.getName() : 'a card';

  var set = new yugi.game.action.field.Set(card, player);
  var activate = new yugi.game.action.field.Activate(card, player);

  var sendToGraveyard = new yugi.game.action.FieldToList(
      'Send to graveyard', card, zone, player, field.getGraveyard(),
      pName + ' sent ' + card.getName() + ' to the graveyard', true);

  var banish = new yugi.game.action.FieldToList(
      'Banish', card, zone, player, field.getBanish(),
      pName + ' banished ' + card.getName(), true);

  var returnToHand = new yugi.game.action.FieldToList(
      'Return to hand', card, zone, player, player.getHand(),
      pName + ' brought ' + cName + ' to their hand');

  var returnToDeck = new yugi.game.action.FieldToList(
      'Shuffle into deck', card, zone, player, deck,
      pName + ' shuffled ' + cName + ' into their deck', false, true);

  var sendToTopOfDeck = new yugi.game.action.FieldToList(
      'Send to top of deck', card, zone, player, deck,
      pName + ' sent ' + cName + ' to the top of their deck', true);

  var sendToBottomOfDeck = new yugi.game.action.FieldToList(
      'Send to bottom of deck', card, zone, player, deck,
      pName + ' sent ' + cName + ' to the bottom of their deck', false);

  var addCounter = new yugi.game.action.field.AddCounter(card, player);

  var giveToOpponent = new yugi.game.action.CardTransfer(
      card, yugi.game.message.CardTransfer.Location.FIELD);

  var actions = [];

  // Action order depends if the card is face up or not.
  if (card.isFaceUp()) {
    actions.push(sendToGraveyard);
    actions.push(banish);
    actions.push(addCounter);
    actions.push(set);
  } else {
    actions.push(activate);
    actions.push(sendToGraveyard);
    actions.push(banish);
    actions.push(addCounter);
  }

  actions.push(returnToHand);
  actions.push(returnToDeck);
  actions.push(sendToTopOfDeck);
  actions.push(sendToBottomOfDeck);
  actions.push(giveToOpponent);

  return actions;
};
