/**
 * Keeps state for a given player.
 */

goog.provide('yugi.game.model.Player');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.math');
goog.require('goog.math.Range');
goog.require('yugi.game.data.DeckData');
goog.require('yugi.game.data.PlayerData');
goog.require('yugi.game.model.Field');
goog.require('yugi.model.CardList');
goog.require('yugi.model.Deck');
goog.require('yugi.service.DeckService');



/**
 * Keeps state for a given player.
 * @param {!yugi.service.DeckService} deckService The deck service.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.model.Player = function(deckService, cardCache) {
  goog.base(this);

  /**
   * This will be used to fetch the full contents of the deck the player chose.
   * @type {!yugi.service.DeckService}
   * @private
   */
  this.deckService_ = deckService;

  /**
   * @type {!yugi.model.CardCache}
   * @private
   */
  this.cardCache_ = cardCache;

  /**
   * The original, unmodified deck as defined by the server.  Do not modify this
   * object except when setting it after receiving it from the server.  This is
   * used when resetting the player's cards and is the state authority.
   * @type {!yugi.model.Deck}
   * @private
   */
  this.originalDeckReadOnly_ = new yugi.model.Deck();

  /**
   * @type {!yugi.model.Deck}
   * @private
   */
  this.deck_ = new yugi.model.Deck();

  /**
   * @type {!yugi.model.CardList}
   * @private
   */
  this.hand_ = new yugi.model.CardList();

  /**
   * @type {!yugi.game.model.Field}
   * @private
   */
  this.field_ = new yugi.game.model.Field();

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  // Listen for when the player's deck loads.
  handler.listen(this.deckService_,
      yugi.service.DeckService.EventType.LOADED,
      this.onDeckLoaded_);
};
goog.inherits(yugi.game.model.Player, goog.events.EventTarget);


/**
 * The set of events dispatched by this model.
 * @enum {string}
 */
yugi.game.model.Player.EventType = {
  DECK_CHANGED: goog.events.getUniqueId('deck-changed'),
  DECK_LOADED: goog.events.getUniqueId('deck-loaded'),
  DECK_SELECTED: goog.events.getUniqueId('deck-selected'),
  LIFE_POINTS_CHANGED: goog.events.getUniqueId('life-points-changed')
};


/**
 * The allowed range for life points.  Life points cannot be negative and the
 * upper end is theoretically unbounded.  It's set at something arbitrarily high
 * so the UI won't get caught completely off guard with abnormally high values.
 * @type {!goog.math.Range}
 * @const
 * @private
 */
yugi.game.model.Player.LIFE_POINT_RANGE_ = new goog.math.Range(0, 1000000);


/**
 * The starting number of life points that a player is allotted.
 * @type {number}
 * @const
 * @private
 */
yugi.game.model.Player.STARTING_LIFE_POINTS_ = 8000;


/**
 * The name of the player.
 * @type {string}
 * @private
 */
yugi.game.model.Player.prototype.name_ = '';


/**
 * The connection status of this player.
 * @type {boolean}
 * @private
 */
yugi.game.model.Player.prototype.connected_ = false;


/**
 * True if the player has selected their deck or not.
 * @type {boolean}
 * @private
 */
yugi.game.model.Player.prototype.deckSelected_ = false;


/**
 * True if this player is the opponent, false otherwise.
 * @type {boolean}
 * @private
 */
yugi.game.model.Player.prototype.isOpponent_ = false;


/**
 * True if this player's deck has loaded.  This is not data that needs to be
 * sent over the wire.  This is used, instead, to keep track of whether or not
 * game data can be handled by this client.  Overall, all deck data needs to
 * have been downloaded before any card key lookup is going to succeed.
 * @private
 */
yugi.game.model.Player.prototype.deckLoaded_ = false;


/**
 * The ID of the request to load this player's deck.
 * @type {?string}
 * @private
 */
yugi.game.model.Player.prototype.deckLoadId_ = null;


/**
 * @type {number}
 * @private
 */
yugi.game.model.Player.prototype.lifePoints_ =
    yugi.game.model.Player.STARTING_LIFE_POINTS_;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.model.Player.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.model.Player');


/**
 * @param {string} name The name of the player.
 */
yugi.game.model.Player.prototype.setName = function(name) {
  this.name_ = name;
};


/**
 * @return {string} The player's name.
 */
yugi.game.model.Player.prototype.getName = function() {
  return this.name_;
};


/**
 * @param {boolean} isOpponent True if this player is the opponent or not.
 */
yugi.game.model.Player.prototype.setOpponent = function(isOpponent) {
  this.isOpponent_ = isOpponent;
};


/**
 * @return {boolean} True if this player is the opponent or not.
 */
yugi.game.model.Player.prototype.isOpponent = function() {
  return this.isOpponent_;
};


/**
 * Selects the deck with the given key.
 * @param {string} deckKey The key of the deck to select.
 */
yugi.game.model.Player.prototype.selectDeck = function(deckKey) {
  // Make sure the deck wasn't already loaded.
  if (this.deckSelected_) {
    throw new Error(this.name_ + '\'s deck was already selected.');
  }
  if (goog.isDefAndNotNull(this.deckLoadId_)) {
    throw new Error(this.name_ + '\'s deck is already loading.');
  }

  // Set the deck as selected, but not loaded.
  this.deckSelected_ = true;
  this.dispatchEvent(yugi.game.model.Player.EventType.DECK_SELECTED);

  // Start loading the deck.
  this.deckLoadId_ = this.deckService_.load(deckKey);
};


/**
 * This function should only be called when the player's deck is downloaded for
 * the first time on this client.  This is to make resets work despite card
 * transfers.
 * @param {!yugi.model.Deck} originalDeck The original deck.
 */
yugi.game.model.Player.prototype.setOriginalDeck = function(originalDeck) {
  this.originalDeckReadOnly_ = originalDeck;
};


/**
 * @param {!yugi.model.Deck} deck The deck to set.
 */
yugi.game.model.Player.prototype.setDeck = function(deck) {
  this.deck_ = deck;
};


/**
 * @return {!yugi.model.Deck} The player's deck.
 */
yugi.game.model.Player.prototype.getDeck = function() {
  return this.deck_;
};


/**
 * @return {boolean} True if this player has selected their deck or not.
 */
yugi.game.model.Player.prototype.isDeckSelected = function() {
  return this.deckSelected_;
};


/**
 * Marks this player's deck as having been loaded.
 */
yugi.game.model.Player.prototype.markDeckLoaded = function() {
  this.deckLoaded_ = true;
  this.dispatchEvent(yugi.game.model.Player.EventType.DECK_LOADED);
};


/**
 * True if the deck has loaded or not.  This is different than deck selection.
 * The user may have selected a deck but all the cards may not have been
 * downloaded to this client.
 * @return {boolean} True if the deck has loaded or not.
 */
yugi.game.model.Player.prototype.isDeckLoaded = function() {
  return this.deckLoaded_;
};


/**
 * @return {!yugi.model.CardList} The player's hand.
 */
yugi.game.model.Player.prototype.getHand = function() {
  return this.hand_;
};


/**
 * @param {!yugi.model.CardList} hand The player's hand.
 */
yugi.game.model.Player.prototype.setHand = function(hand) {
  this.hand_ = hand;
};


/**
 * @return {!yugi.game.model.Field} The player's field.
 */
yugi.game.model.Player.prototype.getField = function() {
  return this.field_;
};


/**
 * @param {!yugi.game.model.Field} field The player's field.
 */
yugi.game.model.Player.prototype.setField = function(field) {
  this.field_ = field;
};


/**
 * @param {boolean} connected True if the player is connected or not.
 */
yugi.game.model.Player.prototype.setConnected = function(connected) {
  this.connected_ = connected;
};


/**
 * @return {boolean} True if the player is connected or not.
 */
yugi.game.model.Player.prototype.isConnected = function() {
  return this.connected_;
};


/**
 * Sets the life points for the player.  The number is clamped to the allowed
 * range.
 * @param {number} lifePoints The life points for the player.
 * @return {number} The life point value after any action is taken.
 */
yugi.game.model.Player.prototype.setLifePoints = function(lifePoints) {

  // Bound the life points within the allowed range.
  lifePoints = goog.math.clamp(lifePoints,
      yugi.game.model.Player.LIFE_POINT_RANGE_.start,
      yugi.game.model.Player.LIFE_POINT_RANGE_.end);

  // Dispatch an event if the life points changed.
  if (this.lifePoints_ != lifePoints) {
    this.lifePoints_ = lifePoints;
    this.dispatchEvent(yugi.game.model.Player.EventType.LIFE_POINTS_CHANGED);
  }

  // Always return the current life point value.
  return this.lifePoints_;
};


/**
 * @return {number} The life points for the player.
 */
yugi.game.model.Player.prototype.getLifePoints = function() {
  return this.lifePoints_;
};


/**
 * Resets the player's card state by putting everything back into the deck and
 * shuffling.
 */
yugi.game.model.Player.prototype.reset = function() {
  this.logger.info('Resetting this player\'s state.');

  this.setLifePoints(yugi.game.model.Player.STARTING_LIFE_POINTS_);

  this.hand_.removeAll();
  this.field_.removeAll();

  this.deck_ = this.originalDeckReadOnly_.clone();
  this.deck_.shuffle();

  this.dispatchEvent(yugi.game.model.Player.EventType.DECK_CHANGED);
};


/**
 * Searches through everything the player has and removes the card completely.
 * Events are dispatched as expected.
 * @param {!yugi.model.Card} card The card to remove.
 * @return {boolean} True if the card was removed or not.
 */
yugi.game.model.Player.prototype.removeCard = function(card) {

  // Try the field first, then the hand, then the deck.  The order was chosen
  // based on likelihood use of this feature.

  var removed = this.field_.removeCard(card);
  if (!removed) {
    removed = this.hand_.remove(card);
  }
  if (!removed) {
    removed = this.deck_.remove(card, yugi.model.Deck.Type.MAIN);
  }
  if (!removed) {
    removed = this.deck_.remove(card, yugi.model.Deck.Type.EXTRA);
  }
  if (!removed) {
    removed = this.deck_.remove(card, yugi.model.Deck.Type.SIDE);
  }
  return removed;
};


/**
 * Called when a deck has loaded.
 * @param {!yugi.service.DeckService.LoadEvent} e The load event.
 * @private
 */
yugi.game.model.Player.prototype.onDeckLoaded_ = function(e) {
  // Make sure this deck load was for this player.
  if (!goog.isDefAndNotNull(this.deckLoadId_) || this.deckLoadId_ != e.id) {
    var name = this.name_ || 'opponent';
    this.logger.info('Ignoring a deck load event for player: ' + name);
    return;
  }

  // Put all the cards in the card cache.
  goog.array.forEach(e.deck.getAllCards(), function(card) {
    this.cardCache_.put(card);
  }, this);

  this.logger.info(this.name_ + '\'s deck finished loading.');
  this.deckLoadId_ = null;
  this.deck_ = e.deck;
  this.originalDeckReadOnly_ = this.deck_.clone();
  this.markDeckLoaded();

  // Shuffle the deck after loading.
  this.deck_.shuffle();
};


/**
 * Converts this object to a data object.
 * @return {!yugi.game.data.PlayerData} The converted data object.
 */
yugi.game.model.Player.prototype.toData = function() {
  var playerData = new yugi.game.data.PlayerData();

  var deckData = new yugi.game.data.DeckData();
  deckData.setKey(this.deck_.getKey());
  deckData.setMainCardData(this.deck_.getMainCardList().toData());
  deckData.setExtraCardData(this.deck_.getExtraCardList().toData());
  deckData.setSideCardData(this.deck_.getSideCardList().toData());

  playerData.setName(this.name_);
  playerData.setOpponent(this.isOpponent_);
  playerData.setDeckSelected(this.deckSelected_);
  playerData.setDeckData(deckData);
  playerData.setHandData(this.hand_.toData());
  playerData.setFieldData(this.field_.toData());
  playerData.setLifePoints(this.lifePoints_);

  return playerData;
};


/**
 * Sets this state based on the given data.
 * @param {!yugi.game.data.PlayerData} playerData The data.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 */
yugi.game.model.Player.prototype.setFromData = function(playerData, cardCache) {

  // Only set the name if it is unknown.
  if (!this.name_) {
    this.name_ = playerData.getName();
  }

  // Synchronize deck data.
  var deckData = playerData.getDeckData();
  var deck = new yugi.model.Deck();
  deck.setKey(deckData.getKey());
  deck.getMainCardList().setFromData(deckData.getMainCardData(), cardCache);
  deck.getExtraCardList().setFromData(deckData.getExtraCardData(), cardCache);
  deck.getSideCardList().setFromData(deckData.getSideCardData(), cardCache);
  this.deck_.setFromDeck(deck);
  this.deckSelected_ = playerData.isDeckSelected();
  this.dispatchEvent(yugi.game.model.Player.EventType.DECK_CHANGED);

  // Synchronize the hand.
  this.hand_.setFromData(playerData.getHandData(), cardCache);

  // Synchronize the field.
  this.field_.setFromData(playerData.getFieldData(), cardCache);

  this.setLifePoints(playerData.getLifePoints());

  // Note: no connection status is set here.  That is entirely managed outside
  // of the scope of this function.

  // Note: The opponent flag is not set since we are relying on the game object
  // to set that flag properly during construction.
};
