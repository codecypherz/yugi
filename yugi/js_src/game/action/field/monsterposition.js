/**
 * A generic action for changing monster position.
 */

goog.provide('yugi.game.action.field.MonsterPosition');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');



/**
 * A generic action for changing monster position.
 * @param {string} actionText The text for the action.
 * @param {!yugi.model.MonsterCard} monsterCard The monster card to summon.
 * @param {!yugi.model.MonsterCard.Position} newPosition The new position.
 * @param {string} chatText The chat text.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.field.MonsterPosition = function(actionText, monsterCard,
    newPosition, chatText) {
  goog.base(this, actionText);

  /**
   * @type {!yugi.model.MonsterCard}
   * @private
   */
  this.monsterCard_ = monsterCard;

  /**
   * The position the card will take if the action fires.
   * @type {!yugi.model.MonsterCard.Position}
   * @private
   */
  this.newPosition_ = newPosition;

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
goog.inherits(yugi.game.action.field.MonsterPosition, yugi.model.Action);


/** @override */
yugi.game.action.field.MonsterPosition.prototype.fire = function() {
  this.monsterCard_.setPosition(this.newPosition_);
  this.chat_.sendSystemRemote(this.chatText_);
  this.syncService_.sendPlayerState();
};
