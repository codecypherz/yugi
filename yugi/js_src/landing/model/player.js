/**
 * Defines the yugi.landing.model.Player class.
 */

goog.provide('yugi.landing.model.Player');

goog.require('goog.Disposable');
goog.require('yugi.service.LocalStore');



/**
 * Model representing player data.
 * @param {!yugi.service.LocalStore} localStore The local storage service.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.landing.model.Player = function(localStore) {
  goog.base(this);

  /**
   * @type {!yugi.service.LocalStore}
   * @private
   */
  this.localStore_ = localStore;
};
goog.inherits(yugi.landing.model.Player, goog.Disposable);


/**
 * Saves the player's name.
 * @param {string} name The name to save.
 */
yugi.landing.model.Player.prototype.saveName = function(name) {
  this.localStore_.put(
      yugi.service.LocalStore.Key.PLAYER_NAME,
      name,
      yugi.service.LocalStore.MAX_AGE);
};


/**
 * Gets the player name, if it has previously been saved.
 * @return {string|undefined} The stored value or undefined if there wasn't one.
 */
yugi.landing.model.Player.prototype.getSavedName = function() {
  return this.localStore_.get(yugi.service.LocalStore.Key.PLAYER_NAME);
};


/**
 * @type {!yugi.landing.model.Player}
 * @private
 */
yugi.landing.model.Player.instance_;


/**
 * Registers an instance of the service.
 * @param {!yugi.service.LocalStore} localStore The local storage service.
 * @return {!yugi.landing.model.Player} The registered instance.
 */
yugi.landing.model.Player.register = function(localStore) {
  yugi.landing.model.Player.instance_ = new yugi.landing.model.Player(
      localStore);
  return yugi.landing.model.Player.get();
};


/**
 * @return {!yugi.landing.model.Player} The service for local persistence.
 */
yugi.landing.model.Player.get = function() {
  return yugi.landing.model.Player.instance_;
};
