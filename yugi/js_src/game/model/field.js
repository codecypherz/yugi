/**
 * Keeps state for a player's side of the field.
 */

goog.provide('yugi.game.model.Field');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('yugi.game.data.FieldData');
goog.require('yugi.game.data.MonsterData');
goog.require('yugi.game.data.SpellTrapData');
goog.require('yugi.model.CardList');



/**
 * Keeps state for a player's side of the field.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.model.Field = function() {
  goog.base(this);

  /**
   * @type {!Array.<yugi.model.MonsterCard>}
   * @private
   */
  this.monsterZone_ = new Array(5);

  /**
   * @type {!Array.<yugi.model.SpellCard|yugi.model.TrapCard>}
   * @private
   */
  this.spellTrapZone_ = new Array(5);

  // Initialize the array with null values instead of undefined.
  for (var i = 0; i < 5; i++) {
    this.monsterZone_[i] = null;
    this.spellTrapZone_[i] = null;
  }

  /**
   * @type {!yugi.model.CardList}
   * @private
   */
  this.graveyard_ = new yugi.model.CardList();

  /**
   * @type {!yugi.model.CardList}
   * @private
   */
  this.banishedCards_ = new yugi.model.CardList();
};
goog.inherits(yugi.game.model.Field, goog.events.EventTarget);


/**
 * @type {yugi.model.SpellCard}
 * @private
 */
yugi.game.model.Field.prototype.fieldCard_ = null;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.model.Field.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.game.model.Field');


/**
 * The set of events dispatched by this model.
 * @enum {string}
 */
yugi.game.model.Field.EventType = {
  FIELD_CARD_CHANGED: goog.events.getUniqueId('field-card-changed'),
  MONSTERS_CHANGED: goog.events.getUniqueId('monsters-changed'),
  SPELLS_TRAPS_CHANGED: goog.events.getUniqueId('spell-trap-changed')
};


/**
 * @return {!Array.<!yugi.model.MonsterCard>} The monster cards on the field.
 */
yugi.game.model.Field.prototype.getMonsterZone = function() {
  return this.monsterZone_;
};


/**
 * @return {!Array.<!yugi.model.SpellCard|!yugi.model.TrapCard>} The spell or
 *     trap cards on the field.
 */
yugi.game.model.Field.prototype.getSpellTrapZone = function() {
  return this.spellTrapZone_;
};


/**
 * Checks to see if there is a free monster zone.
 * @return {boolean} True if there is a free monster zone or not.
 */
yugi.game.model.Field.prototype.hasEmptyMonsterZone = function() {
  for (var i = 0; i < 5; i++) {
    if (!this.monsterZone_[i]) {
      return true;
    }
  }
  return false;
};


/**
 * Checks to see if there is a free spell/trap zone.
 * @return {boolean} True if there is a free spell/trap zone or not.
 */
yugi.game.model.Field.prototype.hasEmptySpellTrapZone = function() {
  for (var i = 0; i < 5; i++) {
    if (!this.spellTrapZone_[i]) {
      return true;
    }
  }
  return false;
};


/**
 * @param {!yugi.model.MonsterCard} card The monster card to set.
 * @param {number=} opt_zone The zero-relative index into the monster zone
 *     array.  If undefined, then the first available index will be chosen.  An
 *     exception will be thrown if there are already 5 monster set.
 * @return {number} The zone in which the card now resides.
 */
yugi.game.model.Field.prototype.setMonsterCard = function(card, opt_zone) {
  var zone = 0;
  if (goog.isDefAndNotNull(opt_zone)) {
    zone = opt_zone;
  } else {
    for (var i = 0; i < 5; i++) {
      if (!this.monsterZone_[i]) {
        zone = i;
        break;
      }
    }
  }
  this.logger.info('Setting ' + card.getName() + ' on monster zone ' + zone);
  this.monsterZone_[zone] = card;
  this.dispatchEvent(yugi.game.model.Field.EventType.MONSTERS_CHANGED);
  return zone;
};


/**
 * @param {!yugi.model.SpellCard|!yugi.model.TrapCard} card The spell/trap card
 *     to set.
 * @param {number=} opt_zone The zero-relative index into the spell/trap zone
 *     array.  If undefined, then the first available index will be chosen.  An
 *     exception will be thrown if there are already 5 spell/trap set.
 * @return {number} The zone in which the card now resides.
 */
yugi.game.model.Field.prototype.setSpellTrapCard = function(card, opt_zone) {
  var zone = 0;
  if (goog.isDefAndNotNull(opt_zone)) {
    zone = opt_zone;
  } else {
    for (var i = 0; i < 5; i++) {
      if (!this.spellTrapZone_[i]) {
        zone = i;
        break;
      }
    }
  }
  this.logger.info('Setting ' + card.getName() + ' on spell/trap zone ' + zone);
  this.spellTrapZone_[zone] = card;
  this.dispatchEvent(yugi.game.model.Field.EventType.SPELLS_TRAPS_CHANGED);
  return zone;
};


/**
 * Removes the card from the monster zone and returns it.
 * @param {number} zone The zero-relative index into the monster zone array.
 * @return {yugi.model.MonsterCard} The monster card in the zone or null if
 *     there wasn't one there.
 */
yugi.game.model.Field.prototype.removeMonsterCard = function(zone) {
  var card = this.monsterZone_[zone];
  if (goog.isDefAndNotNull(card)) {
    this.logger.info('Removing ' + card.getName() + ' from monster zone ' +
        zone);
    this.monsterZone_[zone] = null;
    this.dispatchEvent(yugi.game.model.Field.EventType.MONSTERS_CHANGED);
  } else {
    this.logger.warning('Tried to remove a card from the monster zone ' + zone +
        ', but nothing was there.');
  }
  return card;
};


/**
 * Removes the card from the spell/trap zone and returns it.
 * @param {number} zone The zero-relative index into the spell/trap zone array.
 * @return {yugi.model.SpellCard|yugi.model.TrapCard} The spell/trap card in the
 *     zone or null if there wasn't one there.
 */
yugi.game.model.Field.prototype.removeSpellTrapCard = function(zone) {
  var card = this.spellTrapZone_[zone];
  if (goog.isDefAndNotNull(card)) {
    this.logger.info('Removing ' + card.getName() + ' from spell/trap zone ' +
        zone);
    this.spellTrapZone_[zone] = null;
    this.dispatchEvent(yugi.game.model.Field.EventType.SPELLS_TRAPS_CHANGED);
  } else {
    this.logger.warning('Tried to remove a card from the spell/trap zone ' +
        zone + ', but nothing was there.');
  }
  return card;
};


/**
 * @param {number} zone The zero relative monster index.
 * @return {yugi.model.MonsterCard} The monster card in the zone or null if
 *     there wasn't one there.
 */
yugi.game.model.Field.prototype.getMonsterCard = function(zone) {
  return this.monsterZone_[zone];
};


/**
 * @param {number} zone The zero relative spell/trap index.
 * @return {yugi.model.SpellCard|yugi.model.TrapCard} The spell/trap card in the
 *     zone or null if there wasn't one there.
 */
yugi.game.model.Field.prototype.getSpellTrapCard = function(zone) {
  return this.spellTrapZone_[zone];
};


/**
 * @param {!yugi.model.CardList} graveyard The graveyard.
 */
yugi.game.model.Field.prototype.setGraveyard = function(graveyard) {
  this.graveyard_ = graveyard;
};


/**
 * @return {!yugi.model.CardList} The graveyard.
 */
yugi.game.model.Field.prototype.getGraveyard = function() {
  return this.graveyard_;
};


/**
 * @param {!yugi.model.CardList} banishedCards The banished cards.
 */
yugi.game.model.Field.prototype.setBanishedCards = function(banishedCards) {
  this.banishedCards_ = banishedCards;
};


/**
 * @return {!yugi.model.CardList} The banished cards.
 */
yugi.game.model.Field.prototype.getBanishedCards = function() {
  return this.banishedCards_;
};


/**
 * @param {yugi.model.SpellCard} fieldCard The field card.
 */
yugi.game.model.Field.prototype.setFieldCard = function(fieldCard) {
  // TODO Improve this card comparison to check IDs?  May not be good enough.
  if (this.fieldCard_ == fieldCard) {
    return;
  }
  this.fieldCard_ = fieldCard;
  this.dispatchEvent(yugi.game.model.Field.EventType.FIELD_CARD_CHANGED);
};


/**
 * @return {yugi.model.SpellCard} The field card.
 */
yugi.game.model.Field.prototype.getFieldCard = function() {
  return this.fieldCard_;
};


/**
 * Removes all the cards from the field and returns them.
 * @return {!Array.<!yugi.model.Card>} The cards that were removed.
 */
yugi.game.model.Field.prototype.removeAll = function() {
  var cards = [];

  // Remove all the monster, spell, and trap cards.
  for (var i = 0; i < 5; i++) {

    var card = this.monsterZone_[i];
    if (card) {
      cards.push(card);
    }
    this.monsterZone_[i] = null;
    this.dispatchEvent(yugi.game.model.Field.EventType.MONSTERS_CHANGED);

    card = this.spellTrapZone_[i];
    if (card) {
      cards.push(card);
    }
    this.spellTrapZone_[i] = null;
    this.dispatchEvent(yugi.game.model.Field.EventType.SPELLS_TRAPS_CHANGED);
  }

  // Remove the field card.
  if (this.fieldCard_) {
    cards.push(this.fieldCard_);
    this.setFieldCard(null);
  }

  // Remove everything from the graveyard.
  goog.array.forEach(this.graveyard_.removeAll(), function(card) {
    cards.push(card);
  });

  // Remove all the banished cards.
  goog.array.forEach(this.banishedCards_.removeAll(), function(card) {
    cards.push(card);
  });

  // Return all the cards that were returned.
  return cards;
};


/**
 * Searches through everything the field has and removes the card. Events are
 * dispatched as expected.
 * @param {!yugi.model.Card} cardToRemove The card to remove.
 * @return {boolean} True if the card was removed or not.
 */
yugi.game.model.Field.prototype.removeCard = function(cardToRemove) {

  // Search the monster zones first.
  var removed = goog.array.removeIf(this.monsterZone_, function(card) {
    return card && card.equals(cardToRemove);
  });

  // If the monster card was removed, then dispatch and be done.
  if (removed) {
    this.dispatchEvent(yugi.game.model.Field.EventType.MONSTERS_CHANGED);
  } else {
    // Not removed, so check the spell/trap zones.
    removed = goog.array.removeIf(this.spellTrapZone_, function(card) {
      return card && card.equals(cardToRemove);
    });
  }

  // If the spell/trap was removed, then dispatch and be done.
  if (removed) {
    this.dispatchEvent(yugi.game.model.Field.EventType.SPELLS_TRAPS_CHANGED);
  } else {
    // Not removed, so check the field card.
    if (this.fieldCard_ && this.fieldCard_.equals(cardToRemove)) {
      // This will dispatch the event.
      this.setFieldCard(null);
      removed = true;
    }
  }

  // Now check the graveyard.
  if (!removed) {
    removed = this.graveyard_.remove(cardToRemove);
  }

  // Now check the banished cards.
  if (!removed) {
    removed = this.banishedCards_.remove(cardToRemove);
  }

  return removed;
};


/**
 * Converts this object to a data object.
 * @return {!yugi.game.data.FieldData} The converted data object.
 */
yugi.game.model.Field.prototype.toData = function() {
  var fieldData = new yugi.game.data.FieldData();

  // Fill in the monster data.
  var monsters = new Array(this.monsterZone_.length);
  for (var i = 0; i < this.monsterZone_.length; i++) {
    var monsterCard = this.monsterZone_[i];
    if (monsterCard) {
      monsters[i] = yugi.game.data.MonsterData.createFromCard(monsterCard);
    } else {
      monsters[i] = null;
    }
  }
  fieldData.setMonsters(monsters);

  // Fill in the spell/trap data.
  var spellTraps = new Array(this.spellTrapZone_.length);
  for (var i = 0; i < this.spellTrapZone_.length; i++) {
    var spellTrapCard = this.spellTrapZone_[i];
    if (spellTrapCard) {
      spellTraps[i] =
          yugi.game.data.SpellTrapData.createFromCard(spellTrapCard);
    } else {
      spellTraps[i] = null;
    }
  }
  fieldData.setSpellTraps(spellTraps);

  // Fill in the field card.
  var fieldCardData = null;
  if (this.fieldCard_) {
    fieldCardData =
        yugi.game.data.SpellTrapData.createFromCard(this.fieldCard_);
  }
  fieldData.setFieldCardData(fieldCardData);

  // Fill in other data.
  fieldData.setGraveyardData(this.graveyard_.toData());
  fieldData.setBanishData(this.banishedCards_.toData());

  return fieldData;
};


/**
 * Sets this state based on the given data.
 * @param {!yugi.game.data.FieldData} fieldData The data.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 */
yugi.game.model.Field.prototype.setFromData = function(fieldData, cardCache) {
  var monsters = fieldData.getMonsters();
  var spellTraps = fieldData.getSpellTraps();

  // Loop to set all monsters, spells, and traps on the field.
  for (var i = 0; i < 5; i++) {

    // Monster data.
    var monsterData = monsters[i];
    if (monsterData) {
      var monsterCard = /** @type {!yugi.model.MonsterCard} */ (
          cardCache.get(monsterData.getKey()));
      yugi.game.data.MonsterData.setCardFromData(monsterCard, monsterData);
      this.monsterZone_[i] = monsterCard;
    } else {
      this.monsterZone_[i] = null;
    }

    // Spell/trap data.
    var spellTrapData = spellTraps[i];
    if (spellTrapData) {
      var spellTrapCard =
          /** @type {!yugi.model.SpellCard|!yugi.model.TrapCard} */ (
          cardCache.get(spellTrapData.getKey()));
      yugi.game.data.SpellTrapData.setCardFromData(
          spellTrapCard, spellTrapData);
      this.spellTrapZone_[i] = spellTrapCard;
    } else {
      this.spellTrapZone_[i] = null;
    }
  }
  this.dispatchEvent(yugi.game.model.Field.EventType.MONSTERS_CHANGED);
  this.dispatchEvent(yugi.game.model.Field.EventType.SPELLS_TRAPS_CHANGED);

  // Graveyard
  this.graveyard_.setFromData(fieldData.getGraveyardData(), cardCache);

  // Banish
  this.banishedCards_.setFromData(fieldData.getBanishData(), cardCache);

  // Grab the field card.
  var fieldCardData = fieldData.getFieldCardData();
  if (fieldCardData) {
    var fieldCard = /** @type {!yugi.model.SpellCard} */ (
        cardCache.get(fieldCardData.getKey()));
    yugi.game.data.SpellTrapData.setCardFromData(fieldCard, fieldCardData);
    this.fieldCard_ = fieldCard;
  } else {
    this.fieldCard_ = null;
  }
  this.dispatchEvent(yugi.game.model.Field.EventType.FIELD_CARD_CHANGED);
};
