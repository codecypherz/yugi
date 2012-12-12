/**
 * Model for building a deck.
 */

goog.provide('yugi.deck.editor.model.Constructor');
goog.provide('yugi.deck.editor.model.Constructor.CardsChangedEvent');
goog.provide('yugi.deck.editor.model.Constructor.EventType');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('yugi.model.Deck');
goog.require('yugi.service.DeckService');



/**
 * Model for building a deck.
 * @param {!yugi.model.Notifier} notifier The notifier.
 * @param {!yugi.service.DeckService} deckService The deck service.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.deck.editor.model.Constructor = function(notifier, deckService) {
  goog.base(this);

  /**
   * @type {!yugi.model.Notifier}
   * @private
   */
  this.notifier_ = notifier;

  /**
   * @type {!yugi.service.DeckService}
   * @private
   */
  this.deckService_ = deckService;

  /**
   * @type {!yugi.model.Deck}
   * @private
   */
  this.deck_ = new yugi.model.Deck();
  this.deck_.setName('Untitled Deck');

  /**
   * @type {!yugi.model.Deck.Type}
   * @private
   */
  this.deckType_ = yugi.model.Deck.Type.MAIN;

  /**
   * @type {!yugi.deck.editor.model.Constructor.Status}
   * @private
   */
  this.status_ = yugi.deck.editor.model.Constructor.Status.SAVED;

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  // Listen to the deck service.
  handler.listen(this.deckService_,
      yugi.service.DeckService.EventType.LOADED,
      this.onDeckLoaded_);
  handler.listen(this.deckService_,
      yugi.service.DeckService.EventType.LOAD_ERROR,
      this.onLoadError_);
  handler.listen(this.deckService_,
      yugi.service.DeckService.EventType.SAVED,
      this.onDeckSaved_);
  handler.listen(this.deckService_,
      yugi.service.DeckService.EventType.SAVE_ERROR,
      this.onSaveError_);
};
goog.inherits(yugi.deck.editor.model.Constructor, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.model.Constructor.prototype.logger =
    goog.debug.Logger.getLogger('yugi.deck.editor.model.Constructor');


/**
 * @type {!yugi.deck.editor.model.Constructor}
 * @private
 */
yugi.deck.editor.model.Constructor.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.deck.editor.model.Constructor.EventType = {
  CARDS_CHANGED: goog.events.getUniqueId('cards-changed'),
  DECK_CHANGED: goog.events.getUniqueId('deck-changed'),
  STATUS_CHANGED: goog.events.getUniqueId('status-changed')
};


/**
 * The various statuses of the deck constructor.
 * @enum {string}
 */
yugi.deck.editor.model.Constructor.Status = {
  FAILED_TO_SAVE: 'Failed to save',
  SAVED: 'Saved',
  SAVING: 'Saving...'
};


/**
 * Registers an instance of the model.
 * @param {!yugi.model.Notifier} notifier The notifier.
 * @param {!yugi.service.DeckService} deckService The deck service.
 * @return {!yugi.deck.editor.model.Constructor} The registered instance.
 */
yugi.deck.editor.model.Constructor.register = function(notifier, deckService) {
  yugi.deck.editor.model.Constructor.instance_ =
      new yugi.deck.editor.model.Constructor(notifier, deckService);
  return yugi.deck.editor.model.Constructor.get();
};


/**
 * @return {!yugi.deck.editor.model.Constructor} The model for the constructor.
 */
yugi.deck.editor.model.Constructor.get = function() {
  return yugi.deck.editor.model.Constructor.instance_;
};


/**
 * @return {!yugi.model.Deck} The deck under construction.
 */
yugi.deck.editor.model.Constructor.prototype.getDeck = function() {
  return this.deck_;
};


/**
 * @return {!yugi.model.Deck.Type} The type of deck currently being modified.
 */
yugi.deck.editor.model.Constructor.prototype.getDeckType = function() {
  return this.deckType_;
};


/**
 * @param {!yugi.model.Deck.Type} deckType The type of deck to modify.
 */
yugi.deck.editor.model.Constructor.prototype.setDeckType = function(deckType) {
  this.deckType_ = deckType;
};


/**
 * Adds a card to the current deck.
 * @param {!yugi.model.Card} card The card to add.
 */
yugi.deck.editor.model.Constructor.prototype.addCard = function(card) {
  if (!this.deck_) {
    this.logger.severe('Tried to add a card, but no deck was set.');
    return;
  }

  // Add the card to the appropriate part of the deck.
  this.notifier_.post('Added "' + card.getName() + '" to the ' +
      this.deckType_ + ' deck.');
  this.deck_.add(card, this.deckType_);
  this.deck_.sort();
  this.dispatchEvent(
      new yugi.deck.editor.model.Constructor.CardsChangedEvent(this.deck_));

  // Save the deck.
  this.save_();
};


/**
 * Removes a card to the current deck.
 * @param {!yugi.model.Card} card The card to add.
 */
yugi.deck.editor.model.Constructor.prototype.removeCard = function(card) {
  if (!this.deck_) {
    this.logger.severe('Tried to remove a card, but no deck was set.');
    return;
  }

  // Removed the card from the appropriate part of the deck.
  this.logger.info('Removed ' + card.getName() + ' from the ' +
      this.deckType_ + ' deck.');

  // Remove the card and dispatch the event.
  this.deck_.remove(card, this.deckType_);
  this.dispatchEvent(
      new yugi.deck.editor.model.Constructor.CardsChangedEvent(this.deck_));

  // Save the deck.
  this.save_();
};


/**
 * Sets the cover card.
 * @param {!yugi.model.Card} card The card to set.
 */
yugi.deck.editor.model.Constructor.prototype.setCoverCard = function(card) {
  if (!this.deck_) {
    this.logger.severe('Tried to set the cover card, but no deck was set.');
    return;
  }

  this.notifier_.post('Set ' + card.getName() + ' as the deck\'s cover card.');
  this.deck_.setMainCard(card);

  // Save the deck.
  this.save_();
};


/**
 * Sets the deck name to be the given name.
 * @param {string} name The name of the deck.
 */
yugi.deck.editor.model.Constructor.prototype.setName = function(name) {
  this.notifier_.post('Set deck name to "' + name + '"');
  this.deck_.setName(name);
  this.save_();
};


/**
 * @return {!yugi.deck.editor.model.Constructor.Status} The status of the model.
 */
yugi.deck.editor.model.Constructor.prototype.getStatus = function() {
  return this.status_;
};


/**
 * Called when the deck loads.
 * @param {!yugi.service.DeckService.LoadEvent} e The load event.
 * @private
 */
yugi.deck.editor.model.Constructor.prototype.onDeckLoaded_ = function(e) {
  this.logger.info('Setting the newly loaded deck.');

  this.deck_ = e.deck;
  this.deck_.sort();

  this.dispatchEvent(yugi.deck.editor.model.Constructor.EventType.DECK_CHANGED);

  // TODO(jdeyerle): Maybe stop dispatching this event here since the deck
  // changed event could be used instead.
  this.dispatchEvent(
      new yugi.deck.editor.model.Constructor.CardsChangedEvent(this.deck_));
};


/**
 * Called when the deck finished saving.
 * @private
 */
yugi.deck.editor.model.Constructor.prototype.onDeckSaved_ = function() {
  this.setStatus_(yugi.deck.editor.model.Constructor.Status.SAVED);
};


/**
 * Called if there was an error loading the deck.
 * @private
 */
yugi.deck.editor.model.Constructor.prototype.onLoadError_ = function() {
  this.notifier_.post('Failed to load the deck.', true);
};


/**
 * Called if there was an error saving the deck.
 * @private
 */
yugi.deck.editor.model.Constructor.prototype.onSaveError_ = function() {
  this.setStatus_(yugi.deck.editor.model.Constructor.Status.FAILED_TO_SAVE);
  this.notifier_.post('Failed to save the deck.', true);
};


/**
 * Saves the deck.
 * @private
 */
yugi.deck.editor.model.Constructor.prototype.save_ = function() {
  this.setStatus_(yugi.deck.editor.model.Constructor.Status.SAVING);
  this.deckService_.save(this.getDeck());
};


/**
 * Sets the status to the new value and maybe dispatches an event.
 * @param {!yugi.deck.editor.model.Constructor.Status} status The new status.
 * @private
 */
yugi.deck.editor.model.Constructor.prototype.setStatus_ = function(status) {
  if (this.status_ == status) {
    return;
  }
  this.status_ = status;
  this.dispatchEvent(
      yugi.deck.editor.model.Constructor.EventType.STATUS_CHANGED);
};



/**
 * This event gets fired when a card in the deck changes.
 * @param {!yugi.model.Deck} deck The deck that changed.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.deck.editor.model.Constructor.CardsChangedEvent = function(deck) {
  goog.base(this, yugi.deck.editor.model.Constructor.EventType.CARDS_CHANGED);

  /**
   * @type {!yugi.model.Deck}
   */
  this.deck = deck;
};
goog.inherits(yugi.deck.editor.model.Constructor.CardsChangedEvent,
    goog.events.Event);
