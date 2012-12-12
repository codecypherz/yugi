/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.admin.search');
goog.provide('yugi.admin.search.Main');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('yugi.Main');
goog.require('yugi.admin.search.ui.Search');
goog.require('yugi.admin.ui.Header');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.Search');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.selection.Selection');



/**
 * The container for all the main components of the application.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.admin.search.Main = function() {
  goog.base(this);

  // Create all of the model/service classes.
  var selectionModel = yugi.model.Selection.register();
  var searchModel = yugi.model.Search.register();
  var notifier = yugi.model.Notifier.register();

  // Render all of the UI components.
  var centeredDiv = goog.dom.createDom(goog.dom.TagName.DIV, {
    'id': 'centered-content'
  });

  // Render the top level components.
  var dom = goog.dom.getDomHelper();
  var header = new yugi.admin.ui.Header('Card Search');
  header.createDom();
  dom.appendChild(centeredDiv, header.getElement());

  var selectionComponent = new yugi.ui.selection.Selection();
  selectionComponent.createDom();
  dom.appendChild(centeredDiv, selectionComponent.getElement());

  var searchComponent = new yugi.admin.search.ui.Search();
  searchComponent.createDom();
  dom.appendChild(centeredDiv, searchComponent.getElement());

  // Do one giant HTML modification.
  goog.dom.getDocument().body.appendChild(centeredDiv);
  header.enterDocument();
  selectionComponent.enterDocument();
  searchComponent.enterDocument();

  // Register all the disposables.
  this.registerDisposable(header);
  this.registerDisposable(selectionComponent);
  this.registerDisposable(searchComponent);
  this.registerDisposable(selectionModel);
  this.registerDisposable(searchModel);
  this.registerDisposable(notifier);
};
goog.inherits(yugi.admin.search.Main, yugi.Main);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.admin.search.Main.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.admin.search.Main');


/**
 * Main entry point to the program.  All bootstrapping happens here.
 */
yugi.admin.search.bootstrap = function() {
  new yugi.admin.search.Main();
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.admin.search.bootstrap', yugi.admin.search.bootstrap);
