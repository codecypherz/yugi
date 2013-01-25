/**
 * The minimum set of data to send when synchronizing game state.
 */

goog.provide('yugi.game.data.CardData');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('yugi.model.Counter');
goog.require('yugi.model.Location');
goog.require('yugi.model.Serializable');



/**
 * The minimum set of data to send when synchronizing game state.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {yugi.model.Serializable}
 */
yugi.game.data.CardData = function() {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.key_ = '';

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
goog.inherits(yugi.game.data.CardData, goog.Disposable);


/**
 * @return {string} The card key.
 */
yugi.game.data.CardData.prototype.getKey = function() {
  return this.key_;
};


/**
 * @param {string} key The card key.
 */
yugi.game.data.CardData.prototype.setKey = function(key) {
  this.key_ = key;
};


/**
 * @return {!Array.<!yugi.model.Counter>} The card counters.
 */
yugi.game.data.CardData.prototype.getCounters = function() {
  return this.counters_;
};


/**
 * @param {!Array.<!yugi.model.Counter>} counters The card counters.
 */
yugi.game.data.CardData.prototype.setCounters = function(counters) {
  this.counters_ = counters;
};


/**
 * @return {!yugi.model.Location} The location.
 */
yugi.game.data.CardData.prototype.getLocation = function() {
  return this.location_;
};


/**
 * @param {!yugi.model.Location} location The location.
 */
yugi.game.data.CardData.prototype.setLocation = function(location) {
  this.location_ = location;
};


/**
 * @return {boolean} True if the card is face up or not.
 */
yugi.game.data.CardData.prototype.isFaceUp = function() {
  return this.isFaceUp_;
};


/**
 * @param {boolean} isFaceUp True if the card is face up or not.
 */
yugi.game.data.CardData.prototype.setFaceUp = function(isFaceUp) {
  this.isFaceUp_ = isFaceUp;
};


/**
 * @return {boolean} True if the card is rotated or not.
 */
yugi.game.data.CardData.prototype.isRotated = function() {
  return this.isRotated_;
};


/**
 * @param {boolean} isRotated True if the card is rotated or not.
 */
yugi.game.data.CardData.prototype.setRotated = function(isRotated) {
  this.isRotated_ = isRotated;
};


/** @override */
yugi.game.data.CardData.prototype.toJson = function() {

  var jsonCounters = [];
  goog.array.forEach(this.counters_, function(counter) {
    jsonCounters.push(counter.toJson());
  });

  var json = {};
  // Make sure these keys are unique among all child classes.
  json['k'] = this.key_;
  json['c'] = jsonCounters;
  json['l'] = this.location_.toJson();
  json['f'] = this.isFaceUp_;
  json['r'] = this.isRotated_;
  return json;
};


/** @override */
yugi.game.data.CardData.prototype.setFromJson = function(json) {
  this.key_ = json['k'];

  this.counters_ = [];
  var jsonCounters = json['c'];
  if (jsonCounters) {
    goog.array.forEach(jsonCounters, function(jsonCounter) {
      var counter = new yugi.model.Counter();
      counter.setFromJson(jsonCounter);
      this.counters_.push(counter);
    }, this);
  }

  this.location_ = new yugi.model.Location();
  this.location_.setFromJson(json['l']);

  this.isFaceUp_ = json['f'] || false;
  this.isRotated_ = json['r'] || false;
};


/**
 * Sets the card information based on this card data.
 * @param {!yugi.model.Card} card The card on which to set values.
 */
yugi.game.data.CardData.prototype.syncToCard = function(card) {
  card.setCounters(this.getCounters());
  card.setLocation(this.getLocation());
  card.setFaceUp(this.isFaceUp());
  card.setRotated(this.isRotated());
};


/**
 * Static helper function for creating card data from a card.
 * @param {!yugi.model.Card} card The card.
 * @return {!yugi.game.data.CardData} The card data for the card.
 */
yugi.game.data.CardData.createFromCard = function(card) {
  var cardData = new yugi.game.data.CardData();
  cardData.setKey(card.getKey());
  cardData.setCounters(card.getCounters());
  cardData.setLocation(card.getLocation());
  cardData.setFaceUp(card.isFaceUp());
  cardData.setRotated(card.isRotated());
  return cardData;
};


/**
 * Creates the correct card data from the given JSON.
 * @param {!Object} json The JSON from which to create the data.
 * @return {!yugi.game.data.CardData} The card data.
 */
yugi.game.data.CardData.createFromJson = function(json) {
  var cardData = new yugi.game.data.CardData();
  cardData.setFromJson(json);
  return cardData;
};
