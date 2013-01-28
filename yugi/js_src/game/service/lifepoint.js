/**
 * Service for updating chat and setting life points for a player.
 */

goog.provide('yugi.game.service.LifePoint');

goog.require('goog.Disposable');
goog.require('goog.i18n.NumberFormat');



/**
 * Service for updating chat and setting life points for a player.
 * @param {!yugi.game.model.player.Player} player The player model.
 * @param {!yugi.game.model.Chat} chat The chat model.
 * @param {!yugi.game.service.Sync} syncService The sync service.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.service.LifePoint = function(player, chat, syncService) {
  goog.base(this);

  /**
   * @type {!yugi.game.model.player.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = chat;

  /**
   * @type {!yugi.game.service.Sync}
   * @private
   */
  this.syncService_ = syncService;

  /**
   * @type {!goog.i18n.NumberFormat}
   * @private
   */
  this.numberFormatter_ = new goog.i18n.NumberFormat(
      goog.i18n.NumberFormat.Format.DECIMAL);
};
goog.inherits(yugi.game.service.LifePoint, goog.Disposable);


/**
 * @type {!yugi.game.service.LifePoint}
 * @private
 */
yugi.game.service.LifePoint.instance_;


/**
 * Registers the life point service.
 * @param {!yugi.game.model.player.Player} player The player model.
 * @param {!yugi.game.model.Chat} chat The chat model.
 * @param {!yugi.game.service.Sync} syncService The sync service.
 * @return {!yugi.game.service.LifePoint} The registered instance.
 */
yugi.game.service.LifePoint.register = function(player, chat, syncService) {
  yugi.game.service.LifePoint.instance_ = new yugi.game.service.LifePoint(
      player, chat, syncService);
  return yugi.game.service.LifePoint.get();
};


/**
 * @return {!yugi.game.service.LifePoint} The life point service.
 */
yugi.game.service.LifePoint.get = function() {
  return yugi.game.service.LifePoint.instance_;
};


/**
 * Updates the player's life points to the new value and notifies the opponent.
 * @param {number} lifePoints The new life points to set for the player.
 */
yugi.game.service.LifePoint.prototype.updateLifePoints = function(lifePoints) {

  // Always round up.
  lifePoints = Math.ceil(lifePoints);

  var oldLifePoints = this.player_.getLifePoints();

  // Sync the value with the model since the model enforces bounds.
  lifePoints = this.player_.setLifePoints(lifePoints);

  // Maybe chat some text if the life points actually changed.
  var text = this.player_.getName();
  if (oldLifePoints == lifePoints) {
    return;
  } else if (oldLifePoints > lifePoints) {
    text += ' decreased';
  } else {
    text += ' increased';
  }

  var formattedNumber = this.numberFormatter_.format(
      Math.abs(oldLifePoints - lifePoints));
  text += ' their life points by ' + formattedNumber + '.';

  this.chat_.sendSystemRemote(text);
  this.syncService_.sendPlayerState();
};
