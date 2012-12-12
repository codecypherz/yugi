/**
 * Action for moving a card from one list to another.
 */

goog.provide('yugi.game.action.ListToList');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * Action for moving a card from one list to another.
 * @param {string} title The name of the action.
 * @param {!yugi.model.Card} card The card.
 * @param {!yugi.model.CardList} source The source list.
 * @param {!yugi.model.CardList} destination The destination list.
 * @param {string} chatText The text to chat after the action is performed.
 * @param {boolean=} opt_front True if adding to the front of the list or not.
 * @param {boolean=} opt_shuffle True if the list should be shuffled after.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.ListToList = function(title, card, source, destination,
    chatText, opt_front, opt_shuffle) {
  goog.base(this, title);

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.card_ = card;

  /**
   * @type {!yugi.model.CardList}
   * @private
   */
  this.source_ = source;

  /**
   * @type {!yugi.model.CardList}
   * @private
   */
  this.destination_ = destination;

  /**
   * @type {string}
   * @private
   */
  this.chatText_ = chatText;

  /**
   * @type {boolean}
   * @private
   */
  this.front_ = opt_front || false;

  /**
   * @type {boolean}
   * @private
   */
  this.shuffle_ = opt_shuffle || false;

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
goog.inherits(yugi.game.action.ListToList, yugi.model.Action);


/** @override */
yugi.game.action.ListToList.prototype.fire = function() {

  // Move the card from source to destination.
  this.source_.remove(this.card_);
  this.destination_.add(this.card_, this.front_);

  // Maybe shuffle.
  if (this.shuffle_) {
    this.destination_.shuffle();
  }

  this.chat_.sendSystemRemote(this.chatText_);

  this.syncService_.sendPlayerState();
};
