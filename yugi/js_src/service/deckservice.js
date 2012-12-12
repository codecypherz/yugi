/**
 * Service for things related to a single deck.
 */

goog.provide('yugi.service.DeckService');
goog.provide('yugi.service.DeckService.EventType');
goog.provide('yugi.service.DeckService.LoadEvent');

goog.require('goog.Uri');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XhrManager');
goog.require('goog.ui.IdGenerator');
goog.require('yugi.Config');
goog.require('yugi.model.Deck');



/**
 * Service for things related to a single deck.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.service.DeckService = function() {
  goog.base(this);

  /**
   * Generator for unique IDs to be used for requests on the XHR manager.
   * @type {!goog.ui.IdGenerator}
   * @private
   */
  this.idGenerator_ = goog.ui.IdGenerator.getInstance();

  /**
   * The manager of a pool of XHR objects.  All requests to load a deck are done
   * through this manager.
   * @type {!goog.net.XhrManager}
   * @private
   */
  this.loadXhrManager_ = new goog.net.XhrManager();
  this.registerDisposable(this.loadXhrManager_);

  /**
   * Used for deck deletion.
   * @type {!goog.net.XhrIo}
   * @private
   */
  this.deleteXhrIo_ = new goog.net.XhrIo();
  this.registerDisposable(this.deleteXhrIo_);

  /**
   * Used for deck saving.
   * @type {!goog.net.XhrIo}
   * @private
   */
  this.saveXhrIo_ = new goog.net.XhrIo();
  this.registerDisposable(this.saveXhrIo_);

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  // Listen to the load XHR.
  this.handler_.listen(this.loadXhrManager_,
      goog.net.EventType.ERROR,
      this.onLoadError_);
  this.handler_.listen(this.loadXhrManager_,
      goog.net.EventType.COMPLETE,
      this.onLoadComplete_);

  // TODO Either refactor save/delete to use XHR managers or implement a check
  // to see if a request is in progress.

  // Listen to the delete XHR.
  this.handler_.listen(this.deleteXhrIo_,
      goog.net.EventType.ERROR,
      this.onDeleteError_);
  this.handler_.listen(this.deleteXhrIo_,
      goog.net.EventType.COMPLETE,
      this.onDeleteComplete_);

  // Listen to the saving XHR.
  this.handler_.listen(this.saveXhrIo_,
      goog.net.EventType.ERROR,
      this.onSaveError_);
  this.handler_.listen(this.saveXhrIo_,
      goog.net.EventType.COMPLETE,
      this.onSaveComplete_);
};
goog.inherits(yugi.service.DeckService, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.service.DeckService.prototype.logger =
    goog.debug.Logger.getLogger('yugi.service.DeckService');


/**
 * @type {!yugi.service.DeckService}
 * @private
 */
yugi.service.DeckService.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.service.DeckService.EventType = {
  DELETE_ERROR: goog.events.getUniqueId('delete-error'),
  DELETED: goog.events.getUniqueId('deleted'),
  LOAD_ERROR: goog.events.getUniqueId('load-error'),
  LOADED: goog.events.getUniqueId('loaded'),
  SAVE_ERROR: goog.events.getUniqueId('save-error'),
  SAVED: goog.events.getUniqueId('saved')
};


/**
 * Registers an instance of the model.
 * @return {!yugi.service.DeckService} The registered instance.
 */
yugi.service.DeckService.register = function() {
  yugi.service.DeckService.instance_ = new yugi.service.DeckService();
  return yugi.service.DeckService.get();
};


/**
 * @return {!yugi.service.DeckService} The model for the loader.
 */
yugi.service.DeckService.get = function() {
  return yugi.service.DeckService.instance_;
};


/**
 * Queries the server for a particular deck.
 * @param {string} deckKey The key of the deck to load.
 * @return {string} The ID of the request that was made.
 */
yugi.service.DeckService.prototype.load = function(deckKey) {
  if (!deckKey) {
    throw new Error('There was no deck key specified.');
  }
  this.logger.info('Loading a deck with this key: ' + deckKey);

  // Send the query and wait for the response.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.DECK);
  uri.setParameterValue(yugi.Config.UrlParameter.DECK_KEY, deckKey);

  var requestId = this.idGenerator_.getNextUniqueId();
  this.loadXhrManager_.send(requestId, uri.toString());
  return requestId;
};


/**
 * Saves the given deck.
 * @param {!yugi.model.Deck} deck The deck to save.
 */
yugi.service.DeckService.prototype.save = function(deck) {
  this.logger.info('Saving this deck: ' + deck.getName());

  // Post the deck as JSON back to the server.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.DECK);
  var json = goog.json.serialize(deck.toJson());
  this.saveXhrIo_.send(uri, 'POST', json, {'Content-type': 'text/json'});
};


/**
 * Deletes the given deck.
 * @param {string} deckKey The key of the deck to delete.
 */
yugi.service.DeckService.prototype.deleteDeck = function(deckKey) {
  this.logger.info('Deleting deck with key: ' + deckKey);

  // Ask the server to delete the deck with the key.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.DECK_DELETE);
  uri.setParameterValue(yugi.Config.UrlParameter.DECK_KEY, deckKey);
  this.deleteXhrIo_.send(uri);
};


/**
 * Called when the load fails for some reason.
 * @param {!goog.net.XhrManager.Event} e The error event.
 * @private
 */
yugi.service.DeckService.prototype.onLoadError_ = function(e) {
  var xhrIo = e.xhrIo;
  if (xhrIo) {
    this.logger.severe('An error occurred: ' + xhrIo.getLastError());
  } else {
    this.logger.severe('An error occurred with the load XHR Manager');
  }
  this.dispatchEvent(new yugi.service.DeckService.LoadErrorEvent(e.id));
};


/**
 * Called when the load succeeds.  The data is deserialized and processed.
 * @param {!goog.net.XhrManager.Event} e The error event.
 * @private
 */
yugi.service.DeckService.prototype.onLoadComplete_ = function(e) {
  this.logger.info('The server returned the JSON for a deck.');

  // Grab the JSON from the response.
  var json = e.xhrIo.getResponseJson();
  if (!json) {
    this.logger.severe('The JSON from the server was invalid.');
    return;
  }

  var deck = new yugi.model.Deck();
  deck.setFromJson(json);

  // Notify the deck has been loaded.
  this.dispatchEvent(new yugi.service.DeckService.LoadEvent(e.id, deck));
};


/**
 * Called when the save fails for some reason.
 * @private
 */
yugi.service.DeckService.prototype.onSaveError_ = function() {
  this.logger.severe('Failed to save the deck.');
  this.dispatchEvent(yugi.service.DeckService.EventType.SAVE_ERROR);
};


/**
 * Called when the save succeeds.
 * @private
 */
yugi.service.DeckService.prototype.onSaveComplete_ = function() {
  this.logger.info('Deck successfully saved.');
  this.dispatchEvent(yugi.service.DeckService.EventType.SAVED);
};


/**
 * Called when the delete fails for some reason.
 * @private
 */
yugi.service.DeckService.prototype.onDeleteError_ = function() {
  this.logger.severe('Failed to delete the deck.');
  this.dispatchEvent(yugi.service.DeckService.EventType.DELETE_ERROR);
};


/**
 * Called when the delete succeeds.
 * @private
 */
yugi.service.DeckService.prototype.onDeleteComplete_ = function() {
  this.logger.info('Deck successfully deleted.');
  this.dispatchEvent(yugi.service.DeckService.EventType.DELETED);
};



/**
 * The event that gets dispatched when a deck is loaded.
 * @param {string} id The ID of the request.
 * @param {!yugi.model.Deck} deck The deck that got loaded.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.service.DeckService.LoadEvent = function(id, deck) {
  goog.base(this, yugi.service.DeckService.EventType.LOADED);

  /**
   * @type {string}
   */
  this.id = id;

  /**
   * @type {!yugi.model.Deck}
   */
  this.deck = deck;
};
goog.inherits(yugi.service.DeckService.LoadEvent, goog.events.Event);



/**
 * The event that gets dispatched when a deck fails to load.
 * @param {string} id The ID of the request that failed.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.service.DeckService.LoadErrorEvent = function(id) {
  goog.base(this, yugi.service.DeckService.EventType.LOAD_ERROR);

  /**
   * @type {string}
   */
  this.id = id;
};
goog.inherits(yugi.service.DeckService.LoadErrorEvent, goog.events.Event);
