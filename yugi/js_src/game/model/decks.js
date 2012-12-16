/**
 * Keeps track of the user and structure deck information.
 */

goog.provide('yugi.game.model.Decks');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('yugi.service.DecksService');



/**
 * Loads and keeps track of both the user's decks and structure decks.
 * @param {!yugi.service.DecksService} decksService The decks service.
 * @param {!yugi.model.User} user The user model.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.model.Decks = function(decksService, user) {
  goog.base(this);

  /**
   * @type {!yugi.service.DecksService}
   * @private
   */
  this.decksService_ = decksService;

  /**
   * @type {!yugi.model.User}
   * @private
   */
  this.user_ = user;

  /**
   * @type {?string}
   * @private
   */
  this.structureDecksRequestId_ = null;

  /**
   * @type {?string}
   * @private
   */
  this.userDecksRequestId_ = null;

  /**
   * @type {Array.<!yugi.model.Deck>}
   * @private
   */
  this.structureDecks_ = null;

  /**
   * @type {Array.<!yugi.model.Deck>}
   * @private
   */
  this.userDecks_ = null;

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  handler.listen(this.decksService_,
      yugi.service.DecksService.EventType.LOADED,
      this.onLoad_);
  handler.listen(this.decksService_,
      yugi.service.DecksService.EventType.LOAD_ERROR,
      this.onLoadError_);
};
goog.inherits(yugi.game.model.Decks, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.model.Decks.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.model.Decks');


/**
 * The events dispatched by this model.
 * @enum {string}
 */
yugi.game.model.Decks.EventType = {
  STRUCTURE_DECKS_LOADED: goog.events.getUniqueId('structure-decks-loaded'),
  USER_DECKS_LOADED: goog.events.getUniqueId('user-decks-loaded')
};


/**
 * @type {!yugi.game.model.Decks}
 * @private
 */
yugi.game.model.Decks.instance_;


/**
 * Registers an instance of the decks model.
 * @param {!yugi.service.DecksService} decksService The decks service.
 * @param {!yugi.model.User} user The user model.
 * @return {!yugi.game.model.Decks} The registered instance.
 */
yugi.game.model.Decks.register = function(decksService, user) {
  yugi.game.model.Decks.instance_ = new yugi.game.model.Decks(
      decksService, user);
  return yugi.game.model.Decks.get();
};


/**
 * @return {!yugi.game.model.Decks} The decks model.
 */
yugi.game.model.Decks.get = function() {
  return yugi.game.model.Decks.instance_;
};


/**
 * Loads all the decks for the user and all the structure decks.  This is a
 * shallow query which should be just enough to show the user which decks to
 * choose from.  A deeper query needs to be made once the user selects.
 * Note that if the user is not signed in, their decks will not be queried.
 */
yugi.game.model.Decks.prototype.load = function() {
  this.structureDecksRequestId_ = this.decksService_.loadStructureDecks();
  if (this.user_.isSignedIn()) {
    this.userDecksRequestId_ = this.decksService_.loadUserDecks();
  }
};


/**
 * @return {Array.<!yugi.model.Deck>} The structure decks.  Will be null until
 *     the request completes successfully.
 */
yugi.game.model.Decks.prototype.getStructureDecks = function() {
  return this.structureDecks_;
};


/**
 * @return {Array.<!yugi.model.Deck>} The user decks.  Will be null until the
 *     request completes successfully.
 */
yugi.game.model.Decks.prototype.getUserDecks = function() {
  return this.userDecks_;
};


/**
 * Called when a request succeeds.
 * @param {!yugi.service.DecksService.LoadEvent} e The load event.
 * @private
 */
yugi.game.model.Decks.prototype.onLoad_ = function(e) {
  if (e.requestId == this.structureDecksRequestId_) {
    this.logger.info('The structure decks loaded.');
    this.structureDecks_ = e.decks;
    this.dispatchEvent(yugi.game.model.Decks.EventType.STRUCTURE_DECKS_LOADED);
  } else if (e.requestId == this.userDecksRequestId_) {
    this.logger.info('The user\'s decks loaded.');
    this.userDecks_ = e.decks;
    this.dispatchEvent(yugi.game.model.Decks.EventType.USER_DECKS_LOADED);
  } else {
    this.logger.info(
        'Ignoring a decks loaded event because the request ID did not match.');
  }
};


/**
 * Called when a request fails.
 * @param {!yugi.service.DecksService.LoadErrorEvent} e The load event.
 * @private
 */
yugi.game.model.Decks.prototype.onLoadError_ = function(e) {
  if (e.requestId == this.structureDecksRequestId_) {
    this.logger.severe('The structure decks failed to load.');
  } else if (e.requestId == this.userDecksRequestId_) {
    this.logger.severe('The user\'s decks failed to load.');
  } else {
    this.logger.info('Ignoring a decks load failed event because the ' +
        'request Id did not match.');
  }
};
