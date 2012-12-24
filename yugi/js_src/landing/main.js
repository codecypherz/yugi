/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.landing');
goog.provide('yugi.landing.Main');

goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('yugi.Config');
goog.require('yugi.Main');
goog.require('yugi.landing.model.Game');
goog.require('yugi.landing.model.Games');
goog.require('yugi.landing.model.Player');
goog.require('yugi.landing.ui.launcher.GameJoinPrompt');
goog.require('yugi.landing.ui.launcher.Launcher');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.User');
goog.require('yugi.service.AuthService');
goog.require('yugi.service.LocalStore');
goog.require('yugi.ui.footer.Footer');
goog.require('yugi.ui.header.Header');



/**
 * The container for all the main components of the application.
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @param {string} userJson The user object as raw JSON.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.landing.Main = function(baseLoginUrl, signInUrl, signOutUrl, userJson) {
  goog.base(this);

  // Register all the model/server classes.
  var user = yugi.model.User.register(userJson);
  var authService = yugi.service.AuthService.register(
      baseLoginUrl, signInUrl, signOutUrl);
  var games = yugi.landing.model.Games.register();
  var notifier = yugi.model.Notifier.register();
  var localStore = yugi.service.LocalStore.register();
  var player = yugi.landing.model.Player.register(localStore);

  // Render all of the UI components.
  var dom = goog.dom.getDomHelper();

  // Header
  var header = new yugi.ui.header.Header();
  header.render(dom.getElement('header'));

  // Footer
  var footer = new yugi.ui.footer.Footer();
  footer.render(dom.getElement('footer'));

  // Main content
  var launcher = new yugi.landing.ui.launcher.Launcher();
  launcher.render(dom.getElement('main'));

  // Register all the disposables.
  this.registerDisposable(header);
  this.registerDisposable(launcher);
  this.registerDisposable(games);
  this.registerDisposable(notifier);
  this.registerDisposable(user);
  this.registerDisposable(authService);

  // Handle any error messages.
  this.handleErrorMessages_();

  // See if the user used one of the join links and prompt them if they did.
  this.maybePromptUserToJoin_();
};
goog.inherits(yugi.landing.Main, yugi.Main);


/**
 * The CSS classes used by this component.
 * @enum {string}
 * @private
 */
yugi.landing.Main.Css_ = {
  LEFT: goog.getCssName('left'),
  RIGHT: goog.getCssName('right'),
  STRIPE: goog.getCssName('yugi-stripe')
};


/**
 * Displays any error messages based on the errors set in the URL.
 * @private
 */
yugi.landing.Main.prototype.handleErrorMessages_ = function() {

  // See if there even was an error.
  var config = yugi.Config.get();
  if (config.isErrorSet()) {

    switch (config.getError()) {
      case yugi.Config.Error.GAME_NOT_FOUND:
        alert('Could not find that game.  Try refreshing the list of games.');
        break;
      case yugi.Config.Error.GAME_FULL:
        alert('The ' + config.getGameName() + ' game is already full.  ' +
            'Try refreshing the list of games.');
        break;
      default:
        break;
    }
  }
};


/**
 * If there was a game key specified in the URL, then the user used a quick join
 * link and need to be prompted for their player name before joining.
 * @private
 */
yugi.landing.Main.prototype.maybePromptUserToJoin_ = function() {
  var uri = goog.Uri.parse(window.location.href);
  var queryData = uri.getQueryData();
  var gameKey = /** @type {string} */ (
      queryData.get(yugi.Config.UrlParameter.GAME_KEY));
  if (gameKey) {
    var gameJoinPrompt = new yugi.landing.ui.launcher.GameJoinPrompt();
    this.registerDisposable(gameJoinPrompt);
    gameJoinPrompt.render();

    var game = new yugi.landing.model.Game(gameKey, '');
    gameJoinPrompt.show(game);
  }
};


/**
 * Main entry point to the program.  All bootstrapping happens here.
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @param {string} userJson The user object as raw JSON.
 */
yugi.landing.bootstrap =
    function(baseLoginUrl, signInUrl, signOutUrl, userJson) {
  new yugi.landing.Main(baseLoginUrl, signInUrl, signOutUrl, userJson);
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.landing.bootstrap', yugi.landing.bootstrap);
