/**
 * The target data used when defining a drop target.
 */

goog.provide('yugi.game.ui.dragdrop.TargetData');



/**
 * The target data used when defining a drop target.
 * @param {!yugi.model.Area} area The target area.
 * @constructor
 */
yugi.game.ui.dragdrop.TargetData = function(area) {

  /**
   * @type {!yugi.model.Area}
   * @private
   */
  this.area_ = area;
};


/**
 * @return {!yugi.model.Area} The target's area.
 */
yugi.game.ui.dragdrop.TargetData.prototype.getArea = function() {
  return this.area_;
};
