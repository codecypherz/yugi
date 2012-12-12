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
goog.require('goog.net.XhrIo');
goog.require('yugi.Config');
goog.require('yugi.model.Deck');



/**
 * Service for dealing with multiple decks.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.service.DecksService = function() {
  goog.base(this);

  /**
   * This is used to make queries to the server.
   * @type {!goog.net.XhrIo}
   * @private
   */
  this.loadXhrIo_ = new goog.net.XhrIo();
  this.registerDisposable(this.loadXhrIo_);

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  // Listen to the XHR object.
  this.handler_.listen(this.loadXhrIo_,
      goog.net.EventType.ERROR,
      this.onLoadError_);
  this.handler_.listen(this.loadXhrIo_,
      goog.net.EventType.COMPLETE,
      this.onLoadComplete_);
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
 * Queries the server for all the decks.
 */
yugi.service.DecksService.prototype.load = function() {
  this.logger.info('Fetching decks');

  // Send the query and wait for the response.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.DECKS);
  this.loadXhrIo_.send(uri);
};


/**
 * Called when the query fails for some reason.
 * @private
 */
yugi.service.DecksService.prototype.onLoadError_ = function() {
  this.logger.severe('Failed to load decks.');
  this.dispatchEvent(yugi.service.DecksService.EventType.LOAD_ERROR);
};


/**
 * Called when the query succeeds.  The data is deserialized and processed.
 * @private
 */
yugi.service.DecksService.prototype.onLoadComplete_ = function() {
  this.logger.info('The server returned the JSON for decks.');

  // Grab the JSON from the response.
  var json = this.loadXhrIo_.getResponseJson();
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
  this.dispatchEvent(new yugi.service.DecksService.LoadEvent(decks));
};



/**
 * The event that gets dispatched when the mode changes.
 * @param {!Array.<!yugi.model.Deck>} decks The decks that just got loaded.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.service.DecksService.LoadEvent = function(decks) {
  goog.base(this, yugi.service.DecksService.EventType.LOADED);

  /**
   * @type {!Array.<!yugi.model.Deck>}
   */
  this.decks = decks;
};
goog.inherits(yugi.service.DecksService.LoadEvent, goog.events.Event);
