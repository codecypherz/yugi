/**
 * The UI for searching for cards.
 */

goog.provide('yugi.ui.search.SearchForm');

goog.require('goog.Timer');
goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.LabelInput');
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
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.ui.search.SearchForm');

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
   * @type {!goog.ui.LabelInput}
   * @private
   */
  this.nameLabelInput_ = new goog.ui.LabelInput('Search by name');
  this.addChild(this.nameLabelInput_);

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.searchButton_ = new goog.ui.Button(null);
  this.addChild(this.searchButton_);

  /**
   * @type {goog.events.KeyHandler}
   * @private
   */
  this.nameInputKeyHandler_ = null;
};
goog.inherits(yugi.ui.search.SearchForm, goog.ui.Component);


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
  var nameInputElement = this.getElementByFragment(
      yugi.ui.search.SearchForm.Id_.NAME_INPUT);

  // Decorate.
  if (!this.nameLabelInput_.wasDecorated()) {
    this.nameLabelInput_.decorate(nameInputElement);
  }
  if (!this.searchButton_.wasDecorated()) {
    this.searchButton_.decorate(this.getElementByFragment(
        yugi.ui.search.SearchForm.Id_.SEARCH_BUTTON));
  }

  // Set up the key handler for various inputs.
  this.nameInputKeyHandler_ = new goog.events.KeyHandler(nameInputElement);

  // Listen to various things.
  this.getHandler().listen(this.nameInputKeyHandler_,
      goog.events.KeyHandler.EventType.KEY,
      this.onNameInputKeyEvent_);
  this.getHandler().listen(this.searchButton_,
      goog.ui.Component.EventType.ACTION,
      this.startSearch_);

  this.getHandler().listen(this.search_,
      yugi.model.Search.EventType.RESULTS,
      this.onResults_);

  // Give the text field focus.
  goog.Timer.callOnce(
      goog.bind(this.nameLabelInput_.focusAndSelect, this.nameLabelInput_),
      0,
      this);
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
  var name = goog.string.trim(this.nameLabelInput_.getValue());
  if (name) {
    this.searchButton_.setEnabled(false);
    this.search_.byName(name);
  } else {
    this.notifier_.post('Please enter a name by which to search.');
    this.nameLabelInput_.focusAndSelect();
  }
};


/**
 * Enables the search button and gives the name input focus after the search
 * completes.
 * @private
 */
yugi.ui.search.SearchForm.prototype.onResults_ = function() {
  this.searchButton_.setEnabled(true);
  this.nameLabelInput_.focusAndSelect();
};
