/**
 * This is the UI for a spell or trap card in play.
 */

goog.provide('yugi.game.ui.zone.SpellTrap');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('yugi.game.action.Factory');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.model.field.Field');
goog.require('yugi.game.ui');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.counters.Counters');
goog.require('yugi.game.ui.dragdrop.DragDrop');
goog.require('yugi.model.Area');
goog.require('yugi.model.Card');
goog.require('yugi.model.InformationCard');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.Image');
goog.require('yugi.ui.menu.Menu');



/**
 * This is the UI for a spell or trap card in play.
 * @param {!yugi.model.Area} area The area this zone is rendering.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.zone.SpellTrap = function(area) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.ui.zone.SpellTrap');

  /**
   * @type {!yugi.model.Area}
   * @private
   */
  this.area_ = area;

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
      'This is your opponent\'s spell or trap card.');

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.cardHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.cardHandler_);

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.imageHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.imageHandler_);

  /**
   * @type {yugi.model.Card}
   * @private
   */
  this.card_ = null;

  /**
   * @type {yugi.game.ui.counters.Counters}
   * @private
   */
  this.counters_ = null;

  /**
   * @type {yugi.ui.menu.Menu}
   * @private
   */
  this.menu_ = null;

  //Figure out which player owns this area.
  var game = yugi.game.model.Game.get();
  var player;
  if (yugi.model.Area.PLAYER_SPELL_TRAP_ZONES.contains(area)) {
    player = game.getPlayer();
  } else {
    player = game.getOpponent();
  }

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;
};
goog.inherits(yugi.game.ui.zone.SpellTrap, goog.ui.Component);


/**
 * CSS classes used in this widget.
 * @enum {string}
 * @private
 */
yugi.game.ui.zone.SpellTrap.Css_ = {
  FACE_UP: goog.getCssName('face-up'),
  ROOT: goog.getCssName('yugi-spell-trap-zone')
};


/**
 * @return {!yugi.model.Area} The area of the spell/trap zone.
 */
yugi.game.ui.zone.SpellTrap.prototype.getArea = function() {
  return this.area_;
};


/** @override */
yugi.game.ui.zone.SpellTrap.prototype.createDom = function() {
  goog.base(this, 'createDom');
  var el = this.getElement();
  goog.dom.classes.add(el, yugi.game.ui.zone.SpellTrap.Css_.ROOT);
  goog.dom.classes.enable(el, yugi.game.ui.Css.OPPONENT,
      this.player_.isOpponent());

  // Further rendering happens later.
};


/** @override */
yugi.game.ui.zone.SpellTrap.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.player_.getField(),
      yugi.game.model.field.Field.EventType.SPELLS_TRAPS_CHANGED,
      this.setUpCard_);

  this.setUpCard_();
};


/**
 * Sets up listeners for the card in this zone and renders it.
 * @private
 */
yugi.game.ui.zone.SpellTrap.prototype.setUpCard_ = function() {
  this.cardHandler_.removeAll();

  this.card_ = this.player_.getField().getCardInZone(this.area_);

  if (this.card_) {
    this.cardHandler_.listen(this.card_,
        [yugi.model.Card.EventType.FLIPPED,
         yugi.model.Card.EventType.ROTATED],
        this.renderCard_);

    this.renderCard_();
  } else {
    this.clearCard_();
  }
};


/**
 * Clears the card.
 * @private
 */
yugi.game.ui.zone.SpellTrap.prototype.clearCard_ = function() {
  var image = goog.dom.getFirstElementChild(this.getElement());
  if (image) {
    this.dragDropService_.removeSource(image);
  }

  this.getElement().innerHTML = '';
  this.imageHandler_.removeAll();
  goog.dispose(this.menu_);
  goog.dispose(this.counters_);
};


/**
 * Renders the card.
 * @private
 */
yugi.game.ui.zone.SpellTrap.prototype.renderCard_ = function() {

  // Reset.
  this.clearCard_();

  var dom = this.getDomHelper();
  var img = dom.createDom(goog.dom.TagName.IMG, yugi.game.ui.Css.CARD_SIZE);

  // Set the image based on position.
  if (this.card_.isFaceUp()) {
    img.src = this.card_.getImageSource(yugi.game.ui.MAX_CARD_HEIGHT);
    goog.dom.classes.add(img, yugi.game.ui.zone.SpellTrap.Css_.FACE_UP);
  } else {
    img.src = yugi.ui.Image.CARD_BACK;
  }

  this.getElement().appendChild(img);
  if (!this.player_.isOpponent()) {
    this.dragDropService_.addSource(img, this.card_);
  }

  // Attach menu actions to the card.
  var actions = [];
  if (!this.player_.isOpponent()) {
    var zone = yugi.model.Area.getZoneIndex(this.area_);
    actions = yugi.game.action.Factory.getInstance()
        .createFieldSpellTrapActions(
            this.card_, this.player_, zone);
  }

  // Don't render the menu unless there are actions.
  if (actions.length > 0) {
    this.menu_ = new yugi.ui.menu.Menu(actions);
    this.menu_.render(this.getElement());
  }

  // Render the counters.
  this.counters_ = new yugi.game.ui.counters.Counters(
      this.card_, this.player_);
  this.addChild(this.counters_, true);

  // Listen for image selection.
  this.imageHandler_.listen(img,
      goog.events.EventType.CLICK,
      goog.bind(this.onImageClick_, this, img));
};


/**
 * Called when a card image is clicked.
 * @param {Element} image The image element.
 * @private
 */
yugi.game.ui.zone.SpellTrap.prototype.onImageClick_ = function(image) {
  if (this.player_.isOpponent() && !this.card_.isFaceUp()) {
    // We don't want to show the player the opponent's face down card.
    this.selection_.setSelected(this.opponentCard_, image);
  } else {
    this.selection_.setSelected(this.card_, image);
  }
};


/** @override */
yugi.game.ui.zone.SpellTrap.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.dispose(this.menu_);
};
