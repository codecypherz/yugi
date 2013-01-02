/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.deck.manager');
goog.provide('yugi.deck.manager.Main');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.string');
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
 * @param {string} signInOutUrl The URL to use to either sign in or out.
 * @param {string} deckManagerUrl The URL for the deck manager.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} readOnly 'true' if in read only mode.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.deck.manager.Main = function(
    signInOutUrl, deckManagerUrl, userJson, readOnly) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.deck.manager.Main');

  var isReadOnly = goog.string.caseInsensitiveCompare('true', readOnly) == 0;

  // Create all of the model/service classes.
  var user = yugi.model.User.register(userJson);
  var authService = yugi.service.AuthService.register(
      signInOutUrl, deckManagerUrl);
  var decksService = yugi.service.DecksService.register();
  var deckService = yugi.service.DeckService.register();
  var decks = yugi.deck.manager.model.Decks.register(deckService);
  var notifier = yugi.model.Notifier.register();

  // Render all of the UI components.
  var dom = goog.dom.getDomHelper();
  goog.dom.classes.enable(
      dom.getDocument().body,
      yugi.deck.manager.Main.Css_.READ_ONLY, isReadOnly);

  // Header
  var header = new yugi.ui.header.Header();
  header.render(dom.getElement('header'));

  // Main content
  var decksViewer = new yugi.deck.manager.ui.DecksViewer(isReadOnly);
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
 * @enum {string}
 * @private
 */
yugi.deck.manager.Main.Css_ = {
  READ_ONLY: goog.getCssName('yugi-read-only')
};


/**
 * Main entry point to the program.  All bootstrapping happens here.
 * @param {string} signInOutUrl The URL to use to either sign in or out.
 * @param {string} deckManagerUrl The URL for the deck manager.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} readOnly 'true' if in read only mode.
 */
yugi.deck.manager.bootstrap = function(
    signInOutUrl, deckManagerUrl, userJson, readOnly) {
  new yugi.deck.manager.Main(signInOutUrl, deckManagerUrl, userJson, readOnly);
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.deck.manager.bootstrap', yugi.deck.manager.bootstrap);
