/**
 * This is the UI for a spell or trap card in play.
 */

goog.provide('yugi.game.ui.field.FieldCard');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('yugi.game.action.Factory');
goog.require('yugi.game.model.Field');
goog.require('yugi.game.ui');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.counters.Counters');
goog.require('yugi.game.ui.dragdrop.DragDrop');
goog.require('yugi.model.Card');
goog.require('yugi.model.InformationCard');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.Image');
goog.require('yugi.ui.menu.Menu');



/**
 * This is the UI for a spell or trap card in play.
 * @param {!yugi.game.model.Player} player The player to which the card belongs.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.field.FieldCard = function(player) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.ui.field.FieldCard');

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

  /**
   * @type {!yugi.game.ui.dragdrop.DragDrop}
   * @private
   */
  this.dragDropService_ = yugi.game.ui.dragdrop.DragDrop.get();

  /**
   * @type {!yugi.model.InformationCard}
   * @private
   */
  this.opponentCard_ = new yugi.model.InformationCard(
      'This is your opponent\'s field card.');

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.cardHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.cardHandler_);

  /**
   * @type {yugi.ui.menu.Menu}
   * @private
   */
  this.menu_ = null;

  /**
   * @type {yugi.game.ui.counters.Counters}
   * @private
   */
  this.counters_ = null;
};
goog.inherits(yugi.game.ui.field.FieldCard, goog.ui.Component);


/**
 * CSS classes used in this widget.
 * @enum {string}
 * @private
 */
yugi.game.ui.field.FieldCard.Css_ = {
  FACE_UP: goog.getCssName('face-up'),
  LABEL: goog.getCssName('yugi-label'),
  ROOT: goog.getCssName('yugi-field-card')
};


/** @override */
yugi.game.ui.field.FieldCard.prototype.createDom = function() {
  goog.base(this, 'createDom');
  var el = this.getElement();
  goog.dom.classes.add(el, yugi.game.ui.field.FieldCard.Css_.ROOT);
  goog.dom.classes.enable(el, yugi.game.ui.Css.OPPONENT,
      this.player_.isOpponent());
};


/** @override */
yugi.game.ui.field.FieldCard.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.player_.getField(),
      yugi.game.model.Field.EventType.FIELD_CARD_CHANGED,
      this.onFieldCardChanged_);

  this.onFieldCardChanged_();
};


/**
 * Clears any stuff that was for the previous card.
 * @private
 */
yugi.game.ui.field.FieldCard.prototype.clearCard_ = function() {
  var image = goog.dom.getFirstElementChild(this.getElement());
  if (image) {
    this.dragDropService_.removeSource(image);
  }
  this.getElement().innerHTML = '';
  this.cardHandler_.removeAll();
  goog.dispose(this.menu_);
  goog.dispose(this.counters_);
};


/**
 * Called when the field card changes.
 * @private
 */
yugi.game.ui.field.FieldCard.prototype.onFieldCardChanged_ = function() {

  this.clearCard_();

  // Make sure there's a field card to render.
  var fieldCard = this.player_.getField().getFieldCard();
  if (!fieldCard) {
    return;
  }

  // Listen to flip changes.
  this.cardHandler_.listen(fieldCard,
      yugi.model.Card.EventType.FLIPPED,
      this.onFieldCardChanged_);

  var img = this.getDomHelper().createDom(
      goog.dom.TagName.IMG, yugi.game.ui.Css.CARD_SIZE);

  // Set the image based on position.
  if (fieldCard.isFaceUp()) {
    img.src = fieldCard.getImageSource(yugi.game.ui.MAX_CARD_HEIGHT);
    goog.dom.classes.add(img, yugi.game.ui.field.FieldCard.Css_.FACE_UP);
  } else {
    img.src = yugi.ui.Image.CARD_BACK;
  }

  this.getElement().appendChild(img);
  if (!this.player_.isOpponent()) {
    this.dragDropService_.addSource(img, fieldCard);
  }

  // Attach menu actions to the card.
  var actions = [];
  if (!this.player_.isOpponent()) {
    actions = yugi.game.action.Factory.getInstance()
        .createFieldSpellTrapActions(fieldCard, this.player_, 0);
  }

  // Don't render the menu unless there are actions.
  if (actions.length > 0) {
    this.menu_ = new yugi.ui.menu.Menu(actions);
    this.menu_.render(this.getElement());
  }

  // Render the counters.
  this.counters_ = new yugi.game.ui.counters.Counters(fieldCard, this.player_);
  this.addChild(this.counters_, true);

  // Listen for image selection.
  this.cardHandler_.listen(img,
      goog.events.EventType.CLICK,
      goog.bind(this.onImageClick_, this, img));
};


/**
 * Called when a card image is clicked.
 * @param {Element} image The image element.
 * @private
 */
yugi.game.ui.field.FieldCard.prototype.onImageClick_ = function(image) {
  var fieldCard = this.player_.getField().getFieldCard();
  if (!fieldCard) {
    return;
  }

  if (this.player_.isOpponent() && !fieldCard.isFaceUp()) {
    // We don't want to show the player the opponent's face down card.
    this.selection_.setSelected(this.opponentCard_, image);
  } else {
    this.selection_.setSelected(fieldCard, image);
  }
};


/** @override */
yugi.game.ui.field.FieldCard.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.dispose(this.menu_);
};
