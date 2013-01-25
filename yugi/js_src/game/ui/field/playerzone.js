/**
 * This UI for the player's side of the field.
 */

goog.provide('yugi.game.ui.field.PlayerZone');

goog.require('goog.array');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.ui.field.Banish');
goog.require('yugi.game.ui.field.Deck');
goog.require('yugi.game.ui.field.ExtraDeck');
goog.require('yugi.game.ui.field.FieldCard');
goog.require('yugi.game.ui.field.Graveyard');
goog.require('yugi.game.ui.field.soy');
goog.require('yugi.game.ui.hand.PlayerHand');
goog.require('yugi.game.ui.player.Controls');
goog.require('yugi.game.ui.zone.Monster');
goog.require('yugi.game.ui.zone.SpellTrap');
goog.require('yugi.model.Area');



/**
 * This UI for the player's side of the field.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.field.PlayerZone = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = yugi.game.model.Game.get();

  var player = this.game_.getPlayer();

  /**
   * @type {!yugi.game.ui.field.Deck}
   * @private
   */
  this.deck_ = new yugi.game.ui.field.Deck(player);
  this.addChild(this.deck_);

  /**
   * @type {!yugi.game.ui.field.ExtraDeck}
   * @private
   */
  this.extraDeck_ = new yugi.game.ui.field.ExtraDeck(player);
  this.addChild(this.extraDeck_);

  /**
   * @type {!yugi.game.ui.field.Graveyard}
   * @private
   */
  this.graveyard_ = new yugi.game.ui.field.Graveyard(player);
  this.addChild(this.graveyard_);

  /**
   * @type {!yugi.game.ui.field.Banish}
   * @private
   */
  this.banish_ = new yugi.game.ui.field.Banish(player);
  this.addChild(this.banish_);

  /**
   * @type {!yugi.game.ui.hand.PlayerHand}
   * @private
   */
  this.hand_ = new yugi.game.ui.hand.PlayerHand(player);
  this.addChild(this.hand_);

  /**
   * @type {!yugi.game.ui.field.FieldCard}
   * @private
   */
  this.fieldCard_ = new yugi.game.ui.field.FieldCard(player);
  this.addChild(this.fieldCard_);

  /**
   * @type {!Array.<!yugi.game.ui.zone.Monster>}
   * @private
   */
  this.monsterZones_ = [
    new yugi.game.ui.zone.Monster(yugi.model.Area.PLAYER_MONSTER_1),
    new yugi.game.ui.zone.Monster(yugi.model.Area.PLAYER_MONSTER_2),
    new yugi.game.ui.zone.Monster(yugi.model.Area.PLAYER_MONSTER_3),
    new yugi.game.ui.zone.Monster(yugi.model.Area.PLAYER_MONSTER_4),
    new yugi.game.ui.zone.Monster(yugi.model.Area.PLAYER_MONSTER_5)
  ];
  goog.array.forEach(this.monsterZones_, function(monsterZone) {
    this.addChild(monsterZone);
  }, this);

  /**
   * @type {!Array.<!yugi.game.ui.zone.SpellTrap>}
   * @private
   */
  this.spellTrapZones_ = [
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.PLAYER_SPELL_TRAP_1),
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.PLAYER_SPELL_TRAP_2),
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.PLAYER_SPELL_TRAP_3),
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.PLAYER_SPELL_TRAP_4),
    new yugi.game.ui.zone.SpellTrap(yugi.model.Area.PLAYER_SPELL_TRAP_5)
  ];
  goog.array.forEach(this.spellTrapZones_, function(spellTrapZone) {
    this.addChild(spellTrapZone);
  }, this);

  /**
   * @type {!yugi.game.ui.player.Controls}
   * @private
   */
  this.controls_ = new yugi.game.ui.player.Controls();
  this.addChild(this.controls_);
};
goog.inherits(yugi.game.ui.field.PlayerZone, goog.ui.Component);


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.field.PlayerZone.Id_ = {
  CONTROLS: yugi.uniqueId('controls')
};


/** @override */
yugi.game.ui.field.PlayerZone.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.field.soy.PLAYER_ZONE, {
        ids: this.makeIds(yugi.game.ui.field.PlayerZone.Id_),
        yugiArea: yugi.model.Area
      }));
};


/** @override */
yugi.game.ui.field.PlayerZone.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  var dom = this.getDomHelper();

  this.deck_.render(dom.getElement(yugi.model.Area.PLAYER_DECK));
  this.extraDeck_.render(dom.getElement(yugi.model.Area.PLAYER_EXTRA_DECK));
  this.graveyard_.render(dom.getElement(yugi.model.Area.PLAYER_GRAVEYARD));
  this.banish_.render(dom.getElement(yugi.model.Area.PLAYER_BANISH));
  this.hand_.render(dom.getElement(yugi.model.Area.PLAYER_HAND));
  this.fieldCard_.render(dom.getElement(yugi.model.Area.PLAYER_FIELD));

  goog.array.forEach(this.monsterZones_, function(monsterZone) {
    monsterZone.render(dom.getElement(monsterZone.getArea()));
  }, this);

  goog.array.forEach(this.spellTrapZones_, function(spellTrapZone) {
    spellTrapZone.render(dom.getElement(spellTrapZone.getArea()));
  }, this);

  this.controls_.render(this.getElementByFragment(
      yugi.game.ui.field.PlayerZone.Id_.CONTROLS));
};
