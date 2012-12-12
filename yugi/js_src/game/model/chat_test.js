/**
 * Tests for yugi.game.model.Chat.
 */

/** @suppress {extraProvide} */
goog.provide('yugi.game.model.ChatTest');

goog.require('goog.array');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.mockmatchers.ArgumentMatcher');
goog.require('yugi.game.message.Chat');
goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.ChatInterceptor');
goog.require('yugi.game.net.Channel');
goog.require('yugi.test');

var mc;
var mockChannel;
var chat;

function setUp() {
  mc = new goog.testing.MockControl();

  mockChannel = mc.createLooseMock(yugi.game.net.Channel);
  mockChatInterceptor = mc.createLooseMock(yugi.game.model.ChatInterceptor);

  yugi.test.expectAnyListeners(mockChannel);

  yugi.test.verify(mc, function() {
    chat = new yugi.game.model.Chat(mockChannel, 'Playah', mockChatInterceptor);
  });
}

function tearDown() {
  yugi.test.tearDown(mc, chat);
}

function testSend() {
  var text = 'some chat message';

  mockChatInterceptor.maybeIntercept(text).$returns(false).$anyTimes();

  // Make sure the message is sent over the channel.
  mockChannel.send(new goog.testing.mockmatchers.ArgumentMatcher(
      function(message) {
        return message != null &&
            message instanceof yugi.game.message.Chat &&
            message.getText() == text;
      }));

  yugi.test.verify(mc, function() {
    chat.send(text);
  });

  // Make sure the chat is in the chat history.
  assertNotNull(goog.array.find(chat.getChatHistory(), function(chat) {
    return chat && chat.getText() == text;
  }));
}
