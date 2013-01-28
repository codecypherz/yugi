/**
 * This is the UI for rendering and interacting with a deck in the game.
 */

goog.provide('yugi.game.ui.field.Deck');

goog.require('goog.events.EventHandler');
goog.require('yugi.game.action.Browse');
goog.require('yugi.game.action.ListToField');
goog.require('yugi.game.action.ListToList');
goog.require('yugi.game.action.Shuffle');
goog.require('yugi.game.model.Browser');
goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.player.Player');
goog.require('yugi.game.ui.field.Stack');
goog.require('yugi.model.CardList');
goog.require('yugi.model.MonsterCard');



/**
 * This is the UI for a deck in play.
 * @param {!yugi.game.model.player.Player} player The player from which to get
 *     the deck.
 * @constructor
 * @extends {yugi.game.ui.field.Stack}
 */
yugi.game.ui.field.Deck = function(player) {
  var infoText = player.isOpponent() ?
      'This is your opponent\'s deck.' : 'This is your deck.';
  goog.base(this, false, player.isOpponent(), infoText);

  /**
   * @type {!yugi.game.model.player.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = yugi.game.model.Chat.get();

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.deckListener_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.deckListener_);

  // No actions for initialization - need actual cards first.
  this.setActions([]);
};
goog.inherits(yugi.game.ui.field.Deck, yugi.game.ui.field.Stack);


/** @override */
yugi.game.ui.field.Deck.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen to when the player's deck reference changes.
  this.getHandler().listen(this.player_,
      [yugi.game.model.player.Player.EventType.DECK_CHANGED,
       yugi.game.model.player.Player.EventType.DECK_LOADED],
      this.onDeckChanged_);

  this.onDeckChanged_();
};


/** @override */
yugi.game.ui.field.Deck.prototype.getLabel = function() {
  return 'Deck';
};


/**
 * Starts listening to the new deck.
 * @private
 */
yugi.game.ui.field.Deck.prototype.onDeckChanged_ = function() {

  // Remove all listeners to the old deck reference.
  this.deckListener_.removeAll();

  // Re-attach deck listeners to the new deck.
  this.deckListener_.listen(this.player_.getDeck().getMainCardList(),
      yugi.model.CardList.EventType.CARDS_CHANGED,
      this.onCardsChanged_);

  // The cards changed since the deck changed, so run through that.
  this.onCardsChanged_();
};


/**
 * Called when cards have changed.
 * @private
 */
yugi.game.ui.field.Deck.prototype.onCardsChanged_ = function() {
  var player = this.player_;
  var mainCardList = player.getDeck().getMainCardList();
  var mainCards = mainCardList.getCards();

  var actions = [];

  // There are no opponent actions for the deck.
  if (!player.isOpponent() && mainCards.length > 0) {
    var card = mainCards[0];
    var pName = player.getName();
    var cName = card.getName();

    actions.push(new yugi.game.action.ListToList('Draw',
        card, mainCardList, player.getHand(),
        pName + ' drew a card.'));
    actions.push(new yugi.game.action.ListToList('Draw and reveal',
        card, mainCardList, player.getHand(),
        pName + ' drew ' + cName + '.'));

    actions.push(new yugi.game.action.ListToList('Discard',
        card, mainCardList, player.getGraveyard(),
        pName + ' discarded ' + cName + ' from the top of their deck.', true));

    actions.push(new yugi.game.action.Shuffle('Shuffle',
        mainCardList, player, player.getName() + ' shuffled their deck.'));

    actions.push(new yugi.game.action.Browse(
        yugi.game.model.Browser.Type.DECK,
        mainCardList,
        goog.bind(this.createActions_, this),
        player.isOpponent(),
        goog.bind(this.shuffle_, this)));
  }

  this.setActions(actions);
  this.setCards(mainCardList.getCards());
};


/**
 * Creates actions for the given card.
 * @param {!yugi.model.Card} card The card for which to create actions.
 * @return {!Array.<!yugi.model.Action>} The set of actions for the card.
 * @private
 */
yugi.game.ui.field.Deck.prototype.createActions_ = function(card) {

  // There are no opponent actions.
  var player = this.player_;
  if (player.isOpponent()) {
    return [];
  }

  var actions = [];
  var mainCards = player.getDeck().getMainCardList();
  var cName = card.getName();
  var pName = player.getName();

  // You can bring monster cards out to the field.
  if (card instanceof yugi.model.MonsterCard) {
    actions.push(new yugi.game.action.ListToField(
        'Special Summon in face-up attack',
        card, player, mainCards,
        pName + ' Special Summoned ' + cName + ' from their deck',
        true, false));
    actions.push(new yugi.game.action.ListToField(
        'Special Summon in face-up defense',
        card, player, mainCards,
        pName + ' Special Summoned ' + cName + ' from their deck',
        true, true));
    actions.push(new yugi.game.action.ListToField(
        'Special Summon in face-down defense',
        card, player, mainCards,
        pName + ' Special Summoned ' + cName + ' from their deck',
        false, true));
  }

  actions.push(new yugi.game.action.ListToList('Bring to hand',
      card, mainCards, player.getHand(),
      pName + ' brought ' + cName +
          ' from their deck to their hand.'));

  // Graveyard/Banish
  actions.push(new yugi.game.action.ListToList('Send to graveyard',
      card, mainCards, player.getGraveyard(),
      pName + ' sent ' + cName +
          ' to the graveyard from their deck.', true));
  actions.push(new yugi.game.action.ListToList('Banish',
      card, mainCards, player.getBanish(),
      pName + ' banished ' + cName + ' from their deck.', true));

  return actions;
};


/**
 * Shuffles the deck and tells everyone about it.
 * @private
 */
yugi.game.ui.field.Deck.prototype.shuffle_ = function() {
  this.player_.getDeck().getMainCardList().shuffle();
  this.chat_.sendSystemRemote(this.player_.getName() + ' shuffled their deck.');
};
