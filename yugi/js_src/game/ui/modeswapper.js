/**
 * This knows which UI components should be swapped in when the mode changes.
 */

goog.provide('yugi.game.ui.ModeSwapper');

goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.game.ui.State');
goog.require('yugi.game.ui.browser.BrowserContainer');
goog.require('yugi.game.ui.deck.Select');
goog.require('yugi.game.ui.field.Field');
goog.require('yugi.game.ui.sync.Sync');
goog.require('yugi.game.ui.waiting.Waiting');



/**
 * This knows which UI components should be swapped in when the mode changes.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.ModeSwapper = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.ui.State}
   * @private
   */
  this.uiState_ = yugi.game.ui.State.get();

  /**
   * @type {!yugi.game.ui.deck.Select}
   * @private
   */
  this.deckSelect_ = new yugi.game.ui.deck.Select();

  /**
   * @type {!yugi.game.ui.waiting.Waiting}
   * @private
   */
  this.waiting_ = new yugi.game.ui.waiting.Waiting();

  /**
   * @type {!yugi.game.ui.field.Field}
   * @private
   */
  this.field_ = new yugi.game.ui.field.Field();

  /**
   * @type {!yugi.game.ui.sync.Sync}
   * @private
   */
  this.sync_ = new yugi.game.ui.sync.Sync();

  /**
   * @type {!yugi.game.ui.browser.BrowserContainer}
   * @private
   */
  this.browserContainer_ = new yugi.game.ui.browser.BrowserContainer();

  // Add all the child components.
  this.addChild(this.deckSelect_);
  this.addChild(this.waiting_);
  this.addChild(this.field_);
  this.addChild(this.sync_);
  this.addChild(this.browserContainer_);
};
goog.inherits(yugi.game.ui.ModeSwapper, goog.ui.Component);


/** @override */
yugi.game.ui.ModeSwapper.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var element = this.getElement();

  // Render everything.
  this.deckSelect_.render(element);
  this.waiting_.render(element);
  this.field_.render(element);
  this.sync_.render(element);
  this.browserContainer_.render(element);

  // Listen for mode changes.
  this.getHandler().listen(this.uiState_,
      yugi.game.ui.State.EventType.MODE_CHANGED,
      this.onModeChange_);

  // Initialize which component is shown.
  this.showComponentForMode_(this.uiState_.getMode());
};


/**
 * Called when the mode changes.
 * @param {!yugi.game.ui.State.ModeChangedEvent} e The mode change event.
 * @private
 */
yugi.game.ui.ModeSwapper.prototype.onModeChange_ = function(e) {
  this.showComponentForMode_(e.mode);
};


/**
 * Shows the correct component for the mode and hides all the others.
 * @param {!yugi.game.ui.State.Mode} mode The mode for which to show a
 *     component.
 * @private
 */
yugi.game.ui.ModeSwapper.prototype.showComponentForMode_ = function(mode) {

  // Get out early if not in the document.
  if (!this.isInDocument()) {
    return;
  }

  goog.style.showElement(this.deckSelect_.getElement(),
      mode == yugi.game.ui.State.Mode.DECK_SELECT);
  goog.style.showElement(this.waiting_.getElement(),
      mode == yugi.game.ui.State.Mode.WAITING_FOR_OPPONENT_JOIN);
  goog.style.showElement(this.field_.getElement(),
      mode == yugi.game.ui.State.Mode.FIELD);
  goog.style.showElement(this.sync_.getElement(),
      mode == yugi.game.ui.State.Mode.SYNCHRONIZING);
  goog.style.showElement(this.browserContainer_.getElement(),
      mode == yugi.game.ui.State.Mode.BROWSING);
};
