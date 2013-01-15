/**
 * This is the UI for a spell or trap card in play.
 */

goog.provide('yugi.game.ui.field.SpellTrap');

goog.require('goog.debug.Logger');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('yugi.game.action.Factory');
goog.require('yugi.game.ui');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.counters.Counters');
goog.require('yugi.model.Card');
goog.require('yugi.model.InformationCard');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.Image');
goog.require('yugi.ui.menu.Menu');



/**
 * This is the UI for a spell or trap card in play.
 * @param {!yugi.model.SpellCard|!yugi.model.TrapCard} spellTrapCard The card.
 * @param {number} zone The zone in which the card resides.
 * @param {!yugi.game.model.Player} player The player to which the card belongs.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.field.SpellTrap = function(spellTrapCard, zone, player) {
  goog.base(this);

  /**
   * @type {!yugi.model.SpellCard|!yugi.model.TrapCard}
   * @private
   */
  this.spellTrapCard_ = spellTrapCard;

  /**
   * @type {number}
   * @private
   */
  this.zone_ = zone;

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
   * @type {!yugi.model.InformationCard}
   * @private
   */
  this.opponentCard_ = new yugi.model.InformationCard(
      'This is your opponent\'s spell or trap card.');

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.imageHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.imageHandler_);

  /**
   * @type {!yugi.game.ui.counters.Counters}
   * @private
   */
  this.counters_ = new yugi.game.ui.counters.Counters(spellTrapCard, player);
  this.addChild(this.counters_);
};
goog.inherits(yugi.game.ui.field.SpellTrap, goog.ui.Component);


/**
 * @type {yugi.ui.menu.Menu}
 * @private
 */
yugi.game.ui.field.SpellTrap.prototype.menu_ = null;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.ui.field.SpellTrap.prototype.logger =
    goog.debug.Logger.getLogger('yugi.game.ui.field.SpellTrap');


/**
 * CSS classes used in this widget.
 * @enum {string}
 * @private
 */
yugi.game.ui.field.SpellTrap.Css_ = {
  FACE_UP: goog.getCssName('face-up'),
  ROOT: goog.getCssName('yugi-spell-trap-card')
};


/** @override */
yugi.game.ui.field.SpellTrap.prototype.createDom = function() {
  goog.base(this, 'createDom');
  var el = this.getElement();
  goog.dom.classes.add(el, yugi.game.ui.field.SpellTrap.Css_.ROOT);
  goog.dom.classes.enable(el, yugi.game.ui.Css.OPPONENT,
      this.player_.isOpponent());

  this.counters_.render(el);
};


/** @override */
yugi.game.ui.field.SpellTrap.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.spellTrapCard_,
      yugi.model.Card.EventType.POSITION_CHANGED,
      this.onPositionChanged_);

  this.onPositionChanged_();
};


/**
 * Called when the card position changes.
 * @private
 */
yugi.game.ui.field.SpellTrap.prototype.onPositionChanged_ = function() {

  // Reset.
  var element = this.getElement();
  element.innerHTML = '';
  this.imageHandler_.removeAll();
  goog.dispose(this.menu_);
  goog.dispose(this.counters_);

  var dom = this.getDomHelper();
  var img = dom.createDom(goog.dom.TagName.IMG, yugi.game.ui.Css.CARD_SIZE);

  // Set the image based on position.
  if (this.spellTrapCard_.isFaceUp()) {
    img.src = this.spellTrapCard_.getImageSource(yugi.game.ui.MAX_CARD_HEIGHT);
    goog.dom.classes.add(img, yugi.game.ui.field.SpellTrap.Css_.FACE_UP);
  } else {
    img.src = yugi.ui.Image.CARD_BACK;
  }

  dom.append(element, img);

  // Attach menu actions to the card.
  var actions = [];
  if (!this.player_.isOpponent()) {
    actions = yugi.game.action.Factory.getInstance()
        .createFieldSpellTrapActions(
            this.spellTrapCard_, this.player_, this.zone_);
  }

  // Don't render the menu unless there are actions.
  if (actions.length > 0) {
    this.menu_ = new yugi.ui.menu.Menu(actions);
    this.menu_.render(element);
  }

  // Render the counters.
  this.counters_ = new yugi.game.ui.counters.Counters(
      this.spellTrapCard_, this.player_);
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
yugi.game.ui.field.SpellTrap.prototype.onImageClick_ = function(image) {
  if (this.player_.isOpponent() && !this.spellTrapCard_.isFaceUp()) {
    // We don't want to show the player the opponent's face down card.
    this.selection_.setSelected(this.opponentCard_, image);
  } else {
    this.selection_.setSelected(this.spellTrapCard_, image);
  }
};


/** @override */
yugi.game.ui.field.SpellTrap.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.dispose(this.menu_);
};
