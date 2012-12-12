/**
 * Keeps track of the list of games to present to the user.
 */

goog.provide('yugi.landing.model.Games');
goog.provide('yugi.landing.model.Games.EventType');
goog.provide('yugi.landing.model.Games.UpdateEvent');

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
goog.require('yugi.landing.model.Game');



/**
 * Keeps track of the list of games to present to the user.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.landing.model.Games = function() {
  goog.base(this);

  /**
   * @type {!Array.<!yugi.landing.model.Game>}
   * @private
   */
  this.gameList_ = [];

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
      this.onQueryError_);
  this.handler_.listen(this.xhrio_,
      goog.net.EventType.COMPLETE,
      this.onQueryComplete_);
};
goog.inherits(yugi.landing.model.Games, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.landing.model.Games.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.landing.model.Games');


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.landing.model.Games.EventType = {
  UPDATED: goog.events.getUniqueId('updated'),
  WAITING: goog.events.getUniqueId('waiting')
};


/**
 * @type {boolean}
 * @private
 */
yugi.landing.model.Games.prototype.waiting_ = false;


/**
 * @return {boolean} Whether this model is waiting for a response or not.
 */
yugi.landing.model.Games.prototype.isWaiting = function() {
  return this.waiting_;
};


/**
 * @return {!Array.<!yugi.landing.model.Game>} The list of games available to
 *     join.
 */
yugi.landing.model.Games.prototype.getList = function() {
  return this.gameList_;
};


/**
 * Refreshes the list of games by querying the server.
 */
yugi.landing.model.Games.prototype.refresh = function() {
  this.logger.info('Refreshing game list.');

  // Send the query and wait for the response.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.JOIN_QUERY);
  this.xhrio_.send(uri);

  this.waiting_ = true;
  this.dispatchEvent(yugi.landing.model.Games.EventType.WAITING);
};


/**
 * Called when the query failed for some reason.
 * @private
 */
yugi.landing.model.Games.prototype.onQueryError_ = function() {
  this.logger.severe('Querying for games to join failed.');
};


/**
 * Called when the query succeeds.  The data is deserialized and processed.
 * @private
 */
yugi.landing.model.Games.prototype.onQueryComplete_ = function() {
  this.logger.info('Query complete');
  this.waiting_ = false;

  // Grab the games out of the response.
  var response = this.xhrio_.getResponseJson();
  var games = response['games'];

  // Reset the game list.
  goog.disposeAll(this.gameList_);
  this.gameList_ = new Array();

  // Add all the games to the list.
  goog.array.forEach(games, function(game) {
    this.gameList_.push(new yugi.landing.model.Game(game['key'], game['name']));
  }, this);

  // Notify everyone that the list has been updated.
  this.dispatchEvent(new yugi.landing.model.Games.UpdateEvent(this.gameList_));
};



/**
 * The event that gets dispatched when the list of games gets updated.
 * @param {!Array.<!yugi.landing.model.Game>} gameList The list of games.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.landing.model.Games.UpdateEvent = function(gameList) {
  goog.base(this, yugi.landing.model.Games.EventType.UPDATED);

  /**
   * @type {!Array.<!yugi.landing.model.Game>}
   */
  this.gameList = gameList;
};
goog.inherits(yugi.landing.model.Games.UpdateEvent, goog.events.Event);


/**
 * @type {!yugi.landing.model.Games}
 * @private
 */
yugi.landing.model.Games.instance_;


/**
 * Registers an instance of the model.
 * @return {!yugi.landing.model.Games} The registered instance.
 */
yugi.landing.model.Games.register = function() {
  yugi.landing.model.Games.instance_ = new yugi.landing.model.Games();
  return yugi.landing.model.Games.get();
};


/**
 * @return {!yugi.landing.model.Games} The model for the list of active games.
 */
yugi.landing.model.Games.get = function() {
  return yugi.landing.model.Games.instance_;
};
