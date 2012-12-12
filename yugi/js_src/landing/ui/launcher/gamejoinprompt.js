/**
 * This UI prompts the user to start a new game.
 */

goog.provide('yugi.landing.ui.launcher.GameJoinPrompt');

goog.require('goog.debug.Logger');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.LabelInput');
goog.require('yugi.landing.model.Player');
goog.require('yugi.landing.ui.launcher.soy');



/**
 * Prompts the user for the information to start a new game.
 * @constructor
 * @extends {goog.ui.Dialog}
 */
yugi.landing.ui.launcher.GameJoinPrompt = function() {
  goog.base(this);

  this.setTitle('Join Game');
  this.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());

  /**
   * @type {!goog.ui.LabelInput}
   * @private
   */
  this.playerNameInput_ = new goog.ui.LabelInput('Player 2');
  this.addChild(this.playerNameInput_);

  /**
   * @type {!yugi.landing.model.Player}
   * @private
   */
  this.player_ = yugi.landing.model.Player.get();
};
goog.inherits(yugi.landing.ui.launcher.GameJoinPrompt, goog.ui.Dialog);


/**
 * @type {yugi.landing.model.Game}
 * @private
 */
yugi.landing.ui.launcher.GameJoinPrompt.prototype.game_ = null;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.landing.ui.launcher.GameJoinPrompt.prototype.logger =
    goog.debug.Logger.getLogger('yugi.landing.ui.launcher.GameJoinPrompt');


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.landing.ui.launcher.GameJoinPrompt.Id_ = {
  PLAYER_NAME_INPUT: 'player-name-input'
};


/** @override */
yugi.landing.ui.launcher.GameJoinPrompt.prototype.createDom = function() {
  goog.base(this, 'createDom');

  this.setContent(yugi.landing.ui.launcher.soy.GAME_JOIN_PROMPT({
    ids: this.makeIds(yugi.landing.ui.launcher.GameJoinPrompt.Id_)
  }));
};


/** @override */
yugi.landing.ui.launcher.GameJoinPrompt.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Decorate the components.
  if (!this.playerNameInput_.wasDecorated()) {
    this.playerNameInput_.decorate(this.getElementByFragment(
        yugi.landing.ui.launcher.GameJoinPrompt.Id_.PLAYER_NAME_INPUT));
  }

  // Initialize the dialog.
  this.playerNameInput_.reset();

  // Listen for when to start the game.
  this.getHandler().listen(this,
      goog.ui.Dialog.EventType.SELECT,
      this.onSelect_);
};


/**
 * Called when a button on the dialog is pressed.
 * @param {!goog.ui.Dialog.Event} e The event.
 * @private
 */
yugi.landing.ui.launcher.GameJoinPrompt.prototype.onSelect_ = function(e) {
  if (e.key == goog.ui.Dialog.DefaultButtonKeys.OK) {
    this.joinGame_();
  }
};


/**
 * Shows the dialog and associates the join action with the given game.
 * @param {!yugi.landing.model.Game} game The game to associate with the join.
 */
yugi.landing.ui.launcher.GameJoinPrompt.prototype.show = function(game) {
  this.game_ = game;
  this.setVisible(true);

  // Pull the existing player name, if there was one and set it.
  var playerName = this.player_.getSavedName();
  if (playerName) {
    this.playerNameInput_.setValue(playerName);
  }

  this.playerNameInput_.focusAndSelect();
};


/**
 * Joins the existing game.
 * @private
 */
yugi.landing.ui.launcher.GameJoinPrompt.prototype.joinGame_ = function() {
  this.logger.info('Joining a game game.');

  if (!this.game_) {
    this.logger.severe('No game model associated at the time of joining.');
    return;
  }

  // If the user specified a player name, save it for next time.
  var playerNameValue = this.playerNameInput_.getValue();
  if (playerNameValue) {
    this.player_.saveName(playerNameValue);
  }

  var playerName = playerNameValue || this.playerNameInput_.getLabel();

  this.game_.join(playerName);
};
