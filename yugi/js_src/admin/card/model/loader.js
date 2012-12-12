/**
 * The card loader.
 */

goog.provide('yugi.admin.card.model.Loader');
goog.provide('yugi.admin.card.model.Loader.DoesNotExistEvent');
goog.provide('yugi.admin.card.model.Loader.EventType');
goog.provide('yugi.admin.card.model.Loader.ExistsEvent');
goog.provide('yugi.admin.card.model.Loader.LoadedEvent');

goog.require('goog.Uri');
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
 * The card loader.
 * @param {string} cardKey The key of the card to load.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.admin.card.model.Loader = function(cardKey) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.cardKey_ = cardKey;

  /**
   * This is used to make queries to the server.
   * @type {!goog.net.XhrIo}
   * @private
   */
  this.loadXhrIo_ = new goog.net.XhrIo();
  this.registerDisposable(this.loadXhrIo_);

  /**
   * This is used to make queries to the server.
   * @type {!goog.net.XhrIo}
   * @private
   */
  this.cardExistsXhrIo_ = new goog.net.XhrIo();
  this.registerDisposable(this.cardExistsXhrIo_);

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  // Listen for errors on the XHR objects.
  this.handler_.listen(this.loadXhrIo_,
      goog.net.EventType.ERROR,
      this.onLoadError_);
  this.handler_.listen(this.cardExistsXhrIo_,
      goog.net.EventType.ERROR,
      this.onCardExistsError_);

  // Listen for complete events on the XHR objects.
  this.handler_.listen(this.loadXhrIo_,
      goog.net.EventType.COMPLETE,
      this.onLoadComplete_);
  this.handler_.listen(this.cardExistsXhrIo_,
      goog.net.EventType.COMPLETE,
      this.onCardExistsComplete_);
};
goog.inherits(yugi.admin.card.model.Loader, goog.events.EventTarget);


/**
 * The original name of the card that was loaded.
 * @type {string}
 * @private
 */
yugi.admin.card.model.Loader.prototype.originalName_ = '';


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.admin.card.model.Loader.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.admin.card.model.Loader');


/**
 * @type {!yugi.admin.card.model.Loader}
 * @private
 */
yugi.admin.card.model.Loader.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.admin.card.model.Loader.EventType = {
  CARD_EXISTS_ERROR: goog.events.getUniqueId('card-exists-error'),
  DOES_NOT_EXIST: goog.events.getUniqueId('does-not-exist'),
  EXISTS: goog.events.getUniqueId('exists'),
  LOAD_ERROR: goog.events.getUniqueId('load-error'),
  LOADED: goog.events.getUniqueId('load-loaded')
};


/**
 * Registers an instance of the model.
 * @param {string} cardKey The key of the card to load.
 * @return {!yugi.admin.card.model.Loader} The registered instance.
 */
yugi.admin.card.model.Loader.register = function(cardKey) {
  yugi.admin.card.model.Loader.instance_ =
      new yugi.admin.card.model.Loader(cardKey);
  return yugi.admin.card.model.Loader.get();
};


/**
 * @return {!yugi.admin.card.model.Loader} The model for the loader.
 */
yugi.admin.card.model.Loader.get = function() {
  return yugi.admin.card.model.Loader.instance_;
};


/**
 * Loads the card that was set during model registration.  If no card key has
 * been set, then this is a no-op.
 */
yugi.admin.card.model.Loader.prototype.load = function() {
  // Ignore the call to load in the absence of a card key.
  if (!this.cardKey_) {
    return;
  }

  this.logger.info('Loading card with key = ' + this.cardKey_);

  // Send the query and wait for the response.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.CARD);
  uri.setParameterValue(yugi.Config.UrlParameter.CARD_KEY, this.cardKey_);
  this.loadXhrIo_.send(uri);
};


/**
 * Checks the existence of a card with the given name.
 * @param {string} name The name of the card to check.
 */
yugi.admin.card.model.Loader.prototype.checkCardExists = function(name) {
  this.logger.info('Checking for the existence of a card with this name: ' +
      name);

  // Send the query and wait for the response.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.ADMIN_CARD_EXISTS);
  uri.setParameterValue(yugi.Config.UrlParameter.CARD_NAME, name);
  this.cardExistsXhrIo_.send(uri);
};


/**
 * @return {string} The card key.
 */
yugi.admin.card.model.Loader.prototype.getCardKey = function() {
  return this.cardKey_;
};


/**
 * @return {string} The original card name.
 */
yugi.admin.card.model.Loader.prototype.getOriginalName = function() {
  return this.originalName_;
};


/**
 * Called when the query fails for some reason.
 * @private
 */
yugi.admin.card.model.Loader.prototype.onLoadError_ = function() {
  this.logger.severe('Failed to load the card.');
  this.dispatchEvent(yugi.admin.card.model.Loader.EventType.LOAD_ERROR);
};


/**
 * Called when the query succeeds.  The data is deserialized and processed.
 * @private
 */
yugi.admin.card.model.Loader.prototype.onLoadComplete_ = function() {
  this.logger.info('Card JSON returned from server.');

  // Grab the JSON from the response.
  var json = this.loadXhrIo_.getResponseJson();
  if (!json) {
    this.logger.severe('The card JSON was invalid');
    this.onLoadError_();
    return;
  }

  // Parse the card JSON into a card object.
  var card = yugi.model.util.cardFromJson(json);

  // Validate the card.
  if (!card) {
    this.logger.severe('The card JSON was invalid.');
    this.onLoadError_();
    return;
  }

  // Save off the card's name.
  this.originalName_ = card.getName();

  // Notify people the card has been loaded.
  this.dispatchEvent(new yugi.admin.card.model.Loader.LoadedEvent(card));
};


/**
 * Called when the query fails for some reason.
 * @private
 */
yugi.admin.card.model.Loader.prototype.onCardExistsError_ = function() {
  this.logger.severe('Failed to see if the card exists.');
  this.dispatchEvent(yugi.admin.card.model.Loader.EventType.CARD_EXISTS_ERROR);
};


/**
 * Called when the query succeeds.  The data is deserialized and processed.
 * @private
 */
yugi.admin.card.model.Loader.prototype.onCardExistsComplete_ = function() {

  // Grab the JSON from the response.
  var json = this.cardExistsXhrIo_.getResponseJson();
  if (!json) {
    this.logger.severe('The card exists response JSON was invalid');
    this.onCardExistsError_();
    return;
  }

  // Figure out if the server said the card existed.
  var name = json['name'];
  var cardJson = json['card'];

  if (!goog.isDefAndNotNull(cardJson)) {

    // No card JSON means the card did not exist.
    this.dispatchEvent(
        new yugi.admin.card.model.Loader.DoesNotExistEvent(name));
  } else {
    this.logger.info('The server says ' + name + ' exists.');
    var card = yugi.model.util.cardFromJson(cardJson);

    // Validate the card.
    if (!card) {
      this.logger.severe('The card JSON was invalid.');
      this.onCardExistsError_();
      return;
    }

    // Notify that the card exists.
    this.dispatchEvent(new yugi.admin.card.model.Loader.ExistsEvent(card));
  }
};



/**
 * The event that gets dispatched when the card loads.
 * @param {!yugi.model.Card} card The card that got loaded.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.admin.card.model.Loader.LoadedEvent = function(card) {
  goog.base(this, yugi.admin.card.model.Loader.EventType.LOADED);

  /**
   * @type {!yugi.model.Card}
   */
  this.card = card;
};
goog.inherits(yugi.admin.card.model.Loader.LoadedEvent, goog.events.Event);



/**
 * The event that gets dispatched when the card does not exist.
 * @param {string} name The name that was looked up.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.admin.card.model.Loader.DoesNotExistEvent = function(name) {
  goog.base(this, yugi.admin.card.model.Loader.EventType.DOES_NOT_EXIST);

  /**
   * @type {string}
   */
  this.name = name;
};
goog.inherits(yugi.admin.card.model.Loader.DoesNotExistEvent,
    goog.events.Event);



/**
 * The event that gets dispatched when the card is discovered to exist.
 * @param {!yugi.model.Card} card The existing card.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.admin.card.model.Loader.ExistsEvent = function(card) {
  goog.base(this, yugi.admin.card.model.Loader.EventType.EXISTS);

  /**
   * @type {!yugi.model.Card}
   */
  this.card = card;
};
goog.inherits(yugi.admin.card.model.Loader.ExistsEvent, goog.events.Event);
