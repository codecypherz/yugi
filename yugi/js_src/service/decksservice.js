/**
 * Service for dealing with multiple decks.
 */

goog.provide('yugi.service.DecksService');
goog.provide('yugi.service.DecksService.EventType');
goog.provide('yugi.service.DecksService.LoadEvent');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrManager');
goog.require('goog.ui.IdGenerator');
goog.require('yugi.Config');
goog.require('yugi.model.Deck');
goog.require('yugi.util.deck');



/**
 * Service for dealing with multiple decks.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.service.DecksService = function() {
  goog.base(this);

  /**
   * Generator for unique IDs to be used for requests on the XHR manager.
   * @type {!goog.ui.IdGenerator}
   * @private
   */
  this.idGenerator_ = goog.ui.IdGenerator.getInstance();

  /**
   * The manager of a pool of XHR objects.  All requests are done through this
   * manager.
   * @type {!goog.net.XhrManager}
   * @private
   */
  this.xhrManager_ = new goog.net.XhrManager();
  this.registerDisposable(this.xhrManager_);

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  // Listen for when requests finish.
  handler.listen(this.xhrManager_,
      goog.net.EventType.ERROR,
      this.onLoadError_);
  handler.listen(this.xhrManager_,
      goog.net.EventType.SUCCESS,
      this.onLoadSuccess_);
};
goog.inherits(yugi.service.DecksService, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.service.DecksService.prototype.logger =
    goog.debug.Logger.getLogger('yugi.service.DecksService');


/**
 * @type {!yugi.service.DecksService}
 * @private
 */
yugi.service.DecksService.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.service.DecksService.EventType = {
  LOAD_ERROR: goog.events.getUniqueId('load-error'),
  LOADED: goog.events.getUniqueId('loaded')
};


/**
 * Registers an instance of the model.
 * @return {!yugi.service.DecksService} The registered instance.
 */
yugi.service.DecksService.register = function() {
  yugi.service.DecksService.instance_ = new yugi.service.DecksService();
  return yugi.service.DecksService.get();
};


/**
 * @return {!yugi.service.DecksService} The model for the loader.
 */
yugi.service.DecksService.get = function() {
  return yugi.service.DecksService.instance_;
};


/**
 * Loads all the structure decks.
 * @return {string} The ID of the request used.
 */
yugi.service.DecksService.prototype.loadStructureDecks = function() {
  return this.load_(true);
};


/**
 * Loads all the user's decks.
 * @return {string} The ID of the request used.
 */
yugi.service.DecksService.prototype.loadUserDecks = function() {
  return this.load_(false);
};


/**
 * Queries the server for decks.  This does a shallow query.  All the card
 * information is not fetched.
 * @param {boolean} structureDecks True if the structure decks should be
 *     fetched, false if the user's decks should be fetched.
 * @return {string} The ID of the request used.
 * @private
 */
yugi.service.DecksService.prototype.load_ = function(structureDecks) {

  // Create the request URL.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.DECKS);

  // Tweak the request depending on the set of decks desired.
  if (structureDecks) {
    this.logger.info('Requesting structure decks.');
    yugi.util.deck.setStructureDeckRequest(uri, true);
  } else {
    this.logger.info('Requesting user decks.');
  }

  // Send the request.
  var requestId = this.idGenerator_.getNextUniqueId();
  this.xhrManager_.send(requestId, uri.toString());
  return requestId;
};


/**
 * Called when the query fails for some reason.
 * @param {!goog.net.XhrManager.Event} e The error event.
 * @private
 */
yugi.service.DecksService.prototype.onLoadError_ = function(e) {
  this.logger.severe('Failed to load decks.');
  this.dispatchEvent(new yugi.service.DecksService.LoadErrorEvent(e.id));
};


/**
 * Called when the query succeeds.  The data is deserialized and processed.
 * @param {!goog.net.XhrManager.Event} e The error event.
 * @private
 */
yugi.service.DecksService.prototype.onLoadSuccess_ = function(e) {
  this.logger.info('The server returned the JSON for decks.');

  // Grab the JSON from the response.
  var json = e.xhrIo.getResponseJson();
  if (!json) {
    this.logger.severe('The JSON from the server was invalid.');
    return;
  }

  // Parse each deck's info.
  var decks = new Array();
  goog.array.forEach(json['decks'], function(deckJson) {
    var deck = new yugi.model.Deck();
    deck.setFromJson(deckJson);
    decks.push(deck);
  });
  this.logger.info(decks.length + ' deck(s) finished loading.');

  // Notify the decks have been loaded.
  this.dispatchEvent(new yugi.service.DecksService.LoadEvent(e.id, decks));
};



/**
 * The event that gets dispatched when a load request fails.
 * @param {string} requestId The ID of the request.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.service.DecksService.LoadErrorEvent = function(requestId) {
  goog.base(this, yugi.service.DecksService.EventType.LOAD_ERROR);

  /**
   * @type {string}
   */
  this.requestId = requestId;
};
goog.inherits(yugi.service.DecksService.LoadErrorEvent, goog.events.Event);



/**
 * The event that gets dispatched when the mode changes.
 * @param {string} requestId The ID of the request.
 * @param {!Array.<!yugi.model.Deck>} decks The decks that just got loaded.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.service.DecksService.LoadEvent = function(requestId, decks) {
  goog.base(this, yugi.service.DecksService.EventType.LOADED);

  /**
   * @type {string}
   */
  this.requestId = requestId;

  /**
   * @type {!Array.<!yugi.model.Deck>}
   */
  this.decks = decks;
};
goog.inherits(yugi.service.DecksService.LoadEvent, goog.events.Event);
