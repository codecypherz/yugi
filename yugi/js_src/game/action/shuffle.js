/**
 * Action for shuffling a deck.
 */

goog.provide('yugi.game.action.Shuffle');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * Action for shuffling a deck.
 * @param {string} actionText The action text.
 * @param {!yugi.model.CardList} cardList The list to shuffle.
 * @param {!yugi.game.model.Player} player The player model.
 * @param {string} chatText The chat text.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.Shuffle = function(actionText, cardList, player, chatText) {
  goog.base(this, actionText);

  /**
   * @type {!yugi.model.CardList}
   * @private
   */
  this.cardList_ = cardList;

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {string}
   * @private
   */
  this.chatText_ = chatText;

  /**
   * @type {!yugi.game.service.Sync}
   * @private
   */
  this.syncService_ = yugi.game.service.Sync.get();

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = yugi.game.model.Chat.get();
};
goog.inherits(yugi.game.action.Shuffle, yugi.model.Action);


/** @override */
yugi.game.action.Shuffle.prototype.fire = function() {

  // Shuffle the list.
  this.cardList_.shuffle();
  this.chat_.sendSystemRemote(this.chatText_);

  // Synchronize the new player state.
  this.syncService_.sendPlayerState();
};
