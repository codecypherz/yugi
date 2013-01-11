/**
 * Tests for yugi.net.Channel.
 */

/** @suppress {extraProvide} */
goog.provide('yugi.game.net.ChannelTest');

goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.string');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.mockmatchers');
goog.require('goog.testing.mockmatchers.ArgumentMatcher');
goog.require('yugi.game.message.Chat');
goog.require('yugi.game.net.Channel');
goog.require('yugi.test');

var mc;
var mockAppEngineChannel;
var mockSocket;
var mockXhrIo;
var channel;

var ignore = goog.testing.mockmatchers.ignoreArgument;

function setUp() {
  mc = new goog.testing.MockControl();

  var channelToken = 'channel-token';
  var gameKey = 'game-key';
  var playerName = 'player-name';

  // Mock out the channel.
  mockAppEngineChannel = mc.createLooseMock(appengine.Channel);
  var mockAppEngineChannelCtor = mc.createConstructorMock(
      /** @suppress {missingRequire} */ appengine, 'Channel');
  mockAppEngineChannelCtor(channelToken).$returns(mockAppEngineChannel);

  // Mock out the socket.
  mockSocket = mc.createLooseMock(appengine.Socket);

  // Mock out the XHR object.
  mockXhrIo = mc.createLooseMock(goog.net.XhrIo);
  var mockXhrIoCtor = mc.createConstructorMock(
      /** @suppress {missingRequire} */ goog.net, 'XhrIo');
  mockXhrIoCtor().$returns(mockXhrIo);

  mockAppEngineChannel.open(ignore).$returns(mockSocket);
  yugi.test.expectAnyListeners(mockXhrIo);

  yugi.test.verify(mc, function() {
    channel = new yugi.game.net.Channel(channelToken, gameKey, playerName);
  });
}

function tearDown() {
  yugi.test.tearDown(mc, channel);
}

function testIsOpen_notOpen() {
  assertFalse(channel.isOpen());
}

function testIsOpen_afterOpen() {
  yugi.test.verify(mc, function() {
    channel.onOpen_(); // Normally called by AppEngine JS.
  });
  assertTrue(channel.isOpen());
}

function testSend_sendsMessage() {
  var message = new yugi.game.message.Chat('sender', 'text');

  mockXhrIo.isActive().$returns(false).$anyTimes();
  mockXhrIo.send(ignore, 'POST', ignore, ignore);

  yugi.test.verify(mc, function() {
    channel.send(message);
  });

  assertEquals(0, channel.sendQueue_.getCount());
}

function testSend_queuesMessage() {
  var message = new yugi.game.message.Chat('s1', 't1');

  // Make it like the XHR is busy.
  mockXhrIo.isActive().$returns(true).$anyTimes();

  yugi.test.verify(mc, function() {
    channel.send(message);
  });

  assertEquals(1, channel.sendQueue_.getCount());
  assertTrue(channel.sendQueue_.contains(message));
}

function testSenderReady_nothingInQueue() {
  yugi.test.dispatchAndVerify(mc, mockXhrIo, goog.net.EventType.READY);
}

function testSenderReady_sendsNextMessage() {
  var message = new yugi.game.message.Chat('sender', 'text');
  channel.sendQueue_.enqueue(message);

  mockXhrIo.isActive().$returns(false).$anyTimes();
  mockXhrIo.send(ignore, 'POST', ignore, ignore);

  assertEquals(1, channel.sendQueue_.getCount());
  yugi.test.dispatchAndVerify(mc, mockXhrIo, goog.net.EventType.READY);
  assertEquals(0, channel.sendQueue_.getCount());
}

function testSenderReady_handlesBadActiveState() {
  var message = new yugi.game.message.Chat('sender', 'text');
  channel.sendQueue_.enqueue(message);

  mockXhrIo.isActive().$returns(true).$anyTimes(); // Bad state.

  assertEquals(1, channel.sendQueue_.getCount());
  yugi.test.dispatchAndVerify(mc, mockXhrIo, goog.net.EventType.READY);
  assertEquals(1, channel.sendQueue_.getCount());
}

function testMessageError() {
  mockXhrIo.getLastErrorCode().$returns(1);
  mockXhrIo.getLastError().$returns('Something bad happened.');
  yugi.test.dispatchAndVerify(mc, mockXhrIo, goog.net.EventType.ERROR);
}

function testSending_multipleMessages() {
  var m1 = new yugi.game.message.Chat('s1', 't1');
  var m2 = new yugi.game.message.Chat('s2', 't2');
  var m3 = new yugi.game.message.Chat('s3', 't3');
  var m4 = new yugi.game.message.Chat('s4', 't4');

  // Send the first message which should not queue.
  mockXhrIo.isActive().$returns(false).$anyTimes();
  mockXhrIo.send(ignore, 'POST', createVerifyChat(m1), ignore);
  yugi.test.verify(mc, function() {
    channel.send(m1);
  });
  assertEquals(0, channel.sendQueue_.getCount());

  // Send another while busy.
  mockXhrIo.isActive().$returns(true).$anyTimes();
  yugi.test.verify(mc, function() {
    channel.send(m2);
  });
  assertEquals(1, channel.sendQueue_.getCount());

  // Try to send another.
  mockXhrIo.isActive().$returns(true).$anyTimes();
  yugi.test.verify(mc, function() {
    channel.send(m3);
  });
  assertEquals(2, channel.sendQueue_.getCount());

  // Complete the first message and expect the second to be sent.
  mockXhrIo.isActive().$returns(false).$anyTimes();
  mockXhrIo.send(ignore, 'POST', createVerifyChat(m2), ignore);
  yugi.test.dispatchAndVerify(mc, mockXhrIo, goog.net.EventType.READY);
  assertEquals(1, channel.sendQueue_.getCount());

  // Send a 4th message while the second message is busy.
  mockXhrIo.isActive().$returns(true).$anyTimes();
  yugi.test.verify(mc, function() {
    channel.send(m4);
  });
  assertEquals(2, channel.sendQueue_.getCount());

  // Complete the second message and expect the third to be sent.
  mockXhrIo.isActive().$returns(false).$anyTimes();
  mockXhrIo.send(ignore, 'POST', createVerifyChat(m3), ignore);
  yugi.test.dispatchAndVerify(mc, mockXhrIo, goog.net.EventType.READY);
  assertEquals(1, channel.sendQueue_.getCount());

  // Complete the third message and expect the last message.
  mockXhrIo.isActive().$returns(false).$anyTimes();
  mockXhrIo.send(ignore, 'POST', createVerifyChat(m4), ignore);
  yugi.test.dispatchAndVerify(mc, mockXhrIo, goog.net.EventType.READY);
  assertEquals(0, channel.sendQueue_.getCount());
}


/**
 * Creates an argument matcher that verifies the chat message in the sent json.
 * @param {!yugi.game.message.Chat} chatMessage The chat message.
 * @return {!goog.testing.mockmatchers.ArgumentMatcher} The matcher.
 */
function createVerifyChat(chatMessage) {
  return new goog.testing.mockmatchers.ArgumentMatcher(function(json) {
    return goog.string.contains(json, chatMessage.getSender()) &&
        goog.string.contains(json, chatMessage.getText());
  });
}
