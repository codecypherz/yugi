/**
 * Tests for yugi.game.model.Synchronization.
 */

/** @suppress {extraProvide} */
goog.provide('yugi.game.model.SynchronizationTest');

goog.require('goog.testing.MockControl');
goog.require('yugi.game.data.GameData');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.model.Player');
goog.require('yugi.game.model.Synchronization');
goog.require('yugi.model.CardCache');
goog.require('yugi.model.Deck');
goog.require('yugi.service.DeckService');
goog.require('yugi.test');

var mc;
var mockGame;
var mockDeckService;
var mockCardCache;
var synchronization;

function setUp() {
  mc = new goog.testing.MockControl();

  mockGame = mc.createLooseMock(yugi.game.model.Game);
  mockDeckService = mc.createLooseMock(yugi.service.DeckService);
  mockCardCache = mc.createLooseMock(yugi.model.CardCache);

  yugi.test.expectAnyListeners(mockDeckService);

  yugi.test.verify(mc, function() {
    synchronization = new yugi.game.model.Synchronization(
        mockGame, mockDeckService, mockCardCache);
  });
}

function tearDown() {
  yugi.test.tearDown(mc, synchronization);
}

function testPreconditions() {
  assertEquals(
      yugi.game.model.Synchronization.State.UNKNOWN,
      synchronization.getState());
}

function testSync_noDeckSelection() {
  synchronization.wait();

  var gameData = new yugi.game.data.GameData();

  mockGame.setFromData(gameData, mockCardCache);

  yugi.test.verify(mc, function() {
    synchronization.start(gameData);
  });

  assertEquals(
      yugi.game.model.Synchronization.State.FINISHED,
      synchronization.getState());
}

function testSync_opponentDeckSelection() {
  synchronization.wait();

  // Game data comes from the opponent.  So player data is really the opponent's
  // data and opponent data is this player's data in this case.
  var gameData = new yugi.game.data.GameData();
  var opponentData = gameData.getPlayerData();
  var opponentDeckData = opponentData.getDeckData();
  opponentDeckData.setKey('opp-deck-key');

  // Expect the opponent deck to start loading.
  mockDeckService.load('opp-deck-key').$returns('opp-deck-req-id');

  // Expect synchronization only to have just started.
  yugi.test.verify(mc, function() {
    synchronization.start(gameData);
  });

  assertEquals(
      yugi.game.model.Synchronization.State.STARTED,
      synchronization.getState());

  var mockOpponent = mc.createLooseMock(yugi.game.model.Player);
  var mockPlayer = mc.createLooseMock(yugi.game.model.Player);

  // Expect the game data to be set and synchronization finished.
  var opponentDeck = new yugi.model.Deck();
  mockOpponent.setOriginalDeck(opponentDeck);
  mockOpponent.markDeckLoaded();
  mockGame.getOpponent().$returns(mockOpponent).$anyTimes();
  mockGame.getPlayer().$returns(mockPlayer).$anyTimes();
  mockOpponent.isDeckLoaded().$returns(true).$anyTimes();
  mockPlayer.isDeckLoaded().$returns(false).$anyTimes();
  mockGame.setFromData(gameData, mockCardCache);

  // Simulate the opponent's deck loading.
  yugi.test.dispatchAndVerify(mc, mockDeckService,
      new yugi.service.DeckService.LoadEvent('opp-deck-req-id', opponentDeck));

  assertEquals(
      yugi.game.model.Synchronization.State.FINISHED,
      synchronization.getState());
}

function testSync_playerDeckSelection() {
  synchronization.wait();

  // Game data comes from the opponent.  So player data is really the opponent's
  // data and opponent data is this player's data in this case.
  var gameData = new yugi.game.data.GameData();
  var playerData = gameData.getOpponentData();
  var playerDeckData = playerData.getDeckData();
  playerDeckData.setKey('player-deck-key');

  // Expect the player deck to start loading.
  mockDeckService.load('player-deck-key').$returns('player-deck-req-id');

  // Expect synchronization only to have just started.
  yugi.test.verify(mc, function() {
    synchronization.start(gameData);
  });

  assertEquals(
      yugi.game.model.Synchronization.State.STARTED,
      synchronization.getState());

  var mockOpponent = mc.createLooseMock(yugi.game.model.Player);
  var mockPlayer = mc.createLooseMock(yugi.game.model.Player);

  // Expect the game data to be set and synchronization finished.
  var playerDeck = new yugi.model.Deck();
  mockPlayer.setOriginalDeck(playerDeck);
  mockPlayer.markDeckLoaded();
  mockGame.getOpponent().$returns(mockOpponent).$anyTimes();
  mockGame.getPlayer().$returns(mockPlayer).$anyTimes();
  mockOpponent.isDeckLoaded().$returns(false).$anyTimes();
  mockPlayer.isDeckLoaded().$returns(true).$anyTimes();
  mockGame.setFromData(gameData, mockCardCache);

  // Simulate the players's deck loading.
  yugi.test.dispatchAndVerify(mc, mockDeckService,
      new yugi.service.DeckService.LoadEvent('player-deck-req-id', playerDeck));

  assertEquals(
      yugi.game.model.Synchronization.State.FINISHED,
      synchronization.getState());
}

function testSync_bothDecksSelected() {
  synchronization.wait();

  // Game data comes from the opponent.  So player data is really the opponent's
  // data and opponent data is this player's data in this case.
  var gameData = new yugi.game.data.GameData();
  var opponentData = gameData.getPlayerData();
  var opponentDeckData = opponentData.getDeckData();
  opponentDeckData.setKey('opp-deck-key');
  var playerData = gameData.getOpponentData();
  var playerDeckData = playerData.getDeckData();
  playerDeckData.setKey('player-deck-key');

  // Expect the decks to start loading.
  mockDeckService.load('player-deck-key').$returns('player-deck-req-id');
  mockDeckService.load('opp-deck-key').$returns('opp-deck-req-id');

  // Expect synchronization only to have just started.
  yugi.test.verify(mc, function() {
    synchronization.start(gameData);
  });

  assertEquals(
      yugi.game.model.Synchronization.State.STARTED,
      synchronization.getState());

  var mockOpponent = mc.createLooseMock(yugi.game.model.Player);
  var mockPlayer = mc.createLooseMock(yugi.game.model.Player);

  // Load just the opponent deck.
  var opponentDeck = new yugi.model.Deck();
  mockOpponent.setOriginalDeck(opponentDeck);
  mockOpponent.markDeckLoaded();
  mockGame.getOpponent().$returns(mockOpponent).$anyTimes();
  mockGame.getPlayer().$returns(mockPlayer).$anyTimes();
  mockOpponent.isDeckLoaded().$returns(true).$anyTimes();
  mockPlayer.isDeckLoaded().$returns(false).$anyTimes();

  yugi.test.dispatchAndVerify(mc, mockDeckService,
      new yugi.service.DeckService.LoadEvent('opp-deck-req-id', opponentDeck));

  assertEquals(
      yugi.game.model.Synchronization.State.STARTED,
      synchronization.getState());

  // Load the player deck and expect the synchronization to be finished.
  var playerDeck = new yugi.model.Deck();
  mockPlayer.setOriginalDeck(playerDeck);
  mockPlayer.markDeckLoaded();
  mockGame.getOpponent().$returns(mockOpponent).$anyTimes();
  mockGame.getPlayer().$returns(mockPlayer).$anyTimes();
  mockOpponent.isDeckLoaded().$returns(true).$anyTimes();
  mockPlayer.isDeckLoaded().$returns(true).$anyTimes();
  mockGame.setFromData(gameData, mockCardCache);

  // Simulate the opponent's deck loading.
  yugi.test.dispatchAndVerify(mc, mockDeckService,
      new yugi.service.DeckService.LoadEvent('player-deck-req-id', playerDeck));

  assertEquals(
      yugi.game.model.Synchronization.State.FINISHED,
      synchronization.getState());
}
