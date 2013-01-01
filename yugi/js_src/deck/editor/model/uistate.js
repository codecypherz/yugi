/**
 * Model for the state of the deck editor UI.
 */

goog.provide('yugi.deck.editor.model.UiState');
goog.provide('yugi.deck.editor.model.UiState.EventType');
goog.provide('yugi.deck.editor.model.UiState.Mode');
goog.provide('yugi.deck.editor.model.UiState.ModeChangedEvent');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');



/**
 * Model for the state of the deck editor UI.
 * @param {boolean} readOnly True if the screen is in read only mode.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.deck.editor.model.UiState = function(readOnly) {
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this.readOnly_ = readOnly;

  /**
   * @type {!yugi.deck.editor.model.UiState.Mode}
   * @private
   */
  this.mode_ = yugi.deck.editor.model.UiState.Mode.BROWSE;
};
goog.inherits(yugi.deck.editor.model.UiState, goog.events.EventTarget);


/**
 * The set of modes the UI can be in.
 * @enum {string}
 */
yugi.deck.editor.model.UiState.Mode = {
  BROWSE: 'browse',
  SEARCH: 'search'
};


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.model.UiState.prototype.logger =
    goog.debug.Logger.getLogger('yugi.deck.editor.model.UiState');


/**
 * @type {!yugi.deck.editor.model.UiState}
 * @private
 */
yugi.deck.editor.model.UiState.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.deck.editor.model.UiState.EventType = {
  MODE_CHANGED: goog.events.getUniqueId('mode-changed')
};


/**
 * Registers an instance of the model.
 * @param {boolean} readOnly True if the screen is in read only mode.
 * @return {!yugi.deck.editor.model.UiState} The registered instance.
 */
yugi.deck.editor.model.UiState.register = function(readOnly) {
  yugi.deck.editor.model.UiState.instance_ =
      new yugi.deck.editor.model.UiState(readOnly);
  return yugi.deck.editor.model.UiState.get();
};


/**
 * @return {!yugi.deck.editor.model.UiState} The model for UI state.
 */
yugi.deck.editor.model.UiState.get = function() {
  return yugi.deck.editor.model.UiState.instance_;
};


/**
 * @return {boolean} True if the editor is in read only mode.
 */
yugi.deck.editor.model.UiState.prototype.isReadOnly = function() {
  return this.readOnly_;
};


/**
 * @return {!yugi.deck.editor.model.UiState.Mode} The current mode.
 */
yugi.deck.editor.model.UiState.prototype.getMode = function() {
  return this.mode_;
};


/**
 * @param {!yugi.deck.editor.model.UiState.Mode} mode The mode to set.
 */
yugi.deck.editor.model.UiState.prototype.setMode = function(mode) {
  if (this.mode_ == mode) {
    return;
  }

  this.mode_ = mode;
  this.logger.info('The mode changed to ' + mode);
  this.dispatchEvent(new yugi.deck.editor.model.UiState.ModeChangedEvent(mode));
};



/**
 * The event that gets dispatched when the mode changes.
 * @param {!yugi.deck.editor.model.UiState.Mode} mode The new mode.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.deck.editor.model.UiState.ModeChangedEvent = function(mode) {
  goog.base(this, yugi.deck.editor.model.UiState.EventType.MODE_CHANGED);

  /**
   * @type {!yugi.deck.editor.model.UiState.Mode}
   */
  this.mode = mode;
};
goog.inherits(yugi.deck.editor.model.UiState.ModeChangedEvent,
    goog.events.Event);
