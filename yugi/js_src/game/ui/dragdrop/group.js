/**
 * Custom drag and drop group for the yugi game UI.
 */

goog.provide('yugi.game.ui.dragdrop.Group');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.fx.DragDropGroup');
goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('yugi.game.ui.ZIndex');



/**
 * Custom drag and drop group for the yugi game UI.
 * @constructor
 * @extends {goog.fx.DragDropGroup}
 */
yugi.game.ui.dragdrop.Group = function() {
  goog.base(this);
};
goog.inherits(yugi.game.ui.dragdrop.Group, goog.fx.DragDropGroup);


/** @override */
yugi.game.ui.dragdrop.Group.prototype.createDragElement = function(
    sourceElement) {

  // Clone the source element and fix the width and height to be the size.
  var clonedElement = /** @type {Element} */ (sourceElement.cloneNode(true));
  var size = goog.style.getSize(sourceElement);
  clonedElement.style.width = size.width + 'px';
  clonedElement.style.height = size.height + 'px';
  clonedElement.style.zIndex = yugi.game.ui.ZIndex.DRAG_ITEM;
  goog.dom.classes.add(clonedElement, goog.getCssName('yugi-drag-item'));
  return clonedElement;
};


/** @override */
yugi.game.ui.dragdrop.Group.prototype.getDragElementPosition = function(
    sourceElement, element, e) {

  // Figure out where within the card the drag started.  Make that the drag
  // offset but bound it by the size of the element.  This will give the
  // appearance of dragging the card from wherever you clicked.
  var size = goog.style.getSize(sourceElement);
  var offsetX = goog.math.clamp(e.offsetX, 0, size.width);
  var offsetY = goog.math.clamp(e.offsetY, 0, size.height);

  // The drag position needs to be where the user clicked, adjusted for where
  // within the card the user clicked and how much the document is scrolled.
  var scrollPos = goog.dom.getDocumentScroll();
  var x = e.clientX + scrollPos.x - offsetX;
  var y = e.clientY + scrollPos.y - offsetY;
  return new goog.math.Coordinate(x, y);
};
