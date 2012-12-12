/**
 * This UI prompts the user to start a new game.
 */

goog.provide('yugi.landing.ui.launcher.NewGamePrompt');

goog.require('goog.debug.Logger');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.LabelInput');
goog.require('yugi.landing.model.Player');
goog.require('yugi.landing.ui.launcher.soy');
goog.require('yugi.model.util');



/**
 * Prompts the user for the information to start a new game.
 * @constructor
 * @extends {goog.ui.Dialog}
 */
yugi.landing.ui.launcher.NewGamePrompt = function() {
  goog.base(this);

  this.setTitle('Start New Game');
  this.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());

  /**
   * @type {!goog.ui.LabelInput}
   * @private
   */
  this.playerNameInput_ = new goog.ui.LabelInput('Player 1');
  this.addChild(this.playerNameInput_);

  /**
   * @type {!goog.ui.LabelInput}
   * @private
   */
  this.gameNameInput_ = new goog.ui.LabelInput('Game 1');
  this.addChild(this.gameNameInput_);

  /**
   * @type {!yugi.landing.model.Player}
   * @private
   */
  this.player_ = yugi.landing.model.Player.get();
};
goog.inherits(yugi.landing.ui.launcher.NewGamePrompt, goog.ui.Dialog);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.landing.ui.launcher.NewGamePrompt.prototype.logger =
    goog.debug.Logger.getLogger('yugi.landing.ui.launcher.NewGamePrompt');


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.landing.ui.launcher.NewGamePrompt.Id_ = {
  GAME_NAME_INPUT: 'game-name-input',
  PLAYER_NAME_INPUT: 'player-name-input'
};


/** @override */
yugi.landing.ui.launcher.NewGamePrompt.prototype.createDom = function() {
  goog.base(this, 'createDom');

  this.setContent(yugi.landing.ui.launcher.soy.NEW_GAME_PROMPT({
    ids: this.makeIds(yugi.landing.ui.launcher.NewGamePrompt.Id_)
  }));
};


/** @override */
yugi.landing.ui.launcher.NewGamePrompt.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Decorate the components.
  if (!this.playerNameInput_.wasDecorated()) {
    this.playerNameInput_.decorate(this.getElementByFragment(
        yugi.landing.ui.launcher.NewGamePrompt.Id_.PLAYER_NAME_INPUT));
  }
  if (!this.gameNameInput_.wasDecorated()) {
    this.gameNameInput_.decorate(this.getElementByFragment(
        yugi.landing.ui.launcher.NewGamePrompt.Id_.GAME_NAME_INPUT));
  }

  // Initialize the dialog.
  this.playerNameInput_.reset();
  this.gameNameInput_.reset();

  // Listen for when to start the game.
  this.getHandler().listen(this,
      goog.ui.Dialog.EventType.SELECT,
      this.onSelect_);
};


/** @override */
yugi.landing.ui.launcher.NewGamePrompt.prototype.setVisible =
    function(visible) {
  goog.base(this, 'setVisible', visible);

  // Pull the existing player name, if there was one and set it.
  var playerName = this.player_.getSavedName();
  if (playerName) {

    // Set the player name and give focus to the game field.
    this.playerNameInput_.setValue(playerName);
    this.gameNameInput_.focusAndSelect();
  } else {

    // Focus the player name.
    this.playerNameInput_.focusAndSelect();
  }
};


/**
 * Called when a button on the dialog is pressed.
 * @param {!goog.ui.Dialog.Event} e The event.
 * @private
 */
yugi.landing.ui.launcher.NewGamePrompt.prototype.onSelect_ = function(e) {
  if (e.key == goog.ui.Dialog.DefaultButtonKeys.OK) {
    this.startNewGame_();
  }
};


/**
 * Starts a new game by making a new request to the server.
 * @private
 */
yugi.landing.ui.launcher.NewGamePrompt.prototype.startNewGame_ = function() {
  this.logger.info('Starting a new game.');

  // If the user specified a player name, save it for next time.
  var playerNameValue = this.playerNameInput_.getValue();
  if (playerNameValue) {
    this.player_.saveName(playerNameValue);
  }

  // Use the player's name or the default if none was specified.
  var playerName = playerNameValue || this.playerNameInput_.getLabel();
  var gameName = this.gameNameInput_.getValue() ||
      this.gameNameInput_.getLabel();

  yugi.model.util.startNewGame(playerName, gameName);
};
