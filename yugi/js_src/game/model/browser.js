/**
 * Keeps track of what's being browsed.
 */

goog.provide('yugi.game.model.Browser');
goog.provide('yugi.game.model.Browser.EventType');
goog.provide('yugi.game.model.Browser.Type');

goog.require('goog.debug.Logger');
goog.require('goog.events.EventTarget');
goog.require('yugi.model.Area');
goog.require('yugi.model.CardList');



/**
 * Keeps track of what's being browsed.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.model.Browser = function() {
  goog.base(this);

  /**
   * The list of cards to browse.
   * @type {!yugi.model.CardList}
   * @private
   */
  this.cardList_ = new yugi.model.CardList(yugi.model.Area.UNSPECIFIED);

  /**
   * The function that will create actions for cards in the card list.
   * @type {!function(!yugi.model.Card)}
   * @private
   */
  this.createActionsFn_ = function() { };

  /**
   * The type of cards being browsed.
   * @type {!yugi.game.model.Browser.Type}
   * @private
   */
  this.type_ = yugi.game.model.Browser.Type.DECK;

  /**
   * @type {boolean}
   * @private
   */
  this.isOpponent_ = false;

  /**
   * @type {!function(): void}
   * @private
   */
  this.onFisnish_ = function() { };
};
goog.inherits(yugi.game.model.Browser, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.model.Browser.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.model.Browser');


/**
 * The types of cards that can be browsed.
 * @enum {string}
 */
yugi.game.model.Browser.Type = {
  BANISHED_CARDS: 'banished cards',
  DECK: 'deck',
  EXTRA_DECK: 'extra deck',
  GRAVEYARD: 'graveyard'
};


/**
 * The events dispatched by this model.
 * @enum {string}
 */
yugi.game.model.Browser.EventType = {
  UPDATED: 'updated'
};


/**
 * @type {!yugi.game.model.Browser}
 * @private
 */
yugi.game.model.Browser.instance_;


/**
 * Registers an instance of the browser model.
 * @return {!yugi.game.model.Browser} The registered instance.
 */
yugi.game.model.Browser.register = function() {
  yugi.game.model.Browser.instance_ = new yugi.game.model.Browser();
  return yugi.game.model.Browser.get();
};


/**
 * @return {!yugi.game.model.Browser} The browser model.
 */
yugi.game.model.Browser.get = function() {
  return yugi.game.model.Browser.instance_;
};


/**
 * Updates the browsing data.
 * @param {!yugi.model.CardList} cards The card list.
 * @param {!function(!yugi.model.Card)} fn The create actions functions.
 * @param {!yugi.game.model.Browser.Type} type The type being browsed.
 * @param {boolean} opponent True if it is the opponent or not.
 * @param {!function(): void} onFinish The callback for when finished.
 */
yugi.game.model.Browser.prototype.update =
    function(cards, fn, type, opponent, onFinish) {
  this.cardList_ = cards;
  this.createActionsFn_ = fn;
  this.type_ = type;
  this.isOpponent_ = opponent;
  this.onFinish_ = onFinish;
  this.dispatchEvent(yugi.game.model.Browser.EventType.UPDATED);
};


/**
 * Called when browsing is finished.
 */
yugi.game.model.Browser.prototype.finish = function() {
  this.onFinish_();
};


/**
 * @return {!yugi.model.CardList} The card list.
 */
yugi.game.model.Browser.prototype.getCardList = function() {
  return this.cardList_;
};


/**
 * @return {!function(!yugi.model.Card)} The create actions functions.
 */
yugi.game.model.Browser.prototype.getCreateActionsFn = function() {
  return this.createActionsFn_;
};


/**
 * @return {!yugi.game.model.Browser.Type} The type being browsed.
 */
yugi.game.model.Browser.prototype.getType = function() {
  return this.type_;
};


/**
 * @return {boolean} True if browsing opponent cards or not.
 */
yugi.game.model.Browser.prototype.isOpponent = function() {
  return this.isOpponent_;
};
