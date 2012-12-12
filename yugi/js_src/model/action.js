/**
 * The model for an action that can be taken by the user.
 */

goog.provide('yugi.model.Action');

goog.require('goog.Disposable');



/**
 * The model for an action that can be taken by the user.
 * @param {string} text The text presented to the user.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.model.Action = function(text) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.text_ = text;
};
goog.inherits(yugi.model.Action, goog.Disposable);


/**
 * @return {string} The action's text.
 */
yugi.model.Action.prototype.getText = function() {
  return this.text_;
};


/**
 * This is the actual action taken.  It is called when the user chooses this
 * action.
 */
yugi.model.Action.prototype.fire = goog.abstractMethod;
