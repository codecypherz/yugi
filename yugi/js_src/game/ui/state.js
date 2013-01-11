/**
 * Model for the state of the deck editor UI.
 */

goog.provide('yugi.game.ui.State');
goog.provide('yugi.game.ui.State.EventType');
goog.provide('yugi.game.ui.State.Mode');
goog.provide('yugi.game.ui.State.ModeChangedEvent');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.model.Player');
goog.require('yugi.game.model.Synchronization');



/**
 * Model for the state of the deck editor UI.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.ui.State = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = yugi.game.model.Game.get();

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = yugi.game.model.Chat.get();

  /**
   * @type {!yugi.game.model.Synchronization}
   * @private
   */
  this.synchronization_ = yugi.game.model.Synchronization.get();

  /**
   * @type {!yugi.game.ui.State.Mode}
   * @private
   */
  this.mode_ = yugi.game.ui.State.Mode.DECK_SELECT;

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  // If the player selects their deck, start waiting.
  var player = this.game_.getPlayer();
  handler.listen(player,
      yugi.game.model.Player.EventType.DECK_SELECTED,
      this.onPlayerDeckSelected_);

  // Listen for when the players' decks have loaded to know when to switch to
  // the in-game UI.
  handler.listen(player,
      yugi.game.model.Player.EventType.DECK_LOADED,
      this.setModeBasedOnDeckAndSyncState_);
  handler.listen(this.game_.getOpponent(),
      yugi.game.model.Player.EventType.DECK_LOADED,
      this.setModeBasedOnDeckAndSyncState_);

  // TODO Listen for when the opponent joins and maybe switch to a different
  // waiting screen?
  /*
  handler.listen(this.game_,
      yugi.game.model.Game.EventType.OPPONENT_JOINED,
      this.onOpponentJoined_);
  */

  // Listen for synchronization updates.
  handler.listen(this.synchronization_,
      [yugi.game.model.Synchronization.EventType.WAITING,
       yugi.game.model.Synchronization.EventType.STARTED,
       yugi.game.model.Synchronization.EventType.FINISHED],
      this.setModeBasedOnDeckAndSyncState_);
};
goog.inherits(yugi.game.ui.State, goog.events.EventTarget);


/**
 * The set of modes the UI can be in.
 * @enum {string}
 */
yugi.game.ui.State.Mode = {
  BROWSING: 'browsing',
  DECK_SELECT: 'deck-select',
  FIELD: 'field',
  SYNCHRONIZING: 'synchronizing',
  WAITING_FOR_OPPONENT_JOIN: 'waiting-for-opponent-join'
};


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.ui.State.prototype.logger =
    goog.debug.Logger.getLogger('yugi.game.ui.State');


/**
 * @type {!yugi.game.ui.State}
 * @private
 */
yugi.game.ui.State.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.game.ui.State.EventType = {
  MODE_CHANGED: goog.events.getUniqueId('mode-changed')
};


/**
 * Registers an instance of the model.
 * @return {!yugi.game.ui.State} The registered instance.
 */
yugi.game.ui.State.register = function() {
  yugi.game.ui.State.instance_ = new yugi.game.ui.State();
  return yugi.game.ui.State.get();
};


/**
 * @return {!yugi.game.ui.State} The model for UI state.
 */
yugi.game.ui.State.get = function() {
  return yugi.game.ui.State.instance_;
};


/**
 * @return {!yugi.game.ui.State.Mode} The current mode.
 */
yugi.game.ui.State.prototype.getMode = function() {
  return this.mode_;
};


/**
 * @param {!yugi.game.ui.State.Mode} mode The mode to set.
 */
yugi.game.ui.State.prototype.setMode = function(mode) {
  if (this.mode_ == mode) {
    return;
  }

  this.mode_ = mode;
  this.logger.info('The mode changed to ' + mode);
  this.dispatchEvent(new yugi.game.ui.State.ModeChangedEvent(mode));
};


/**
 * Called when the player selects their deck.
 * @private
 */
yugi.game.ui.State.prototype.onPlayerDeckSelected_ = function() {
  this.logger.info(
      'Player selected their deck, so now we wait for deck loading.');
  this.setMode(yugi.game.ui.State.Mode.WAITING_FOR_OPPONENT_JOIN);
};


/**
 * Sets the mode based on deck load and synchronization state.
 * @private
 */
yugi.game.ui.State.prototype.setModeBasedOnDeckAndSyncState_ = function() {

  // Get some model information for convenience.
  var syncState = this.synchronization_.getState();
  var playerDeckLoaded = this.game_.getPlayer().isDeckLoaded();
  var opponentDeckLoaded = this.game_.getOpponent().isDeckLoaded();

  // Check the synchronization state first.
  if (syncState == yugi.game.model.Synchronization.State.UNKNOWN ||
      syncState == yugi.game.model.Synchronization.State.FINISHED) {

    // Not currently synchronizing, so set mode based on deck load status.
    if (playerDeckLoaded && opponentDeckLoaded) {

      // The game can only begin once synchronization is finished and both
      // players' decks have loaded on this client.
      this.setMode(yugi.game.ui.State.Mode.FIELD);

    } else if (playerDeckLoaded || this.game_.getPlayer().isDeckSelected()) {

      // TODO Check if there is an opponent and their deck selection status.
      // If they haven't selected a deck, show a different screen since this
      // client is technically no longer waiting for an opponent to join.

      // We are waiting (as in not selecting a deck) if synchronization is
      // finished and we have a loaded deck or are waiting for the deck to load.
      this.setMode(yugi.game.ui.State.Mode.WAITING_FOR_OPPONENT_JOIN);

    } else {

      // The opponent's deck may be loaded, but we want deck selection anyway,
      // because the player hasn't selected one yet.
      this.setMode(yugi.game.ui.State.Mode.DECK_SELECT);
    }

  } else {

    // Synchronization is either waiting to start or started.
    this.setMode(yugi.game.ui.State.Mode.SYNCHRONIZING);
  }
};



/**
 * The event that gets dispatched when the mode changes.
 * @param {!yugi.game.ui.State.Mode} mode The new mode.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.game.ui.State.ModeChangedEvent = function(mode) {
  goog.base(this, yugi.game.ui.State.EventType.MODE_CHANGED);

  /**
   * @type {!yugi.game.ui.State.Mode}
   */
  this.mode = mode;
};
goog.inherits(yugi.game.ui.State.ModeChangedEvent, goog.events.Event);
