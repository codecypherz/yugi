/**
 * Keeps track of game state for this client.
 */

goog.provide('yugi.game.model.Game');
goog.provide('yugi.game.model.Game.EventType');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('yugi.game.data.GameData');
goog.require('yugi.game.model.Player');



/**
 * Keeps track of game state for this client.
 * @param {!yugi.service.DeckService} deckService The deck service.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.model.Game = function(deckService, cardCache) {
  goog.base(this);

  /**
   * The "self" player or this client's player.
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = new yugi.game.model.Player(deckService, cardCache);

  /**
   * The player's opponent.
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.opponent_ = new yugi.game.model.Player(deckService, cardCache);
  this.opponent_.setOpponent(true);
};
goog.inherits(yugi.game.model.Game, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.model.Game.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.model.Game');


/**
 * The game's key on the server.
 * @type {string}
 * @private
 */
yugi.game.model.Game.prototype.key_ = '';


/**
 * @type {boolean}
 * @private
 */
yugi.game.model.Game.prototype.opponentJoined_ = false;


/**
 * The set of events dispatched by this model.
 * @enum {string}
 */
yugi.game.model.Game.EventType = {
  OPPONENT_JOINED: goog.events.getUniqueId('opponent-joined')
};


/**
 * @type {!yugi.game.model.Game}
 * @private
 */
yugi.game.model.Game.instance_;


/**
 * Registers an instance of the chat model.
 * @param {string} key The server's game key.
 * @param {string} playerName The name of the player.
 * @param {!yugi.service.DeckService} deckService The deck service.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 * @return {!yugi.game.model.Game} The registered instance.
 */
yugi.game.model.Game.register = function(key, playerName, deckService,
    cardCache) {

  var game = new yugi.game.model.Game(deckService, cardCache);
  yugi.game.model.Game.instance_ = game;

  game.setKey(key);

  var player = game.getPlayer();
  player.setName(playerName);
  player.setConnected(true);

  return yugi.game.model.Game.get();
};


/**
 * @return {!yugi.game.model.Game} The chat model.
 */
yugi.game.model.Game.get = function() {
  return yugi.game.model.Game.instance_;
};


/**
 * @return {string} The server's game key.
 */
yugi.game.model.Game.prototype.getKey = function() {
  return this.key_;
};


/**
 * @param {string} key The server's game key.
 */
yugi.game.model.Game.prototype.setKey = function(key) {
  this.key_ = key;
};


/**
 * @return {!yugi.game.model.Player} The player.
 */
yugi.game.model.Game.prototype.getPlayer = function() {
  return this.player_;
};


/**
 * @param {!yugi.game.model.Player} player The player.
 */
yugi.game.model.Game.prototype.setPlayer = function(player) {
  this.player_ = player;
};


/**
 * @return {!yugi.game.model.Player} The player's opponent.
 */
yugi.game.model.Game.prototype.getOpponent = function() {
  return this.opponent_;
};


/**
 * @param {!yugi.game.model.Player} opponent The player's opponent.
 */
yugi.game.model.Game.prototype.setOpponent = function(opponent) {
  this.opponent_ = opponent;
  this.markOpponentJoined_();
};


/**
 * @return {boolean} True if the opponent has joined or not.
 */
yugi.game.model.Game.prototype.hasOpponentJoined = function() {
  return this.opponentJoined_;
};


/**
 * Marks the opponent as joined.  It's not parameterized because it is not
 * expected for an opponent to "unjoin" a game.
 * @private
 */
yugi.game.model.Game.prototype.markOpponentJoined_ = function() {

  // Only dispatch the event if the value changed.
  if (!this.opponentJoined_) {
    this.opponentJoined_ = true;
    this.dispatchEvent(yugi.game.model.Game.EventType.OPPONENT_JOINED);
  }
};


/**
 * Converts this object to a GameData object.
 * @return {!yugi.game.data.GameData} The converted game data object.
 */
yugi.game.model.Game.prototype.toData = function() {
  var gameData = new yugi.game.data.GameData();
  gameData.setPlayerData(this.player_.toData());
  gameData.setOpponentData(this.opponent_.toData());
  gameData.setKey(this.key_);
  gameData.setOpponentJoined(this.opponentJoined_);
  return gameData;
};


/**
 * Sets this game state based on the given game data.
 * @param {!yugi.game.data.GameData} gameData The game data.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 */
yugi.game.model.Game.prototype.setFromData = function(gameData, cardCache) {
  this.logger.info('Setting from game data.');

  // Sanity check.
  if (this.getKey() != gameData.getKey()) {

    // If the keys don't match, don't do anything else - something is really
    // wrong here.
    this.logger.severe('The other game object had a different key.');
    return;
  }

  // Flip player/opponent data.
  this.player_.setFromData(gameData.getOpponentData(), cardCache);
  this.opponent_.setFromData(gameData.getPlayerData(), cardCache);

  // The opponent is considered joined because you can't get this game data
  // without the opponent sending it to this client.
  this.markOpponentJoined_();
};
