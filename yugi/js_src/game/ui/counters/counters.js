/**
 * The UI for displaying all of a card's counters.
 */

goog.provide('yugi.game.ui.counters.Counters');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.ui.Component');
goog.require('yugi.game.ui.counters.Counter');
goog.require('yugi.model.Card');
goog.require('yugi.model.MonsterCard');



/**
 * The UI for displaying all of a card's counters.
 * @param {!yugi.model.Card} card The card with the counters.
 * @param {!yugi.game.model.Player} player The player model.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.counters.Counters = function(card, player) {
  goog.base(this);

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.card_ = card;

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!Array.<!yugi.game.ui.counters.Counter>}
   * @private
   */
  this.counters_ = [];
};
goog.inherits(yugi.game.ui.counters.Counters, goog.ui.Component);


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.counters.Counters.Css_ = {
  ROOT: goog.getCssName('yugi-counters')
};


/** @override */
yugi.game.ui.counters.Counters.prototype.createDom = function() {
  this.setElementInternal(goog.dom.createDom(goog.dom.TagName.DIV,
      yugi.game.ui.counters.Counters.Css_.ROOT));
};


/** @override */
yugi.game.ui.counters.Counters.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.card_,
      yugi.model.Card.EventType.COUNTERS_CHANGED,
      this.updateCounters_);
  this.getHandler().listen(this.card_,
      yugi.model.Card.EventType.POSITION_CHANGED,
      this.updatePosition_);

  // Sync up the UI with the current list of counters.
  this.updateCounters_();
  this.updatePosition_();
};


/**
 * Updates the UI to reflect the current list of counters for the card.
 * @private
 */
yugi.game.ui.counters.Counters.prototype.updateCounters_ = function() {

  // Remove existing counters.
  goog.disposeAll(this.counters_);
  this.counters_ = [];

  goog.array.forEach(this.card_.getCounters(), function(counterModel) {
    var counter = new yugi.game.ui.counters.Counter(
        this.card_, this.player_, counterModel);
    this.addChild(counter, true);
    this.counters_.push(counter);
  }, this);
};


/**
 * Updates the position of the counters based on card position.
 * @private
 */
yugi.game.ui.counters.Counters.prototype.updatePosition_ = function() {

  var x = 0;
  var y = 0;

  var element = this.getElement();

  if (this.card_ instanceof yugi.model.MonsterCard) {
    var monsterCard = /** @type {!yugi.model.MonsterCard} */ (this.card_);
    var position = monsterCard.getPosition();
    if (position == yugi.model.MonsterCard.Position.FACE_DOWN_DEFENSE ||
        position == yugi.model.MonsterCard.Position.FACE_UP_DEFENSE) {
      x = -15;
      y = 14;
    }
  }

  if (this.player_.isOpponent()) {
    element.style.bottom = y + 'px';
    element.style.right = x + 'px';
  } else {
    element.style.top = y + 'px';
    element.style.left = x + 'px';
  }
};
