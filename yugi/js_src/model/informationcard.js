/**
 * The model for a card that is merely informational.
 */

goog.provide('yugi.model.InformationCard');

goog.require('goog.Disposable');
goog.require('yugi.model.Selectable');



/**
 * The model for a card that is merely informational.
 * @param {string=} opt_text The optional informational text.
 * @implements {yugi.model.Selectable}
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.model.InformationCard = function(opt_text) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.text_ = opt_text || '';
};
goog.inherits(yugi.model.InformationCard, goog.Disposable);


/**
 * @return {string} The informational text.
 */
yugi.model.InformationCard.prototype.getText = function() {
  return this.text_;
};


/**
 * @param {string} text The informational text.
 */
yugi.model.InformationCard.prototype.setText = function(text) {
  this.text_ = text;
};
