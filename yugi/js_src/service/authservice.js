/**
 * Service for things related to authentiaction.
 */

goog.provide('yugi.service.AuthService');

goog.require('goog.Disposable');
goog.require('goog.Uri');
goog.require('yugi.Config');



/**
 * Service for things related to authentication.
 * @param {string} baseLoginUrl The base URL for login.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.service.AuthService = function(baseLoginUrl) {
  goog.base(this);

  /**
   * The base URL used for logging in a user.
   * @type {!goog.Uri}
   * @private
   */
  this.baseLoginUri_ = goog.Uri.parse(baseLoginUrl);

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
 * @return {!yugi.service.AuthService} The registered instance.
 */
yugi.service.AuthService.register = function(baseLoginUrl) {
  yugi.service.AuthService.instance_ = new yugi.service.AuthService(
      baseLoginUrl);
  return yugi.service.AuthService.get();
};


/**
 * @return {!yugi.service.AuthService} The service for the auth service.
 */
yugi.service.AuthService.get = function() {
  return yugi.service.AuthService.instance_;
};


/**
 * Builds a URL that will allow the user to login and automatically navigate to
 * the destination URL.  If a JS mode is specified, it will automatically be
 * added to the destination URL.  The destination URL must not be escaped.
 * @param {string} destinationUrl The destination for the user after login.
 * @return {string} The URL that can be followed to login and navigate.
 */
yugi.service.AuthService.prototype.buildLoginUrl = function(destinationUrl) {

  var destination = goog.Uri.parse(destinationUrl);

  // Forward the mode parameter.
  if (yugi.Config.isDevMode() || yugi.Config.isRawMode()) {
    destination.setParameterValue(
        yugi.Config.UrlParameter.MODE, yugi.Config.getMode());
  }

  var uri = this.baseLoginUri_.clone();
  uri.setParameterValue(
      yugi.service.AuthService.CONTINUE_PARAM_, destination.toString());

  return uri.toString();
};
