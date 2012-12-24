/**
 * Service for things related to authentiaction.
 */

goog.provide('yugi.service.AuthService');

goog.require('goog.Disposable');
goog.require('goog.Uri');
goog.require('yugi.Config');
goog.require('yugi.model.User');



/**
 * Service for things related to authentication.
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.service.AuthService = function(baseLoginUrl, signInUrl, signOutUrl) {
  goog.base(this);

  /**
   * The base URL used for logging in a user.
   * @type {!goog.Uri}
   * @private
   */
  this.baseLoginUri_ = goog.Uri.parse(baseLoginUrl);

  /**
   * @type {string}
   * @private
   */
  this.signInUrl_ = signInUrl;

  /**
   * @type {string}
   * @private
   */
  this.signOutUrl_ = signOutUrl;

  /**
   * @type {!yugi.model.User}
   * @private
   */
  this.user_ = yugi.model.User.get();

  // Clear the parameter value.
  this.baseLoginUri_.setParameterValue(
      yugi.service.AuthService.CONTINUE_PARAM_, '');
};
goog.inherits(yugi.service.AuthService, goog.Disposable);


/**
 * @type {!yugi.service.AuthService}
 * @private
 */
yugi.service.AuthService.instance_;


/**
 * The continue parameter on the login URL.
 * @type {string}
 * @private
 * @const
 */
yugi.service.AuthService.CONTINUE_PARAM_ = 'continue';


/**
 * Registers an instance of the service.
 * @param {string} baseLoginUrl The base URL for login.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @return {!yugi.service.AuthService} The registered instance.
 */
yugi.service.AuthService.register = function(
    baseLoginUrl, signInUrl, signOutUrl) {
  yugi.service.AuthService.instance_ = new yugi.service.AuthService(
      baseLoginUrl, signInUrl, signOutUrl);
  return yugi.service.AuthService.get();
};


/**
 * @return {!yugi.service.AuthService} The service for the auth service.
 */
yugi.service.AuthService.get = function() {
  return yugi.service.AuthService.instance_;
};


/** @return {string} The URL to visit to sign in. */
yugi.service.AuthService.prototype.getSignInUrl = function() {
  return this.signInUrl_;
};


/** @return {string} The URL to visit to sign out. */
yugi.service.AuthService.prototype.getSignOutUrl = function() {
  return this.signOutUrl_;
};


/**
 * Builds a URL that will allow the user to login and automatically navigate to
 * the destination URL if they are not already logged in.  If the user is logged
 * in, then the user will navigate to directly to the destination.  If a JS mode
 * is specified, it will automatically be added to the destination URL.  The
 * destination URL must not be escaped.
 * @param {string} destinationUrl The destination for the user after login.
 * @return {string} The URL that can be followed to login and navigate.
 */
yugi.service.AuthService.prototype.buildUrl = function(destinationUrl) {

  var destination = goog.Uri.parse(destinationUrl);

  // Forward the mode parameter.
  if (yugi.Config.isDevMode() || yugi.Config.isRawMode()) {
    destination.setParameterValue(
        yugi.Config.UrlParameter.MODE, yugi.Config.getMode());
  }

  if (this.user_.isSignedIn()) {

    // Just use the destination with the mode param if the user is signed in.
    return destination.toString();
  } else {

    // Use the base login URL if the user is not signed in.
    var uri = this.baseLoginUri_.clone();
    uri.setParameterValue(
        yugi.service.AuthService.CONTINUE_PARAM_, destination.toString());
    return uri.toString();
  }
};
