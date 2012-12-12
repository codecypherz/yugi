/**
 * Intercepts chat messages in order execute commands.
 */

goog.provide('yugi.game.model.ChatInterceptor');

goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.i18n.NumberFormat');
goog.require('goog.string');



/**
 * Intercepts chat messages in order execute commands.
 * @param {!yugi.game.model.Game} game The game object.
 * @param {!yugi.game.net.Channel} channel The channel.
 * @param {!yugi.game.service.Sync} syncService The sync service.
 * @constructor
 * @extends {goog.Disposable}
 */
yugi.game.model.ChatInterceptor = function(game, channel, syncService) {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = channel;

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
goog.inherits(yugi.game.model.ChatInterceptor, goog.Disposable);


/**
 * @type {yugi.game.model.Chat}
 * @private
 */
yugi.game.model.ChatInterceptor.prototype.chat_ = null;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.model.ChatInterceptor.prototype.logger =
    goog.debug.Logger.getLogger('yugi.game.model.ChatInterceptor');


/**
 * @param {!yugi.game.model.Chat} chat The chat model.
 */
yugi.game.model.ChatInterceptor.prototype.setChatModel = function(chat) {
  this.chat_ = chat;
};


/**
 * Maybe intercepts the text that would ordinarily be chatted to the opponent.
 * @param {string} text The raw, unmodified text from the player.
 * @return {boolean} True if the text was intercepted, false otherwise.
 */
yugi.game.model.ChatInterceptor.prototype.maybeIntercept = function(text) {

  // Trim, make lower case, and split the text on any whitespace character.
  text = goog.string.trim(text);
  var tokens = text.split(/\s+/g);

  // No tokens? Return.
  if (tokens.length == 0) {
    return false;
  }

  // Smash everything together.
  var command = tokens.join('');
  if (goog.string.startsWith(command, 'lp') && command.length > 3) {
    return this.interceptLifePointCommand_(command);
  }

  // Return false by default.
  return false;
};


/**
 * Parses the life point command and updates the player's life points.
 * @param {string} command The smashed together life point command.
 * @return {boolean} True if the command was executed, false otherwise.
 * @private
 */
yugi.game.model.ChatInterceptor.prototype.interceptLifePointCommand_ =
    function(command) {
  try {

    // Chop off the 'lp'
    command = command.substr(2, command.length);

    // Get the operator (e.g. =,+,-,*,/)
    var operator = command.substr(0, 1);

    // Get the number (e.g. 100) and make sure it is valid.
    var numberString = command.substr(1, command.length);
    var num = NaN;
    try {
      num = this.numberFormatter_.parse(numberString);
    } catch (e) {
      this.logger.warning('Failed to parse this as a number: ' + numberString);
      return false; // Fail silently.
    }
    if (isNaN(num)) {
      this.logger.warning('Failed to parse this as a number: ' + numberString);
      return false;
    }

    // Modify the life points based on the operator.
    var currentLifePoints = this.game_.getPlayer().getLifePoints();
    switch (operator) {
      case '=':
        this.updateLifePoints_(num);
        break;
      case '+':
        this.updateLifePoints_(currentLifePoints + num);
        break;
      case '-':
        this.updateLifePoints_(currentLifePoints - num);
        break;
      case '*':
        this.updateLifePoints_(currentLifePoints * num);
        break;
      case '/':
        // Don't let the user divide by zero.
        if (num != 0) {
          this.updateLifePoints_(Math.ceil(currentLifePoints / num));
        }
        break;
      default:
        return false;
    }

  } catch (e) {
    this.logger.severe('Failed to execute this command: ' + command, e);
    return false;
  }
  return true;
};


/**
 * Updates the player's life points to the new value and notifies the opponent.
 * @param {number} newLifePoints The new life points to set for the player.
 * @private
 */
yugi.game.model.ChatInterceptor.prototype.updateLifePoints_ =
    function(newLifePoints) {

  // Always round up.
  newLifePoints = Math.ceil(newLifePoints);

  var player = this.game_.getPlayer();
  var oldLifePoints = player.getLifePoints();

  // Sync the value with the model since the model enforces bounds.
  newLifePoints = player.setLifePoints(newLifePoints);

  // Maybe chat some text if the life points actually changed.
  var text = player.getName();
  if (oldLifePoints == newLifePoints) {
    return;
  } else if (oldLifePoints > newLifePoints) {
    text += ' decreased';
  } else {
    text += ' increased';
  }

  var formattedNumber = this.numberFormatter_.format(
      Math.abs(oldLifePoints - newLifePoints));
  text += ' their life points by ' + formattedNumber + '.';

  this.chat_.sendSystemRemote(text);
  this.syncService_.sendPlayerState();
};
