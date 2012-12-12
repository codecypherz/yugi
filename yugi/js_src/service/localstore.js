/**
 * Defines the yugi.service.LocalStore class.
 */

goog.provide('yugi.service.LocalStore');
goog.provide('yugi.service.LocalStore.Key');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.net.Cookies');



/**
 * Constructs the service for storing information locally.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.service.LocalStore = function() {
  goog.base(this);

  /**
   * @type {!goog.net.Cookies}
   * @private
   */
  this.cookies_ = new goog.net.Cookies(goog.dom.getDocument());

  // Cookies may or may not be available.
  if (!this.cookies_.isEnabled()) {
    this.logger.warning('Cookies are not enabled.');
  }
};
goog.inherits(yugi.service.LocalStore, goog.Disposable);


/**
 * The keys used in local storage.  They must all be specified here to avoid
 * collision throughout the application.
 * @enum {string}
 */
yugi.service.LocalStore.Key = {
  PLAYER_NAME: 'player-name'
};


/**
 * This is the maximum integer allowed for a signed 32-bit integer.
 * @type {number}
 * @const
 */
yugi.service.LocalStore.MAX_AGE = 2147483647;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.service.LocalStore.prototype.logger =
    goog.debug.Logger.getLogger('yugi.service.LocalStore');


/**
 * @type {!yugi.service.LocalStore}
 * @private
 */
yugi.service.LocalStore.instance_;


/**
 * Registers an instance of the service.
 * @return {!yugi.service.LocalStore} The registered instance.
 */
yugi.service.LocalStore.register = function() {
  yugi.service.LocalStore.instance_ = new yugi.service.LocalStore();
  return yugi.service.LocalStore.get();
};


/**
 * @return {!yugi.service.LocalStore} The service for local persistence.
 */
yugi.service.LocalStore.get = function() {
  return yugi.service.LocalStore.instance_;
};


/**
 * Stores a value locally by the key.
 * @param {!yugi.service.LocalStore.Key} key The storage key.
 * @param {string} value The value to store.
 * @param {number=} opt_maxAge  The max age in seconds (from now). Use -1 to
 *     set a session cookie. If not provided, the default is -1
 *     (i.e. set a session cookie).
 */
yugi.service.LocalStore.prototype.put = function(key, value, opt_maxAge) {
  var logInfo = '(' + key + ', ' + value + ')';
  try {
    this.cookies_.set(key, value, opt_maxAge);
    this.logger.info('Just stored this: ' + logInfo);
  } catch (e) {
    this.logger.severe('Failed to put: ' + logInfo, e);
  }
};


/**
 * Gets the value for the key.
 * @param {!yugi.service.LocalStore.Key} key The storage key.
 * @return {string|undefined} The stored value or undefined if there wasn't one.
 */
yugi.service.LocalStore.prototype.get = function(key) {
  return this.cookies_.get(key);
};
