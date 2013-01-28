/**
 * This UI for a player's hand.
 */

goog.provide('yugi.game.ui.hand.PlayerHand');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.game.action.CardTransfer');
goog.require('yugi.game.action.Chat');
goog.require('yugi.game.action.ListToField');
goog.require('yugi.game.action.ListToList');
goog.require('yugi.game.action.Shuffle');
goog.require('yugi.game.message.CardTransfer');
goog.require('yugi.game.ui');
goog.require('yugi.game.ui.dragdrop.DragDrop');
goog.require('yugi.game.ui.hand.soy');
goog.require('yugi.model.CardList');
goog.require('yugi.model.MonsterCard');
goog.require('yugi.model.Selection');
goog.require('yugi.model.SpellCard');
goog.require('yugi.ui.menu.Menu');



/**
 * This UI for a player's hand.
 * @param {!yugi.game.model.Player} player The player.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.hand.PlayerHand = function(player) {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

  /**
   * @type {!yugi.game.ui.dragdrop.DragDrop}
   * @private
   */
  this.dragDropService_ = yugi.game.ui.dragdrop.DragDrop.get();

  /**
   * @type {!Array.<!yugi.ui.menu.Menu>}
   * @private
   */
  this.menus_ = new Array();

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.cardHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.cardHandler_);
};
goog.inherits(yugi.game.ui.hand.PlayerHand, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.ui.hand.PlayerHand.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.ui.hand.PlayerHand');


/** @override */
yugi.game.ui.hand.PlayerHand.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen for when cards in the hand change.
  this.getHandler().listen(this.player_.getHand(),
      yugi.model.CardList.EventType.CARDS_CHANGED,
      this.onCardsChanged_);

  this.onCardsChanged_();
};


/**
 * Called when the cards in the hand have changed.
 * @private
 */
yugi.game.ui.hand.PlayerHand.prototype.onCardsChanged_ = function() {

  var element = this.getElement();

  // Clean up drag sources.
  goog.array.forEach(goog.dom.getChildren(element), function(child) {
    this.dragDropService_.removeSource(element);
  }, this);

  // Reset the rendering of the hand.
  element.innerHTML = '';
  this.cardHandler_.removeAll();
  this.disposeMenus_();

  var player = this.player_;
  var hand = player.getHand();
  var pName = player.getName();

  goog.array.forEach(hand.getCards(), function(card) {

    var cardElement = goog.soy.renderAsElement(
        yugi.game.ui.hand.soy.CARD, {
          imageSource: card.getImageSource(yugi.game.ui.MAX_CARD_HEIGHT)
        });
    goog.dom.appendChild(element, cardElement);

    this.dragDropService_.addSource(cardElement, card);

    var cName = card.getName();

    // Attach menu actions to the card.
    var actions = [];
    actions.push(new yugi.game.action.ListToField('Set',
        card, player, hand,
        pName + ' set a card',
        false, true));

    // Attach monster-specific menu actions.
    if (card instanceof yugi.model.MonsterCard) {
      actions.push(new yugi.game.action.ListToField('Summon',
          card, player, hand,
          pName + ' summoned ' + cName + ' from their hand',
          true, false));
    } else if (card instanceof yugi.model.SpellCard) {
      actions.push(new yugi.game.action.ListToField('Activate',
          card, player, hand,
          pName + ' activated ' + cName,
          true, false));
    }

    // Graveyard/Banish
    actions.push(new yugi.game.action.ListToList('Send to graveyard',
        card, hand, player.getGraveyard(),
        pName + ' sent ' + cName + ' from their hand to the graveyard.', true));
    actions.push(new yugi.game.action.ListToList('Banish',
        card, hand, player.getBanish(),
        pName + ' banished ' + cName + ' from their hand.', true));

    // Deck
    actions.push(new yugi.game.action.ListToList('Shuffle into deck',
        card, hand, player.getDeck().getMainCardList(),
        pName + ' returned a card from their hand to their deck and shuffled.',
        false, true));
    actions.push(new yugi.game.action.ListToList('Send to top of deck',
        card, hand, player.getDeck().getMainCardList(),
        pName + ' sent a card from their hand to the top of their deck.',
        true));
    actions.push(new yugi.game.action.ListToList('Send to bottom of deck',
        card, hand, player.getDeck().getMainCardList(),
        pName + ' sent a card from their hand to the bottom of their deck.',
        false));

    // Other
    actions.push(new yugi.game.action.Shuffle('Shuffle hand',
        hand, player, pName + ' shuffled their hand.'));
    actions.push(new yugi.game.action.Chat('Reveal to opponent',
        pName + ' revealed ' + cName + ' in their hand.'));
    actions.push(new yugi.game.action.CardTransfer(
        card, yugi.game.message.CardTransfer.Location.HAND));

    var menu = new yugi.ui.menu.Menu(actions);
    menu.render(cardElement);
    this.menus_.push(menu);

    // Listen for card selection.
    this.cardHandler_.listen(cardElement,
        goog.events.EventType.CLICK,
        goog.bind(this.selection_.setSelected, this.selection_,
            card, cardElement));
  }, this);
};


/**
 * Disposes all card menus.
 * @private
 */
yugi.game.ui.hand.PlayerHand.prototype.disposeMenus_ = function() {
  goog.array.forEach(this.menus_, function(menu) {
    goog.dispose(menu);
  });
  this.menus_ = new Array();
};


/** @override */
yugi.game.ui.hand.PlayerHand.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.disposeMenus_();
};
