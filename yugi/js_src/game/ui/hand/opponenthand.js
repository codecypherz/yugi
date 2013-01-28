/**
 * This UI for the opponent's hand.
 */

goog.provide('yugi.game.ui.hand.OpponentHand');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Attack');
goog.require('yugi.game.ui.hand.soy');
goog.require('yugi.model.CardList');
goog.require('yugi.model.InformationCard');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.Image');



/**
 * This UI for a opponent's hand.
 * @param {!yugi.game.model.player.Player} player The player.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.hand.OpponentHand = function(player) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.ui.hand.OpponentHand');

  /**
   * @type {!yugi.game.model.player.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

  /**
   * @type {!yugi.game.model.Attack}
   * @private
   */
  this.attack_ = yugi.game.model.Attack.get();

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.cardHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.cardHandler_);

  /**
   * @type {!yugi.model.InformationCard}
   * @private
   */
  this.opponentCard_ = new yugi.model.InformationCard(
      'This is your opponent\'s card.');
};
goog.inherits(yugi.game.ui.hand.OpponentHand, goog.ui.Component);


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.hand.OpponentHand.Id_ = {
  ATTACK_OVERLAY: 'attack-overlay',
  CARDS: 'cards'
};


/** @override */
yugi.game.ui.hand.OpponentHand.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.hand.soy.OPPONENT_HAND, {
        ids: this.makeIds(yugi.game.ui.hand.OpponentHand.Id_)
      }));
};


/** @override */
yugi.game.ui.hand.OpponentHand.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen for when cards in the hand change.
  this.getHandler().listen(this.player_.getHand(),
      yugi.model.CardList.EventType.CARDS_CHANGED,
      this.onCardsChanged_);

  // Listen for clicks on the overlay to attack the player.
  var attackOverlay = this.getElementByFragment(
      yugi.game.ui.hand.OpponentHand.Id_.ATTACK_OVERLAY);
  this.getHandler().listen(attackOverlay,
      goog.events.EventType.CLICK,
      this.onOverlayClicked_);

  // Show the overlay when declaring an attack.
  this.getHandler().listen(this.attack_,
      yugi.game.model.Attack.EventType.DECLARATION_STARTED,
      goog.bind(this.setOverlayVisible_, this, true));

  // Hide the overlay when the declaration is finished.
  this.getHandler().listen(this.attack_,
      [yugi.game.model.Attack.EventType.CANCELED,
       yugi.game.model.Attack.EventType.CARD_DECLARED,
       yugi.game.model.Attack.EventType.PLAYER_DECLARED],
      goog.bind(this.setOverlayVisible_, this, false));

  this.onCardsChanged_();
  this.setOverlayVisible_(false);
};


/**
 * Called when the cards in the hand have changed.
 * @private
 */
yugi.game.ui.hand.OpponentHand.prototype.onCardsChanged_ = function() {

  // Reset the rendering of the hand.
  var cardContainer = this.getElementByFragment(
      yugi.game.ui.hand.OpponentHand.Id_.CARDS);
  cardContainer.innerHTML = '';
  this.cardHandler_.removeAll();

  goog.array.forEach(this.player_.getHand().getCards(), function(card) {

    var cardElement = goog.soy.renderAsElement(
        yugi.game.ui.hand.soy.CARD, {
          imageSource: yugi.ui.Image.CARD_BACK
        });
    goog.dom.appendChild(cardContainer, cardElement);

    // Listen for card selection.
    this.cardHandler_.listen(cardElement,
        goog.events.EventType.CLICK,
        goog.bind(this.selection_.setSelected, this.selection_,
            this.opponentCard_, cardElement));
  }, this);
};


/**
 * Sets the visibility of the attack overlay.
 * @param {boolean} visible True if the element should be visible.
 * @private
 */
yugi.game.ui.hand.OpponentHand.prototype.setOverlayVisible_ = function(
    visible) {

  var attackOverlay = this.getElementByFragment(
      yugi.game.ui.hand.OpponentHand.Id_.ATTACK_OVERLAY);
  goog.style.showElement(attackOverlay, visible);
};


/**
 * Declares an attack on the player.
 * @private
 */
yugi.game.ui.hand.OpponentHand.prototype.onOverlayClicked_ = function() {
  var cards = this.getElementByFragment(
      yugi.game.ui.hand.OpponentHand.Id_.CARDS);
  this.attack_.declarePlayer(this.player_, goog.asserts.assert(cards));
};
