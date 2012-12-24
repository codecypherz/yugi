/**
 * Service for things related to authentication.
 */

goog.provide('yugi.service.AuthService');

goog.require('goog.Disposable');



/**
 * Service for things related to authentication.
 * @param {string} signInOutUrl The URL to use to either sign in or out.
 * @param {string} deckManagerUrl The URL for the deck manager.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.service.AuthService = function(signInOutUrl, deckManagerUrl) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.signInOutUrl_ = signInOutUrl;

  /**
   * @type {string}
   * @private
   */
  this.deckManagerUrl_ = deckManagerUrl;
};
goog.inherits(yugi.service.AuthService, goog.Disposable);


/**
 * @type {!yugi.service.AuthService}
 * @private
 */
yugi.service.AuthService.instance_;


/**
 * Registers an instance of the service.
 * @param {string} signInOutUrl The URL to use to either sign in or out.
 * @param {string} deckManagerUrl The URL for the deck manager.
 * @return {!yugi.service.AuthService} The registered instance.
 */
yugi.service.AuthService.register = function(signInOutUrl, deckManagerUrl) {
  yugi.service.AuthService.instance_ = new yugi.service.AuthService(
      signInOutUrl, deckManagerUrl);
  return yugi.service.AuthService.get();
};


/**
 * @return {!yugi.service.AuthService} The service for the auth service.
 */
yugi.service.AuthService.get = function() {
  return yugi.service.AuthService.instance_;
};


/** @return {string} The URL to use to either sign in or out. */
yugi.service.AuthService.prototype.getSignInOutUrl = function() {
  return this.signInOutUrl_;
};


/** @return {string} The URL for the deck manager. */
yugi.service.AuthService.prototype.getDeckManagerUrl = function() {
  return this.deckManagerUrl_;
};
