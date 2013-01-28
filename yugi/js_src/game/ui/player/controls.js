/**
 * This is the UI for player controls.
 */

goog.provide('yugi.game.ui.player.Controls');

goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.game.action.Reset');
goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.ui.player.soy');
goog.require('yugi.ui.menu.ActionContainer');



/**
 * This is the UI for player controls.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.player.Controls = function() {
  goog.base(this);

  var game = yugi.game.model.Game.get();

  /**
   * @type {!yugi.game.model.player.Player}
   * @private
   */
  this.player_ = game.getPlayer();

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = yugi.game.model.Chat.get();

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.endTurnButton_ = new goog.ui.Button(null);
  this.addChild(this.endTurnButton_);

  var moreActions = [];
  moreActions.push(new yugi.game.action.Reset());

  /**
   * @type {!yugi.ui.menu.ActionContainer}
   * @private
   */
  this.moreActionsContainer_ = new yugi.ui.menu.ActionContainer(moreActions);
  this.registerDisposable(this.moreActionsContainer_);
};
goog.inherits(yugi.game.ui.player.Controls, goog.ui.Component);


/**
 * The CSS classes used by this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.player.Controls.Css_ = {
  ROOT: goog.getCssName('yugi-player-controls')
};


/**
 * DOM IDs used by this widget.
 * @enum {string}
 * @private
 */
yugi.game.ui.player.Controls.Id_ = {
  COIN: 'coin',
  DIE: 'die',
  END_TURN_BUTTON: 'end-turn-button',
  MORE_BUTTON: 'more-button'
};


/** @override */
yugi.game.ui.player.Controls.prototype.createDom = function() {

  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.player.soy.CONTROLS, {
        ids: this.makeIds(yugi.game.ui.player.Controls.Id_)
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.game.ui.player.Controls.Css_.ROOT);
};


/** @override */
yugi.game.ui.player.Controls.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.moreActionsContainer_.render();

  var die = this.getElementByFragment(yugi.game.ui.player.Controls.Id_.DIE);
  var coin = this.getElementByFragment(yugi.game.ui.player.Controls.Id_.COIN);
  var moreButton = this.getElementByFragment(
      yugi.game.ui.player.Controls.Id_.MORE_BUTTON);

  if (!this.endTurnButton_.wasDecorated()) {
    this.endTurnButton_.decorate(this.getElementByFragment(
        yugi.game.ui.player.Controls.Id_.END_TURN_BUTTON));
  }

  this.getHandler().listen(die,
      goog.events.EventType.CLICK,
      this.rollDie_);
  this.getHandler().listen(coin,
      goog.events.EventType.CLICK,
      this.flipCoin_);
  this.getHandler().listen(this.endTurnButton_,
      goog.ui.Component.EventType.ACTION,
      this.endTurn_);
  this.getHandler().listen(moreButton,
      goog.events.EventType.CLICK,
      this.showMoreActions_);
};


/**
 * Rolls the die.
 * @private
 */
yugi.game.ui.player.Controls.prototype.rollDie_ = function() {
  var num = Math.floor((Math.random() * 6)) + 1;
  this.chat_.sendSystemRemote(
      this.player_.getName() + ' rolled a ' + num + '.');
};


/**
 * Flips the coin.
 * @private
 */
yugi.game.ui.player.Controls.prototype.flipCoin_ = function() {
  var result = Math.random() >= 0.5 ? 'heads' : 'tails';
  this.chat_.sendSystemRemote(
      this.player_.getName() + ' flipped a coin and got ' + result + '.');
};


/**
 * There's no real action for ending the turn - this is just a convenient way to
 * tell the opponent that the turn is over.
 * @private
 */
yugi.game.ui.player.Controls.prototype.endTurn_ = function() {
  this.chat_.sendSystemRemote(this.player_.getName() + ' ends their turn.');
};


/**
 * Shows more actions.
 * @param {!goog.events.Event} e The click event.
 * @private
 */
yugi.game.ui.player.Controls.prototype.showMoreActions_ = function(e) {
  this.moreActionsContainer_.show(e);
};
