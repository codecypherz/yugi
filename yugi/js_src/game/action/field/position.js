/**
 * A generic action for changing monster position.
 */

goog.provide('yugi.game.action.field.Position');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * A generic action for changing monster position.
 * @param {string} actionText The text for the action.
 * @param {!yugi.model.Card} card The card.
 * @param {boolean} faceUp True if the action will flip the card face up.
 * @param {boolean} rotated True if the action will make the card rotated.
 * @param {string} chatText The chat text.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.field.Position = function(
    actionText, card, faceUp, rotated, chatText) {
  goog.base(this, actionText);

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.card_ = card;

  /**
   * True if the action will make the card face up.
   * @type {boolean}
   * @private
   */
  this.faceUp_ = faceUp;

  /**
   * True if the action will make the card rotated.
   * @type {boolean}
   * @private
   */
  this.rotated_ = rotated;

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
goog.inherits(yugi.game.action.field.Position, yugi.model.Action);


/** @override */
yugi.game.action.field.Position.prototype.fire = function() {
  this.card_.setFaceUp(this.faceUp_);
  this.card_.setRotated(this.rotated_);
  this.chat_.sendSystemRemote(this.chatText_);
  this.syncService_.sendPlayerState();
};
