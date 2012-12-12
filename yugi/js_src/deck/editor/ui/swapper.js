/**
 * Swaps UI components based on the current mode.
 */

goog.provide('yugi.deck.editor.ui.Swapper');

goog.require('goog.dom.classes');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.deck.editor.model.UiState');
goog.require('yugi.deck.editor.ui.Editor');
goog.require('yugi.deck.editor.ui.Search');



/**
 * Swaps UI components based on the current mode.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.deck.editor.ui.Swapper = function() {
  goog.base(this);

  /**
   * @type {!yugi.deck.editor.model.UiState}
   * @private
   */
  this.uiState_ = yugi.deck.editor.model.UiState.get();

  /**
   * @type {!yugi.deck.editor.ui.Editor}
   * @private
   */
  this.editor_ = new yugi.deck.editor.ui.Editor();

  /**
   * @type {!yugi.deck.editor.ui.Search}
   * @private
   */
  this.search_ = new yugi.deck.editor.ui.Search();

  this.addChild(this.editor_);
  this.addChild(this.search_);
};
goog.inherits(yugi.deck.editor.ui.Swapper, goog.ui.Component);


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.Swapper.Css_ = {
  SWAPPER: goog.getCssName('yugi-deck-editor-swapper')
};


/** @override */
yugi.deck.editor.ui.Swapper.prototype.createDom = function() {
  goog.base(this, 'createDom');
  goog.dom.classes.add(this.getElement(),
      yugi.deck.editor.ui.Swapper.Css_.SWAPPER);
};


/** @override */
yugi.deck.editor.ui.Swapper.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Render all components.
  this.editor_.render(this.getElement());
  this.search_.render(this.getElement());

  // Listen for when mode changes happen.
  this.getHandler().listen(this.uiState_,
      yugi.deck.editor.model.UiState.EventType.MODE_CHANGED,
      function(e) {
        this.setComponentForMode_(e.mode);
      });

  // Update the UI according to the current mode.
  this.setComponentForMode_(this.uiState_.getMode());
};


/**
 * Sets the appropriate component to visible according to the given mode.
 * @param {!yugi.deck.editor.model.UiState.Mode} mode The current mode.
 * @private
 */
yugi.deck.editor.ui.Swapper.prototype.setComponentForMode_ = function(mode) {

  // Show/hide the element based on the mode.
  goog.style.showElement(this.editor_.getElement(),
      mode == yugi.deck.editor.model.UiState.Mode.BROWSE);
  goog.style.showElement(this.search_.getElement(),
      mode == yugi.deck.editor.model.UiState.Mode.SEARCH);
};
