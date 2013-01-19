/**
 * Action for declaring an attack.
 */

goog.provide('yugi.game.action.field.DeclareAttack');

goog.require('yugi.game.model.Attack');
goog.require('yugi.model.Action');



/**
 * Action for declaring an attack.
 * @param {!yugi.model.Card} declaringCard The card declaring the attack.
 * @param {number} declaringZone The zone in which the declaring card resides.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.field.DeclareAttack = function(declaringCard, declaringZone) {
  goog.base(this, 'Declare Attack');

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.declaringCard_ = declaringCard;

  /**
   * @type {number}
   * @private
   */
  this.declaringZone_ = declaringZone;

  /**
   * @type {!yugi.game.model.Attack}
   * @private
   */
  this.attack_ = yugi.game.model.Attack.get();
};
goog.inherits(yugi.game.action.field.DeclareAttack, yugi.model.Action);


/** @override */
yugi.game.action.field.DeclareAttack.prototype.fire = function() {

  // Start declaring the attack.  The UI that results will complete the action.
  this.attack_.startDeclaring(this.declaringCard_, this.declaringZone_);
};
