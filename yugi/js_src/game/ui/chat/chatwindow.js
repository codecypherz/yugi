/**
 * This is the UI for where chat is displayed.
 */

goog.provide('yugi.game.ui.chat.ChatWindow');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.structs.Set');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.LabelInput');
goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.ui.chat.soy');
goog.require('yugi.model.CardCache');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.Css');



/**
 * This is the UI for where chat is displayed.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.chat.ChatWindow = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chatModel_ = yugi.game.model.Chat.get();

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = yugi.game.model.Game.get();

  /**
   * @type {!yugi.model.CardCache}
   * @private
   */
  this.cardCache_ = yugi.model.CardCache.get();

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

  /**
   * @type {!goog.ui.LabelInput}
   * @private
   */
  this.chatInput_ = new goog.ui.LabelInput();
  this.addChild(this.chatInput_);
};
goog.inherits(yugi.game.ui.chat.ChatWindow, goog.ui.Component);


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.chat.ChatWindow.Id_ = {
  CHAT_AREA: 'chat-area',
  CHAT_INPUT: 'chat-input'
};


/**
 * Classes used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.chat.ChatWindow.Css_ = {
  CHAT: goog.getCssName('yugi-chat'),
  OPPONENT: goog.getCssName('yugi-chat-opponent'),
  PLAYER: goog.getCssName('yugi-chat-player'),
  SYSTEM: goog.getCssName('yugi-chat-system')
};


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.ui.chat.ChatWindow.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.ui.chat.ChatWindow');


/** @override */
yugi.game.ui.chat.ChatWindow.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.chat.soy.WINDOW, {
        ids: this.makeIds(yugi.game.ui.chat.ChatWindow.Id_)
      }));
};


/** @override */
yugi.game.ui.chat.ChatWindow.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  if (!this.chatInput_.wasDecorated()) {
    this.chatInput_.decorate(this.getElementByFragment(
        yugi.game.ui.chat.ChatWindow.Id_.CHAT_INPUT));
  }

  this.getHandler().listen(this.chatInput_.getElement(),
      goog.events.EventType.KEYDOWN,
      this.onKeyDown_);

  // Append existing chats from the chat model.
  var chatHistory = this.chatModel_.getChatHistory();
  goog.array.forEach(chatHistory, function(chatMessage) {
    this.renderChatMessage_(chatMessage);
  }, this);

  // Listen for when new ones arrive.
  this.getHandler().listen(this.chatModel_,
      yugi.game.model.Chat.EventType.NEW_CHAT,
      this.onNewChat_);
};


/**
 * Called when a key is pressed down on the chat input.
 * @param {!goog.events.Event} e The key down event.
 * @private
 */
yugi.game.ui.chat.ChatWindow.prototype.onKeyDown_ = function(e) {
  switch (e.keyCode) {
    case goog.events.KeyCodes.ENTER:
      this.chatModel_.send(this.chatInput_.getValue());
      this.chatInput_.clear();
      break;
  }
};


/**
 * Called when a new chat arrives.
 * @param {!yugi.game.model.Chat.NewChatEvent} e The new chat event.
 * @private
 */
yugi.game.ui.chat.ChatWindow.prototype.onNewChat_ = function(e) {
  this.renderChatMessage_(e.chatMessage);
};


/**
 * Renders chat messages onto the chat area.
 * @param {!yugi.game.message.Chat} chatMessage The message to render.
 * @private
 */
yugi.game.ui.chat.ChatWindow.prototype.renderChatMessage_ =
    function(chatMessage) {

  var sender = chatMessage.getSender();

  // Parse the text and tag it if you find things.
  var text = goog.string.htmlEscape(chatMessage.getText());
  text = this.tagCardNames_(text); // Do this first so there is less to search.
  text = this.tagName_(text, this.game_.getPlayer().getName());
  text = this.tagName_(text, this.game_.getOpponent().getName());

  // Create the chat element.
  var element = goog.soy.renderAsElement(
      yugi.game.ui.chat.soy.MESSAGE, {
        sender: sender,
        text: text
      });
  goog.dom.classes.add(element, yugi.game.ui.chat.ChatWindow.Css_.CHAT);

  // Add a class that represents the kind of message this is.
  goog.dom.classes.add(element, this.getClassForName_(sender));

  // Append the element to the chat area.
  var chatArea = this.getElementByFragment(
      yugi.game.ui.chat.ChatWindow.Id_.CHAT_AREA);
  goog.dom.appendChild(chatArea, element);

  this.listenToCardLinks_(element);

  // Scroll the chat area so the new message is visible.
  goog.style.scrollIntoContainerView(element, chatArea);
};


/**
 * Tags the name within the text if it exists.
 * @param {string} text The text to tag.
 * @param {string} name The name to find and tag.
 * @return {string} text The tagged text if the name was found.
 * @private
 */
yugi.game.ui.chat.ChatWindow.prototype.tagName_ = function(text, name) {
  // Guard against blank names just in case.
  if (!goog.string.isEmptySafe(name)) {
    var nameIndex = text.indexOf(name);
    if (nameIndex >= 0) {
      var className = this.getClassForName_(name);
      var taggedName = '<span class="' + className + '">' + name + '</span>';
      var re = new RegExp(goog.string.regExpEscape(name), 'g');
      text = text.replace(re, taggedName);
    }
  }
  return text;
};


/**
 * Figures out which CSS class should be applied for the given name.
 * @param {string} name The name for which to get the class.
 * @return {string} The class for the name.
 * @private
 */
yugi.game.ui.chat.ChatWindow.prototype.getClassForName_ = function(name) {
  if (name == yugi.game.model.Chat.SYSTEM_USER) {
    return yugi.game.ui.chat.ChatWindow.Css_.SYSTEM;
  } else if (name == this.game_.getPlayer().getName()) {
    return yugi.game.ui.chat.ChatWindow.Css_.PLAYER;
  } else if (name == this.game_.getOpponent().getName()) {
    return yugi.game.ui.chat.ChatWindow.Css_.OPPONENT;
  }
  return '';
};


/**
 * Tags card names found in the text.
 * @param {string} text The text to tag.
 * @return {string} text The tagged text.
 * @private
 */
yugi.game.ui.chat.ChatWindow.prototype.tagCardNames_ = function(text) {

  // Get all the words in the text.
  var words = text.split(/\s+/g);

  // Use a set to remove duplicates.
  var cardNameSet = new goog.structs.Set();

  // Loop through each word and look for card name prefix matches.
  goog.array.forEach(words, function(word) {
    var cardNames = this.cardCache_.getNamesByPrefix(word);
    goog.array.forEach(cardNames, function(cardName) {
      if (goog.string.contains(text, cardName)) {
        cardNameSet.add(cardName);
      }
    });
  }, this);

  // Convert the set to an array and sort the largest number of tokens should be
  // processed first.
  var cardNames = cardNameSet.getValues();
  goog.array.sort(cardNames, function(cardName1, cardName2) {
    var numTokens1 = cardName1.split(/\s+/g).length;
    var numTokens2 = cardName2.split(/\s+/g).length;
    return numTokens2 - numTokens1;
  });

  // Loop through each card name found and surround with a link.
  goog.array.forEach(cardNames, function(cardName) {
    var taggedCardName =
        '<button class="' + yugi.ui.Css.LINK + '">' + cardName + '</button>';

    var re = new RegExp(goog.string.regExpEscape(cardName), 'g');

    while (true) {
      var replaced = false;
      var match;
      while (match = re.exec(text)) {
        if (replaced) {
          continue;
        }

        // Try to tag the card name at the index.
        if (this.isInElement_(match.index, text)) {
          continue;
        } else {
          // Text is not in an element, so can be tagged.
          text = text.substring(0, match.index) +
              taggedCardName +
              text.substring(match.index + match[0].length);
          replaced = true;
        }
      }
      if (replaced) {
        continue;
      } else {
        break;
      }
    }
  }, this);

  return text;
};


/**
 * Checks to see if the index in the text is within an element.
 * @param {number} index The index to check.
 * @param {string} text The text to check.
 * @return {boolean} True if the index is in an element, false otherwise.
 * @private
 */
yugi.game.ui.chat.ChatWindow.prototype.isInElement_ = function(index, text) {
  // Look for the ">" preceeding the index.
  var gtIndex = -1;
  var pre = index;
  while (pre >= 0) {
    if (text[pre] == '>') {
      gtIndex = pre;
      break;
    }
    pre--;
  }
  // Look for the next "<"
  var ltIndex = text.indexOf('<', index);
  if (gtIndex >= 0 && ltIndex >= 0 &&
      gtIndex < ltIndex &&
      gtIndex < index &&
      index < ltIndex) {
    return true;
  }
  return false;
};


/**
 * Finds and listens to all the card links.
 * @param {Element} element The element in which to find the links.
 * @private
 */
yugi.game.ui.chat.ChatWindow.prototype.listenToCardLinks_ = function(element) {
  var links = goog.dom.getElementsByTagNameAndClass(
      'button', yugi.ui.Css.LINK, element);
  goog.array.forEach(links, function(link) {
    var cardName = link.innerHTML;
    this.getHandler().listen(link,
        goog.events.EventType.CLICK,
        goog.bind(this.selectCard_, this, cardName));
  }, this);
};


/**
 * Selects the card with the given name.
 * @param {string} cardName The name of the card.
 * @private
 */
yugi.game.ui.chat.ChatWindow.prototype.selectCard_ = function(cardName) {
  var card = this.cardCache_.getByName(cardName);
  if (card) {
    this.selection_.setSelected(card, null);
  } else {
    this.logger.severe('Failed to find a card with this name: ' + cardName);
  }
};
