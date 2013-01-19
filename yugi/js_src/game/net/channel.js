/**
 * Manages the channel back to the server.
 */

goog.provide('yugi.game.net.Channel');
goog.provide('yugi.game.net.Channel.MessageEvent');

goog.require('goog.Uri');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.structs.Queue');
goog.require('yugi.Config');
goog.require('yugi.game.message.CardTransfer');
goog.require('yugi.game.message.Chat');
goog.require('yugi.game.message.Connected');
goog.require('yugi.game.message.DeckSelected');
goog.require('yugi.game.message.DeclareAttack');
goog.require('yugi.game.message.Disconnected');
goog.require('yugi.game.message.JoinResponse');
goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');
goog.require('yugi.game.message.State');
goog.require('yugi.game.message.SyncResponse');
goog.require('yugi.game.net.WrappedMessage');



/**
 * The channel that allows for bi-directional communication between the client
 * and the server.  The constructor will open the channel.
 * @param {string} channelToken The token for this client's access to the
 *     appengine channel.
 * @param {string} gameKey The game's key.
 * @param {string} playerName The name of the player.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.net.Channel = function(channelToken, gameKey, playerName) {
  goog.base(this);

  /**
   * The key for the game.  This is passed along in every post to the server.
   * @type {string}
   * @private
   */
  this.gameKey_ = gameKey;

  /**
   * @type {string}
   * @private
   */
  this.playerName_ = playerName;

  /**
   * Used for receiving messages from the server.
   * @type {!appengine.Channel}
   * @suppress {missingRequire}
   * @private
   */
  this.channel_ = new appengine.Channel(channelToken);

  this.logger.info('Attempting to open the channel.');

  /**
   * @type {appengine.Socket}
   * @private
   */
  this.socket_ = this.channel_.open({
    'onopen': goog.bind(this.onOpen_, this),
    'onmessage': goog.bind(this.onMessage_, this),
    'onerror': goog.bind(this.onError_, this),
    'onclose': goog.bind(this.onClose_, this)
  });

  /**
   * All messages sent by this client must be delivered synchronously.  In order
   * to ensure this, the queue will be used to save messages while the single
   * sending XHR object is busy.
   * @type {!goog.structs.Queue.<!yugi.game.message.Message>}
   * @private
   */
  this.sendQueue_ = new goog.structs.Queue();

  /**
   * All requests to the message servlet are done through this XHR object one at
   * a time.  This is to ensure synchronous delivery of messages from this
   * client.  Messages attempting to be sent while this XHR object is busy will
   * be queued up and delivered as soon as it can.
   * @type {!goog.net.XhrIo}
   * @private
   */
  this.messageSender_ = new goog.net.XhrIo();
  this.registerDisposable(this.messageSender_);

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  // Listen for when send message events.
  handler.listen(this.messageSender_,
      goog.net.EventType.READY,
      this.maybeSendNextMessage_);
  handler.listen(this.messageSender_,
      goog.net.EventType.ERROR,
      this.onSendError_);
  handler.listen(this.messageSender_,
      goog.net.EventType.SUCCESS,
      this.onSendSuccess_);
};
goog.inherits(yugi.game.net.Channel, goog.events.EventTarget);


/**
 * The events dispatched by this class.
 * @enum {string}
 */
yugi.game.net.Channel.EventType = {
  CLOSED: goog.events.getUniqueId('closed'),
  OPENED: goog.events.getUniqueId('opened')
};


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.net.Channel.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.net.Channel');


/**
 * Keeps track of whether the channel is open or not.
 * @type {boolean}
 * @private
 */
yugi.game.net.Channel.prototype.isOpen_ = false;


/**
 * @type {!yugi.game.net.Channel}
 * @private
 */
yugi.game.net.Channel.instance_;


/**
 * Registers an instance of the channel.
 * @param {string} channelToken The token for this client's access to the
 *     appengine channel.
 * @param {string} gameKey The game's key.
 * @param {string} playerName The name of the player.
 * @return {!yugi.game.net.Channel} The registered instance.
 */
yugi.game.net.Channel.register = function(channelToken, gameKey, playerName) {
  yugi.game.net.Channel.instance_ = new yugi.game.net.Channel(channelToken,
      gameKey, playerName);
  return yugi.game.net.Channel.get();
};


/**
 * @return {!yugi.game.net.Channel} The Yugioh application channel.
 */
yugi.game.net.Channel.get = function() {
  return yugi.game.net.Channel.instance_;
};


/**
 * Sends data to the server.  This implementation guarantees synchronous
 * delivery of messages.
 * @param {!yugi.game.message.Message} message The message to send to the
 *     server.
 */
yugi.game.net.Channel.prototype.send = function(message) {

  // Queue the message.
  this.sendQueue_.enqueue(message);

  // Don't try to send anything while the sender is busy.
  if (this.messageSender_.isActive()) {
    this.logger.fine('XHR is busy - message added to queue.');
  } else {

    // Go ahead and send the next message since XHR is ready.  This should only
    // be called when the queue is empty otherwise the queue is emptied through
    // message complete callbacks.
    if (this.sendQueue_.getCount() > 1) {

      // If this condition occurs, go ahead and let it go since the queue will
      // still be processed in the correct order, but the fact that there are
      // messages in the queue here is certainly not expected.
      this.logger.severe('Unexpected messages in the queue.');
    }

    this.send_();
  }
};


/**
 * Sends the next message on the queue if there is one.
 * @private
 */
yugi.game.net.Channel.prototype.send_ = function() {

  // Nothing to do if the queue is empty.
  if (this.sendQueue_.getCount() == 0) {
    this.logger.severe('The message queue was empty.');
    return;
  }

  // Make sure the XHR is not busy.
  if (this.messageSender_.isActive()) {
    this.logger.severe('XHR is busy - cannot send message.');
    return;
  }

  // Grab the next message to send.
  var message = /** @type {!yugi.game.message.Message} */ (
      this.sendQueue_.dequeue());

  // Wrap the message and send it.
  this.logger.fine('Sending a message to the server.');
  var wrappedMessage = new yugi.game.net.WrappedMessage(
      message.getType(),
      this.playerName_,
      message);

  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.MESSAGE);
  uri.setParameterValue(yugi.Config.UrlParameter.GAME_KEY, this.gameKey_);

  var json = goog.json.serialize(wrappedMessage.toJson());

  this.messageSender_.send(
      uri,
      'POST',
      json,
      {'Content-type': 'text/json'});
};


/**
 * @return {boolean} True if the channel is open or not.
 */
yugi.game.net.Channel.prototype.isOpen = function() {
  return this.isOpen_;
};


/**
 * Called when the channel opens.
 * @private
 */
yugi.game.net.Channel.prototype.onOpen_ = function() {
  this.logger.info('Channel open');
  this.isOpen_ = true;
  this.dispatchEvent(yugi.game.net.Channel.EventType.OPENED);
};


/**
 * Called when a message comes from the server.
 * @param {*} channelMessage The message coming from the server.
 * @private
 */
yugi.game.net.Channel.prototype.onMessage_ = function(channelMessage) {

  // Check the raw data.
  var rawData = channelMessage.data;
  if (!rawData) {
    this.logger.severe('Received an empy message from the server.');
    return;
  }
  this.logger.fine('Received this raw data: ' + rawData);

  // Try to parse the data as JSON.
  var json = null;
  var type = null;

  try {

    // Parse the JSON object and make sure it succeeded.
    json = goog.json.parse(rawData);
    if (!json) {
      throw Error('Parsing resulted in a null object');
    }

    // Make sure a type was discovered.
    type = yugi.game.message.Message.getTypeFromJson(json);
    if (!type) {
      throw Error('Unable to discern the type of message.');
    }

  } catch (e) {
    this.logger.severe('Failed to parse the message into JSON.', e);
    return;
  }

  // Construct the appropriate message object.
  var message = null;
  switch (type) {
    case yugi.game.message.MessageType.CARD_TRANSFER:
      message = new yugi.game.message.CardTransfer();
      break;
    case yugi.game.message.MessageType.CHAT:
      message = new yugi.game.message.Chat();
      break;
    case yugi.game.message.MessageType.CONNECTED:
      message = new yugi.game.message.Connected();
      break;
    case yugi.game.message.MessageType.DECK_SELECTED:
      message = new yugi.game.message.DeckSelected();
      break;
    case yugi.game.message.MessageType.DECLARE_ATTACK:
      message = new yugi.game.message.DeclareAttack();
      break;
    case yugi.game.message.MessageType.DISCONNECTED:
      message = new yugi.game.message.Disconnected();
      break;
    case yugi.game.message.MessageType.STATE:
      message = new yugi.game.message.State();
      break;
    case yugi.game.message.MessageType.JOIN_RESPONSE:
      message = new yugi.game.message.JoinResponse();
      break;
    case yugi.game.message.MessageType.SYNC_RESPONSE:
      message = new yugi.game.message.SyncResponse();
      break;
    default:
      message = new yugi.game.message.Message(type);
      break;
  }

  // Make sure a message object was constructed.
  if (!message) {
    this.logger.severe('Failed to create a message object.');
    return;
  }

  // Set the fields from the JSON.
  message.setFromJson(json);

  // Dispatch the message in an event and let anyone else handle it.
  this.dispatchEvent(new yugi.game.net.Channel.MessageEvent(message));
};


/**
 * Called when the channel has an error.
 * @param {*} e The error object.
 * @private
 */
yugi.game.net.Channel.prototype.onError_ = function(e) {
  // TODO If the code is a 401, "Unauthorized", then it was probably a timeout.
  // Need to figure out what to do here.

  var text = 'The channel had an error.  Code: ' + e.code +
      '  Description: ' + e.description;
  this.logger.severe(text);
};


/**
 * Called when the channel closes.
 * @private
 */
yugi.game.net.Channel.prototype.onClose_ = function() {
  this.logger.warning('Channel closed');

  // TODO Maybe implement some sort of auto-reconnect logic?
  this.isOpen_ = false;
  this.dispatchEvent(yugi.game.net.Channel.EventType.CLOSED);
};


/**
 * Handles the success event for the sent message.
 * @private
 */
yugi.game.net.Channel.prototype.onSendSuccess_ = function() {
  this.logger.fine('Message sent successfully.');
};


/**
 * Handles an error that occurred while sending a message.
 * @private
 */
yugi.game.net.Channel.prototype.onSendError_ = function() {
  // TODO Maybe try to send the message again?
  // TODO Maybe be really, really loud about this kind of failure - let the
  // user know somehow.
  this.logger.severe('Failed to send a message.  Error code: ' +
      this.messageSender_.getLastErrorCode() + '  Error message: ' +
      this.messageSender_.getLastError());
};


/**
 * Sends the next message if there is one in the queue.
 * @private
 */
yugi.game.net.Channel.prototype.maybeSendNextMessage_ = function() {
  this.logger.fine('XHR is now ready.');

  // Send the next available message from the queue.
  if (this.sendQueue_.getCount() > 0) {
    if (this.messageSender_.isActive()) {
      // TODO Maybe try to send the message again here as well as the general
      // failure case?  I suppose the next attempt to send will pull from the
      // queue.
      this.logger.severe(
          'XHR was busy event after "READY" - cannot send next message.');
    } else {
      this.logger.fine('Sending next message.');
      this.send_();
    }
  }
};


/** @override */
yugi.game.net.Channel.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  this.sendQueue_.clear();
  goog.dispose(this.sendQueue_);
  goog.dispose(this.socket_);
  goog.dispose(this.channel_);
};



/**
 * Dispatched when a new message arrives on the channel.
 * @param {!yugi.game.message.Message} message The message being dispatched.
 * @extends {goog.events.Event}
 * @constructor
 */
yugi.game.net.Channel.MessageEvent = function(message) {
  goog.base(this, message.getType());

  /**
   * @type {!yugi.game.message.Message}
   */
  this.message = message;
};
goog.inherits(yugi.game.net.Channel.MessageEvent, goog.events.Event);
