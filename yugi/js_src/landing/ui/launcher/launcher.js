/**
 * This UI allows the user to start and join games.
 */

goog.provide('yugi.landing.ui.launcher.Launcher');

goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.landing.model.Games');
goog.require('yugi.landing.ui.launcher.GameJoiner');
goog.require('yugi.landing.ui.launcher.GameStarter');
goog.require('yugi.landing.ui.launcher.soy');



/**
 * Represents the launcher UI which lets user start and join games.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.landing.ui.launcher.Launcher = function() {
  goog.base(this);

  /**
   * @type {!yugi.landing.model.Games}
   * @private
   */
  this.games_ = yugi.landing.model.Games.get();

  /**
   * This widget provides the UI for starting a new game.
   * @type {!yugi.landing.ui.launcher.GameStarter}
   * @private
   */
  this.gameStarter_ = new yugi.landing.ui.launcher.GameStarter();
  this.addChild(this.gameStarter_);

  /**
   * This widget provides the UI for joining an existing game.
   * @type {!yugi.landing.ui.launcher.GameJoiner}
   * @private
   */
  this.gameJoiner_ = new yugi.landing.ui.launcher.GameJoiner();
  this.addChild(this.gameJoiner_);
};
goog.inherits(yugi.landing.ui.launcher.Launcher, goog.ui.Component);


/**
 * DOM IDs used by this component.
 * @enum {string}
 * @private
 */
yugi.landing.ui.launcher.Launcher.Id_ = {
  GAME_JOINER: 'game-joiner',
  GAME_STARTER: 'game-starter',
  REFRESH_LINK: 'refresh-link',
  WAITING_IMAGE: 'waiting-image'
};


/**
 * CSS used by this component.
 * @enum {string}
 * @private
 */
yugi.landing.ui.launcher.Launcher.Css_ = {
  LAUNCHER: goog.getCssName('yugi-launcher')
};


/**
 * @type {Element}
 * @private
 */
yugi.landing.ui.launcher.Launcher.prototype.refreshLink_ = null;


/**
 * @type {Element}
 * @private
 */
yugi.landing.ui.launcher.Launcher.prototype.waitingImage_ = null;


/** @override */
yugi.landing.ui.launcher.Launcher.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.landing.ui.launcher.soy.LAUNCHER, {
        ids: this.makeIds(yugi.landing.ui.launcher.Launcher.Id_)
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.landing.ui.launcher.Launcher.Css_.LAUNCHER);
};


/** @override */
yugi.landing.ui.launcher.Launcher.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.gameStarter_.render(this.getElementByFragment(
      yugi.landing.ui.launcher.Launcher.Id_.GAME_STARTER));
  this.gameJoiner_.render(this.getElementByFragment(
      yugi.landing.ui.launcher.Launcher.Id_.GAME_JOINER));

  this.refreshLink_ = this.getElementByFragment(
      yugi.landing.ui.launcher.Launcher.Id_.REFRESH_LINK);
  this.waitingImage_ = this.getElementByFragment(
      yugi.landing.ui.launcher.Launcher.Id_.WAITING_IMAGE);

  this.getHandler().listen(this.refreshLink_,
      goog.events.EventType.CLICK,
      this.refresh_);

  this.getHandler().listen(this.games_,
      [yugi.landing.model.Games.EventType.WAITING,
       yugi.landing.model.Games.EventType.UPDATED],
      this.updateRefresh_);

  this.updateRefresh_();
};


/**
 * Refreshes the game list and shows the waiting image.
 * @private
 */
yugi.landing.ui.launcher.Launcher.prototype.refresh_ = function() {
  this.games_.refresh();
};


/**
 * Updates the refresh link and waiting image.
 * @private
 */
yugi.landing.ui.launcher.Launcher.prototype.updateRefresh_ = function() {
  var waiting = this.games_.isWaiting();
  goog.style.showElement(this.refreshLink_, !waiting);
  goog.style.showElement(this.waitingImage_, waiting);
};
