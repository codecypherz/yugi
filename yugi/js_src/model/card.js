/**
 * The model for a card in Yugioh.
 */

goog.provide('yugi.model.Card');
goog.provide('yugi.model.Card.EventType');
goog.provide('yugi.model.Card.Type');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.string');
goog.require('yugi');
goog.require('yugi.model.Counter');
goog.require('yugi.model.Location');
goog.require('yugi.model.Selectable');
goog.require('yugi.model.Serializable');
goog.require('yugi.ui.Image');



/**
 * The model for a card in Yugioh.
 * @param {!yugi.model.Card.Type} type The type of card this is.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @implements {yugi.model.Selectable}
 * @implements {yugi.model.Serializable}
 */
yugi.model.Card = function(type) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.model.Card');

  /**
   * The server side key for this card.
   * @type {string}
   * @private
   */
  this.key_ = '';

  /**
   * The name of the card.
   * @type {string}
   * @private
   */
  this.name_ = '';

  /**
   * The description of the card.
   * @type {string}
   * @private
   */
  this.description_ = '';

  /**
   * @type {!yugi.model.Card.Type}
   * @private
   */
  this.type_ = type;

  /**
   * @type {string}
   * @private
   */
  this.imageSource_ = yugi.ui.Image.CARD_BACK;

  /**
   * The unique ID for this card.  This is only used on the client and can/will
   * change every time the "same" card is loaded from the server.
   * @type {number}
   * @private
   */
  this.id_ = yugi.model.Card.uniqueIdCounter_++;

  /**
   * The counters for this card.
   * @type {!Array.<!yugi.model.Counter>}
   * @private
   */
  this.counters_ = [];

  /**
   * @type {!yugi.model.Location}
   * @private
   */
  this.location_ = new yugi.model.Location();

  /**
   * True if the card is face up.
   * @type {boolean}
   * @private
   */
  this.isFaceUp_ = true;

  /**
   * True if the card is rotated.
   * @type {boolean}
   * @private
   */
  this.isRotated_ = false;
};
goog.inherits(yugi.model.Card, goog.events.EventTarget);


/**
 * Counter to create unique IDs for cards.  Note that this ONLY uniquely
 * identifies cards that were created on THIS client.
 * @type {number}
 * @private
 */
yugi.model.Card.uniqueIdCounter_ = 0;


/**
 * The set of card types.
 * @enum {string}
 */
yugi.model.Card.Type = {
  MONSTER: 'Monster',
  SPELL: 'Spell',
  TRAP: 'Trap'
};


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.model.Card.EventType = {
  COUNTERS_CHANGED: yugi.uniqueId('counters-changed'),
  FLIPPED: yugi.uniqueId('flipped'),
  ROTATED: yugi.uniqueId('rotated')
};


/**
 * Returns a new copy of the card.  This is a deep copy.
 * @return {!yugi.model.Card} The card copy.
 */
yugi.model.Card.prototype.clone = goog.abstractMethod;


/**
 * @return {string} The server side key for this card.
 */
yugi.model.Card.prototype.getKey = function() {
  return this.key_;
};


/**
 * @param {string} key The card key.
 */
yugi.model.Card.prototype.setKey = function(key) {
  this.key_ = key;
};


/**
 * @return {string} The name of the card.
 */
yugi.model.Card.prototype.getName = function() {
  return this.name_;
};


/**
 * @param {string} name The name to set.
 */
yugi.model.Card.prototype.setName = function(name) {
  this.name_ = name;
};


/**
 * @return {string} The description of the card.
 */
yugi.model.Card.prototype.getDescription = function() {
  return this.description_;
};


/**
 * @param {string} description The description to set.
 */
yugi.model.Card.prototype.setDescription = function(description) {
  this.description_ = description;
};


/**
 * @return {boolean} True if the card is face up or not.
 */
yugi.model.Card.prototype.isFaceUp = function() {
  return this.isFaceUp_;
};


/**
 * @param {boolean} isFaceUp True if the card is face up or not.
 */
yugi.model.Card.prototype.setFaceUp = function(isFaceUp) {
  if (this.isFaceUp_ == isFaceUp) {
    return;
  }
  this.isFaceUp_ = isFaceUp;
  this.dispatchEvent(yugi.model.Card.EventType.FLIPPED);
};


/**
 * @param {number} height The desired height of the image.
 * @param {boolean=} opt_crop True if the image should be cropped or not.
 * @return {string} The image source of the card.
 */
yugi.model.Card.prototype.getImageSource = function(height, opt_crop) {
  var src = this.imageSource_ + '=s' + height;
  if (opt_crop) {
    src += '-c';
  }
  return src;
};


/**
 * @param {string} imageSource The card's image source.
 */
yugi.model.Card.prototype.setImageSource = function(imageSource) {
  this.imageSource_ = imageSource;
};


/**
 * @return {boolean} True if the card is rotated or not.
 */
yugi.model.Card.prototype.isRotated = function() {
  return this.isRotated_;
};


/**
 * @param {boolean} isRotated True if the card is rotated or not.
 */
yugi.model.Card.prototype.setRotated = function(isRotated) {
  if (this.isRotated_ == isRotated) {
    return;
  }
  this.isRotated_ = isRotated;
  this.dispatchEvent(yugi.model.Card.EventType.ROTATED);
};


/**
 * @return {!yugi.model.Card.Type} The type of card this is.
 */
yugi.model.Card.prototype.getType = function() {
  return this.type_;
};


/**
 * @return {!Array.<!yugi.model.Counter>} The card counters.
 */
yugi.model.Card.prototype.getCounters = function() {
  return this.counters_;
};


/**
 * @param {!Array.<!yugi.model.Counter>} counters The card counters.
 */
yugi.model.Card.prototype.setCounters = function(counters) {
  this.counters_ = counters;
  this.dispatchEvent(yugi.model.Card.EventType.COUNTERS_CHANGED);
};


/**
 * Adds a new counter to the card.
 */
yugi.model.Card.prototype.addCounter = function() {

  // Figure out the largest existing ID in order to create a unique ID.
  var largestId = 0;
  goog.array.forEach(this.counters_, function(counter) {
    var id = counter.getId();
    if (id > largestId) {
      largestId = id;
    }
  });

  // Create the new counter and add it to the array.
  var counter = new yugi.model.Counter();
  counter.setId(largestId + 1);
  this.counters_.push(counter);

  // Let everyone know there was a change to the counters array.
  this.dispatchEvent(yugi.model.Card.EventType.COUNTERS_CHANGED);
};


/**
 * @param {!yugi.model.Counter} counterToRemove The counter to remove.
 */
yugi.model.Card.prototype.removeCounter = function(counterToRemove) {
  var removed = goog.array.removeIf(this.counters_, function(counter) {
    return counter.equals(counterToRemove);
  });

  if (removed) {
    // Let everyone know there was a change to the counters array.
    this.dispatchEvent(yugi.model.Card.EventType.COUNTERS_CHANGED);
  } else {
    this.logger.severe('Failed to remove a counter with this ID: ' +
        counterToRemove.getId());
  }
};


/**
 * Clears all the card counters.
 */
yugi.model.Card.prototype.clearCounters = function() {
  goog.disposeAll(this.counters_);
  this.counters_ = [];
  this.dispatchEvent(yugi.model.Card.EventType.COUNTERS_CHANGED);
};


/**
 * @return {!yugi.model.Location} The current card location.
 */
yugi.model.Card.prototype.getLocation = function() {
  return this.location_;
};


/**
 * @param {!yugi.model.Location} location The new location.
 */
yugi.model.Card.prototype.setLocation = function(location) {
  this.location_ = location;
};


/**
 * Checks to see if the other card is equal to this one.
 * @param {!yugi.model.Card} card The other card.
 * @return {boolean} True if the cards are equal or not.
 */
yugi.model.Card.prototype.equals = function(card) {
  return this.id_ == card.id_;
};


/** @override */
yugi.model.Card.prototype.toJson = function() {
  return {
    'key': this.getKey(),
    'name': this.getName(),
    'description': this.getDescription(),
    'fup': this.isFaceUp_,
    'image-source': this.imageSource_,
    'rut': this.isRotated_,
    'type': this.getType()
  };
};


/** @override */
yugi.model.Card.prototype.setFromJson = function(json) {
  this.setKey(json['key']);
  this.setName(json['name']);
  this.setDescription(json['description']);
  this.setFaceUp(json['fup'] || false);
  this.setImageSource(json['image-source']);
  this.setRotated(json['rot'] || false);
};


/**
 * Sets the information of this card based on the given card.
 * @param {!yugi.model.Card} card The card from which to set values.
 */
yugi.model.Card.prototype.setFromCard = function(card) {
  this.setKey(card.key_);
  this.setName(card.name_);
  this.setDescription(card.description_);
  this.setFaceUp(card.isFaceUp_);
  this.setImageSource(card.imageSource_);
  this.setLocation(card.location_.clone());
  this.setRotated(card.isRotated_);

  var counters = [];
  goog.array.forEach(card.counters_, function(counter) {
    counters.push(counter.clone());
  });
  this.setCounters(counters);
};


/**
 * Tries to find a matching type for the string.
 * @param {string} typeString The string to match.
 * @return {yugi.model.Card.Type} The type or undefined if not found.
 */
yugi.model.Card.getTypeFromString = function(typeString) {
  return /** @type {yugi.model.Card.Type} */ (goog.object.findValue(
      yugi.model.Card.Type,
      function(value, key, object) {
        return goog.string.caseInsensitiveCompare(value, typeString) == 0;
      }));
};
