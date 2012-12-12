/**
 * The UI for searching for cards.
 */

goog.provide('yugi.ui.search.SearchForm');

goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.Search');
goog.require('yugi.ui.search.soy');



/**
 * The UI for searching for cards.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.ui.search.SearchForm = function() {
  goog.base(this);

  /**
   * @type {!yugi.model.Notifier}
   * @private
   */
  this.notifier_ = yugi.model.Notifier.get();

  /**
   * @type {!yugi.model.Search}
   * @private
   */
  this.search_ = yugi.model.Search.get();

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.searchButton_ = new goog.ui.Button(null);

  this.addChild(this.searchButton_);
};
goog.inherits(yugi.ui.search.SearchForm, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.ui.search.SearchForm.prototype.nameInput_;


/**
 * @type {goog.events.KeyHandler}
 * @private
 */
yugi.ui.search.SearchForm.prototype.nameInputKeyHandler_;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.ui.search.SearchForm.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.ui.search.SearchForm');


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.ui.search.SearchForm.Id_ = {
  NAME_INPUT: 'name-input',
  SEARCH_BUTTON: 'search-button'
};


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.ui.search.SearchForm.Css_ = {
  SEARCH_FORM: goog.getCssName('yugi-search-form')
};


/** @override */
yugi.ui.search.SearchForm.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.ui.search.soy.FORM, {
        ids: this.makeIds(yugi.ui.search.SearchForm.Id_)
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.ui.search.SearchForm.Css_.SEARCH_FORM);
};


/** @override */
yugi.ui.search.SearchForm.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Grab references to the elements.
  this.nameInput_ = this.getElementByFragment(
      yugi.ui.search.SearchForm.Id_.NAME_INPUT);

  // Decorate the buttons.
  if (!this.searchButton_.wasDecorated()) {
    this.searchButton_.decorate(this.getElementByFragment(
        yugi.ui.search.SearchForm.Id_.SEARCH_BUTTON));
  }

  // Set up the key handler for various inputs.
  this.nameInputKeyHandler_ = new goog.events.KeyHandler(this.nameInput_);

  // Listen to various things.
  this.getHandler().listen(this.nameInputKeyHandler_,
      goog.events.KeyHandler.EventType.KEY,
      this.onNameInputKeyEvent_);
  this.getHandler().listen(this.searchButton_,
      goog.ui.Component.EventType.ACTION,
      this.startSearch_);

  // Give the text field focus.
  this.nameInput_.focus();
};


/** @override */
yugi.ui.search.SearchForm.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');
  goog.dispose(this.nameInputKeyHandler_);
};


/**
 * Called when a key stroke happens in the name input field.
 * @param {!goog.events.KeyEvent} e The key event.
 * @private
 */
yugi.ui.search.SearchForm.prototype.onNameInputKeyEvent_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ENTER) {
    this.startSearch_();
  }
};


/**
 * Starts searching for cards.
 * @private
 */
yugi.ui.search.SearchForm.prototype.startSearch_ = function() {
  var name = goog.string.trim(this.nameInput_.value);
  if (name) {
    this.search_.byName(name);
  } else {
    this.notifier_.post('Please enter a name by which to search.');
    this.nameInput_.focus();
  }
};
