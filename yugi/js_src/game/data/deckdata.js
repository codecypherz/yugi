/**
 * The minimum set of data to send when synchronizing game state.
 */

goog.provide('yugi.game.data.DeckData');

goog.require('goog.Disposable');
goog.require('yugi.data.CardListData');
goog.require('yugi.model.Serializable');



/**
 * The minimum set of data to send when synchronizing game state.
 * @constructor
 * @implements {yugi.model.Serializable}
 * @extends {goog.Disposable}
 */
yugi.game.data.DeckData = function() {

  /**
   * The key for this deck on the server.
   * @type {string}
   * @private
   */
  this.key_ = '';

  /**
   * @type {!yugi.data.CardListData}
   * @private
   */
  this.mainCardData_ = new yugi.data.CardListData();

  /**
   * @type {!yugi.data.CardListData}
   * @private
   */
  this.extraCardData_ = new yugi.data.CardListData();

  /**
   * @type {!yugi.data.CardListData}
   * @private
   */
  this.sideCardData_ = new yugi.data.CardListData();
};
goog.inherits(yugi.game.data.DeckData, goog.Disposable);


/**
 * @return {string} The server side key for this deck.
 */
yugi.game.data.DeckData.prototype.getKey = function() {
  return this.key_;
};


/**
 * @param {string} key The key to set.
 */
yugi.game.data.DeckData.prototype.setKey = function(key) {
  this.key_ = key;
};


/**
 * @return {!yugi.data.CardListData} The list of cards.
 */
yugi.game.data.DeckData.prototype.getMainCardData = function() {
  return this.mainCardData_;
};


/**
 * @param {!yugi.data.CardListData} cardData The card list data.
 */
yugi.game.data.DeckData.prototype.setMainCardData = function(cardData) {
  this.mainCardData_ = cardData;
};


/**
 * @return {!yugi.data.CardListData} The list of cards.
 */
yugi.game.data.DeckData.prototype.getExtraCardData = function() {
  return this.extraCardData_;
};


/**
 * @param {!yugi.data.CardListData} cardData The card list data.
 */
yugi.game.data.DeckData.prototype.setExtraCardData = function(cardData) {
  this.extraCardData_ = cardData;
};


/**
 * @return {!yugi.data.CardListData} The list of cards.
 */
yugi.game.data.DeckData.prototype.getSideCardData = function() {
  return this.sideCardData_;
};


/**
 * @param {!yugi.data.CardListData} cardData The card list data.
 */
yugi.game.data.DeckData.prototype.setSideCardData = function(cardData) {
  this.sideCardData_ = cardData;
};


/** @override */
yugi.game.data.DeckData.prototype.toJson = function() {
  return {
    'k': this.key_,
    'md': this.mainCardData_.toJson(),
    'ed': this.extraCardData_.toJson(),
    'sd': this.sideCardData_.toJson()
  };
};


/** @override */
yugi.game.data.DeckData.prototype.setFromJson = function(json) {
  this.key_ = json['k'];

  var mainCardData = new yugi.data.CardListData();
  mainCardData.setFromJson(json['md']);
  this.mainCardData_ = mainCardData;

  var extraCardData = new yugi.data.CardListData();
  extraCardData.setFromJson(json['ed']);
  this.extraCardData_ = extraCardData;

  var sideCardData = new yugi.data.CardListData();
  sideCardData.setFromJson(json['sd']);
  this.sideCardData_ = sideCardData;
};
