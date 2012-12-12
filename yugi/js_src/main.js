/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.Main');

goog.require('goog.Disposable');
goog.require('goog.debug.Console');
/** @suppress {extraRequire} Added for compilation warnings. */
goog.require('goog.debug.ErrorHandler');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
/** @suppress {extraRequire} Added for compilation warnings. */
goog.require('goog.net.XhrLite');
goog.require('yugi.Config');
/** @suppress {extraRequire} */
goog.require('yugi.model.CardCache');



/**
 * The container for all the main components of the application.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.Main = function() {
  goog.base(this);

  /**
   * @type {!yugi.Config}
   * @private
   */
  this.config_ = yugi.Config.register(window.location.href);
  this.registerDisposable(this.config_);

  // Set up logging for the entire application.
  if (!goog.debug.Console.instance) {
    goog.debug.Console.instance = new goog.debug.Console();
  }
  var console = goog.debug.Console.instance;
  console.addFilter('goog.ui.ComboBox');
  console.setCapturing(true);

  if (yugi.Config.isDevMode() || yugi.Config.isRawMode()) {
    goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.INFO);
  } else {
    goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.WARNING);
  }
  this.logger.info('Finished setting up logging');

  // Register an unload event to properly clean up resources.
  window.onbeforeunload = goog.bind(this.onUnload, this);
};
goog.inherits(yugi.Main, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.Main.prototype.logger = goog.debug.Logger.getLogger('yugi.Main');


/**
 * Called when the application unloads.
 */
yugi.Main.prototype.onUnload = function() {
  this.beforeUnload();
  this.disposeInternal();
};


/**
 * Called before the window closes.  Implement this function to perform any
 * special non-disposal clean up.  Still override the dispose internal for
 * object clean up.
 * @protected
 */
yugi.Main.prototype.beforeUnload = goog.nullFunction;
