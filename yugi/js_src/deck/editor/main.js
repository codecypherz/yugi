/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.deck.editor');
goog.provide('yugi.deck.editor.Main');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.string');
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
 * @param {string} signInOutUrl The URL to use to either sign in or out.
 * @param {string} deckManagerUrl The URL for the deck manager.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} deckKey The key to the deck or empty if this is for a new
 *     deck.
 * @param {string} readOnly 'true' if in read only mode.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.deck.editor.Main = function(
    signInOutUrl, deckManagerUrl, userJson, deckKey, readOnly) {
  goog.base(this);

  var isReadOnly = goog.string.caseInsensitiveCompare('true', readOnly) == 0;

  // Create all of the model/service classes.
  var user = yugi.model.User.register(userJson);
  var authService = yugi.service.AuthService.register(
      signInOutUrl, deckManagerUrl);
  var selectionModel = yugi.model.Selection.register();
  var deckService = yugi.service.DeckService.register();
  var uiState = yugi.deck.editor.model.UiState.register(isReadOnly);
  var search = yugi.model.Search.register();
  var notifier = yugi.model.Notifier.register();
  var constructor = yugi.deck.editor.model.Constructor.register(notifier,
      deckService);

  // Render all of the UI components.
  var dom = goog.dom.getDomHelper();
  goog.dom.classes.enable(
      dom.getDocument().body, yugi.deck.editor.Main.Css_.READ_ONLY, isReadOnly);
  var mainElement = dom.getElement('main');

  // Header
  var header = new yugi.ui.header.Header();
  this.registerDisposable(header);
  header.render(dom.getElement('header'));

  // Footer
  var footer = new yugi.ui.footer.Footer();
  footer.render(dom.getElement('footer'));

  // Name and State components
  var nameAndStatusElement = dom.getElement('name-status');
  var name = new yugi.deck.editor.ui.Name();
  this.registerDisposable(name);
  var status = new yugi.deck.editor.ui.Status();
  this.registerDisposable(status);

  // Selection
  var selectionUi = new yugi.ui.selection.Selection();
  this.registerDisposable(selectionUi);

  // Swapper
  var swapper = new yugi.deck.editor.ui.Swapper();
  this.registerDisposable(swapper);

  // Register all the disposables.
  this.registerDisposable(selectionModel);
  this.registerDisposable(deckService);
  this.registerDisposable(constructor);
  this.registerDisposable(uiState);
  this.registerDisposable(search);
  this.registerDisposable(notifier);
  this.registerDisposable(user);
  this.registerDisposable(authService);

  // Render a simple loading UI.
  var loadingDiv = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.setTextContent(loadingDiv, 'Loading...');
  mainElement.appendChild(loadingDiv);

  // Start loading the deck.
  if (deckKey) {
    deckService.load(deckKey);
  }

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  // Render more stuff after the deck loads.
  handler.listen(yugi.service.DeckService.get(),
      yugi.service.DeckService.EventType.LOADED,
      function(e) {

        // Render the deck editing UI.
        goog.dom.removeNode(loadingDiv);
        name.render(nameAndStatusElement);
        if (!isReadOnly) { // Don't render status for read only.
          status.render(nameAndStatusElement);
        }
        selectionUi.render(mainElement);
        swapper.render(mainElement);

        // Select the main card if there is one.
        var mainCard = e.deck.getMainCard();
        if (mainCard) {
          selectionModel.setSelected(mainCard, null);
        }
      });
};
goog.inherits(yugi.deck.editor.Main, yugi.Main);


/**
 * @enum {string}
 * @private
 */
yugi.deck.editor.Main.Css_ = {
  READ_ONLY: goog.getCssName('yugi-read-only')
};


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.Main.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.deck.editor.Main');


/**
 * Main entry point to the program.  All bootstrapping happens here.
 * @param {string} signInOutUrl The URL to use to either sign in or out.
 * @param {string} deckManagerUrl The URL for the deck manager.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} deckKey The key to the deck or empty if this is for a new
 *     deck.
 * @param {string} readOnly 'true' if in read only mode.
 */
yugi.deck.editor.bootstrap = function(
    signInOutUrl, deckManagerUrl, userJson, deckKey, readOnly) {
  new yugi.deck.editor.Main(
      signInOutUrl, deckManagerUrl, userJson, deckKey, readOnly);
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.deck.editor.bootstrap', yugi.deck.editor.bootstrap);
