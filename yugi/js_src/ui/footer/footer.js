/**
 * The footer widget.
 */

goog.provide('yugi.ui.footer.Footer');

goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.ui.footer.soy');



/**
 * The footer widget.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.ui.footer.Footer = function() {
  goog.base(this);
};
goog.inherits(yugi.ui.footer.Footer, goog.ui.Component);


/** @override */
yugi.ui.footer.Footer.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(yugi.ui.footer.soy.HTML));
};
