/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.admin.card');
goog.provide('yugi.admin.card.Main');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('yugi.Main');
goog.require('yugi.admin.card.model.Loader');
goog.require('yugi.admin.card.ui.Editor');
goog.require('yugi.admin.ui.Header');
goog.require('yugi.model.Notifier');



/**
 * The container for all the main components of the application.
 * @param {string} uploadUrl The upload URL for the card image.  This is created
 *     server-side by the blobstore service.
 * @param {string} cardKey The key for the card to edit, or empty if the editor
 *     is meant for a new card.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.admin.card.Main = function(uploadUrl, cardKey) {
  goog.base(this);

  this.logger.info('Blobstore Upload URL: ' + uploadUrl);
  this.logger.info('Card Key: ' + cardKey);

  // Create all of the model/service classes.
  var loader = yugi.admin.card.model.Loader.register(cardKey);
  var notifier = yugi.model.Notifier.register();

  // Render all of the UI components.
  var centeredDiv = goog.dom.createDom(goog.dom.TagName.DIV, {
    'id': 'centered-content'
  });

  // Render the top level components.
  var dom = goog.dom.getDomHelper();
  var header = new yugi.admin.ui.Header('Card Editor');
  header.createDom();
  dom.appendChild(centeredDiv, header.getElement());

  var editor = new yugi.admin.card.ui.Editor(uploadUrl);
  editor.createDom();
  dom.appendChild(centeredDiv, editor.getElement());

  // Do one giant HTML modification.
  goog.dom.getDocument().body.appendChild(centeredDiv);
  header.enterDocument();
  editor.enterDocument();

  // Register all the disposables.
  this.registerDisposable(header);
  this.registerDisposable(editor);
  this.registerDisposable(loader);
  this.registerDisposable(notifier);
};
goog.inherits(yugi.admin.card.Main, yugi.Main);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.admin.card.Main.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.admin.card.Main');


/**
 * Main entry point to the program.  All bootstrapping happens here.
 * @param {string} uploadUrl The upload URL for the card image.  This is created
 *     server-side by the blobstore service.
 * @param {string} cardKey The key for the card to edit, or empty if the editor
 *     is meant for a new card.
 */
yugi.admin.card.bootstrap = function(uploadUrl, cardKey) {
  new yugi.admin.card.Main(uploadUrl, cardKey);
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.admin.card.bootstrap', yugi.admin.card.bootstrap);
