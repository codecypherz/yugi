/**
 * This is the UI for displaying and manipulating life points.
 */

goog.provide('yugi.game.ui.player.LifePoints');

goog.require('goog.dom.classes');
goog.require('goog.i18n.NumberFormat');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Player');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.player.soy');



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
  OKAY: goog.getCssName('okay'),
  ROOT: goog.getCssName('yugi-life-points')
};


/**
 * DOM IDs used by this widget.
 * @enum {string}
 * @private
 */
yugi.game.ui.player.LifePoints.Id_ = {
  LIFE_POINTS: 'life-points'
};


/** @override */
yugi.game.ui.player.LifePoints.prototype.createDom = function() {

  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.player.soy.LIFE_POINTS, {
        ids: this.makeIds(yugi.game.ui.player.LifePoints.Id_)
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.game.ui.player.LifePoints.Css_.ROOT);
  goog.dom.classes.enable(this.getElement(), yugi.game.ui.Css.OPPONENT,
      this.player_.isOpponent());
};


/** @override */
yugi.game.ui.player.LifePoints.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.lifePointsElement_ = this.getElementByFragment(
      yugi.game.ui.player.LifePoints.Id_.LIFE_POINTS);

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

  this.lifePointsElement_.innerHTML = this.numberFormatter_.format(lifePoints);

  var el = this.getElement();
  goog.dom.classes.enable(el, yugi.game.ui.player.LifePoints.Css_.HIGH,
      lifePoints >= 6000);
  goog.dom.classes.enable(el, yugi.game.ui.player.LifePoints.Css_.OKAY,
      lifePoints < 6000 && lifePoints >= 2000);
  goog.dom.classes.enable(el, yugi.game.ui.player.LifePoints.Css_.LOW,
      lifePoints < 2000);
};
