/**
 * This is part of the UI for declaring an attack.
 */

goog.provide('yugi.game.ui.attack.Mask');

goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Attack');
goog.require('yugi.game.ui.attack.soy');



/**
 * This is part of the UI for declaring an attack.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.attack.Mask = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Attack}
   * @private
   */
  this.attack_ = yugi.game.model.Attack.get();
};
goog.inherits(yugi.game.ui.attack.Mask, goog.ui.Component);


/** @override */
yugi.game.ui.attack.Mask.prototype.createDom = function() {
  this.setElementInternal(
      goog.soy.renderAsElement(yugi.game.ui.attack.soy.MASK));
};


/** @override */
yugi.game.ui.attack.Mask.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen for clicks on the mask to cancel the attack.
  this.getHandler().listen(this.getElement(),
      goog.events.EventType.CLICK,
      goog.bind(this.attack_.cancel, this.attack_));

  // Listen for ESC key presses to cancel the attack.
  // TODO

  // Show the mask when a declaration has started.
  this.getHandler().listen(this.attack_,
      yugi.game.model.Attack.EventType.DECLARATION_STARTED,
      goog.bind(this.setVisible_, this, true));

  // Hide the mask if the attack is canceled or declared.
  this.getHandler().listen(this.attack_,
      [yugi.game.model.Attack.EventType.CANCELED,
       yugi.game.model.Attack.EventType.CARD_DECLARED,
       yugi.game.model.Attack.EventType.PLAYER_DECLARED],
      goog.bind(this.setVisible_, this, false));

  // Hide the mask by default.
  this.setVisible_(false);
};


/**
 * Alters the visibility of the mask.
 * @param {boolean} visible True if the mask should be visible.
 * @private
 */
yugi.game.ui.attack.Mask.prototype.setVisible_ = function(visible) {
  goog.style.showElement(this.getElement(), visible);
};
