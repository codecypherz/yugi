/**
 * A UI component that sits on top of a component and will launch a menu when
 * clicked.
 */

goog.provide('yugi.ui.menu.Menu');

goog.require('goog.debug.Logger');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.ui.menu.ActionContainer');
goog.require('yugi.ui.menu.soy');



/**
 * A UI component that sits on top of a component and will launch a menu when
 * clicked.
 * @param {!Array.<!yugi.model.Action>} actions The set of actions the menu
 *     should render.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.ui.menu.Menu = function(actions) {
  goog.base(this);

  /**
   * @type {!yugi.ui.menu.ActionContainer}
   * @private
   */
  this.actionContainer_ = new yugi.ui.menu.ActionContainer(actions);
  this.registerDisposable(this.actionContainer_);

  /**
   * The value from the right of the parent to render the menu.
   * @type {number|string}
   * @private
   */
  this.right_ = yugi.ui.menu.Menu.DEFAULT_RIGHT;

  /**
   * The value from the top of the parent to render the menu.
   * @type {number|string}
   * @private
   */
  this.top_ = yugi.ui.menu.Menu.DEFAULT_TOP;
};
goog.inherits(yugi.ui.menu.Menu, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.ui.menu.Menu.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.ui.menu.Menu');


/**
 * @type {Element}
 * @private
 */
yugi.ui.menu.Menu.prototype.icon_;


/**
 * The DOM IDs used by this component.
 * @enum {string}
 * @private
 */
yugi.ui.menu.Menu.Id_ = {
  ICON: 'icon'
};


/**
 * The default x-axis offset from the right side of the parent, in pixels.
 * @type {number}
 * @const
 */
yugi.ui.menu.Menu.DEFAULT_RIGHT = 5;


/**
 * The default y-axis offset from the top side of the parent, in pixels.
 * @type {number}
 * @const
 */
yugi.ui.menu.Menu.DEFAULT_TOP = 5;


/**
 * @param {Element} element The element on which to render.
 * @param {number|string} right The x-offset.
 * @param {number|string} top The y-offset.
 */
yugi.ui.menu.Menu.prototype.renderWithOffset = function(element, right, top) {
  this.right_ = right;
  this.top_ = top;
  this.render(element);
};


/** @override */
yugi.ui.menu.Menu.prototype.createDom = function() {
  var element = goog.soy.renderAsElement(
      yugi.ui.menu.soy.HTML, {
        ids: this.makeIds(yugi.ui.menu.Menu.Id_)
      });
  var r = goog.isString(this.right_) ? this.right_ : this.right_ + 'px';
  var t = goog.isString(this.top_) ? this.top_ : this.top_ + 'px';
  element.style.right = r;
  element.style.top = t;
  this.setElementInternal(element);
};


/** @override */
yugi.ui.menu.Menu.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.actionContainer_.render();

  this.icon_ = this.getElementByFragment(
      yugi.ui.menu.Menu.Id_.ICON);

  this.getHandler().listen(this.icon_,
      goog.events.EventType.CLICK,
      this.onIconClick_);
};


/**
 * Called when the menu icon is clicked.
 * @param {!goog.events.Event} e The click event.
 * @private
 */
yugi.ui.menu.Menu.prototype.onIconClick_ = function(e) {
  this.actionContainer_.show(e);
};
