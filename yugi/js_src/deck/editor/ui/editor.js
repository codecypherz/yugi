/**
 * The UI for editing a deck.
 */

goog.provide('yugi.deck.editor.ui.Editor');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.deck.editor.model.Constructor');
goog.require('yugi.deck.editor.ui.DeckBrowser');
goog.require('yugi.deck.editor.ui.soy');
goog.require('yugi.model.Deck');



/**
 * The UI for editing a deck.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.deck.editor.ui.Editor = function() {
  goog.base(this);

  /**
   * @type {!yugi.deck.editor.model.Constructor}
   * @private
   */
  this.constructor_ = yugi.deck.editor.model.Constructor.get();

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.mainButton_ = new goog.ui.Button(null);
  this.addChild(this.mainButton_);

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.extraButton_ = new goog.ui.Button(null);
  this.addChild(this.extraButton_);

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.sideButton_ = new goog.ui.Button(null);
  this.addChild(this.sideButton_);

  /**
   * @type {!yugi.deck.editor.ui.DeckBrowser}
   * @private
   */
  this.mainBrowser_ = new yugi.deck.editor.ui.DeckBrowser(
      yugi.model.Deck.Type.MAIN);
  this.addChild(this.mainBrowser_);

  /**
   * @type {!yugi.deck.editor.ui.DeckBrowser}
   * @private
   */
  this.extraBrowser_ = new yugi.deck.editor.ui.DeckBrowser(
      yugi.model.Deck.Type.EXTRA);
  this.addChild(this.extraBrowser_);

  /**
   * @type {!yugi.deck.editor.ui.DeckBrowser}
   * @private
   */
  this.sideBrowser_ = new yugi.deck.editor.ui.DeckBrowser(
      yugi.model.Deck.Type.SIDE);
  this.addChild(this.sideBrowser_);

  /**
   * @type {!Array.<!yugi.deck.editor.ui.DeckBrowser>}
   * @private
   */
  this.browsers_ = new Array();

  this.browsers_.push(this.mainBrowser_);
  this.browsers_.push(this.extraBrowser_);
  this.browsers_.push(this.sideBrowser_);
};
goog.inherits(yugi.deck.editor.ui.Editor, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.deck.editor.ui.Editor.prototype.mainButtonElement_;


/**
 * @type {Element}
 * @private
 */
yugi.deck.editor.ui.Editor.prototype.extraButtonElement_;


/**
 * @type {Element}
 * @private
 */
yugi.deck.editor.ui.Editor.prototype.sideButtonElement_;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.ui.Editor.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.deck.editor.ui.Editor');


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.Editor.Id_ = {
  BROWSER_CONTAINER: 'browser-container',
  EXTRA_BUTTON: 'extra-button',
  MAIN_BUTTON: 'main-button',
  SIDE_BUTTON: 'side-button'
};


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.Editor.Css_ = {
  DECK_TAB_SELECTED: goog.getCssName('yugi-deck-tab-selected'),
  EDITOR: goog.getCssName('yugi-deck-editor')
};


/** @override */
yugi.deck.editor.ui.Editor.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.deck.editor.ui.soy.EDITOR, {
        ids: this.makeIds(yugi.deck.editor.ui.Editor.Id_)
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.deck.editor.ui.Editor.Css_.EDITOR);
};


/** @override */
yugi.deck.editor.ui.Editor.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Grab references to the button elements.
  this.mainButtonElement_ = this.getElementByFragment(
      yugi.deck.editor.ui.Editor.Id_.MAIN_BUTTON);
  this.extraButtonElement_ = this.getElementByFragment(
      yugi.deck.editor.ui.Editor.Id_.EXTRA_BUTTON);
  this.sideButtonElement_ = this.getElementByFragment(
      yugi.deck.editor.ui.Editor.Id_.SIDE_BUTTON);

  // Decorate the buttons.
  if (!this.mainButton_.wasDecorated()) {
    this.mainButton_.decorate(this.mainButtonElement_);
  }
  if (!this.extraButton_.wasDecorated()) {
    this.extraButton_.decorate(this.extraButtonElement_);
  }
  if (!this.sideButton_.wasDecorated()) {
    this.sideButton_.decorate(this.sideButtonElement_);
  }

  // Render the deck browsers.
  goog.array.forEach(this.browsers_, function(browser) {
    browser.render(this.getElementByFragment(
        yugi.deck.editor.ui.Editor.Id_.BROWSER_CONTAINER));
  }, this);

  // Listen to the tabs to swap what's visible.
  this.getHandler().listen(this.mainButton_,
      goog.ui.Component.EventType.ACTION,
      goog.bind(this.setDeckType_, this, this.mainBrowser_.getDeckType()));
  this.getHandler().listen(this.extraButton_,
      goog.ui.Component.EventType.ACTION,
      goog.bind(this.setDeckType_, this, this.extraBrowser_.getDeckType()));
  this.getHandler().listen(this.sideButton_,
      goog.ui.Component.EventType.ACTION,
      goog.bind(this.setDeckType_, this, this.sideBrowser_.getDeckType()));

  // Listen for when to refresh the UI.
  this.getHandler().listen(this.constructor_,
      yugi.deck.editor.model.Constructor.EventType.CARDS_CHANGED,
      this.onCardsChanged_);

  // Sync the state of things right now.
  this.setDeckType_(yugi.model.Deck.Type.MAIN);
  this.setButtonText_(this.constructor_.getDeck());
};


/**
 * Sets the appropriate browser visible and hides the rest.
 * @param {!yugi.model.Deck.Type} deckType The type that should be visible.
 * @private
 */
yugi.deck.editor.ui.Editor.prototype.setDeckType_ = function(deckType) {
  this.logger.info('Setting deck type to ' + deckType);

  this.constructor_.setDeckType(deckType);

  // Adjust visibility.
  goog.array.forEach(this.browsers_, function(browser) {
    goog.style.showElement(browser.getElement(),
        deckType == browser.getDeckType());
  });

  // Adjust selected tab CSS.
  goog.dom.classes.enable(this.mainButtonElement_,
      yugi.deck.editor.ui.Editor.Css_.DECK_TAB_SELECTED,
      deckType == yugi.model.Deck.Type.MAIN);
  goog.dom.classes.enable(this.extraButtonElement_,
      yugi.deck.editor.ui.Editor.Css_.DECK_TAB_SELECTED,
      deckType == yugi.model.Deck.Type.EXTRA);
  goog.dom.classes.enable(this.sideButtonElement_,
      yugi.deck.editor.ui.Editor.Css_.DECK_TAB_SELECTED,
      deckType == yugi.model.Deck.Type.SIDE);
};


/**
 * Updates the UI to reflect the change in cards.
 * @param {!yugi.deck.editor.model.Constructor.CardsChangedEvent} e The event.
 * @private
 */
yugi.deck.editor.ui.Editor.prototype.onCardsChanged_ = function(e) {
  this.setButtonText_(e.deck);
};


/**
 * Updates the button text according to the given deck.
 * @param {!yugi.model.Deck} deck The deck on which to base the button text.
 * @private
 */
yugi.deck.editor.ui.Editor.prototype.setButtonText_ = function(deck) {
  this.mainButtonElement_.innerHTML =
      'Main (' + deck.getMainCards().length + ')';
  this.extraButtonElement_.innerHTML =
      'Extra (' + deck.getExtraCards().length + ')';
  this.sideButtonElement_.innerHTML =
      'Side (' + deck.getSideCards().length + ')';
};
