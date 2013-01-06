/**
 * The UI for browsing a particular sub deck.
 */

goog.provide('yugi.deck.editor.ui.DeckBrowser');

goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.deck.editor.model.Constructor');
goog.require('yugi.deck.editor.model.CoverAction');
goog.require('yugi.deck.editor.model.RemoveAction');
goog.require('yugi.deck.editor.model.UiState');
goog.require('yugi.deck.editor.ui.soy');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.browser.CardBrowser');



/**
 * The UI for browsing a particular sub deck.
 * @param {!yugi.model.Deck.Type} deckType The type of deck being browsed.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.deck.editor.ui.DeckBrowser = function(deckType) {
  goog.base(this);

  /**
   * @type {!yugi.model.Deck.Type}
   * @private
   */
  this.deckType_ = deckType;

  /**
   * @type {!yugi.deck.editor.model.Constructor}
   * @private
   */
  this.constructor_ = yugi.deck.editor.model.Constructor.get();

  /**
   * @type {!yugi.deck.editor.model.UiState}
   * @private
   */
  this.uiState_ = yugi.deck.editor.model.UiState.get();

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

  /**
   * @type {!yugi.ui.browser.CardBrowser}
   * @private
   */
  this.cardBrowser_ = new yugi.ui.browser.CardBrowser(
      goog.bind(this.createActions_, this));
  this.addChild(this.cardBrowser_);

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.addCardsButton_ = new goog.ui.Button(null);
  this.addChild(this.addCardsButton_);
};
goog.inherits(yugi.deck.editor.ui.DeckBrowser, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.ui.DeckBrowser.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.deck.editor.ui.DeckBrowser');


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.DeckBrowser.Id_ = {
  ADD_CARDS_BUTTON: 'add-cards-button',
  CARD_BROWSER: 'card-browser'
};


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.DeckBrowser.Css_ = {
  DECK_BROWSER: goog.getCssName('yugi-deck-browser')
};


/** @override */
yugi.deck.editor.ui.DeckBrowser.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.deck.editor.ui.soy.DECK_BROWSER, {
        ids: this.makeIds(yugi.deck.editor.ui.DeckBrowser.Id_),
        readOnly: this.uiState_.isReadOnly()
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.deck.editor.ui.DeckBrowser.Css_.DECK_BROWSER);
};


/** @override */
yugi.deck.editor.ui.DeckBrowser.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Render the add button if not in read only mode.
  if (!this.uiState_.isReadOnly()) {
    if (!this.addCardsButton_.wasDecorated()) {
      this.addCardsButton_.decorate(this.getElementByFragment(
          yugi.deck.editor.ui.DeckBrowser.Id_.ADD_CARDS_BUTTON));
    }
    // Listen for when to switch modes.
    this.getHandler().listen(this.addCardsButton_,
        goog.ui.Component.EventType.ACTION,
        this.switchToSearchMode_);
  }

  // Render the card browser.
  this.cardBrowser_.render(this.getElementByFragment(
      yugi.deck.editor.ui.DeckBrowser.Id_.CARD_BROWSER));

  // Listen for when to refresh the UI.
  this.getHandler().listen(this.constructor_,
      yugi.deck.editor.model.Constructor.EventType.CARDS_CHANGED,
      this.updateCards_);

  this.updateCards_();
};


/**
 * @return {!yugi.model.Deck.Type} The type of deck this browser is browsing.
 */
yugi.deck.editor.ui.DeckBrowser.prototype.getDeckType = function() {
  return this.deckType_;
};


/**
 * Switches the UI state to search mode.
 * @private
 */
yugi.deck.editor.ui.DeckBrowser.prototype.switchToSearchMode_ = function() {
  this.selection_.deselect();
  this.uiState_.setMode(yugi.deck.editor.model.UiState.Mode.SEARCH);
};


/**
 * Updates the UI to reflect the change in cards.
 * @private
 */
yugi.deck.editor.ui.DeckBrowser.prototype.updateCards_ = function() {
  var deck = this.constructor_.getDeck();
  this.cardBrowser_.browse(deck.getCards(this.deckType_));
};


/**
 * Creates actions for the given card.
 * @param {!yugi.model.Card} card The card being acted on.
 * @return {!Array.<!yugi.model.Action>} The list of actions for the card.
 * @private
 */
yugi.deck.editor.ui.DeckBrowser.prototype.createActions_ = function(card) {
  var actions = new Array();
  // Don't create actions in read only mode.
  if (!this.uiState_.isReadOnly()) {
    actions.push(new yugi.deck.editor.model.CoverAction(card,
        this.constructor_));
    actions.push(new yugi.deck.editor.model.RemoveAction(card,
        this.constructor_));
  }
  return actions;
};
