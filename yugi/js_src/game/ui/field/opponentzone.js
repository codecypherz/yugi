/**
 * This UI for the opponent's side of the field.
 */

goog.provide('yugi.game.ui.field.OpponentZone');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Field');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.ui.field.Banish');
goog.require('yugi.game.ui.field.Deck');
goog.require('yugi.game.ui.field.ExtraDeck');
goog.require('yugi.game.ui.field.FieldCard');
goog.require('yugi.game.ui.field.Graveyard');
goog.require('yugi.game.ui.field.Monster');
goog.require('yugi.game.ui.field.SpellTrap');
goog.require('yugi.game.ui.field.soy');
goog.require('yugi.game.ui.hand.OpponentHand');



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
   * @type {!Array.<!yugi.game.ui.field.Monster>}
   * @private
   */
  this.monsters_ = [];

  /**
   * @type {!Array.<!yugi.game.ui.field.SpellTrap>}
   * @private
   */
  this.spellTraps_ = [];
};
goog.inherits(yugi.game.ui.field.OpponentZone, goog.ui.Component);


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.field.OpponentZone.Id_ = {
  BANISH: 'banish',
  DECK: 'deck',
  EXTRA_DECK: 'extra-deck',
  FIELD: 'field',
  GRAVEYARD: 'graveyard',
  HAND: 'hand',
  MONSTER_1: 'monster-1',
  MONSTER_2: 'monster-2',
  MONSTER_3: 'monster-3',
  MONSTER_4: 'monster-4',
  MONSTER_5: 'monster-5',
  SPELL_TRAP_1: 'spell-trap-1',
  SPELL_TRAP_2: 'spell-trap-2',
  SPELL_TRAP_3: 'spell-trap-3',
  SPELL_TRAP_4: 'spell-trap-4',
  SPELL_TRAP_5: 'spell-trap-5'
};


/** @override */
yugi.game.ui.field.OpponentZone.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.field.soy.OPPONENT_ZONE, {
        ids: this.makeIds(yugi.game.ui.field.OpponentZone.Id_)
      }));
};


/** @override */
yugi.game.ui.field.OpponentZone.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.deck_.render(this.getElementByFragment(
      yugi.game.ui.field.OpponentZone.Id_.DECK));
  this.extraDeck_.render(this.getElementByFragment(
      yugi.game.ui.field.OpponentZone.Id_.EXTRA_DECK));
  this.graveyard_.render(this.getElementByFragment(
      yugi.game.ui.field.OpponentZone.Id_.GRAVEYARD));
  this.banish_.render(this.getElementByFragment(
      yugi.game.ui.field.OpponentZone.Id_.BANISH));
  this.hand_.render(this.getElementByFragment(
      yugi.game.ui.field.OpponentZone.Id_.HAND));
  this.fieldCard_.render(this.getElementByFragment(
      yugi.game.ui.field.OpponentZone.Id_.FIELD));

  // Listen to field changes.
  var field = this.game_.getOpponent().getField();

  this.getHandler().listen(field,
      yugi.game.model.Field.EventType.MONSTERS_CHANGED,
      this.onMonstersChanged_);
  this.getHandler().listen(field,
      yugi.game.model.Field.EventType.SPELLS_TRAPS_CHANGED,
      this.onSpellsTrapsChanged_);

  // TODO Listen for the field card change.
};


/**
 * Called when the monsters change.
 * @private
 */
yugi.game.ui.field.OpponentZone.prototype.onMonstersChanged_ = function() {

  // Clear old monsters.
  this.disposeMonsters_();

  var opponent = this.game_.getOpponent();
  var field = opponent.getField();

  // Render existing monsters.
  var monsterCards = field.getMonsterZone();
  for (var i = 0; i < monsterCards.length; i++) {
    var monsterCard = monsterCards[i];
    if (monsterCard) {
      var monster = new yugi.game.ui.field.Monster(monsterCard, i, opponent);
      var element = this.getElementByFragment(this.getMonsterFragment_(i));
      monster.render(element);
      this.monsters_.push(monster);
    }
  }
};


/**
 * Called when the spells/traps change.
 * @private
 */
yugi.game.ui.field.OpponentZone.prototype.onSpellsTrapsChanged_ = function() {

  // Clear old monsters.
  this.disposeSpellTraps_();

  var opponent = this.game_.getOpponent();
  var field = opponent.getField();

  // Render the spell/trap cards.
  var spellTrapCards = field.getSpellTrapZone();
  for (var i = 0; i < spellTrapCards.length; i++) {
    var spellTrapCard = spellTrapCards[i];
    if (spellTrapCard) {
      var spellTrap = new yugi.game.ui.field.SpellTrap(spellTrapCard, i,
          opponent);
      var element = this.getElementByFragment(this.getSpellTrapFragment_(i));
      spellTrap.render(element);
      this.spellTraps_.push(spellTrap);
    }
  }
};


/**
 * Figures out the monster fragment associated with the zone ID.
 * @param {number} zone The zone ID.
 * @return {!yugi.game.ui.field.OpponentZone.Id_} The ID for the zone.
 * @private
 */
yugi.game.ui.field.OpponentZone.prototype.getMonsterFragment_ = function(zone) {
  switch (zone) {
    case 0:
      return yugi.game.ui.field.OpponentZone.Id_.MONSTER_1;
    case 1:
      return yugi.game.ui.field.OpponentZone.Id_.MONSTER_2;
    case 2:
      return yugi.game.ui.field.OpponentZone.Id_.MONSTER_3;
    case 3:
      return yugi.game.ui.field.OpponentZone.Id_.MONSTER_4;
    case 4:
    default:
      return yugi.game.ui.field.OpponentZone.Id_.MONSTER_5;
  }
};


/**
 * Figures out the spell/trap fragment associated with the zone ID.
 * @param {number} zone The zone ID.
 * @return {!yugi.game.ui.field.OpponentZone.Id_} The ID for the zone.
 * @private
 */
yugi.game.ui.field.OpponentZone.prototype.getSpellTrapFragment_ =
    function(zone) {
  switch (zone) {
    case 0:
      return yugi.game.ui.field.OpponentZone.Id_.SPELL_TRAP_1;
    case 1:
      return yugi.game.ui.field.OpponentZone.Id_.SPELL_TRAP_2;
    case 2:
      return yugi.game.ui.field.OpponentZone.Id_.SPELL_TRAP_3;
    case 3:
      return yugi.game.ui.field.OpponentZone.Id_.SPELL_TRAP_4;
    case 4:
    default:
      return yugi.game.ui.field.OpponentZone.Id_.SPELL_TRAP_5;
  }
};


/** @override */
yugi.game.ui.field.OpponentZone.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.disposeMonsters_();
  this.disposeSpellTraps_();
};


/**
 * Disposes all monsters.
 * @private
 */
yugi.game.ui.field.OpponentZone.prototype.disposeMonsters_ = function() {
  goog.array.forEach(this.monsters_, function(monster) {
    goog.dom.removeNode(monster.getElement());
    monster.dispose();
  }, this);
  this.monsters_ = [];
};


/**
 * Disposes all spell/traps.
 * @private
 */
yugi.game.ui.field.OpponentZone.prototype.disposeSpellTraps_ = function() {
  goog.array.forEach(this.spellTraps_, function(spellTrap) {
    goog.dom.removeNode(spellTrap.getElement());
    spellTrap.dispose();
  }, this);
  this.spellTraps_ = [];
};
