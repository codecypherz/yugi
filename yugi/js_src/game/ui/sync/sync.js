/**
 * This is the UI for when this client is synchronizing.
 */

goog.provide('yugi.game.ui.sync.Sync');

goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Synchronization');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.sync.soy');



/**
 * This is the UI for when this client is synchronizing.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.sync.Sync = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Synchronization}
   * @private
   */
  this.synchronization_ = yugi.game.model.Synchronization.get();
};
goog.inherits(yugi.game.ui.sync.Sync, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.game.ui.sync.Sync.prototype.text_ = null;


/**
 * DOM IDs used by this widget.
 * @enum {string}
 * @private
 */
yugi.game.ui.sync.Sync.Id_ = {
  TEXT: 'text'
};


/** @override */
yugi.game.ui.sync.Sync.prototype.createDom = function() {

  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.sync.soy.HTML, {
        ids: this.makeIds(yugi.game.ui.sync.Sync.Id_)
      }));
  goog.dom.classes.add(
      this.getElement(), yugi.game.ui.Css.MODE_SWAPPER_CONTAINER);
};


/** @override */
yugi.game.ui.sync.Sync.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.text_ = this.getElementByFragment(yugi.game.ui.sync.Sync.Id_.TEXT);

  this.getHandler().listen(this.synchronization_,
      yugi.game.model.Synchronization.EventType.WAITING,
      this.onWaiting_);
  this.getHandler().listen(this.synchronization_,
      yugi.game.model.Synchronization.EventType.STARTED,
      this.onStarted_);
  this.getHandler().listen(this.synchronization_,
      yugi.game.model.Synchronization.EventType.FINISHED,
      this.onFinished_);
};


/**
 * Called when we are waiting on synchronization data.
 * @private
 */
yugi.game.ui.sync.Sync.prototype.onWaiting_ = function() {
  this.text_.innerHTML = 'Waiting for synchronization data...';
};


/**
 * Called when we have started receiving synchronization data.
 * @private
 */
yugi.game.ui.sync.Sync.prototype.onStarted_ = function() {
  this.text_.innerHTML = 'Starting to receive the data...';
};


/**
 * Called when we have finished receiving synchronization data.
 * @private
 */
yugi.game.ui.sync.Sync.prototype.onFinished_ = function() {
  this.text_.innerHTML = 'Finished synchronizing.';
};
