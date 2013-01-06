/**
 * The configuration that might be used for the entire application.
 */

goog.provide('yugi.Config');
goog.provide('yugi.Config.Error');
goog.provide('yugi.Config.Mode');
goog.provide('yugi.Config.ServletPath');
goog.provide('yugi.Config.UrlParameter');

goog.require('goog.Disposable');
goog.require('goog.Uri');
goog.require('goog.object');
goog.require('goog.string');



/**
 * The configuration for the entire Yugioh application.
 * @param {string} url The URL for the application.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.Config = function(url) {
  goog.base(this);

  // Parse the URL for configuration.
  var uri = goog.Uri.parse(url);

  /**
   * @type {!yugi.Config.Mode}
   * @private
   */
  this.mode_ = yugi.Config.Mode.NORMAL;

  /**
   * @type {!yugi.Config.Error}
   * @private
   */
  this.error_ = yugi.Config.Error.NONE;

  /**
   * @type {string}
   * @private
   */
  this.gameName_ = /** @type {string} */ (uri.getParameterValue(
      yugi.Config.UrlParameter.GAME_NAME));

  // Figure out the mode of the application.
  var modeString = uri.getParameterValue(yugi.Config.UrlParameter.MODE);
  if (modeString) {
    var mode = modeString.toLowerCase();
    if (mode == yugi.Config.Mode.DEV) {
      this.mode_ = yugi.Config.Mode.DEV;
    } else if (mode == yugi.Config.Mode.RAW) {
      this.mode_ = yugi.Config.Mode.RAW;
    }
  }

  // Figure out if an error was passed.
  var errorString = /** @type {string} */ (uri.getParameterValue(
      yugi.Config.UrlParameter.ERROR));
  if (errorString) {
    var error = /** @type {yugi.Config.Error} */ (goog.object.findValue(
        yugi.Config.Error,
        function(value, key, object) {
          return goog.string.caseInsensitiveCompare(value, errorString) == 0;
        }));
    if (error) {
      this.error_ = error;
    }
  }
};
goog.inherits(yugi.Config, goog.Disposable);


/**
 * The paths to various servlets.
 * @enum {string}
 */
yugi.Config.ServletPath = {
  ADMIN_CARD: '/admin/card',
  ADMIN_CARD_DELETE: '/admin/card/delete',
  ADMIN_CARD_EXISTS: '/admin/card/exists',
  ADMIN_CARD_SEARCH: '/admin/card/search',
  CARD: '/card',
  CARD_IMAGE: '/card/image',
  CARD_SEARCH: '/card/search',
  CREATE_GAME: '/game/create',
  DECK: '/deck',
  DECK_COPY: '/deck/copy',
  DECK_DELETE: '/deck/delete',
  DECK_EDITOR: '/deck/editor',
  DECK_MANAGER: '/deck/manager',
  DECK_VIEWER: '/deck/viewer',
  DECKS: '/decks',
  DECKS_VIEWER: '/decks/viewer',
  JOIN_GAME: '/game/join',
  JOIN_QUERY: '/game/join/query',
  LANDING: '/landing',
  MESSAGE: '/m',
  MAIN: '/'
};


/**
 * The various URL parameters to the application.
 * @enum {string}
 */
yugi.Config.UrlParameter = {
  CARD_KEY: 'card_key',       // The key of the card.
  CARD_NAME: 'card_name',     // The name of a card.
  DATA: 'data',               // The data part of the message.
  DECK_KEY: 'deck_key',       // The key of the deck.
  ERROR: 'error',             // The error that occurred.
  GAME_KEY: 'game_key',       // The game's key that was assigned by the server.
  GAME_NAME: 'game_name',     // The name of the game.
  IMAGE_FILE: 'image_file',   // The image file (used in card uploading).
  MODE: 'mode',               // The mode (such as "dev" mode)
  PLAYER_NAME: 'player_name', // The name of the player.
  READ_ONLY: 'read_only',     // True if this screen is read only.
  STRUCTURE: 'structure'      // True if this is for structure decks.
};


/**
 * The various modes of the application.
 * @enum {string}
 */
yugi.Config.Mode = {
  DEV: 'dev',
  NORMAL: 'normal',
  RAW: 'raw'
};


/**
 * The kinds of errors that can occur in the application.
 * @enum {string}
 */
yugi.Config.Error = {
  GAME_FULL: 'game_full',
  GAME_NOT_FOUND: 'game_not_found',
  NONE: 'none'
};


/**
 * @type {!yugi.Config}
 * @private
 */
yugi.Config.instance_;


/**
 * Registers an instance of the configuration.
 * @param {string} url The URL for the application.
 * @return {!yugi.Config} The registered instance.
 */
yugi.Config.register = function(url) {
  yugi.Config.instance_ = new yugi.Config(url);
  return yugi.Config.get();
};


/**
 * @return {!yugi.Config} The Yugioh application configuration.
 */
yugi.Config.get = function() {
  return yugi.Config.instance_;
};


/**
 * Checks to see if we are in development mode or not.
 * @return {boolean} True if in dev mode, false otherwise.
 */
yugi.Config.isDevMode = function() {
  return yugi.Config.getMode() == yugi.Config.Mode.DEV;
};


/**
 * Checks to see if we are in raw mode or not.
 * @return {boolean} True if in raw mode, false otherwise.
 */
yugi.Config.isRawMode = function() {
  return yugi.Config.getMode() == yugi.Config.Mode.RAW;
};


/**
 * @return {!yugi.Config.Mode} The mode of the application.
 */
yugi.Config.getMode = function() {
  return yugi.Config.get().getMode();
};


/**
 * Gets the current mode of the application.
 * @return {!yugi.Config.Mode} The current mode of the application.
 */
yugi.Config.prototype.getMode = function() {
  return this.mode_;
};


/**
 * @return {string} The name of the game, if specified in the URL.
 */
yugi.Config.prototype.getGameName = function() {
  return this.gameName_;
};


/**
 * @return {boolean} True if there is an error, false otherwise.
 */
yugi.Config.prototype.isErrorSet = function() {
  return this.error_ != yugi.Config.Error.NONE;
};


/**
 * The error that occurred, if any.
 * @return {!yugi.Config.Error} The error that occurred, if any.
 */
yugi.Config.prototype.getError = function() {
  return this.error_;
};
