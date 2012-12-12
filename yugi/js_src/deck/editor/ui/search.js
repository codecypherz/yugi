/**
 * The UI for searching for cards.
 */

goog.provide('yugi.deck.editor.ui.Search');

goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.deck.editor.model.Constructor');
goog.require('yugi.deck.editor.model.UiState');
goog.require('yugi.deck.editor.ui.soy');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.search.SearchForm');
goog.require('yugi.ui.search.SearchResults');



/**
 * The UI for searching for cards.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.deck.editor.ui.Search = function() {
  goog.base(this);

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
   * @type {!yugi.ui.search.SearchForm}
   * @private
   */
  this.searchForm_ = new yugi.ui.search.SearchForm();

  /**
   * @type {!yugi.ui.search.SearchResults}
   * @private
   */
  this.searchResults_ = new yugi.ui.search.SearchResults('Add');

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.backButton_ = new goog.ui.Button(null);

  this.addChild(this.searchForm_);
  this.addChild(this.searchResults_);
  this.addChild(this.backButton_);
};
goog.inherits(yugi.deck.editor.ui.Search, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.ui.Search.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.deck.editor.ui.Search');


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.Search.Id_ = {
  BACK_BUTTON: 'back-button',
  FORM: 'form',
  RESULTS: 'results'
};


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.Search.Css_ = {
  SEARCH: goog.getCssName('yugi-deck-editor-search')
};


/** @override */
yugi.deck.editor.ui.Search.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.deck.editor.ui.soy.SEARCH, {
        ids: this.makeIds(yugi.deck.editor.ui.Search.Id_)
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.deck.editor.ui.Search.Css_.SEARCH);
};


/** @override */
yugi.deck.editor.ui.Search.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.searchForm_.render(this.getElementByFragment(
      yugi.deck.editor.ui.Search.Id_.FORM));
  this.searchResults_.render(this.getElementByFragment(
      yugi.deck.editor.ui.Search.Id_.RESULTS));

  if (!this.backButton_.wasDecorated()) {
    this.backButton_.decorate(this.getElementByFragment(
        yugi.deck.editor.ui.Search.Id_.BACK_BUTTON));
  }

  this.getHandler().listen(this.backButton_,
      goog.ui.Component.EventType.ACTION,
      this.switchToBrowseMode_);
  this.getHandler().listen(this.searchResults_,
      yugi.ui.search.SearchResults.EventType.CARD_ACTION,
      this.onCardAction_);
};


/**
 * Switches the UI state to browse mode.
 * @private
 */
yugi.deck.editor.ui.Search.prototype.switchToBrowseMode_ = function() {
  this.selection_.deselect();
  this.uiState_.setMode(yugi.deck.editor.model.UiState.Mode.BROWSE);
};


/**
 * Called when a card is acted upon.
 * @param {!yugi.ui.search.SearchResults.CardActionEvent} e The action event.
 * @private
 */
yugi.deck.editor.ui.Search.prototype.onCardAction_ = function(e) {
  this.constructor_.addCard(e.card);
};
