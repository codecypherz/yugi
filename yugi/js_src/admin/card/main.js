/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.admin.card');
goog.provide('yugi.admin.card.Main');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('yugi.Main');
goog.require('yugi.admin.card.model.Loader');
goog.require('yugi.admin.card.ui.Editor');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.User');
goog.require('yugi.service.AuthService');
goog.require('yugi.ui.footer.Footer');
goog.require('yugi.ui.header.Header');



/**
 * The container for all the main components of the application.
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} uploadUrl The upload URL for the card image.  This is created
 *     server-side by the blobstore service.
 * @param {string} cardKey The key for the card to edit, or empty if the editor
 *     is meant for a new card.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.admin.card.Main = function(
    baseLoginUrl, signInUrl, signOutUrl, userJson, uploadUrl, cardKey) {
  goog.base(this);

  this.logger.info('Blobstore Upload URL: ' + uploadUrl);
  this.logger.info('Card Key: ' + cardKey);

  // Create all of the model/service classes.
  var authService = yugi.service.AuthService.register(baseLoginUrl);
  var user = yugi.model.User.register(userJson);
  var loader = yugi.admin.card.model.Loader.register(cardKey);
  var notifier = yugi.model.Notifier.register();

  // Render all of the UI components.
  var dom = goog.dom.getDomHelper();

  // Header
  var header = new yugi.ui.header.Header(signInUrl, signOutUrl);
  header.render(dom.getElement('header'));

  // Footer
  var footer = new yugi.ui.footer.Footer();
  footer.render(dom.getElement('footer'));

  // Main content
  var editor = new yugi.admin.card.ui.Editor(uploadUrl);
  editor.render(dom.getElement('main'));

  // Register all the disposables.
  this.registerDisposable(header);
  this.registerDisposable(editor);
  this.registerDisposable(loader);
  this.registerDisposable(notifier);
  this.registerDisposable(user);
  this.registerDisposable(authService);
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
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} uploadUrl The upload URL for the card image.  This is created
 *     server-side by the blobstore service.
 * @param {string} cardKey The key for the card to edit, or empty if the editor
 *     is meant for a new card.
 */
yugi.admin.card.bootstrap = function(
    baseLoginUrl, signInUrl, signOutUrl, userJson, uploadUrl, cardKey) {
  new yugi.admin.card.Main(
      baseLoginUrl, signInUrl, signOutUrl, userJson, uploadUrl, cardKey);
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.admin.card.bootstrap', yugi.admin.card.bootstrap);
