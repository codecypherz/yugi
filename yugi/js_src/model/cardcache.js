/**
 * Keeps a cache of full card data.
 */

goog.provide('yugi.model.CardCache');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.structs.Trie');



/**
 * Keeps a cache of full card data.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.model.CardCache = function() {
  goog.base(this);

  /**
   * Maps card keys to cards.
   * @type {!Object.<!yugi.model.Card>}
   * @private
   */
  this.keyToCardMap_ = {};

  /**
   * Uses a prefix tree to map card names to card objects.
   * @type {!goog.structs.Trie}
   * @private
   */
  this.nameToCardTrie_ = new goog.structs.Trie();
};
goog.inherits(yugi.model.CardCache, goog.Disposable);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.model.CardCache.prototype.logger =
    goog.debug.Logger.getLogger('yugi.model.CardCache');


/**
 * @type {!yugi.model.CardCache}
 * @private
 */
yugi.model.CardCache.instance_;


/**
 * Registers an instance of the model.
 * @return {!yugi.model.CardCache} The registered instance.
 */
yugi.model.CardCache.register = function() {
  yugi.model.CardCache.instance_ = new yugi.model.CardCache();
  return yugi.model.CardCache.get();
};


/**
 * @return {!yugi.model.CardCache} The model for synchronization.
 */
yugi.model.CardCache.get = function() {
  return yugi.model.CardCache.instance_;
};


/**
 * Gets a card from the cache that has the key.  An error is thrown if the cache
 * does not have the card.  Note that you only get a copy of the card from the
 * cache because the cache should be treated as read only unless initializing.
 * @param {string} cardKey The card key.
 * @return {!yugi.model.Card} The card in the cache.
 */
yugi.model.CardCache.prototype.get = function(cardKey) {

  // Pull the card from the cache by key.
  var card = this.keyToCardMap_[cardKey];

  // Make sure the card was in the cache.
  if (!card) {
    throw new Error('Failed to find a card with this key: ' + cardKey);
  }

  // Return a cloned version of the card instead of the same reference.
  // The cache is treated as read only unless it is being set up when a deck
  // loads.
  return card.clone();
};


/**
 * Gets all the cards for the list of keys.
 * @param {!Array.<string>} cardKeys The list of card keys.
 * @return {!Array.<!yugi.model.Card>} The list of cards.
 */
yugi.model.CardCache.prototype.getList = function(cardKeys) {
  var cards = [];
  goog.array.forEach(cardKeys, function(cardKey) {
    cards.push(this.get(cardKey));
  }, this);
  return cards;
};


/**
 * Puts a card in the cache.
 * @param {!yugi.model.Card} card The card to put in the cache.
 */
yugi.model.CardCache.prototype.put = function(card) {
  this.keyToCardMap_[card.getKey()] = card;
  this.nameToCardTrie_.set(card.getName(), card);
};


/**
 * Finds all cards that match the name prefix that are currently in the map.
 * @param {string} cardNamePrefix The card name prefix. (e.g. "Mystical").
 * @return {!Array.<string>} The names matching the prefix.
 */
yugi.model.CardCache.prototype.getNamesByPrefix = function(cardNamePrefix) {
  return /** @type {!Array.<string>} */ (
      this.nameToCardTrie_.getKeys(cardNamePrefix));
};


/**
 * Retrieves a card by name.
 * @param {string} cardName The name of the card.
 * @return {yugi.model.Card} The card, if found.
 */
yugi.model.CardCache.prototype.getByName = function(cardName) {
  return /** @type {yugi.model.Card} */ (this.nameToCardTrie_.get(cardName));
};
