/**
 * Action for that sends a chat message.
 */

goog.provide('yugi.game.action.Chat');

goog.require('yugi.game.model.Chat');
goog.require('yugi.model.Action');



/**
 * Action for that sends a chat message.
 * @param {string} actionText The action text.
 * @param {string} chatText The chat text.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.Chat = function(actionText, chatText) {
  goog.base(this, actionText);

  /**
   * @type {string}
   * @private
   */
  this.chatText_ = chatText;

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = yugi.game.model.Chat.get();
};
goog.inherits(yugi.game.action.Chat, yugi.model.Action);


/** @override */
yugi.game.action.Chat.prototype.fire = function() {
  this.chat_.sendSystemRemote(this.chatText_);
};
