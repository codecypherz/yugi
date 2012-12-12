/**
 * This UI allows the user to join active, open games.
 */

goog.provide('yugi.landing.ui.launcher.GameJoiner');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.landing.model.Games');
goog.require('yugi.landing.ui.launcher.GameJoin');
goog.require('yugi.landing.ui.launcher.GameJoinPrompt');
goog.require('yugi.landing.ui.launcher.soy');



/**
 * This UI allows the user to join active, open games.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.landing.ui.launcher.GameJoiner = function() {
  goog.base(this);

  /**
   * @type {!yugi.landing.model.Games}
   * @private
   */
  this.games_ = yugi.landing.model.Games.get();

  /**
   * @type {!Array.<!yugi.landing.ui.launcher.GameJoin>}
   * @private
   */
  this.gameJoinComponents_ = new Array();

  /**
   * @type {!yugi.landing.ui.launcher.GameJoinPrompt}
   * @private
   */
  this.gameJoinPrompt_ = new yugi.landing.ui.launcher.GameJoinPrompt();
  this.addChild(this.gameJoinPrompt_);
};
goog.inherits(yugi.landing.ui.launcher.GameJoiner, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.landing.ui.launcher.GameJoiner.prototype.logger =
    goog.debug.Logger.getLogger('yugi.landing.ui.launcher.GameJoiner');


/** @override */
yugi.landing.ui.launcher.GameJoiner.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.landing.ui.launcher.soy.GAME_JOINER));
};


/** @override */
yugi.landing.ui.launcher.GameJoiner.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.games_,
      yugi.landing.model.Games.EventType.UPDATED,
      this.onGamesUpdate_);

  this.games_.refresh();
};


/**
 * Called when the list updates.
 * @param {!yugi.landing.model.Games.UpdateEvent} e The update event.
 * @private
 */
yugi.landing.ui.launcher.GameJoiner.prototype.onGamesUpdate_ = function(e) {
  this.logger.info('Refreshing game joiner based on the game list update.');

  // Remove all of the previous children.
  goog.array.forEach(this.gameJoinComponents_, function(gameJoinComponent) {
    goog.dispose(gameJoinComponent);
  });

  // TODO Have some sort of "no games" state displayed when there are no games.
  if (e.gameList.length == 0) {
    this.logger.info('There were no games found to join.');
  }

  // TODO Put all of these in a container.
  // Add all of the new children.
  goog.array.forEach(e.gameList, function(game) {
    var gameJoinComponent = new yugi.landing.ui.launcher.GameJoin(game,
        goog.bind(this.showPrompt_, this, game));
    this.gameJoinComponents_.push(gameJoinComponent);
    this.addChild(gameJoinComponent, true);
  }, this);
};


/**
 * Called when the game is ready to be joined.
 * @param {!yugi.landing.model.Game} game The game to associate with the dialog.
 * @private
 */
yugi.landing.ui.launcher.GameJoiner.prototype.showPrompt_ = function(game) {
  this.gameJoinPrompt_.show(game);
};
