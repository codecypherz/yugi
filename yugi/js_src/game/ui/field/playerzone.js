/**
 * This UI for the player's side of the field.
 */

goog.provide('yugi.game.ui.field.PlayerZone');

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
goog.require('yugi.game.ui.hand.PlayerHand');
goog.require('yugi.game.ui.player.Controls');



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
   * @type {!Array.<!yugi.game.ui.field.Monster>}
   * @private
   */
  this.monsters_ = [];

  /**
   * @type {!Array.<!yugi.game.ui.field.SpellTrap>}
   * @private
   */
  this.spellTraps_ = [];

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
  BANISH: 'banish',
  CONTROLS: 'controls',
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
yugi.game.ui.field.PlayerZone.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.field.soy.PLAYER_ZONE, {
        ids: this.makeIds(yugi.game.ui.field.PlayerZone.Id_)
      }));
};


/** @override */
yugi.game.ui.field.PlayerZone.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.deck_.render(this.getElementByFragment(
      yugi.game.ui.field.PlayerZone.Id_.DECK));
  this.extraDeck_.render(this.getElementByFragment(
      yugi.game.ui.field.PlayerZone.Id_.EXTRA_DECK));
  this.graveyard_.render(this.getElementByFragment(
      yugi.game.ui.field.PlayerZone.Id_.GRAVEYARD));
  this.banish_.render(this.getElementByFragment(
      yugi.game.ui.field.PlayerZone.Id_.BANISH));
  this.hand_.render(this.getElementByFragment(
      yugi.game.ui.field.PlayerZone.Id_.HAND));
  this.fieldCard_.render(this.getElementByFragment(
      yugi.game.ui.field.PlayerZone.Id_.FIELD));
  this.controls_.render(this.getElementByFragment(
      yugi.game.ui.field.PlayerZone.Id_.CONTROLS));

  // Listen to field changes.
  var field = this.game_.getPlayer().getField();

  this.getHandler().listen(field,
      yugi.game.model.Field.EventType.MONSTERS_CHANGED,
      this.onMonstersChanged_);
  this.getHandler().listen(field,
      yugi.game.model.Field.EventType.SPELLS_TRAPS_CHANGED,
      this.onSpellsTrapsChanged_);
};


/**
 * Called when the monsters change.
 * @private
 */
yugi.game.ui.field.PlayerZone.prototype.onMonstersChanged_ = function() {

  // Clear old stuff.
  this.disposeMonsters_();

  var player = this.game_.getPlayer();
  var field = player.getField();

  // Render the monsters.
  var monsterCards = field.getMonsterZone();
  for (var i = 0; i < monsterCards.length; i++) {
    var monsterCard = monsterCards[i];
    if (monsterCard) {
      var monster = new yugi.game.ui.field.Monster(monsterCard, i, player);
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
yugi.game.ui.field.PlayerZone.prototype.onSpellsTrapsChanged_ = function() {

  // Clear old stuff.
  this.disposeSpellTraps_();

  var player = this.game_.getPlayer();
  var field = player.getField();

  // Render the spell/trap cards.
  var spellTrapCards = field.getSpellTrapZone();
  for (var i = 0; i < spellTrapCards.length; i++) {
    var spellTrapCard = spellTrapCards[i];
    if (spellTrapCard) {
      var spellTrap = new yugi.game.ui.field.SpellTrap(spellTrapCard, i,
          player);
      var element = this.getElementByFragment(this.getSpellTrapFragment_(i));
      spellTrap.render(element);
      this.spellTraps_.push(spellTrap);
    }
  }
};


/**
 * Figures out the monster fragment associated with the zone ID.
 * @param {number} zone The zone ID.
 * @return {!yugi.game.ui.field.PlayerZone.Id_} The ID for the zone.
 * @private
 */
yugi.game.ui.field.PlayerZone.prototype.getMonsterFragment_ = function(zone) {
  switch (zone) {
    case 0:
      return yugi.game.ui.field.PlayerZone.Id_.MONSTER_1;
    case 1:
      return yugi.game.ui.field.PlayerZone.Id_.MONSTER_2;
    case 2:
      return yugi.game.ui.field.PlayerZone.Id_.MONSTER_3;
    case 3:
      return yugi.game.ui.field.PlayerZone.Id_.MONSTER_4;
    case 4:
    default:
      return yugi.game.ui.field.PlayerZone.Id_.MONSTER_5;
  }
};


/**
 * Figures out the spell/trap fragment associated with the zone ID.
 * @param {number} zone The zone ID.
 * @return {!yugi.game.ui.field.PlayerZone.Id_} The ID for the zone.
 * @private
 */
yugi.game.ui.field.PlayerZone.prototype.getSpellTrapFragment_ = function(zone) {
  switch (zone) {
    case 0:
      return yugi.game.ui.field.PlayerZone.Id_.SPELL_TRAP_1;
    case 1:
      return yugi.game.ui.field.PlayerZone.Id_.SPELL_TRAP_2;
    case 2:
      return yugi.game.ui.field.PlayerZone.Id_.SPELL_TRAP_3;
    case 3:
      return yugi.game.ui.field.PlayerZone.Id_.SPELL_TRAP_4;
    case 4:
    default:
      return yugi.game.ui.field.PlayerZone.Id_.SPELL_TRAP_5;
  }
};


/** @override */
yugi.game.ui.field.PlayerZone.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.disposeMonsters_();
  this.disposeSpellTraps_();
};


/**
 * Disposes all monsters.
 * @private
 */
yugi.game.ui.field.PlayerZone.prototype.disposeMonsters_ = function() {
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
yugi.game.ui.field.PlayerZone.prototype.disposeSpellTraps_ = function() {
  goog.array.forEach(this.spellTraps_, function(spellTrap) {
    goog.dom.removeNode(spellTrap.getElement());
    spellTrap.dispose();
  }, this);
  this.spellTraps_ = [];
};
