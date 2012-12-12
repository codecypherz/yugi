/**
 * Model for the state of the deck editor UI.
 */

goog.provide('yugi.model.Search');
goog.provide('yugi.model.Search.EventType');
goog.provide('yugi.model.Search.ResultsEvent');

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
goog.require('yugi.model.util');



/**
 * Model for the state of the deck editor UI.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.model.Search = function() {
  goog.base(this);

  /**
   * This is used to make queries to the server.
   * @type {!goog.net.XhrIo}
   * @private
   */
  this.xhrio_ = new goog.net.XhrIo();
  this.registerDisposable(this.xhrio_);

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  // Listen for errors on the XHR object.
  this.handler_.listen(this.xhrio_,
      goog.net.EventType.ERROR,
      this.onError_);
  this.handler_.listen(this.xhrio_,
      goog.net.EventType.COMPLETE,
      this.onComplete_);
};
goog.inherits(yugi.model.Search, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.model.Search.prototype.logger =
    goog.debug.Logger.getLogger('yugi.model.Search');


/**
 * @type {!yugi.model.Search}
 * @private
 */
yugi.model.Search.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.model.Search.EventType = {
  ERROR: goog.events.getUniqueId('error'),
  RESULTS: goog.events.getUniqueId('results'),
  SEARCHING: goog.events.getUniqueId('searching')
};


/**
 * Registers an instance of the model.
 * @return {!yugi.model.Search} The registered instance.
 */
yugi.model.Search.register = function() {
  yugi.model.Search.instance_ =
      new yugi.model.Search();
  return yugi.model.Search.get();
};


/**
 * @return {!yugi.model.Search} The model for UI state.
 */
yugi.model.Search.get = function() {
  return yugi.model.Search.instance_;
};


/**
 * Searches for cards by name.
 * @param {string} name The name for which to search.
 */
yugi.model.Search.prototype.byName = function(name) {
  this.logger.info('Searching for cards by this name: ' + name);
  this.dispatchEvent(yugi.model.Search.EventType.SEARCHING);

  // TODO Use an XHR manager here for sure.

  // Send the query and wait for the response.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.CARD_SEARCH);
  uri.setParameterValue(yugi.Config.UrlParameter.CARD_NAME, name);
  this.xhrio_.send(uri);
};


/**
 * Called when the query fails for some reason.
 * @private
 */
yugi.model.Search.prototype.onError_ = function() {
  this.logger.severe('Failed to search for cards.');
  this.dispatchEvent(yugi.model.Search.EventType.ERROR);
};


/**
 * Called when the query succeeds.  The data is deserialized and processed.
 * @private
 */
yugi.model.Search.prototype.onComplete_ = function() {
  this.logger.info('Card JSON returned from server.');

  // Grab the JSON from the response.
  var json = this.xhrio_.getResponseJson();

  /**
   * @type {!Array.<!yugi.model.Card>}
   */
  var cards = new Array();

  // Create card objects from the raw server JSON.
  goog.array.forEach(json['cards'], function(cardJson) {

    // Parse the card JSON into a card object.
    var card = yugi.model.util.cardFromJson(cardJson);

    // Validate the card.
    if (!card) {
      this.logger.severe(
          'Skipping a card in the results because card parsing failed.');
      return;
    }

    // Add the card since it was valid.
    cards.push(card);

  }, this);

  // Tell everyone that results have arrived.
  this.dispatchEvent(new yugi.model.Search.ResultsEvent(cards));
};



/**
 * The event that gets dispatched when search results arrive.
 * @param {!Array.<!yugi.model.Card>} cards The resulting set of cards.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.model.Search.ResultsEvent = function(cards) {
  goog.base(this, yugi.model.Search.EventType.RESULTS);

  /**
   * @type {!Array.<!yugi.model.Card>}
   */
  this.cards = cards;
};
goog.inherits(yugi.model.Search.ResultsEvent, goog.events.Event);
