/**
 * The model for the user.
 */

goog.provide('yugi.model.User');

goog.require('goog.debug.Logger');
goog.require('goog.events.EventTarget');
goog.require('goog.json');



/**
 * The model for the user.
 * @param {string} userJson The user object as raw JSON.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.model.User = function(userJson) {
  goog.base(this);

  /**
   * The name of the user.
   * @type {string}
   * @private
   */
  this.name_ = '';

  /**
   * The user's email address.
   * @type {string}
   * @private
   */
  this.email_ = '';

  /**
   * Whether the user is signed in or not.
   * @type {boolean}
   * @private
   */
  this.signedIn_ = false;

  /**
   * Whether the user is an administrator or not.
   * @type {boolean}
   * @private
   */
  this.admin_ = false;

  // Try to parse the user information coming from the server.
  try {
    var json = goog.json.parse(userJson);

    this.name_ = json['name'] || '';
    this.email_ = json['email'] || '';
    this.signedIn_ = json['signed-in'] || false;
    this.admin_ = json['admin'] || false;

  } catch (e) {
    this.logger.severe('Failed to parse the user json.', e);
  }
};
goog.inherits(yugi.model.User, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.model.User.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.model.User');


/**
 * @type {!yugi.model.User}
 * @private
 */
yugi.model.User.instance_;


/**
 * Registers an instance of the model.
 * @param {string} userJson The user object as raw JSON.
 * @return {!yugi.model.User} The registered instance.
 */
yugi.model.User.register = function(userJson) {
  yugi.model.User.instance_ = new yugi.model.User(userJson);
  return yugi.model.User.get();
};


/**
 * @return {!yugi.model.User} The model for the notifier.
 */
yugi.model.User.get = function() {
  return yugi.model.User.instance_;
};


/**
 * @return {string} The name of the user, or empty if they are not signed in.
 */
yugi.model.User.prototype.getName = function() {
  return this.name_;
};


/**
 * @return {string} The email of the user, or empty if they are not signed in.
 */
yugi.model.User.prototype.getEmail = function() {
  return this.email_;
};


/**
 * @return {boolean} True if the user is signed in, false otherwise.
 */
yugi.model.User.prototype.isSignedIn = function() {
  return this.signedIn_;
};


/**
 * @return {boolean} True if the user is an administrator, false otherwise.
 */
yugi.model.User.prototype.isAdmin = function() {
  return this.admin_;
};
