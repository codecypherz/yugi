/**
 * Keeps track of the list of decks to present to the user.
 */

goog.provide('yugi.deck.manager.model.Decks');
goog.provide('yugi.deck.manager.model.Decks.EventType');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventTarget');



/**
 * Keeps track of the list of decks to present to the user.
 * @param {!yugi.service.DeckService} deckService The service for modifying a
 *     single deck.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.deck.manager.model.Decks = function(deckService) {
  goog.base(this);

  /**
   * @type {!yugi.service.DeckService}
   * @private
   */
  this.deckService_ = deckService;

  /**
   * @type {!Array.<!yugi.model.Deck>}
   * @private
   */
  this.decks_ = new Array();
};
goog.inherits(yugi.deck.manager.model.Decks, goog.events.EventTarget);


/**
 * The deck currently being deleted.
 * @type {yugi.model.Deck}
 * @private
 */
yugi.deck.manager.model.Decks.prototype.deckBeingDeleted_;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.manager.model.Decks.prototype.logger =
    goog.debug.Logger.getLogger('yugi.deck.manager.model.Decks');


/**
 * @type {!yugi.deck.manager.model.Decks}
 * @private
 */
yugi.deck.manager.model.Decks.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.deck.manager.model.Decks.EventType = {
  DECKS_CHANGED: goog.events.getUniqueId('decks-changed')
};


/**
 * Registers an instance of the model.
 * @param {!yugi.service.DeckService} deckService The deck service.
 * @return {!yugi.deck.manager.model.Decks} The registered instance.
 */
yugi.deck.manager.model.Decks.register = function(deckService) {
  yugi.deck.manager.model.Decks.instance_ = new yugi.deck.manager.model.Decks(
      deckService);
  return yugi.deck.manager.model.Decks.get();
};


/**
 * @return {!yugi.deck.manager.model.Decks} The model for the loader.
 */
yugi.deck.manager.model.Decks.get = function() {
  return yugi.deck.manager.model.Decks.instance_;
};


/**
 * @param {!Array.<!yugi.model.Deck>} decks The decks to set.
 */
yugi.deck.manager.model.Decks.prototype.setDecks = function(decks) {
  this.decks_ = decks;
  this.dispatchEvent(yugi.deck.manager.model.Decks.EventType.DECKS_CHANGED);
};


/**
 * @return {!Array.<!yugi.model.Deck>} The decks.
 */
yugi.deck.manager.model.Decks.prototype.getDecks = function() {
  return this.decks_;
};


/**
 * Deletes the given deck.
 * @param {!yugi.model.Deck} deck The deck to delete.
 */
yugi.deck.manager.model.Decks.prototype.deleteDeck = function(deck) {
  this.logger.info('Deleting the ' + deck.getName() + ' deck.');

  // Remove the deck from the local copy.  Worst case scenario is the server
  // fails to delete the deck, in which case a refresh solves the issue.
  goog.array.removeIf(this.decks_, function(deckToCheck) {
    return deckToCheck.getKey() == deck.getKey();
  });
  this.dispatchEvent(yugi.deck.manager.model.Decks.EventType.DECKS_CHANGED);

  // Delegate further deletion to the deck service.
  this.deckService_.deleteDeck(deck.getKey());
};
