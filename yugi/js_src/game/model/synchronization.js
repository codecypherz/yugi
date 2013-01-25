/**
 * Model responsible for synchronization.
 */

goog.provide('yugi.game.model.Synchronization');
goog.provide('yugi.game.model.Synchronization.EventType');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('yugi.service.DeckService');



/**
 * Model responsible for synchronization.
 * @param {!yugi.game.model.Game} game This client's game state.
 * @param {!yugi.service.DeckService} deckService The deck service.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.model.Synchronization = function(game, deckService, cardCache) {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = game;

  /**
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
   * @type {!yugi.game.model.Synchronization.State}
   * @private
   */
  this.state_ = yugi.game.model.Synchronization.State.UNKNOWN;

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  handler.listen(this.deckService_,
      yugi.service.DeckService.EventType.LOADED,
      this.onDeckLoaded_);
};
goog.inherits(yugi.game.model.Synchronization, goog.events.EventTarget);


/**
 * The other client's game state that was sent to this client.
 * @type {yugi.game.data.GameData}
 * @private
 */
yugi.game.model.Synchronization.prototype.gameData_ = null;


/**
 * Keeps track of the number of decks that need to load.
 * @type {number}
 * @private
 */
yugi.game.model.Synchronization.prototype.numDecksToLoad_ = 0;


/**
 * The ID for the request to download the deck.
 * @type {?string}
 * @private
 */
yugi.game.model.Synchronization.prototype.playerDeckRequestId_ = null;


/**
 * The ID for the request to download the deck.
 * @type {?string}
 * @private
 */
yugi.game.model.Synchronization.prototype.opponentDeckRequestId_ = null;


/**
 * The different states of synchronization.
 * @enum {string}
 */
yugi.game.model.Synchronization.State = {
  FINISHED: 'finished',
  STARTED: 'started',
  UNKNOWN: 'unknown',
  WAITING: 'waiting'
};


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.game.model.Synchronization.EventType = {
  FINISHED: goog.events.getUniqueId('finished'),
  STARTED: goog.events.getUniqueId('started'),
  WAITING: goog.events.getUniqueId('waiting')
};


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.model.Synchronization.prototype.logger =
    goog.debug.Logger.getLogger('yugi.game.model.Synchronization');


/**
 * @type {!yugi.game.model.Synchronization}
 * @private
 */
yugi.game.model.Synchronization.instance_;


/**
 * Registers an instance of the model.
 * @param {!yugi.game.model.Game} game This client's game state.
 * @param {!yugi.service.DeckService} deckService The deck service.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 * @return {!yugi.game.model.Synchronization} The registered instance.
 */
yugi.game.model.Synchronization.register = function(game, deckService,
    cardCache) {
  yugi.game.model.Synchronization.instance_ =
      new yugi.game.model.Synchronization(game, deckService, cardCache);
  return yugi.game.model.Synchronization.get();
};


/**
 * @return {!yugi.game.model.Synchronization} The model for synchronization.
 */
yugi.game.model.Synchronization.get = function() {
  return yugi.game.model.Synchronization.instance_;
};


/**
 * @return {!yugi.game.model.Synchronization.State} The current state.
 */
yugi.game.model.Synchronization.prototype.getState = function() {
  return this.state_;
};


/**
 * Tells the model to wait for synchronization data.
 */
yugi.game.model.Synchronization.prototype.wait = function() {
  if (this.state_ != yugi.game.model.Synchronization.State.UNKNOWN) {
    this.logger.warning('Ignoring wait() because in bad state.');
    return;
  }

  // Notify everyone that we are waiting for synchronization data.
  this.state_ = yugi.game.model.Synchronization.State.WAITING;
  this.dispatchEvent(yugi.game.model.Synchronization.EventType.WAITING);
};


/**
 * Starts the synchronization process.  This will fetch both players' deck
 * information and then set all the data appropriately.  Various events are
 * dispatched to allow the UI to update the user throughout the process.
 * @param {!yugi.game.data.GameData} gameData The other client's game data.
 */
yugi.game.model.Synchronization.prototype.start = function(gameData) {

  if (this.state_ != yugi.game.model.Synchronization.State.WAITING) {
    this.logger.severe('An attempt was made to start synchronization, but we ' +
        'weren\'t waiting for it.');
    return;
  }

  this.gameData_ = gameData;
  this.numDecksToLoad_ = 2;
  this.state_ = yugi.game.model.Synchronization.State.STARTED;
  this.dispatchEvent(yugi.game.model.Synchronization.EventType.STARTED);

  // The other client considers this player as the opponent.
  var playerData = gameData.getOpponentData();
  if (!playerData) {
    // The other client doesn't know about this player - this is a broken state.
    throw new Error(
        'The other client did not have this player\'s information.');
  }

  var playerDeckData = playerData.getDeckData();
  var playerDeckKey = playerDeckData ? playerDeckData.getKey() : null;
  if (playerDeckKey) {
    this.logger.info('Loading this player\'s deck.');
    this.playerDeckRequestId_ = this.deckService_.load(playerDeckKey);
  } else {
    // If there's no deck data, then this player must not have selected a deck.
    // TODO Move to the deck selection screen while opponent info downloads?
    this.logger.info('The player hasn\'t yet chosen a deck.');
    this.numDecksToLoad_--;
  }

  // This client's opponent is the player in the data.
  var opponentData = gameData.getPlayerData();
  if (!opponentData) {
    // The other client doesn't know about itself - there is something majorly
    // wrong here.
    throw new Error('The other client did not have its own information.');
  }

  var opponentDeckData = opponentData.getDeckData();
  var opponentDeckKey = opponentDeckData ? opponentDeckData.getKey() : null;
  if (opponentDeckKey) {
    this.logger.info('Loading the opponent\'s deck.');
    this.opponentDeckRequestId_ = this.deckService_.load(opponentDeckKey);
  } else {
    // If there's no deck data, then the opponent must not have selected a deck.
    this.logger.info('The opponent hasn\'t yet chosen a deck.');
    this.numDecksToLoad_--;
  }

  // Special case if neither player has selected a deck.
  if (this.numDecksToLoad_ == 0) {
    this.logger.info(
        'Neither player has selected a deck, so synchronization is finished.');
    this.game_.setFromData(this.gameData_, this.cardCache_);
    this.state_ = yugi.game.model.Synchronization.State.FINISHED;
    this.dispatchEvent(yugi.game.model.Synchronization.EventType.FINISHED);
  }
};


/**
 * @return {boolean} True if waiting for synchronization data, false otherwise.
 */
yugi.game.model.Synchronization.prototype.isWaiting = function() {
  return this.state_ == yugi.game.model.Synchronization.State.WAITING;
};


/**
 * Called when a deck loads.
 * @param {!yugi.service.DeckService.LoadEvent} e The deck load event.
 * @private
 */
yugi.game.model.Synchronization.prototype.onDeckLoaded_ = function(e) {

  var deck = e.deck;

  // Make sure this load event is for this model.
  var player = null;
  if (this.playerDeckRequestId_ == e.id) {
    this.playerDeckRequestId_ = null;
    player = this.game_.getPlayer();
    this.logger.info('The player deck just loaded.');
  } else if (this.opponentDeckRequestId_ == e.id) {
    this.opponentDeckRequestId_ = null;
    player = this.game_.getOpponent();
    this.logger.info('The opponent deck just loaded.');
  } else {
    this.logger.info('Ignoring a deck load event.');
    return;
  }

  // Make sure the load event was expected.
  if (this.numDecksToLoad_ == 0) {
    this.logger.severe('A deck was loaded without expectation.');
    return;
  }
  this.logger.info('A deck finished loading - putting all cards in the cache.');

  // Whenever a deck loads, put all cards into the card cache and set the
  // original on the player for accurate resets.
  player.setOriginalDeck(deck);
  goog.array.forEach(deck.getAllCards(), function(card) {
    this.cardCache_.put(card);
  }, this);

  // We just loaded a deck, so check if we are done now.
  player.markDeckLoaded();
  this.logger.info('Marked the deck as loaded.');
  this.numDecksToLoad_--;
  this.maybeFinish_();
};


/**
 * Checks to see if deck loading is done and finishes synchronization.
 * @private
 */
yugi.game.model.Synchronization.prototype.maybeFinish_ = function() {
  if (this.numDecksToLoad_ == 0) {
    this.logger.info('Finished downloading all the decks - setting game info.');

    if (!this.gameData_) {
      throw new Error('No game data set in order to continue synchronization');
    }

    // Set the game info and tell everyone we are done.
    this.game_.setFromData(this.gameData_, this.cardCache_);
    this.state_ = yugi.game.model.Synchronization.State.FINISHED;
    this.dispatchEvent(yugi.game.model.Synchronization.EventType.FINISHED);
  }
};
