/**
 * This UI allows the user to join the associated game.
 */

goog.provide('yugi.landing.ui.launcher.GameJoin');

goog.require('goog.soy');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.landing.ui.launcher.soy');



/**
 * This UI allows the user to join the associated game.
 * @param {!yugi.landing.model.Game} game The game for which this component will
 *     render.
 * @param {!function()} showPrompt The callback to show the prompt to join the
 *     game.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.landing.ui.launcher.GameJoin = function(game, showPrompt) {
  goog.base(this);

  /**
   * @type {!yugi.landing.model.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!function()}
   * @private
   */
  this.showPrompt_ = showPrompt;

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.joinButton_ = new goog.ui.Button(null);
  this.addChild(this.joinButton_);
};
goog.inherits(yugi.landing.ui.launcher.GameJoin, goog.ui.Component);


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.landing.ui.launcher.GameJoin.Id_ = {
  JOIN_BUTTON: 'join-button'
};


/** @override */
yugi.landing.ui.launcher.GameJoin.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.landing.ui.launcher.soy.GAME_JOIN, {
        ids: this.makeIds(yugi.landing.ui.launcher.GameJoin.Id_),
        gameName: this.game_.getName()
      }));
};


/** @override */
yugi.landing.ui.launcher.GameJoin.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Decorate the button.
  if (!this.joinButton_.wasDecorated()) {
    this.joinButton_.decorate(this.getElementByFragment(
        yugi.landing.ui.launcher.GameJoin.Id_.JOIN_BUTTON));
  }

  this.getHandler().listen(this.joinButton_,
      goog.ui.Component.EventType.ACTION,
      this.promptForJoinGame_);
};


/**
 * Prompts the user for information in order to join the game.
 * @private
 */
yugi.landing.ui.launcher.GameJoin.prototype.promptForJoinGame_ = function() {
  this.showPrompt_();
};
