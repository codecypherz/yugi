/**
 * Keeps track of attack declaration stuff.
 */

goog.provide('yugi.game.model.Attack');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('yugi.game.data.CardData');
goog.require('yugi.game.message.DeclareAttack');



/**
 * Keeps track of attack declaration stuff.
 * @param {!yugi.game.model.Chat} chat The chat model.
 * @param {!yugi.game.net.Channel} channel The channel.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.model.Attack = function(chat, channel) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.model.Attack');

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = chat;

  /**
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = channel;

  /**
   * The card doing the attacking.
   * @type {yugi.model.Card}
   * @private
   */
  this.declaringCard_ = null;

  /**
   * The attacking card's zone.
   * @type {?number}
   * @private
   */
  this.declaringZone_ = null;

  /**
   * The card being targeted.
   * @type {yugi.model.Card}
   * @private
   */
  this.targetCard_ = null;

  /**
   * The targeted card's zone.
   * @type {?number}
   * @private
   */
  this.targetZone_ = null;

  /**
   * The element representing the target.  This could be representing a player
   * or a card.
   * @type {Element}
   * @private
   */
  this.targetElement_ = null;

  /**
   * The targeted player.
   * @type {yugi.game.model.player.Player}
   * @private
   */
  this.targetPlayer_ = null;

  /**
   * @type {!yugi.game.model.Attack.State}
   * @private
   */
  this.state_ = yugi.game.model.Attack.State.READY;
};
goog.inherits(yugi.game.model.Attack, goog.events.EventTarget);


/**
 * The various states of an attack.
 * @enum {string}
 */
yugi.game.model.Attack.State = {
  DECLARING: 'declaring',
  READY: 'ready'
};


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.game.model.Attack.EventType = {
  CANCELED: goog.events.getUniqueId('canceled'),
  CARD_DECLARED: goog.events.getUniqueId('card-declared'),
  DECLARATION_STARTED: goog.events.getUniqueId('declaration-started'),
  PLAYER_DECLARED: goog.events.getUniqueId('player-declared')
};


/**
 * @type {!yugi.game.model.Attack}
 * @private
 */
yugi.game.model.Attack.instance_;


/**
 * Registers an instance of the attack model.
 * @param {!yugi.game.model.Chat} chat The chat model.
 * @param {!yugi.game.net.Channel} channel The channel.
 * @return {!yugi.game.model.Attack} The registered instance.
 */
yugi.game.model.Attack.register = function(chat, channel) {
  yugi.game.model.Attack.instance_ = new yugi.game.model.Attack(chat, channel);
  return yugi.game.model.Attack.get();
};


/**
 * @return {!yugi.game.model.Attack} The attack model.
 */
yugi.game.model.Attack.get = function() {
  return yugi.game.model.Attack.instance_;
};


/**
 * @return {!yugi.game.model.Attack.State} The current state.
 */
yugi.game.model.Attack.prototype.getState = function() {
  return this.state_;
};


/**
 * @return {yugi.model.Card} The card declaring the attack.
 */
yugi.game.model.Attack.prototype.getDeclaringCard = function() {
  return this.declaringCard_;
};


/**
 * @return {?number} The zone from which the declaration originates.
 */
yugi.game.model.Attack.prototype.getDeclaringZone = function() {
  return this.declaringZone_;
};


/**
 * @return {yugi.model.Card} The card target in the attack.
 */
yugi.game.model.Attack.prototype.getTargetCard = function() {
  return this.targetCard_;
};


/**
 * @return {?number} The zone in which the target card resides.
 */
yugi.game.model.Attack.prototype.getTargetZone = function() {
  return this.targetZone_;
};


/**
 * @return {Element} The target element.
 */
yugi.game.model.Attack.prototype.getTargetElement = function() {
  return this.targetElement_;
};


/**
 * Starts declaring an attack.
 * @param {!yugi.model.Card} declaringCard The declaring card.
 * @param {number} declaringZone The zone from which the declaration originates.
 */
yugi.game.model.Attack.prototype.startDeclaring = function(
    declaringCard, declaringZone) {

  // Make sure an attack declaration isn't already in progress.
  if (this.state_ != yugi.game.model.Attack.State.READY) {
    this.logger.severe(
        'There appears to be an attack declaration already in progress.');
    return;
  }

  // Start the attack declaration.
  this.declaringCard_ = declaringCard;
  this.declaringZone_ = declaringZone;
  this.targetCard_ = null;
  this.targetZone_ = null;
  this.targetPlayer_ = null;
  this.targetElement_ = null;
  this.state_ = yugi.game.model.Attack.State.DECLARING;
  this.dispatchEvent(yugi.game.model.Attack.EventType.DECLARATION_STARTED);
};


/**
 * Declares an attack against a card.
 * @param {!yugi.model.Card} card The target of the attack.
 * @param {number} zone The target zone in which the target card resides.
 * @param {!Element} element The target element.  In this case, the card's
 *     element.
 */
yugi.game.model.Attack.prototype.declareCard = function(card, zone, element) {
  if (this.state_ != yugi.game.model.Attack.State.DECLARING) {
    this.logger.severe('A card attack has been declared without starting.');
    return;
  }

  // Declare the attack and go back to being ready to attack.
  this.targetCard_ = card;
  this.targetZone_ = zone;
  this.targetElement_ = element;

  // Assert some state.
  if (!goog.isDefAndNotNull(this.declaringZone_)) {
    this.logger.severe('The declaring zone was null.');
    return;
  }
  if (!goog.isDefAndNotNull(this.declaringCard_)) {
    this.logger.severe('The declaring card was null.');
    return;
  }

  // The target name is the card name unless it is face down.
  var targetName = this.targetCard_.isFaceUp() ?
      this.targetCard_.getName() : 'the face down card';

  this.chat_.sendSystemRemote(
      this.declaringCard_.getName() + ' in monster zone ' +
      (this.declaringZone_ + 1) + ' declares an attack against ' +
      targetName + ' in monster zone ' +
      (this.targetZone_ + 1) + '.');

  var declareAttack = new yugi.game.message.DeclareAttack();
  declareAttack.setDeclaringCardData(
      yugi.game.data.CardData.createFromCard(this.declaringCard_));
  declareAttack.setDeclaringZone(this.declaringZone_);
  declareAttack.setTargetCardData(
      yugi.game.data.CardData.createFromCard(this.targetCard_));
  declareAttack.setTargetZone(this.targetZone_);
  this.channel_.send(declareAttack);

  this.state_ = yugi.game.model.Attack.State.READY;
  this.dispatchEvent(yugi.game.model.Attack.EventType.CARD_DECLARED);
};


/**
 * Declares the player to be the target of the attack.
 * @param {!yugi.game.model.player.Player} player The targeted player.
 * @param {!Element} element The target element.  In this case the player's hand
 *     container.
 */
yugi.game.model.Attack.prototype.declarePlayer = function(player, element) {
  if (this.state_ != yugi.game.model.Attack.State.DECLARING) {
    this.logger.severe('A player attack has been declared without starting.');
    return;
  }

  this.targetPlayer_ = player;
  this.targetElement_ = element;

  // Assert some state.
  if (!goog.isDefAndNotNull(this.declaringZone_)) {
    this.logger.severe('The declaring zone was null.');
    return;
  }
  if (!goog.isDefAndNotNull(this.declaringCard_)) {
    this.logger.severe('The declaring card was null.');
    return;
  }

  this.chat_.sendSystemRemote(
      this.declaringCard_.getName() + ' in monster zone ' +
      (this.declaringZone_ + 1) + ' declares a direct attack against ' +
      this.targetPlayer_.getName() + '.');

  var declareAttack = new yugi.game.message.DeclareAttack();
  declareAttack.setDeclaringCardData(
      yugi.game.data.CardData.createFromCard(this.declaringCard_));
  declareAttack.setDeclaringZone(this.declaringZone_);
  declareAttack.setTargetPlayerData(this.targetPlayer_.toData());
  this.channel_.send(declareAttack);

  this.state_ = yugi.game.model.Attack.State.READY;
  this.dispatchEvent(yugi.game.model.Attack.EventType.PLAYER_DECLARED);
};


/**
 * Cancels the attack.
 */
yugi.game.model.Attack.prototype.cancel = function() {
  if (this.state_ == yugi.game.model.Attack.State.READY) {
    this.logger.warning('There is nothing to cancel.');
    return;
  }

  this.declaringCard_ = null;
  this.declaringZone_ = null;
  this.state_ = yugi.game.model.Attack.State.READY;
  this.dispatchEvent(yugi.game.model.Attack.EventType.CANCELED);
};
