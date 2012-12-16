/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.deck.manager');
goog.provide('yugi.deck.manager.Main');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('yugi.Main');
goog.require('yugi.deck.manager.model.Decks');
goog.require('yugi.deck.manager.ui.DecksViewer');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.User');
goog.require('yugi.service.AuthService');
goog.require('yugi.service.DeckService');
goog.require('yugi.service.DecksService');
goog.require('yugi.ui.footer.Footer');
goog.require('yugi.ui.header.Header');
goog.require('yugi.util.deck');



/**
 * The container for all the main components of the application.
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @param {string} userJson The user object as raw JSON.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.deck.manager.Main =
    function(baseLoginUrl, signInUrl, signOutUrl, userJson) {
  goog.base(this);

  // Create all of the model/service classes.
  var authService = yugi.service.AuthService.register(baseLoginUrl);
  var user = yugi.model.User.register(userJson);
  var decksService = yugi.service.DecksService.register();
  var deckService = yugi.service.DeckService.register();
  var decks = yugi.deck.manager.model.Decks.register(deckService);
  var notifier = yugi.model.Notifier.register();

  // Render all of the UI components.
  var dom = goog.dom.getDomHelper();

  // Header
  var header = new yugi.ui.header.Header(signInUrl, signOutUrl);
  header.render(dom.getElement('header'));

  // Main content
  var decksViewer = new yugi.deck.manager.ui.DecksViewer();
  decksViewer.render(dom.getElement('main'));

  // Footer
  var footer = new yugi.ui.footer.Footer();
  footer.render(dom.getElement('footer'));

  // Register all the disposables.
  this.registerDisposable(header);
  this.registerDisposable(decksViewer);
  this.registerDisposable(decksService);
  this.registerDisposable(deckService);
  this.registerDisposable(decks);
  this.registerDisposable(notifier);
  this.registerDisposable(user);
  this.registerDisposable(authService);

  // Load the decks.
  if (yugi.util.deck.isStructureDeckRequest(window.location.href)) {
    decksService.loadStructureDecks();
  } else {
    decksService.loadUserDecks();
  }
};
goog.inherits(yugi.deck.manager.Main, yugi.Main);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.manager.Main.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.deck.manager.Main');


/**
 * Main entry point to the program.  All bootstrapping happens here.
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @param {string} userJson The user object as raw JSON.
 */
yugi.deck.manager.bootstrap =
    function(baseLoginUrl, signInUrl, signOutUrl, userJson) {
  new yugi.deck.manager.Main(baseLoginUrl, signInUrl, signOutUrl, userJson);
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.deck.manager.bootstrap', yugi.deck.manager.bootstrap);
