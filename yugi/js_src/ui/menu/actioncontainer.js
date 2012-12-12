/**
 * A UI component that allows actions to be attached to arbitrary UI elements.
 */

goog.provide('yugi.ui.menu.ActionContainer');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.ui.menu.soy');



/**
 * A UI component that allows actions to be attached to arbitrary UI elements.
 * @param {!Array.<!yugi.model.Action>} actions The set of actions the menu
 *     should render.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.ui.menu.ActionContainer = function(actions) {
  goog.base(this);

  /**
   * @type {!Array.<!yugi.model.Action>}
   * @private
   */
  this.actions_ = actions;

  // Clean up all actions on dispose.
  goog.array.forEach(actions, function(action) {
    this.registerDisposable(action);
  }, this);
};
goog.inherits(yugi.ui.menu.ActionContainer, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.ui.menu.ActionContainer.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.ui.menu.ActionContainer');


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.ui.menu.ActionContainer.Css_ = {
  ACTIONS: goog.getCssName('yugi-menu-actions')
};


/** @override */
yugi.ui.menu.ActionContainer.prototype.createDom = function() {
  var element = goog.dom.createElement(goog.dom.TagName.DIV);
  goog.dom.classes.add(element, yugi.ui.menu.ActionContainer.Css_.ACTIONS);
  element.tabIndex = 0;
  this.setElementInternal(element);
};


/** @override */
yugi.ui.menu.ActionContainer.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Render all the actions.
  goog.array.forEach(this.actions_, function(action) {
    var actionElement = goog.soy.renderAsElement(yugi.ui.menu.soy.ACTION, {
      text: action.getText()
    });
    goog.dom.append(/** @type {!Node} */ (this.getElement()), actionElement);

    // Listen for when the action is fired.
    this.getHandler().listen(actionElement,
        goog.events.EventType.CLICK,
        goog.bind(this.onActionClick_, this, action));

  }, this);

  this.getHandler().listen(this.getElement(),
      goog.events.EventType.BLUR,
      this.hide_);

  // Hide the actions to begin with.
  this.hide_();
};


/**
 * Shows the action container at the given position.
 * @param {!goog.events.Event} clickEvent The click event.
 */
yugi.ui.menu.ActionContainer.prototype.show = function(clickEvent) {
  var element = this.getElement();

  // Stop default actions (like an <a> tag being followed).
  clickEvent.preventDefault();
  clickEvent.stopPropagation();

  // Figure out where to position the actions.
  var size = goog.style.getSize(element);
  var viewportSize = goog.dom.getViewportSize();
  var scrollPos = goog.dom.getDocumentScroll();
  var x = clickEvent.clientX;
  var y = clickEvent.clientY;

  // See if the menu would be off to the right, then shift it left.
  if ((x + size.width) > viewportSize.width) {
    // Make sure this wouldn't make the menu go off the left side of the screen.
    if ((x - size.width) >= 0) {
      x -= size.width;
    }
  }

  // See if the menu would be off the bottom, then shift it up.
  if ((y + size.height) > viewportSize.height) {
    // Make sure this wouldn't make the menu go off the bottom of the screen.
    if ((y - size.height) >= 0) {
      y -= size.height;
    }
  }

  // Adjust for the scroll.
  x += scrollPos.x;
  y += scrollPos.y;

  // Show the menu.
  element.style.top = y + 'px';
  element.style.left = x + 'px';
  goog.style.showElement(element, true);

  // Make sure you focus after changing position.  If you don't the browser will
  // scroll when it shouldn't.
  element.focus();
};


/**
 * Hides the actions.
 * @private
 */
yugi.ui.menu.ActionContainer.prototype.hide_ = function() {
  goog.style.showElement(this.getElement(), false);
};


/**
 * Called when an action is clicked.  The menu is hidden and the action fires.
 * @param {!yugi.model.Action} action The action that was clicked.
 * @param {!goog.events.Event} e The click event.
 * @private
 */
yugi.ui.menu.ActionContainer.prototype.onActionClick_ = function(action, e) {
  // Stop default actions (like an <a> tag being followed).
  e.preventDefault();
  e.stopPropagation();

  this.hide_();
  action.fire();
};
