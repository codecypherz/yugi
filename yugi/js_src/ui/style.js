/**
 * Utility functions related to style.
 */

goog.provide('yugi.ui.style');

goog.require('goog.math.Coordinate');
goog.require('goog.style');


/**
 * Sets the transform style for the element in a cross-browser way.
 * @param {!Element} el The element to modify.
 * @param {string} transform The new transform string.
 */
yugi.ui.style.setTransform = function(el, transform) {
  el.style.webkitTransform = transform;
  el.style.mozTransform = transform;
  el.style.msTransform = transform;
  el.style.oTransform = transform;
  el.style.transform = transform;
};


/**
 * Figures out the center of the element in coordinates relative to the top
 * left of the page (not the viewport) rounded to the nearest pixel.
 * @param {!Element} el The element for which to compute the center.
 * @return {!goog.math.Coordinate} The center of the element.
 */
yugi.ui.style.computeCenter = function(el) {
  var pageOffset = goog.style.getPageOffset(el);
  var size = goog.style.getSize(el);
  return new goog.math.Coordinate(
      pageOffset.x + (size.width / 2),
      pageOffset.y + (size.height / 2));
};
