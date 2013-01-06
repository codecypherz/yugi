/**
 * The UI for editing a deck name.
 */

goog.provide('yugi.deck.editor.ui.Name');

goog.require('goog.Timer');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.string');
goog.require('goog.ui.Component');
goog.require('goog.ui.LabelInput');
goog.require('yugi.deck.editor.model.Constructor');
goog.require('yugi.deck.editor.model.UiState');
goog.require('yugi.model.Deck');



/**
 * The UI for editing a deck name.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.deck.editor.ui.Name = function() {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.deck.editor.ui.Name');

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
   * @type {!goog.ui.LabelInput}
   * @private
   */
  this.nameLabelInput_ = new goog.ui.LabelInput('Enter deck name');
  this.addChild(this.nameLabelInput_);

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.deckHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.deckHandler_);

  /**
   * The last valid deck name.  Used to restore the deck name if the user
   * deletes the name and the input field loses focus.
   * @type {string}
   * @private
   */
  this.lastDeckName_ = '';
};
goog.inherits(yugi.deck.editor.ui.Name, goog.ui.Component);


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.Name.Css_ = {
  ROOT: goog.getCssName('yugi-deck-name')
};


/** @override */
yugi.deck.editor.ui.Name.prototype.createDom = function() {
  this.setElementInternal(goog.dom.createDom(
      goog.dom.TagName.DIV,
      yugi.deck.editor.ui.Name.Css_.ROOT));

  if (!this.uiState_.isReadOnly()) {
    this.nameLabelInput_.render(this.getElement());
  }
};


/** @override */
yugi.deck.editor.ui.Name.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Don't listen to clicks if in read only mode.
  if (!this.uiState_.isReadOnly()) {
    this.getHandler().listen(this.nameLabelInput_.getElement(),
        goog.events.EventType.BLUR,
        this.onNameBlur_);
  }

  // Listen for when the deck changes so the deck listener can be updated.
  this.getHandler().listen(this.constructor_,
      yugi.deck.editor.model.Constructor.EventType.DECK_CHANGED,
      this.onDeckChanged_);

  // Sync up the UI with the current deck.
  this.onDeckChanged_();
};


/**
 * Removes listeners to the previous deck and attaches new listeners to the new
 * deck.
 * @private
 */
yugi.deck.editor.ui.Name.prototype.onDeckChanged_ = function() {
  this.deckHandler_.removeAll();

  // Listen for when the name changes on the new deck.
  this.deckHandler_.listen(this.constructor_.getDeck(),
      yugi.model.Deck.EventType.NAME_CHANGED,
      this.onNameChanged_);

  // Synchronize the UI with the new name value.
  this.onNameChanged_();
};


/**
 * Updates the UI to reflect the current name value of the deck.
 * @private
 */
yugi.deck.editor.ui.Name.prototype.onNameChanged_ = function() {
  this.lastDeckName_ = this.constructor_.getDeck().getName();
  if (this.uiState_.isReadOnly()) {
    goog.dom.setTextContent(this.getElement(), this.lastDeckName_);
  } else {
    this.nameLabelInput_.setValue(this.lastDeckName_);
    if (this.lastDeckName_ == yugi.deck.editor.model.Constructor.DEFAULT_NAME) {
      goog.Timer.callOnce(
          goog.bind(this.nameLabelInput_.focusAndSelect, this.nameLabelInput_),
          0,
          this);
    }
  }
};


/**
 * Saves the deck name.
 * @private
 */
yugi.deck.editor.ui.Name.prototype.onNameBlur_ = function() {
  var newDeckName = this.nameLabelInput_.getValue();
  if (goog.string.isEmptySafe(newDeckName)) {
    this.nameLabelInput_.setValue(this.lastDeckName_);
  } else {
    this.constructor_.setName(newDeckName);
  }
};
