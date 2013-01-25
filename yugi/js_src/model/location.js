/**
 * The model for the location of a card.
 */

goog.provide('yugi.model.Location');

goog.require('yugi.model.Area');
goog.require('yugi.model.Serializable');



/**
 * The model for the location of a card.
 * @param {yugi.model.Area=} opt_area The area.
 * @param {number=} opt_index The index.
 * @constructor
 * @implements {yugi.model.Serializable}
 */
yugi.model.Location = function(opt_area, opt_index) {

  /**
   * @type {!yugi.model.Area}
   * @private
   */
  this.area_ = opt_area || yugi.model.Area.UNSPECIFIED;

  /**
   * @type {number}
   * @private
   */
  this.index_ = opt_index || 0;
};


/**
 * @return {!yugi.model.Area} The card area.
 */
yugi.model.Location.prototype.getArea = function() {
  return this.area_;
};


/**
 * @param {!yugi.model.Area} area The new area.
 */
yugi.model.Location.prototype.setArea = function(area) {
  this.area_ = area;
};


/**
 * @return {number} The index.
 */
yugi.model.Location.prototype.getIndex = function() {
  return this.index_;
};


/**
 * @param {number} index The new index.
 */
yugi.model.Location.prototype.setIndex = function(index) {
  this.index_ = index;
};


/**
 * Clones this location.
 * @return {!yugi.model.Location} The cloned object.
 */
yugi.model.Location.prototype.clone = function() {
  return new yugi.model.Location(this.area_, this.index_);
};


/** @override */
yugi.model.Location.prototype.toJson = function() {
  var json = {};
  json['a'] = this.area_;
  json['i'] = this.index_;
  return json;
};


/** @override */
yugi.model.Location.prototype.setFromJson = function(json) {
  this.area_ = json['a'];
  this.index_ = json['i'];
};
