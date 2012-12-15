/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.deck.editor');
goog.provide('yugi.deck.editor.Main');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('yugi.Main');
goog.require('yugi.deck.editor.model.Constructor');
goog.require('yugi.deck.editor.model.UiState');
goog.require('yugi.deck.editor.ui.Name');
goog.require('yugi.deck.editor.ui.Status');
goog.require('yugi.deck.editor.ui.Swapper');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.Search');
goog.require('yugi.model.Selection');
goog.require('yugi.model.User');
goog.require('yugi.service.AuthService');
goog.require('yugi.service.DeckService');
goog.require('yugi.ui.footer.Footer');
goog.require('yugi.ui.header.Header');
goog.require('yugi.ui.selection.Selection');



/**
 * The container for all the main components of the application.
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} deckKey The key to the deck or empty if this is for a new
 *     deck.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.deck.editor.Main = function(
    baseLoginUrl, signInUrl, signOutUrl, userJson, deckKey) {
  goog.base(this);

  // Create all of the model/service classes.
  var authService = yugi.service.AuthService.register(baseLoginUrl);
  var user = yugi.model.User.register(userJson);
  var selectionModel = yugi.model.Selection.register();
  var deckService = yugi.service.DeckService.register();
  var uiState = yugi.deck.editor.model.UiState.register();
  var search = yugi.model.Search.register();
  var notifier = yugi.model.Notifier.register();
  var constructor = yugi.deck.editor.model.Constructor.register(notifier,
      deckService);

  // Render all of the UI components.
  var dom = goog.dom.getDomHelper();
  var mainElement = dom.getElement('main');

  // Header
  var header = new yugi.ui.header.Header(signInUrl, signOutUrl);
  header.render(dom.getElement('header'));

  // Footer
  var footer = new yugi.ui.footer.Footer();
  footer.render(dom.getElement('footer'));

  // Name and State components
  var nameAndStatusElement = dom.getElement('name-status');
  var name = new yugi.deck.editor.ui.Name();
  name.render(nameAndStatusElement);
  var status = new yugi.deck.editor.ui.Status();
  status.render(nameAndStatusElement);

  // Selection
  var selectionUi = new yugi.ui.selection.Selection();
  selectionUi.render(mainElement);

  // Swapper
  var swapper = new yugi.deck.editor.ui.Swapper();
  swapper.render(mainElement);

  // Register all the disposables.
  this.registerDisposable(header);
  this.registerDisposable(selectionUi);
  this.registerDisposable(swapper);
  this.registerDisposable(selectionModel);
  this.registerDisposable(deckService);
  this.registerDisposable(constructor);
  this.registerDisposable(uiState);
  this.registerDisposable(search);
  this.registerDisposable(notifier);
  this.registerDisposable(user);
  this.registerDisposable(authService);

  // Start loading the deck.
  if (deckKey) {
    deckService.load(deckKey);
  }
};
goog.inherits(yugi.deck.editor.Main, yugi.Main);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.Main.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.deck.editor.Main');


/**
 * Main entry point to the program.  All bootstrapping happens here.
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} deckKey The key to the deck or empty if this is for a new
 *     deck.
 */
yugi.deck.editor.bootstrap = function(
    baseLoginUrl, signInUrl, signOutUrl, userJson, deckKey) {
  new yugi.deck.editor.Main(
      baseLoginUrl, signInUrl, signOutUrl, userJson, deckKey);
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.deck.editor.bootstrap', yugi.deck.editor.bootstrap);
