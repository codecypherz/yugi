/**
 * The minimum set of data to send when synchronizing game state.
 */

goog.provide('yugi.game.data.CardData');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('yugi.model.Counter');
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
};
goog.inherits(yugi.game.data.CardData, goog.Disposable);


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
  return cardData;
};


/**
 * Static helper function to set values on the card from the data.
 * @param {!yugi.model.Card} card The card on which to set data.
 * @param {!yugi.game.data.CardData} data The data to set on the card.
 */
yugi.game.data.CardData.setCardFromData = function(card, data) {
  card.setCounters(data.getCounters());
};
