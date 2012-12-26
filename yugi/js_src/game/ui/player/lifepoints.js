/**
 * This is the UI for displaying and manipulating life points.
 */

goog.provide('yugi.game.ui.player.LifePoints');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.i18n.NumberFormat');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Player');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.player.LifePointModifier');



/**
 * This is the UI for displaying and manipulating life points.
 * @param {!yugi.game.model.Player} player The player for which to show life
 *     points.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.player.LifePoints = function(player) {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!goog.i18n.NumberFormat}
   * @private
   */
  this.numberFormatter_ = new goog.i18n.NumberFormat(
      goog.i18n.NumberFormat.Format.DECIMAL);

  if (!player.isOpponent()) {
    /**
     * @type {!goog.ui.Button}
     * @private
     */
    this.plusButton_ = new goog.ui.Button('+');
    this.addChild(this.plusButton_);

    /**
     * @type {!goog.ui.Button}
     * @private
     */
    this.minusButton_ = new goog.ui.Button('-');
    this.addChild(this.minusButton_);

    /**
     * @type {!yugi.game.ui.player.LifePointModifier}
     * @private
     */
    this.lifePointModifier_ = new yugi.game.ui.player.LifePointModifier(player);
    this.addChild(this.lifePointModifier_);
  }
};
goog.inherits(yugi.game.ui.player.LifePoints, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.game.ui.player.LifePoints.prototype.lifePointsElement_ = null;


/**
 * The CSS classes used by this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.player.LifePoints.Css_ = {
  HIGH: goog.getCssName('high'),
  LOW: goog.getCssName('low'),
  MINUS: goog.getCssName('minus'),
  OKAY: goog.getCssName('okay'),
  PLUS: goog.getCssName('plus'),
  ROOT: goog.getCssName('yugi-life-points'),
  VALUE: goog.getCssName('yugi-life-points-value')
};


/** @override */
yugi.game.ui.player.LifePoints.prototype.createDom = function() {
  var css = yugi.game.ui.player.LifePoints.Css_;
  var dom = this.getDomHelper();
  var element = dom.createDom(goog.dom.TagName.DIV, css.ROOT);
  this.setElementInternal(element);

  this.lifePointsElement_ = dom.createDom(goog.dom.TagName.DIV, css.VALUE);
  element.appendChild(this.lifePointsElement_);

  goog.dom.classes.enable(
      this.lifePointsElement_,
      yugi.game.ui.Css.OPPONENT,
      this.player_.isOpponent());

  // Only render life point modification for *this* player.
  if (!this.player_.isOpponent()) {
    this.lifePointModifier_.render(element);
    this.plusButton_.render(element);
    goog.dom.classes.add(this.plusButton_.getElement(), css.PLUS);
    this.minusButton_.render(element);
    goog.dom.classes.add(this.minusButton_.getElement(), css.MINUS);
  }
};


/** @override */
yugi.game.ui.player.LifePoints.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen to the +/- buttons to show the life point modifier.
  if (!this.player_.isOpponent()) {
    this.getHandler().listen(this.plusButton_,
        goog.ui.Component.EventType.ACTION,
        goog.bind(
            this.lifePointModifier_.show,
            this.lifePointModifier_,
            yugi.game.ui.player.LifePointModifier.Mode.ADD));
    this.getHandler().listen(this.minusButton_,
        goog.ui.Component.EventType.ACTION,
        goog.bind(
            this.lifePointModifier_.show,
            this.lifePointModifier_,
            yugi.game.ui.player.LifePointModifier.Mode.SUBTRACT));
  }

  this.getHandler().listen(this.player_,
      yugi.game.model.Player.EventType.LIFE_POINTS_CHANGED,
      this.updateLifePoints_);

  this.updateLifePoints_();
};


/**
 * Updates the UI to reflect the current value of the player's life points.
 * @private
 */
yugi.game.ui.player.LifePoints.prototype.updateLifePoints_ = function() {
  var lifePoints = this.player_.getLifePoints();

  goog.dom.setTextContent(
      this.lifePointsElement_, this.numberFormatter_.format(lifePoints));

  var el = this.getElement();
  goog.dom.classes.enable(el, yugi.game.ui.player.LifePoints.Css_.HIGH,
      lifePoints >= 6000);
  goog.dom.classes.enable(el, yugi.game.ui.player.LifePoints.Css_.OKAY,
      lifePoints < 6000 && lifePoints >= 2000);
  goog.dom.classes.enable(el, yugi.game.ui.player.LifePoints.Css_.LOW,
      lifePoints < 2000);
};
