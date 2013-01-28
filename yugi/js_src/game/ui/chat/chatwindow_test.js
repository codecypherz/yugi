/**
 * Tests for yugi.game.ui.chat.ChatWindow.
 */

/** @suppress {extraProvide} */
goog.provide('yugi.game.ui.chat.ChatWindowTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.mockmatchers');
goog.require('yugi.game.message.Chat');
goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.model.player.Player');
goog.require('yugi.game.ui.chat.ChatWindow');
goog.require('yugi.model.Card');
goog.require('yugi.model.CardCache');
goog.require('yugi.model.Selection');
goog.require('yugi.test');
goog.require('yugi.ui.Css');

var mc;
var mockChat;
var mockGame;
var mockPlayer;
var mockOpponent;
var mockSelection;
var cardCache;
var chatWindow;

var ignore = goog.testing.mockmatchers.ignoreArgument;

function setUp() {
  mc = new goog.testing.MockControl();

  mockChat = yugi.test.mock(mc, yugi.game.model.Chat);
  mockGame = yugi.test.mock(mc, yugi.game.model.Game);
  mockSelection = yugi.test.mock(mc, yugi.model.Selection);

  mockPlayer = mc.createLooseMock(yugi.game.model.player.Player);
  mockOpponent = mc.createLooseMock(yugi.game.model.player.Player);

  cardCache = yugi.model.CardCache.register();

  yugi.test.verify(mc, function() {
    chatWindow = new yugi.game.ui.chat.ChatWindow();
  });

  mockChat.getChatHistory().$returns([]);
  yugi.test.expectAnyListeners(mockChat);

  sandbox = yugi.test.createSandbox();
  yugi.test.verify(mc, function() {
    chatWindow.render(sandbox);
  });
}

function tearDown() {
  yugi.test.tearDown(mc, chatWindow, sandbox);
}

function testCardName_notLinked() {
  dispatchChat('Player Name just played a Fake Card.');
  assertLinks();
}

function testCardName_autoLinks() {
  addCardToCache('Fake Card');
  dispatchChat('Player Name just played a Fake Card.');
  assertLinks('Fake Card');
}

function testCardName_multipleNames() {
  addCardToCache('Solar Flare Dragon');
  addCardToCache('Magician of Faith');
  dispatchChat('Solar Flare Dragon attacked the Magician of Faith.');
  assertLinks('Solar Flare Dragon', 'Magician of Faith');
}

function testCardName_nestedNameAtEnd() {
  addCardToCache('Dark Magician');
  addCardToCache('Skilled Dark Magician');
  dispatchChat('Player Name just played a Skilled Dark Magician.');
  assertLinks('Skilled Dark Magician');
}

function testCardName_nestedNameAtBeginning() {
  addCardToCache('Skilled Dark');
  addCardToCache('Skilled Dark Magician');
  dispatchChat('Player Name just played a Skilled Dark Magician.');
  assertLinks('Skilled Dark Magician');
}

function testCardName_nestedNameInMiddle() {
  addCardToCache('Dark');
  addCardToCache('Skilled Dark Magician');
  dispatchChat('Player Name just played a Skilled Dark Magician.');
  assertLinks('Skilled Dark Magician');
}

function testCardName_nestedNameInMiddle2() {
  addCardToCache('Dark Magician');
  addCardToCache('Skilled Dark Magician Girl');
  dispatchChat('Played a Skilled Dark Magician Girl and a Dark Magician.');
  assertLinks('Skilled Dark Magician Girl', 'Dark Magician');
}

function testCardName_multipleTrickyNames() {
  addCardToCache('Dark Magician');
  addCardToCache('Skilled Dark Magician');
  dispatchChat('Dark Magician attack Skilled Dark Magician.');
  assertLinks('Dark Magician', 'Skilled Dark Magician');
}

function dispatchChat(chatText) {
  expectGetPlayerNames();
  yugi.test.dispatchAndVerify(mc, mockChat,
      new yugi.game.model.Chat.NewChatEvent(newChatMessage(chatText)));
}

function addCardToCache(cardName) {
  var card = new yugi.model.Card(yugi.model.Card.Type.MONSTER);
  card.setName(cardName);
  cardCache.put(card);
}

function newChatMessage(text) {
  var chatMessage = new yugi.game.message.Chat();
  chatMessage.setSender('System');
  chatMessage.setText(text);
  return chatMessage;
}

function expectGetPlayerNames() {
  mockPlayer.getName().$returns('Player Name').$anyTimes();
  mockOpponent.getName().$returns('Opponent Name').$anyTimes();
  mockGame.getPlayer().$returns(mockPlayer).$anyTimes();
  mockGame.getOpponent().$returns(mockOpponent).$anyTimes();
}


/**
 * Asserts all the given links exist and that no other links exist.
 * @param {...string} var_args The links to validate.
 */
function assertLinks(var_args) {

  var linksFound = [];

  var chatArea = chatWindow.getElementByFragment(
      yugi.game.ui.chat.ChatWindow.Id_.CHAT_AREA);
  lastChatEl = goog.dom.getLastElementChild(chatArea);
  assertNotNull(lastChatEl);
  var links = goog.dom.getElementsByTagNameAndClass(
      'button', yugi.ui.Css.LINK, lastChatEl);
  goog.array.forEach(links, function(link) {
    linksFound.push(link.innerHTML);
  });

  assertArrayEquals(goog.array.slice(arguments, 0), linksFound);
}
