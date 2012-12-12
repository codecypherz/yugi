/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.deck.editor');
goog.provide('yugi.deck.editor.Main');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('yugi.Main');
goog.require('yugi.admin.ui.Header');
goog.require('yugi.deck.editor.model.Constructor');
goog.require('yugi.deck.editor.model.UiState');
goog.require('yugi.deck.editor.ui.Name');
goog.require('yugi.deck.editor.ui.Status');
goog.require('yugi.deck.editor.ui.Swapper');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.Search');
goog.require('yugi.model.Selection');
goog.require('yugi.service.DeckService');
goog.require('yugi.ui.selection.Selection');



/**
 * The container for all the main components of the application.
 * @param {string} deckKey The key to the deck or empty if this is for a new
 *     deck.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.deck.editor.Main = function(deckKey) {
  goog.base(this);

  // Create all of the model/service classes.
  var selectionModel = yugi.model.Selection.register();
  var deckService = yugi.service.DeckService.register();
  var uiState = yugi.deck.editor.model.UiState.register();
  var search = yugi.model.Search.register();
  var notifier = yugi.model.Notifier.register();
  var constructor = yugi.deck.editor.model.Constructor.register(notifier,
      deckService);

  // Render all of the UI components.
  var centeredDiv = goog.dom.createDom(goog.dom.TagName.DIV, {
    'id': 'centered-content'
  });

  // Render the top level components.
  var dom = goog.dom.getDomHelper();
  var header = new yugi.admin.ui.Header('Deck Editor');
  header.createDom();
  dom.appendChild(centeredDiv, header.getElement());

  // Name and State components.
  var nameAndStatusDiv = goog.dom.createDom(goog.dom.TagName.DIV);

  var name = new yugi.deck.editor.ui.Name();
  name.createDom();
  dom.appendChild(nameAndStatusDiv, name.getElement());

  var status = new yugi.deck.editor.ui.Status();
  status.createDom();
  dom.appendChild(nameAndStatusDiv, status.getElement());

  dom.appendChild(centeredDiv, nameAndStatusDiv);

  var selectionUi = new yugi.ui.selection.Selection();
  selectionUi.createDom();
  dom.appendChild(centeredDiv, selectionUi.getElement());

  var swapper = new yugi.deck.editor.ui.Swapper();
  swapper.createDom();
  dom.appendChild(centeredDiv, swapper.getElement());

  // Do one giant HTML modification.
  goog.dom.getDocument().body.appendChild(centeredDiv);
  header.enterDocument();
  name.enterDocument();
  status.enterDocument();
  selectionUi.enterDocument();
  swapper.enterDocument();

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
 * @param {string} deckKey The key to the deck or empty if this is for a new
 *     deck.
 */
yugi.deck.editor.bootstrap = function(deckKey) {
  new yugi.deck.editor.Main(deckKey);
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.deck.editor.bootstrap', yugi.deck.editor.bootstrap);
