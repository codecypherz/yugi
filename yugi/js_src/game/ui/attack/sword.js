/**
 * This is the UI for displaying the sword as a part of an attack.
 */

goog.provide('yugi.game.ui.attack.Sword');

goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.fx.Animation');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.easing');
goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.game.message.MessageType');
goog.require('yugi.game.model.Attack');
goog.require('yugi.game.net.Channel');
goog.require('yugi.game.service.Resize');
goog.require('yugi.game.ui');
goog.require('yugi.game.ui.attack.soy');
goog.require('yugi.model.Area');
goog.require('yugi.ui.style');



/**
 * This is the UI for displaying the sword as a part of an attack.
 * @param {!yugi.model.Card} card The card to which the sword belongs.
 * @param {number} zone The zone in which the card resides.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.attack.Sword = function(card, zone) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.ui.attack.Sword');

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
   * @type {goog.events.EventHandler}
   * @private
   */
  this.visibleHandler_ = null;

  /**
   * @type {goog.math.Coordinate}
   * @private
   */
  this.center_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.visible_ = false;

  /**
   * @type {boolean}
   * @private
   */
  this.animating_ = false;

  /**
   * @type {!yugi.game.model.Attack}
   * @private
   */
  this.attack_ = yugi.game.model.Attack.get();

  /**
   * @type {!yugi.game.service.Resize}
   * @private
   */
  this.resizeService_ = yugi.game.service.Resize.get();

  /**
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = yugi.game.net.Channel.get();
};
goog.inherits(yugi.game.ui.attack.Sword, goog.ui.Component);


/**
 * The duration of the sword attack animation in milliseconds.
 * @type {number}
 * @const
 * @private
 */
yugi.game.ui.attack.Sword.ANIMATION_DURATION_MS_ = 200;


/**
 * The amount of time, in milliseconds, after an animation completes before
 * resetting the sword.
 * @type {number}
 * @const
 * @private
 */
yugi.game.ui.attack.Sword.RESET_DELAY_MS_ = 500;


/** @override */
yugi.game.ui.attack.Sword.prototype.createDom = function() {
  this.setElementInternal(
      goog.soy.renderAsElement(yugi.game.ui.attack.soy.SWORD));
};


/** @override */
yugi.game.ui.attack.Sword.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen to clicks on the sword in order to cancel the attack.
  this.getHandler().listen(this.getElement(),
      goog.events.EventType.CLICK,
      goog.bind(this.attack_.cancel, this.attack_));

  // Show the card when the declaration has started.
  this.getHandler().listen(this.attack_,
      yugi.game.model.Attack.EventType.DECLARATION_STARTED,
      this.onDeclarationStarted_);

  // Hide the sword if the attack is canceled.
  this.getHandler().listen(this.attack_,
      yugi.game.model.Attack.EventType.CANCELED,
      goog.bind(this.setVisible_, this, false));

  // Animate the sword when an attack is declared.
  this.getHandler().listen(this.attack_,
      yugi.game.model.Attack.EventType.CARD_DECLARED,
      this.onOpponentCardDeclared_);
  this.getHandler().listen(this.attack_,
      yugi.game.model.Attack.EventType.PLAYER_DECLARED,
      this.onOpponentDeclared_);

  // Animate the sword when the opponent declares an attack.
  this.getHandler().listen(this.channel_,
      yugi.game.message.MessageType.DECLARE_ATTACK,
      this.onDeclareAttackMessage_);

  // The sword is hidden by default.
  this.setVisible_(this.visible_);
};


/**
 * Called when an attack declaration has started.  If it was for this card, then
 * the sword is shown.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.onDeclarationStarted_ = function() {
  if (this.attack_.getDeclaringCard() == this.card_) {
    this.setVisible_(true);
  }
};


/**
 * Called when a card is selected for an attack.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.onOpponentCardDeclared_ = function() {

  // Make sure this sword is for the declaring card.
  if (this.attack_.getDeclaringCard() != this.card_) {
    return;
  }

  var targetZone = this.attack_.getTargetZone();
  if (goog.isDefAndNotNull(targetZone)) {
    var targetElement = goog.asserts.assert(
        yugi.game.ui.getMonsterZoneElement(targetZone, true));
    this.animate_(targetElement);
  }
};


/**
 * Called when the opponent is selected for an attack.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.onOpponentDeclared_ = function() {

  // Make sure this sword is for the declaring card.
  if (this.attack_.getDeclaringCard() != this.card_) {
    return;
  }

  var targetElement = goog.asserts.assert(
      this.getDomHelper().getElement(yugi.model.Area.OPP_HAND));
  this.animate_(targetElement);
};


/**
 * Called when the opponent declares an attack.
 * @param {!yugi.game.net.Channel.MessageEvent} e The message event.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.onDeclareAttackMessage_ = function(e) {
  var message = /** @type {!yugi.game.message.DeclareAttack} */ (e.message);

  // Check to see if the declaration originated from this monster.
  if (message.getDeclaringCardData().getKey() == this.card_.getKey() &&
      message.getDeclaringZone() == this.zone_) {
    this.logger.info('Animating the opponent\'s attack declaration.');

    // Make the sword visible!
    this.setVisible_(true);

    var targetElement = null;
    if (message.getTargetZone() >= 0) {
      targetElement = yugi.game.ui.getMonsterZoneElement(
          message.getTargetZone());
    } else {
      targetElement = goog.dom.getElement(yugi.model.Area.PLAYER_HAND);
    }
    this.animate_(goog.asserts.assert(targetElement));
  }
};


/**
 * Animates the sword into the target of the attack.
 * @param {!Element} targetElement The target element.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.animate_ = function(targetElement) {

  // Figure out the target and point the sword directly at that.
  var targetPos = yugi.ui.style.computeCenter(targetElement);
  this.setRotationAngleFromCoordinate_(targetPos.x, targetPos.y);

  // Figure out the destination coordinates of the animation.
  var swordElement = this.getElement();
  var swordSize = goog.style.getSize(swordElement);
  var swordPos = goog.style.getPageOffset(swordElement);

  // Adjust for the center of the sword.
  var center = goog.asserts.assert(this.center_);
  var diff = goog.math.Coordinate.difference(swordPos, center);
  targetPos.x += diff.x;
  targetPos.y += diff.y;

  // The target coordinate should be relative to where the sword started.
  targetPos.x -= swordPos.x;
  targetPos.y -= swordPos.y;

  var slide = new goog.fx.dom.Slide(
      swordElement,
      [0, 0],
      [targetPos.x, targetPos.y],
      yugi.game.ui.attack.Sword.ANIMATION_DURATION_MS_,
      goog.fx.easing.easeIn);

  // Reset the sword after animation.
  this.getHandler().listen(slide,
      goog.fx.Animation.EventType.END,
      this.onAnimationEnd_);

  // Play the animation.
  this.animating_ = true;
  slide.play();
};


/**
 * Resets the sword after the animation completes.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.onAnimationEnd_ = function() {
  goog.Timer.callOnce(function() {
    this.animating_ = false;
    // Check just in case things were destroyed or something.
    if (this.isInDocument()) {
      this.getElement().style.top = 0;
      this.getElement().style.left = 0;
      this.setRotationAngle_(0);
      this.setVisible_(false);
    }
  }, yugi.game.ui.attack.Sword.RESET_DELAY_MS_, this);
};


/**
 * Alters the visibility of the sword.
 * @param {boolean} visible True if the sword should be visible.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.setVisible_ = function(visible) {

  this.visible_ = visible;
  goog.style.showElement(this.getElement(), visible);

  if (visible) {

    // Recalculate the center after becoming visible.
    this.calculateCenter_();

    // Most listeners are only attached once the sword is visible in order to be
    // efficient.
    this.visibleHandler_ = new goog.events.EventHandler(this);

    // Listen to mouse move in order to change the angle of the sword.
    this.visibleHandler_.listen(this.getDomHelper().getDocument().body,
        goog.events.EventType.MOUSEMOVE,
        this.onMouseMove_);

    // Listen to resize events in order to recalculate the center of the sword.
    this.visibleHandler_.listen(this.resizeService_,
        yugi.game.service.Resize.EventType.RESIZED,
        this.calculateCenter_);

  } else {
    goog.dispose(this.visibleHandler_);
    this.visibleHandler_ = null;
  }
};


/**
 * Calculates the center of the sword.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.calculateCenter_ = function() {

  // Don't have any rotation while trying to calculate the center.
  this.setRotationAngle_(0);

  // Figure out the center of the sword.
  var swordElement = goog.asserts.assert(this.getElement());
  this.center_ = yugi.ui.style.computeCenter(swordElement);
};


/**
 * Called when the mouse moves.  The sword is updated to point at the mouse.
 * @param {!goog.events.Event} e The mouse move event.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.onMouseMove_ = function(e) {

  // Don't change the angle of the sword while animating.
  if (this.animating_) {
    return;
  }

  // Figure out the click coordinate relative to the top left of the document.
  var scrollPos = goog.dom.getDocumentScroll();
  var x = e.clientX + scrollPos.x;
  var y = e.clientY + scrollPos.y;

  // Set the new angle.
  this.setRotationAngleFromCoordinate_(x, y);
};


/**
 * Sets the angle of the sword based on its center and the given coordinate.
 * @param {number} x The x-coordinate.
 * @param {number} y The y-coordinate.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.setRotationAngleFromCoordinate_ = function(
    x, y) {

  // Figure out the angle between the coordinate and the center of the sword.
  var angle = goog.math.angle(this.center_.x, this.center_.y, x, y);
  angle = goog.math.standardAngle(angle + 90);
  this.setRotationAngle_(angle);
};


/**
 * Sets the new rotation angle of the sword.
 * @param {number} angle The new rotation angle of the sword.
 * @private
 */
yugi.game.ui.attack.Sword.prototype.setRotationAngle_ = function(angle) {
  var element = goog.asserts.assert(this.getElement());
  yugi.ui.style.setTransform(element, 'rotate(' + angle + 'deg)');
};


/** @override */
yugi.game.ui.attack.Sword.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.dispose(this.visibleHandler_);
};
