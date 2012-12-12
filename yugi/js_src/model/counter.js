/**
 * The model for a counter on a card.
 */

goog.provide('yugi.model.Counter');
goog.provide('yugi.model.Counter.EventType');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('yugi.model.Serializable');



/**
 * The model for a counter on a card.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @implements {yugi.model.Serializable}
 */
yugi.model.Counter = function() {
  goog.base(this);
};
goog.inherits(yugi.model.Counter, goog.events.EventTarget);


/**
 * The events dispatched by this model.
 * @enum {string}
 */
yugi.model.Counter.EventType = {
  COUNT_CHANGED: goog.events.getUniqueId('count-changed')
};


/**
 * The number of counts on the card.
 * @type {number}
 * @private
 */
yugi.model.Counter.prototype.count_ = 1;


/**
 * The ID of the counter.  This must be unique on a given card.  No two counters
 * on the same card should have the same ID.
 * @type {number}
 * @private
 */
yugi.model.Counter.prototype.id_ = 0;


/**
 * Clones the counter - this is a deep copy.
 * @return {!yugi.model.Counter} The cloned counter.
 */
yugi.model.Counter.prototype.clone = function() {
  var counter = new yugi.model.Counter();
  counter.setCount(this.count_);
  counter.setId(this.id_);
  return counter;
};


/**
 * @return {number} The count.
 */
yugi.model.Counter.prototype.getCount = function() {
  return this.count_;
};


/**
 * @param {number} count The count.
 */
yugi.model.Counter.prototype.setCount = function(count) {
  if (this.count_ == count) {
    return;
  }
  this.count_ = count;
  this.dispatchEvent(yugi.model.Counter.EventType.COUNT_CHANGED);
};


/**
 * Increments the current count.
 */
yugi.model.Counter.prototype.increment = function() {
  this.count_++;
  this.dispatchEvent(yugi.model.Counter.EventType.COUNT_CHANGED);
};


/**
 * Decrements the current count.
 */
yugi.model.Counter.prototype.decrement = function() {
  // Don't let the user make the count go negative.
  if (this.count_ == 0) {
    return;
  }
  this.count_--;
  this.dispatchEvent(yugi.model.Counter.EventType.COUNT_CHANGED);
};


/**
 * @return {number} This counter's ID.
 */
yugi.model.Counter.prototype.getId = function() {
  return this.id_;
};


/**
 * @param {number} id The ID of the counter.
 */
yugi.model.Counter.prototype.setId = function(id) {
  this.id_ = id;
};


/**
 * Checks to see if the other counter is equal to this one.  This comparison is
 * only valid when comparing counters on the same card.
 * @param {!yugi.model.Counter} counter The other counter.
 * @return {boolean} True if the counters are equal or not.
 */
yugi.model.Counter.prototype.equals = function(counter) {
  return this.id_ == counter.id_;
};


/** @override */
yugi.model.Counter.prototype.toJson = function() {
  return {
    'c': this.count_,
    'i': this.id_
  };
};


/** @override */
yugi.model.Counter.prototype.setFromJson = function(json) {
  this.count_ = json['c'];
  this.id_ = json['i'];
};


/**
 * Sets the information of this counter based on the given counter.
 * @param {!yugi.model.Counter} counter The counter from which to set values.
 */
yugi.model.Counter.prototype.setFromCard = function(counter) {
  // Using the setters here to trigger events, if applicable.
  this.setId(counter.id_);
  this.setCount(counter.count_);
};
