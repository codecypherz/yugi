/**
 * The UI for displaying a single card counter.
 */

goog.provide('yugi.game.ui.counters.Counter');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('yugi.game.action.field.DecrementCounter');
goog.require('yugi.game.action.field.IncrementCounter');
goog.require('yugi.game.action.field.RemoveCounter');
goog.require('yugi.model.Counter');
goog.require('yugi.ui.menu.ActionContainer');



/**
 * The UI for displaying a single card counter.
 * @param {!yugi.model.Card} card The card with the counters.
 * @param {!yugi.game.model.Player} player The player model.
 * @param {!yugi.model.Counter} counterModel The model for the counter.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.counters.Counter = function(card, player, counterModel) {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.model.Counter}
   * @private
   */
  this.counterModel_ = counterModel;

  var actions = [];
  actions.push(new yugi.game.action.field.IncrementCounter(
      card, player, counterModel));
  actions.push(new yugi.game.action.field.DecrementCounter(
      card, player, counterModel));
  actions.push(new yugi.game.action.field.RemoveCounter(
      card, player, counterModel));

  /**
   * @type {!yugi.ui.menu.ActionContainer}
   * @private
   */
  this.actionsContainer_ = new yugi.ui.menu.ActionContainer(actions);
  this.registerDisposable(this.actionsContainer_);
};
goog.inherits(yugi.game.ui.counters.Counter, goog.ui.Component);


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.counters.Counter.Css_ = {
  ROOT: goog.getCssName('yugi-counter')
};


/** @override */
yugi.game.ui.counters.Counter.prototype.createDom = function() {
  this.setElementInternal(goog.dom.createDom(goog.dom.TagName.DIV,
      yugi.game.ui.counters.Counter.Css_.ROOT));

  this.actionsContainer_.render();
};


/** @override */
yugi.game.ui.counters.Counter.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.getElement(),
      goog.events.EventType.CLICK,
      this.showActions_);

  this.getHandler().listen(this.counterModel_,
      yugi.model.Counter.EventType.COUNT_CHANGED,
      this.updateCount_);

  // Sync up the UI with the current count.
  this.updateCount_();
};


/**
 * Updates the UI to reflect the current count.
 * @private
 */
yugi.game.ui.counters.Counter.prototype.updateCount_ = function() {
  this.getElement().innerHTML = this.counterModel_.getCount();
};


/**
 * Shows counter actions.
 * @param {!goog.events.Event} e The click event.
 * @private
 */
yugi.game.ui.counters.Counter.prototype.showActions_ = function(e) {
  // Don't give actions to the opponent cards.
  if (!this.player_.isOpponent()) {
    this.actionsContainer_.show(e);
  }
};
