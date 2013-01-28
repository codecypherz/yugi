/**
 * Action for moving a card from the field to a list.
 */

goog.provide('yugi.game.action.FieldToList');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');
goog.require('yugi.model.Area');



/**
 * Action for moving a card from the field to a list.
 * @param {string} title The name of the action.
 * @param {!yugi.model.Card} card The card.
 * @param {number} zone The zone from which to remove the card.  It is ignored
 *     for the field card.
 * @param {!yugi.game.model.player.Player} player The player.
 * @param {!yugi.model.CardList} destination The destination list.
 * @param {string} chatText The text to chat after the action is performed.
 * @param {boolean=} opt_front True if adding to the front of the list or not.
 * @param {boolean=} opt_shuffle True if the list should be shuffled after.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.FieldToList = function(title, card, zone, player, destination,
    chatText, opt_front, opt_shuffle) {
  goog.base(this, title);

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.card_ = card;

  /**
   * @type {number}
   * @private
   */
  this.zone_ = zone;

  /**
   * @type {!yugi.game.model.player.Player}
   * @private
   */
  this.player_ = player;

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
goog.inherits(yugi.game.action.FieldToList, yugi.model.Action);


/** @override */
yugi.game.action.FieldToList.prototype.fire = function() {

  // Figure out where the card is and remove it.
  var area = this.card_.getLocation().getArea();

  if (yugi.model.Area.PLAYER_MONSTER_ZONES.contains(area)) {
    this.chat_.sendSystemRemote(this.chatText_ +
        ' from monster zone ' + (this.zone_ + 1) + '.');
  } else if (yugi.model.Area.PLAYER_SPELL_TRAP_ZONES.contains(area)) {
    this.chat_.sendSystemRemote(this.chatText_ +
        ' from spell/trap zone ' + (this.zone_ + 1) + '.');
  } else if (yugi.model.Area.PLAYER_FIELD == area) {
    this.chat_.sendSystemRemote(this.chatText_ + '.');
  } else {
    throw Error('Invalid area for the field to list action.');
  }

  // Remove the card from the field.
  this.player_.getField().setCard(area, null);

  // Add the card to the list, but remove counters first.
  this.card_.clearCounters();
  this.destination_.add(this.card_, this.front_);

  // Maybe shuffle.
  if (this.shuffle_) {
    this.destination_.shuffle();
  }

  this.syncService_.sendPlayerState();
};
