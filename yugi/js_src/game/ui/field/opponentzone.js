/**
 * This UI for the opponent's side of the field.
 */

goog.provide('yugi.game.ui.field.OpponentZone');

goog.require('goog.array');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.ui.field.Banish');
goog.require('yugi.game.ui.field.Deck');
goog.require('yugi.game.ui.field.ExtraDeck');
goog.require('yugi.game.ui.field.FieldCard');
goog.require('yugi.game.ui.field.Graveyard');
goog.require('yugi.game.ui.field.soy');
goog.require('yugi.game.ui.hand.OpponentHand');
goog.require('yugi.game.ui.zone.Monster');
goog.require('yugi.game.ui.zone.SpellTrap');
goog.require('yugi.model.Area');



/**
 * This UI for the opponent's side of the field.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.field.OpponentZone = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = yugi.game.model.Game.get();

  var opponent = this.game_.getOpponent();

  /**
   * @type {!yugi.game.ui.field.Deck}
   * @private
   */
  this.deck_ = new yugi.game.ui.field.Deck(opponent);
  this.addChild(this.deck_);

  /**
   * @type {!yugi.game.ui.field.ExtraDeck}
   * @private
   */
  this.extraDeck_ = new yugi.game.ui.field.ExtraDeck(opponent);
  this.addChild(this.extraDeck_);

  /**
   * @type {!yugi.game.ui.field.Graveyard}
   * @private
   */
  this.graveyard_ = new yugi.game.ui.field.Graveyard(opponent);
  this.addChild(this.graveyard_);

  /**
   * @type {!yugi.game.ui.field.Banish}
   * @private
   */
  this.banish_ = new yugi.game.ui.field.Banish(opponent);
  this.addChild(this.banish_);

  /**
   * @type {!yugi.game.ui.hand.OpponentHand}
   * @private
   */
  this.hand_ = new yugi.game.ui.hand.OpponentHand(opponent);
  this.addChild(this.hand_);

  /**
   * @type {!yugi.game.ui.field.FieldCard}
   * @private
   */
  this.fieldCard_ = new yugi.game.ui.field.FieldCard(opponent);
  this.addChild(this.fieldCard_);

  /**
   * @type {!Array.<!yugi.game.ui.zone.Monster>}
   * @private
   */
  this.monsterZones_ = [
    new yugi.game.ui.zone.Monster(yugi.model.Area.OPP_MONSTER_1),
    new yugi.game.ui.zone.Monster(yugi.model.Area.OPP_MONSTER_2),
    new yugi.game.ui.zone.Monster(yugi.model.Area.OPP_MONSTER_3),
    new yugi.game.ui.zone.Monster(yugi.model.Area.OPP_MONSTER_4),
    new yugi.game.ui.zone.Monster(yugi.model.Area.OPP_MONSTER_5)
  ];
  goog.array.forEach(this.monsterZones_, function(monsterZone) {
    this.addChild(monsterZone);
  }, this);

  /**
   * @type {!Array.<!yugi.game.ui.zone.SpellTrap>}
   * @private
   */
  this.spellTrapZones_ = [
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.OPP_SPELL_TRAP_1),
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.OPP_SPELL_TRAP_2),
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.OPP_SPELL_TRAP_3),
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.OPP_SPELL_TRAP_4),
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.OPP_SPELL_TRAP_5)
  ];
  goog.array.forEach(this.spellTrapZones_, function(spellTrapZone) {
    this.addChild(spellTrapZone);
  }, this);
};
goog.inherits(yugi.game.ui.field.OpponentZone, goog.ui.Component);


/** @override */
yugi.game.ui.field.OpponentZone.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.field.soy.OPPONENT_ZONE, {
        yugiArea: yugi.model.Area
      }));
};


/** @override */
yugi.game.ui.field.OpponentZone.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  var dom = this.getDomHelper();

  this.deck_.render(dom.getElement(yugi.model.Area.OPP_DECK));
  this.extraDeck_.render(dom.getElement(yugi.model.Area.OPP_EXTRA_DECK));
  this.graveyard_.render(dom.getElement(yugi.model.Area.OPP_GRAVEYARD));
  this.banish_.render(dom.getElement(yugi.model.Area.OPP_BANISH));
  this.hand_.render(dom.getElement(yugi.model.Area.OPP_HAND));
  this.fieldCard_.render(dom.getElement(yugi.model.Area.OPP_FIELD));

  goog.array.forEach(this.monsterZones_, function(monsterZone) {
    monsterZone.render(dom.getElement(monsterZone.getArea()));
  }, this);

  goog.array.forEach(this.spellTrapZones_, function(spellTrapZone) {
    spellTrapZone.render(dom.getElement(spellTrapZone.getArea()));
  }, this);
};
