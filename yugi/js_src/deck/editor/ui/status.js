/**
 * The UI for displaying the deck constructor status.
 */

goog.provide('yugi.deck.editor.ui.Status');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.ui.Component');
goog.require('yugi.deck.editor.model.Constructor');



/**
 * The UI for displaying the deck constructor status.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.deck.editor.ui.Status = function() {
  goog.base(this);

  /**
   * @type {!yugi.deck.editor.model.Constructor}
   * @private
   */
  this.constructor_ = yugi.deck.editor.model.Constructor.get();
};
goog.inherits(yugi.deck.editor.ui.Status, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.deck.editor.ui.Status.prototype.statusElement_ = null;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.ui.Status.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.deck.editor.ui.Status');


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.Status.Css_ = {
  ERROR: goog.getCssName('yugi-error'),
  ROOT: goog.getCssName('yugi-deck-status')
};


/** @override */
yugi.deck.editor.ui.Status.prototype.createDom = function() {
  this.setElementInternal(goog.dom.createDom(goog.dom.TagName.DIV,
      yugi.deck.editor.ui.Status.Css_.ROOT));
};


/** @override */
yugi.deck.editor.ui.Status.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.statusElement_ = this.getElement();

  this.getHandler().listen(this.constructor_,
      yugi.deck.editor.model.Constructor.EventType.STATUS_CHANGED,
      this.onStatusChanged_);

  // Sync up the UI with the current status.
  this.onStatusChanged_();
};


/**
 * Updates the UI to reflect the current status of the constructor.
 * @private
 */
yugi.deck.editor.ui.Status.prototype.onStatusChanged_ = function() {
  var status = this.constructor_.getStatus();
  this.statusElement_.innerHTML = '(' + status + ')';
  goog.dom.classes.enable(this.statusElement_,
      yugi.deck.editor.ui.Status.Css_.ERROR,
      status == yugi.deck.editor.model.Constructor.Status.FAILED_TO_SAVE);
};
