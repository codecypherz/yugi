/**
 * This UI allows the user to start games.
 */

goog.provide('yugi.landing.ui.launcher.GameStarter');

goog.require('goog.soy');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.landing.ui.launcher.NewGamePrompt');
goog.require('yugi.landing.ui.launcher.soy');



/**
 * Represents the UI which lets user start games.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.landing.ui.launcher.GameStarter = function() {
  goog.base(this);

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.newGameButton_ = new goog.ui.Button(null);

  /**
   * @type {!yugi.landing.ui.launcher.NewGamePrompt}
   * @private
   */
  this.newGamePrompt_ = new yugi.landing.ui.launcher.NewGamePrompt();

  this.addChild(this.newGameButton_);
  this.addChild(this.newGamePrompt_);
};
goog.inherits(yugi.landing.ui.launcher.GameStarter, goog.ui.Component);


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.landing.ui.launcher.GameStarter.Id_ = {
  NEW_GAME_BUTTON: 'new-game-button'
};


/** @override */
yugi.landing.ui.launcher.GameStarter.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.landing.ui.launcher.soy.GAME_STARTER, {
        ids: this.makeIds(yugi.landing.ui.launcher.GameStarter.Id_)
      }));
};


/** @override */
yugi.landing.ui.launcher.GameStarter.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  if (!this.newGameButton_.wasDecorated()) {
    this.newGameButton_.decorate(this.getElementByFragment(
        yugi.landing.ui.launcher.GameStarter.Id_.NEW_GAME_BUTTON));
  }

  this.getHandler().listen(this.newGameButton_,
      goog.ui.Component.EventType.ACTION,
      this.promptForNewGame_);
};


/**
 * Starts a new game by prompting the user with the start game dialog.
 * @private
 */
yugi.landing.ui.launcher.GameStarter.prototype.promptForNewGame_ = function() {
  this.newGamePrompt_.setVisible(true);
};
