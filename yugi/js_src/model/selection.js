/**
 * Keeps track of what is selected.
 */

goog.provide('yugi.model.Selection');
goog.provide('yugi.model.Selection.SelectedEvent');

goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('yugi.ui.Css');



/**
 * Keeps track of what is selected.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.model.Selection = function() {
  goog.base(this);
};
goog.inherits(yugi.model.Selection, goog.events.EventTarget);


/**
 * The currently selected item.
 * @type {yugi.model.Selectable}
 * @private
 */
yugi.model.Selection.prototype.selectedItem_ = null;


/**
 * The currently selected element that is associated with the item.
 * @type {?Element}
 * @private
 */
yugi.model.Selection.prototype.selectedElement_ = null;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.model.Selection.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.model.Selection');


/**
 * @type {!yugi.model.Selection}
 * @private
 */
yugi.model.Selection.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.model.Selection.EventType = {
  DESELECTED: goog.events.getUniqueId('deselected'),
  SELECTED: goog.events.getUniqueId('selected')
};


/**
 * Registers an instance of the model.
 * @return {!yugi.model.Selection} The registered instance.
 */
yugi.model.Selection.register = function() {
  yugi.model.Selection.instance_ = new yugi.model.Selection();
  return yugi.model.Selection.get();
};


/**
 * @return {!yugi.model.Selection} The model for the selection.
 */
yugi.model.Selection.get = function() {
  return yugi.model.Selection.instance_;
};


/**
 * Sets the currently selected item.
 * @param {yugi.model.Selectable} selectable The newly selected item.
 * @param {?Element} element The element associated with the selectable.
 */
yugi.model.Selection.prototype.setSelected = function(selectable, element) {

  // Don't do anything unless there was a change.
  if (this.selected_ == selectable && this.selectedElement_ == element) {
    return; // No change.
  }

  // Deselect anything previously selected.
  if (this.selectedElement_) {
    goog.dom.classes.enable(this.selectedElement_, yugi.ui.Css.SELECTED, false);
  }

  // Update references.
  this.selected_ = selectable;
  this.selectedElement_ = element;

  // Change the object and dispatch to notify others.
  if (this.selected_) {

    // Update the CSS for the selected element.
    if (this.selectedElement_) {
      goog.dom.classes.enable(this.selectedElement_, yugi.ui.Css.SELECTED,
          true);
    } else {
      this.logger.warning('No element associated with the selected item.');
    }

    this.dispatchEvent(new yugi.model.Selection.SelectedEvent(this.selected_));

  } else {
    this.dispatchEvent(yugi.model.Selection.EventType.DESELECTED);
  }
};


/**
 * @return {yugi.model.Selectable} The currently selected item.
 */
yugi.model.Selection.prototype.getSelected = function() {
  return this.selected_;
};


/**
 * Deselects anything.
 */
yugi.model.Selection.prototype.deselect = function() {
  this.setSelected(null, null);
};



/**
 * The event that gets dispatched when the something gets selected.
 * @param {yugi.model.Selectable} selectable The newly selected item.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.model.Selection.SelectedEvent = function(selectable) {
  goog.base(this, yugi.model.Selection.EventType.SELECTED);

  /**
   * @type {yugi.model.Selectable}
   */
  this.selectable = selectable;
};
goog.inherits(yugi.model.Selection.SelectedEvent, goog.events.Event);
