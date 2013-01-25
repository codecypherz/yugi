/**
 * Service for dragging and dropping things.
 */

goog.provide('yugi.game.ui.dragdrop.DragDrop');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.fx.AbstractDragDrop');
goog.require('yugi');
goog.require('yugi.game.ui');
goog.require('yugi.game.ui.State');
goog.require('yugi.game.ui.dragdrop.Group');
goog.require('yugi.game.ui.dragdrop.TargetData');
goog.require('yugi.model.Area');



/**
 * Service for dragging and dropping things.
 * @param {!yugi.game.ui.State} uiState The state of the game UI.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.ui.dragdrop.DragDrop = function(uiState) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.ui.dragdrop.DragDrop');

  /**
   * @type {!yugi.game.ui.State}
   * @private
   */
  this.uiState_ = uiState;

  /**
   * @type {!goog.fx.DragDropGroup}
   * @private
   */
  this.sourceGroup_ = new yugi.game.ui.dragdrop.Group();
  this.registerDisposable(this.sourceGroup_);

  /**
   * @type {!goog.fx.DragDropGroup}
   * @private
   */
  this.targetGroup_ = new yugi.game.ui.dragdrop.Group();
  this.registerDisposable(this.targetGroup_);

  /**
   * True if the drag targets have been set, false otherwise.
   * @type {boolean}
   * @private
   */
  this.initialized_ = false;

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  // Listen for when the field is created so targets can be set and
  // initialization be finished.
  this.handler_.listen(this.uiState_,
      yugi.game.ui.State.EventType.MODE_CHANGED,
      this.maybeInitialize_);

  // Set up the source and target groups to have the same features and behavior.
  this.setUpGroup_(this.sourceGroup_);
  this.setUpGroup_(this.targetGroup_);
};
goog.inherits(yugi.game.ui.dragdrop.DragDrop, goog.events.EventTarget);


/**
 * The events dispatched by this class.
 * @enum {string}
 */
yugi.game.ui.dragdrop.DragDrop.EventType = {
  DROP: yugi.uniqueId('drop')
};


/**
 * CSS used by this service.
 * @enum {string}
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.Css_ = {
  DRAG_OVER: goog.getCssName('yugi-drag-over'),
  DRAGGED: goog.getCssName('yugi-dragged'),
  SOURCE: goog.getCssName('yugi-drag-source'),
  TARGET: goog.getCssName('yugi-drag-target')
};


/**
 * Adds a drag drop item to the source group.
 * @param {Element} element The item to add to the source group.
 * @param {Object=} opt_data The data associated with the element.
 */
yugi.game.ui.dragdrop.DragDrop.prototype.addSource = function(
    element, opt_data) {
  this.sourceGroup_.addItem(element, opt_data);
};


/**
 * Removes a drag drop item from the source group.
 * @param {Element} element The item to remove from the source group.
 */
yugi.game.ui.dragdrop.DragDrop.prototype.removeSource = function(element) {
  this.sourceGroup_.removeItem(element);
};


/**
 * Sets up a drag and drop group with the common things like classes and
 * listeners.
 * @param {!yugi.game.ui.dragdrop.Group} group The group to set up.
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.prototype.setUpGroup_ = function(group) {

  // Set the source and target classes.
  group.setSourceClass(yugi.game.ui.dragdrop.DragDrop.Css_.SOURCE);
  group.setTargetClass(yugi.game.ui.dragdrop.DragDrop.Css_.TARGET);

  // Listen to drag events.
  this.handler_.listen(group,
      goog.fx.AbstractDragDrop.EventType.DRAGSTART,
      this.onDragStart_);
  this.handler_.listen(group,
      goog.fx.AbstractDragDrop.EventType.DRAGOVER,
      this.onDragOver_);
  this.handler_.listen(group,
      goog.fx.AbstractDragDrop.EventType.DRAGOUT,
      this.onDragOut_);
  this.handler_.listen(group,
      goog.fx.AbstractDragDrop.EventType.DROP,
      this.onDrop_);
  this.handler_.listen(group,
      goog.fx.AbstractDragDrop.EventType.DRAGEND,
      this.onDragEnd_);
};


/**
 * Sets the drag targets if they haven't yet been set.
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.prototype.maybeInitialize_ = function() {

  // Check to see if targets can or should be set.
  if (this.initialized_ ||
      this.uiState_.getMode() != yugi.game.ui.State.Mode.FIELD) {
    return;
  }

  this.logger.info('Initializing drag and drop.');

  // Add all the target areas.
  for (var i = 0; i < 5; i++) {
    this.addTarget_(yugi.game.ui.getMonsterArea(i, true));
    this.addTarget_(yugi.game.ui.getMonsterArea(i));
    this.addTarget_(yugi.game.ui.getSpellTrapZoneId(i));
  }

  this.addTarget_(yugi.model.Area.PLAYER_FIELD);
  this.addTarget_(yugi.model.Area.PLAYER_EXTRA_DECK);
  this.addTarget_(yugi.model.Area.PLAYER_GRAVEYARD);
  this.addTarget_(yugi.model.Area.PLAYER_BANISH);
  this.addTarget_(yugi.model.Area.PLAYER_DECK);
  this.addTarget_(yugi.model.Area.PLAYER_HAND);

  // All sources have the same set of targets.  It's up to the player to do the
  // right thing.
  this.sourceGroup_.addTarget(this.targetGroup_);

  // Initialize the drag and drop of each group.
  this.sourceGroup_.init();
  this.targetGroup_.init();

  this.initialized_ = true;

  this.logger.info('Finished initializing drag and drop.');
};


/**
 * Adds a target item to the target group for the given area.
 * @param {!yugi.model.Area} area The target area.
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.prototype.addTarget_ = function(area) {
  this.targetGroup_.addItem(
      goog.dom.getDomHelper().getElement(area),
      new yugi.game.ui.dragdrop.TargetData(area));
};


/**
 * Called when an item has started to drag.
 * @param {!goog.events.Event} e The event.
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.prototype.onDragStart_ = function(e) {
  this.logger.fine('onDragStart_');
  goog.dom.classes.enable(
      e.dragSourceItem.element,
      yugi.game.ui.dragdrop.DragDrop.Css_.DRAGGED,
      true);
};


/**
 * Called when the dragging is complete.
 * @param {!goog.events.Event} e The event.
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.prototype.onDragEnd_ = function(e) {
  this.logger.fine('onDragEnd_');
  goog.dom.classes.enable(
      e.dragSourceItem.element,
      yugi.game.ui.dragdrop.DragDrop.Css_.DRAGGED,
      false);
};


/**
 * Called when an item that is being dragged over is entered.
 * @param {!goog.events.Event} e The event.
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.prototype.onDragOver_ = function(e) {
  this.logger.fine('onDragOver_');
  goog.dom.classes.enable(
      e.dropTargetItem.element,
      yugi.game.ui.dragdrop.DragDrop.Css_.DRAG_OVER,
      true);
};


/**
 * Called when an item that was being dragged over is left.
 * @param {!goog.events.Event} e The event.
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.prototype.onDragOut_ = function(e) {
  this.logger.fine('onDragOut_');
  goog.dom.classes.enable(
      e.dropTargetItem.element,
      yugi.game.ui.dragdrop.DragDrop.Css_.DRAG_OVER,
      false);
};


/**
 * Called when a dragged item has been dropped.
 * @param {!goog.events.Event} e The event.
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.prototype.onDrop_ = function(e) {
  this.logger.fine('onDrop_');
  goog.dom.classes.enable(
      e.dropTargetItem.element,
      yugi.game.ui.dragdrop.DragDrop.Css_.DRAG_OVER,
      false);

  var sourceCard = /** {!yugi.model.Card} */ (e.dragSourceItem.data);
  var targetData = /** {!yugi.game.ui.dragdrop.TargetData} */ (
      e.dropTargetItem.data);
  this.logger.info(
      sourceCard.getName() + ' at ' + sourceCard.getLocation().getArea() +
      '[' + sourceCard.getLocation().getIndex() + '] was dropped onto ' +
      targetData.getArea());

  this.dispatchEvent(
      new yugi.game.ui.dragdrop.DragDrop.DropEvent(sourceCard, targetData));
};


/**
 * @type {!yugi.game.ui.dragdrop.DragDrop}
 * @private
 */
yugi.game.ui.dragdrop.DragDrop.instance_;


/**
 * Registers the drag/drop service.
 * @param {!yugi.game.ui.State} uiState The state of the game UI.
 * @return {!yugi.game.ui.dragdrop.DragDrop} The registered instance.
 */
yugi.game.ui.dragdrop.DragDrop.register = function(uiState) {
  yugi.game.ui.dragdrop.DragDrop.instance_ = new yugi.game.ui.dragdrop.DragDrop(
      uiState);
  return yugi.game.ui.dragdrop.DragDrop.get();
};


/**
 * @return {!yugi.game.ui.dragdrop.DragDrop} The service.
 */
yugi.game.ui.dragdrop.DragDrop.get = function() {
  return yugi.game.ui.dragdrop.DragDrop.instance_;
};



/**
 * The event dispatched when a card is dropped somewhere.
 * @param {!yugi.model.Card} sourceCard The card being dropped.
 * @param {!yugi.game.ui.dragdrop.TargetData} targetData The target data.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.game.ui.dragdrop.DragDrop.DropEvent = function(sourceCard, targetData) {
  goog.base(this, yugi.game.ui.dragdrop.DragDrop.EventType.DROP);

  /**
   * @type {!yugi.model.Card}
   */
  this.sourceCard = sourceCard;

  /**
   * @type {!yugi.game.ui.dragdrop.TargetData}
   */
  this.targetData = targetData;
};
goog.inherits(yugi.game.ui.dragdrop.DragDrop.DropEvent, goog.events.Event);
