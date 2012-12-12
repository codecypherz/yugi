/**
 * This UI for the opponent's hand.
 */

goog.provide('yugi.game.ui.hand.OpponentHand');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.game.ui.hand.soy');
goog.require('yugi.model.CardList');
goog.require('yugi.model.InformationCard');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.Image');



/**
 * This UI for a opponent's hand.
 * @param {!yugi.game.model.Player} player The player.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.hand.OpponentHand = function(player) {
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
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.ui.hand.OpponentHand.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.ui.hand.OpponentHand');


/** @override */
yugi.game.ui.hand.OpponentHand.prototype.enterDocument = function() {
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
yugi.game.ui.hand.OpponentHand.prototype.onCardsChanged_ = function() {

  // Reset the rendering of the hand.
  var element = this.getElement();
  element.innerHTML = '';
  this.cardHandler_.removeAll();

  goog.array.forEach(this.player_.getHand().getCards(), function(card) {

    var cardElement = goog.soy.renderAsElement(
        yugi.game.ui.hand.soy.CARD, {
          imageSource: yugi.ui.Image.CARD_BACK
        });
    goog.dom.appendChild(element, cardElement);

    // Listen for card selection.
    this.cardHandler_.listen(cardElement,
        goog.events.EventType.CLICK,
        goog.bind(this.selection_.setSelected, this.selection_,
            this.opponentCard_, cardElement));
  }, this);
};
