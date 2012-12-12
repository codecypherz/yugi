/**
 * Keeps track of chat for this client.
 */

goog.provide('yugi.game.model.Chat');
goog.provide('yugi.game.model.Chat.NewChatEvent');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('yugi.game.message.Chat');
goog.require('yugi.game.message.MessageType');



/**
 * Keeps track of chat for this client.
 * @param {!yugi.game.net.Channel} channel The channel for communication.
 * @param {string} playerName The name of the player.
 * @param {!yugi.game.model.ChatInterceptor} chatInterceptor The interceptor.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.model.Chat = function(channel, playerName, chatInterceptor) {
  goog.base(this);

  /**
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = channel;

  /**
   * The name of the player.
   * @type {string}
   * @private
   */
  this.playerName_ = playerName;

  /**
   * @type {!yugi.game.model.ChatInterceptor}
   * @private
   */
  this.chatInterceptor_ = chatInterceptor;

  /**
   * The history of chat messages.
   * @type {!Array.<!yugi.game.message.Chat>}
   * @private
   */
  this.chatHistory_ = new Array();

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  handler.listen(this.channel_,
      yugi.game.message.MessageType.CHAT,
      this.onChat_);
};
goog.inherits(yugi.game.model.Chat, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.model.Chat.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.model.Chat');


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.game.model.Chat.EventType = {
  NEW_CHAT: goog.events.getUniqueId('new-chat')
};


/**
 * The system user.
 * @type {string}
 * @const
 */
yugi.game.model.Chat.SYSTEM_USER = 'System';


/**
 * @type {!yugi.game.model.Chat}
 * @private
 */
yugi.game.model.Chat.instance_;


/**
 * Registers an instance of the chat model.
 * @param {!yugi.game.net.Channel} channel The communication channel.
 * @param {string} playerName The name of the player.
 * @param {!yugi.game.model.ChatInterceptor} chatInterceptor The interceptor.
 * @return {!yugi.game.model.Chat} The registered instance.
 */
yugi.game.model.Chat.register = function(channel, playerName, chatInterceptor) {
  yugi.game.model.Chat.instance_ = new yugi.game.model.Chat(channel,
      playerName, chatInterceptor);
  return yugi.game.model.Chat.get();
};


/**
 * @return {!yugi.game.model.Chat} The chat model.
 */
yugi.game.model.Chat.get = function() {
  return yugi.game.model.Chat.instance_;
};


/**
 * Sends a chat message from this user.
 * @param {string} text The text to send.
 * @param {boolean=} opt_system True if the message is from the system or not.
 *     It is false by default.
 * @param {boolean=} opt_local True if the message should only be local or not.
 *     If it is only local, it will not be sent over the channel.  It is false
 *     by default.
 */
yugi.game.model.Chat.prototype.send = function(text, opt_system, opt_local) {

  // Parse parameters.
  var system = goog.isDef(opt_system) ? opt_system : false;
  var local = goog.isDef(opt_local) ? opt_local : false;

  // Sanity checks.
  if (!text) {
    this.logger.severe('There was no text to send.');
    return;
  }
  if (!system && local) {
    this.logger.severe('A non-system, local message does not make sense.');
    return;
  }

  // Maybe intercept the chat as a command.
  var intercepted = this.chatInterceptor_.maybeIntercept(text);
  if (intercepted) {
    // Don't send intercepted text.
    this.logger.info('"' + text + '" was intercepted.');
    return;
  }

  // Create the message.
  var chatMessage = new yugi.game.message.Chat();
  chatMessage.setText(text);

  // Set the sender appropriately.
  if (system) {
    chatMessage.setSender(yugi.game.model.Chat.SYSTEM_USER);
  } else {
    chatMessage.setSender(this.playerName_);
  }

  // Send over the channel unless it is supposed to be local only.
  if (!local) {
    this.channel_.send(chatMessage);
  }

  // Only keep chat history for things the user types.
  if (!system) {
    // TODO Limit the chat history to something reasonable?
    this.chatHistory_.push(chatMessage);
  }

  // Notify everyone of the new message so it can be rendered.
  this.dispatchEvent(new yugi.game.model.Chat.NewChatEvent(chatMessage));
};


/**
 * Sends a local chat message as the system.  This is just a convenience method
 * for the normal send method.
 * @param {string} text The text to send.
 */
yugi.game.model.Chat.prototype.sendSystemLocal = function(text) {
  this.send(text, true, true);
};


/**
 * Sends a remote chat message as the system.  This is just a convenience method
 * for the normal send method.
 * @param {string} text The text to send.
 */
yugi.game.model.Chat.prototype.sendSystemRemote = function(text) {
  this.send(text, true, false);
};


/**
 * @return {!Array.<!yugi.game.message.Chat>} The chat history for this client.
 */
yugi.game.model.Chat.prototype.getChatHistory = function() {
  return this.chatHistory_;
};


/**
 * Called when a chat message arrives.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.model.Chat.prototype.onChat_ = function(e) {
  var chatMessage = /** @type {!yugi.game.message.Chat} */ (e.message);
  this.dispatchEvent(new yugi.game.model.Chat.NewChatEvent(chatMessage));
};



/**
 * The event that gets dispatched when a new chat arrives (or is sent).
 * @param {!yugi.game.message.Chat} chatMessage The chat message that arrived.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.game.model.Chat.NewChatEvent = function(chatMessage) {
  goog.base(this, yugi.game.model.Chat.EventType.NEW_CHAT);

  /**
   * @type {!yugi.game.message.Chat}
   */
  this.chatMessage = chatMessage;
};
goog.inherits(yugi.game.model.Chat.NewChatEvent, goog.events.Event);
