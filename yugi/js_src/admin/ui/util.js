/**
 * The set of utilities for administration UI.
 */

goog.provide('yugi.admin.ui.util');

goog.require('goog.dom.classes');


/**
 * Marks an element as invalid.
 * @param {Element} element The element to mark invalid.
 * @param {boolean} invalid True if the element is invalid, false otherwise.
 */
yugi.admin.ui.util.markInvalid = function(element, invalid) {
  goog.dom.classes.enable(element, goog.getCssName('yugi-admin-invalid'),
      invalid);
};
