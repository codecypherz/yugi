/**
 * This is the main game UI.
 */

goog.provide('yugi.game.ui.Main');

goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.ui.ModeSwapper');
goog.require('yugi.game.ui.attack.Mask');
goog.require('yugi.game.ui.chat.ChatWindow');
goog.require('yugi.game.ui.connection.Status');
goog.require('yugi.game.ui.player.LifePoints');
goog.require('yugi.game.ui.soy');
goog.require('yugi.ui.selection.Selection');



/**
 * This is the main game UI.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.Main = function() {
  goog.base(this);

  var game = yugi.game.model.Game.get();

  /**
   * @type {!yugi.game.ui.connection.Status}
   * @private
   */
  this.status_ = new yugi.game.ui.connection.Status();
  this.addChild(this.status_);

  /**
   * @type {!yugi.ui.selection.Selection}
   * @private
   */
  this.selection_ = new yugi.ui.selection.Selection();
  this.addChild(this.selection_);

  /**
   * @type {!yugi.game.ui.player.LifePoints}
   * @private
   */
  this.playerLifePoints_ = new yugi.game.ui.player.LifePoints(game.getPlayer());
  this.addChild(this.playerLifePoints_);

  /**
   * @type {!yugi.game.ui.player.LifePoints}
   * @private
   */
  this.opponentLifePoints_ = new yugi.game.ui.player.LifePoints(
      game.getOpponent());
  this.addChild(this.opponentLifePoints_);

  /**
   * @type {!yugi.game.ui.ModeSwapper}
   * @private
   */
  this.modeSwapper_ = new yugi.game.ui.ModeSwapper();
  this.addChild(this.modeSwapper_);

  /**
   * @type {!yugi.game.ui.chat.ChatWindow}
   * @private
   */
  this.chatWindow_ = new yugi.game.ui.chat.ChatWindow();
  this.addChild(this.chatWindow_);

  /**
   * @type {!yugi.game.ui.attack.Mask}
   * @private
   */
  this.attackMask_ = new yugi.game.ui.attack.Mask();
  this.addChild(this.attackMask_);
};
goog.inherits(yugi.game.ui.Main, goog.ui.Component);


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.Main.Id_ = {
  CHAT: 'chat',
  HEADER: 'header',
  MODE_SWAPPER: 'mode-swapper',
  OPPONENT_LIFE_POINTS: 'opponent-life-points',
  PLAYER_LIFE_POINTS: 'player-life-points',
  SELECTION: 'selection'
};


/**
 * CSS classes used by this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.Main.Css_ = {
  ROOT: goog.getCssName('yugi-main-root')
};


/** @override */
yugi.game.ui.Main.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.soy.HTML, {
        ids: this.makeIds(yugi.game.ui.Main.Id_)
      }));
  goog.dom.classes.add(this.getElement(), yugi.game.ui.Main.Css_.ROOT);

  this.attackMask_.render(this.getElement());
};


/** @override */
yugi.game.ui.Main.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Render the sub components.
  this.status_.render(this.getElement());
  this.selection_.render(this.getElementByFragment(
      yugi.game.ui.Main.Id_.SELECTION));
  this.playerLifePoints_.render(this.getElementByFragment(
      yugi.game.ui.Main.Id_.PLAYER_LIFE_POINTS));
  this.opponentLifePoints_.render(this.getElementByFragment(
      yugi.game.ui.Main.Id_.OPPONENT_LIFE_POINTS));
  this.modeSwapper_.render(this.getElementByFragment(
      yugi.game.ui.Main.Id_.MODE_SWAPPER));
  this.chatWindow_.render(this.getElementByFragment(
      yugi.game.ui.Main.Id_.CHAT));
};
