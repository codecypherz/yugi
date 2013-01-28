/**
 * This is the UI for rendering and interacting with the extra deck in the game.
 */

goog.provide('yugi.game.ui.field.ExtraDeck');

goog.require('goog.events.EventHandler');
goog.require('yugi.game.action.Browse');
goog.require('yugi.game.action.ListToField');
goog.require('yugi.game.action.ListToList');
goog.require('yugi.game.model.Browser');
goog.require('yugi.game.model.Player');
goog.require('yugi.game.ui.field.Stack');
goog.require('yugi.model.CardList');
goog.require('yugi.model.MonsterCard');



/**
 * This is the UI for rendering and interacting with the extra deck in the game.
 * @param {!yugi.game.model.Player} player The player from which to get the
 *     deck.
 * @constructor
 * @extends {yugi.game.ui.field.Stack}
 */
yugi.game.ui.field.ExtraDeck = function(player) {
  var infoText = player.isOpponent() ?
      'This is your opponent\'s extra deck.' : 'This is your extra deck.';

  goog.base(this, false, player.isOpponent(), infoText);

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.deckListener_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.deckListener_);

  this.setActions([]);
};
goog.inherits(yugi.game.ui.field.ExtraDeck, yugi.game.ui.field.Stack);


/** @override */
yugi.game.ui.field.ExtraDeck.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen to changes in the deck overall.
  this.getHandler().listen(this.player_,
      [yugi.game.model.Player.EventType.DECK_CHANGED,
       yugi.game.model.Player.EventType.DECK_LOADED],
      this.onDeckChanged_);

  this.onDeckChanged_();
};


/** @override */
yugi.game.ui.field.ExtraDeck.prototype.getLabel = function() {
  return 'Extra';
};


/**
 * Starts listening to the new deck.
 * @private
 */
yugi.game.ui.field.ExtraDeck.prototype.onDeckChanged_ = function() {

  // Remove all listeners to the old deck reference.
  this.deckListener_.removeAll();

  // Re-attach deck listeners to the new deck.
  this.getHandler().listen(this.player_.getDeck().getExtraCardList(),
      yugi.model.CardList.EventType.CARDS_CHANGED,
      this.onCardsChanged_);

  // The cards changed since the deck changed, so run through that.
  this.onCardsChanged_();
};


/**
 * Called when cards have changed.
 * @private
 */
yugi.game.ui.field.ExtraDeck.prototype.onCardsChanged_ = function() {
  var extraCardList = this.player_.getDeck().getExtraCardList();

  var actions = [];

  // There are no opponent actions for the extra deck.
  if (!this.player_.isOpponent()) {

    actions.push(new yugi.game.action.Browse(
        yugi.game.model.Browser.Type.EXTRA_DECK,
        extraCardList,
        goog.bind(this.createActions_, this),
        this.player_.isOpponent()));
  }

  this.setActions(actions);
  this.setCards(extraCardList.getCards());
};


/**
 * Creates actions for the given card.
 * @param {!yugi.model.Card} card The card for which to create actions.
 * @return {!Array.<!yugi.model.Action>} The set of actions for the card.
 * @private
 */
yugi.game.ui.field.ExtraDeck.prototype.createActions_ = function(card) {

  // There are no opponent actions.
  var player = this.player_;
  if (player.isOpponent()) {
    return [];
  }

  var actions = [];
  var extraCards = player.getDeck().getExtraCardList();
  var cName = card.getName();
  var pName = player.getName();

  // You can bring monster cards out to the field.
  if (card instanceof yugi.model.MonsterCard) {
    actions.push(new yugi.game.action.ListToField(
        'Summon in face-up attack',
        card, player, extraCards,
        pName + ' summoned ' + cName + ' from their extra deck',
        true, false));
    actions.push(new yugi.game.action.ListToField(
        'Summon in face-up defense',
        card, player, extraCards,
        pName + ' summoned ' + cName + ' from their extra deck',
        true, true));
    actions.push(new yugi.game.action.ListToField(
        'Summon in face-down defense',
        card, player, extraCards,
        pName + ' summoned ' + cName + ' from their extra deck',
        false, true));
  }

  actions.push(new yugi.game.action.ListToList('Send to graveyard',
      card, extraCards, player.getGraveyard(),
      pName + ' sent ' + cName + ' from their extra deck to the graveyard.',
      true));
  actions.push(new yugi.game.action.ListToList('Banish',
      card, extraCards, player.getBanish(),
      pName + ' banished ' + cName + ' from their extra deck.',
      true));

  return actions;
};
