/**
 * Keeps state for a player's side of the field.
 */

goog.provide('yugi.game.model.field.Field');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.structs.Set');
goog.require('yugi.game.data.CardData');
goog.require('yugi.game.data.FieldData');
goog.require('yugi.game.model.field.Banish');
goog.require('yugi.game.model.field.Graveyard');
goog.require('yugi.model.Area');



/**
 * Keeps state for a player's side of the field.
 * @param {boolean} isOpponent True if the player is the opponent.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.model.field.Field = function(isOpponent) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.model.field.Field');

  /**
   * @type {!Array.<yugi.model.Card>}
   * @private
   */
  this.monsterZone_ = new Array(5);

  /**
   * @type {!Array.<yugi.model.Card>}
   * @private
   */
  this.spellTrapZone_ = new Array(5);

  // Initialize the array with null values instead of undefined.
  for (var i = 0; i < 5; i++) {
    this.monsterZone_[i] = null;
    this.spellTrapZone_[i] = null;
  }

  /**
   * @type {!yugi.game.model.field.Graveyard}
   * @private
   */
  this.graveyard_ = new yugi.game.model.field.Graveyard(isOpponent);

  /**
   * @type {!yugi.game.model.field.Banish}
   * @private
   */
  this.banish_ = new yugi.game.model.field.Banish(isOpponent);

  /**
   * @type {boolean}
   * @private
   */
  this.isOpponent_ = isOpponent;

  /**
   * @type {yugi.model.SpellCard}
   * @private
   */
  this.fieldCard_ = null;
};
goog.inherits(yugi.game.model.field.Field, goog.events.EventTarget);


/**
 * The set of events dispatched by this model.
 * @enum {string}
 */
yugi.game.model.field.Field.EventType = {
  FIELD_CARD_CHANGED: goog.events.getUniqueId('field-card-changed'),
  MONSTERS_CHANGED: goog.events.getUniqueId('monsters-changed'),
  SPELLS_TRAPS_CHANGED: goog.events.getUniqueId('spell-trap-changed')
};


/**
 * The set of areas that belong to the field (except zones).
 * @type {!goog.structs.Set}
 * @private
 * @const
 */
yugi.game.model.field.Field.NON_ZONES_ = new goog.structs.Set([
  yugi.model.Area.PLAYER_GRAVEYARD,
  yugi.model.Area.PLAYER_BANISH,
  yugi.model.Area.PLAYER_FIELD,
  yugi.model.Area.OPP_GRAVEYARD,
  yugi.model.Area.OPP_BANISH,
  yugi.model.Area.OPP_FIELD
]);


/**
 * The set of all areas that belong to the field.
 * @type {!goog.structs.Set}
 * @private
 * @const
 */
yugi.game.model.field.Field.AREAS_ = new goog.structs.Set(goog.array.flatten(
    yugi.model.Area.MONSTER_ZONES.getValues(),
    yugi.model.Area.SPELL_TRAP_ZONES.getValues(),
    yugi.game.model.field.Field.NON_ZONES_.getValues()));


/**
 * @return {!Array.<!yugi.model.MonsterCard>} The monster cards on the field.
 */
yugi.game.model.field.Field.prototype.getMonsterZone = function() {
  return this.monsterZone_;
};


/**
 * @return {!Array.<!yugi.model.SpellCard|!yugi.model.TrapCard>} The spell or
 *     trap cards on the field.
 */
yugi.game.model.field.Field.prototype.getSpellTrapZone = function() {
  return this.spellTrapZone_;
};


/**
 * Checks to see if there is a free monster zone.
 * @return {boolean} True if there is a free monster zone or not.
 */
yugi.game.model.field.Field.prototype.hasEmptyMonsterZone = function() {
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
yugi.game.model.field.Field.prototype.hasEmptySpellTrapZone = function() {
  for (var i = 0; i < 5; i++) {
    if (!this.spellTrapZone_[i]) {
      return true;
    }
  }
  return false;
};


/**
 * Checks to see if the area belongs to the field.
 * @param {!yugi.model.Area} area The area to check.
 * @return {boolean} True if the area is a field area.
 */
yugi.game.model.field.Field.prototype.isFieldArea = function(area) {
  return yugi.game.model.field.Field.AREAS_.contains(area);
};


/**
 * Checks to see if the area belongs to the field and is a zone.
 * @param {!yugi.model.Area} area The area to check.
 * @return {boolean} True if the area is a field area zone.
 */
yugi.game.model.field.Field.prototype.isZone = function(area) {
  return yugi.model.Area.MONSTER_ZONES.contains(area) ||
      yugi.model.Area.SPELL_TRAP_ZONES.contains(area);
};


/**
 * Checks to see if the field zone is empty.  An error is thrown if it is not a
 * field zone area.
 * @param {!yugi.model.Area} area The area to check.
 * @return {boolean} True if the area is empty.
 */
yugi.game.model.field.Field.prototype.isZoneEmpty = function(area) {
  var index = yugi.model.Area.getZoneIndex(area);
  if (yugi.model.Area.MONSTER_ZONES.contains(area)) {
    return !this.monsterZone_[index];
  } else if (yugi.model.Area.SPELL_TRAP_ZONES.contains(area)) {
    return !this.spellTrapZone_[index];
  } else {
    throw Error('Area ' + area + ' is not a zone.');
  }
};


/**
 * Sets the card for the given zone.  Errors are thrown if the area is invalid
 * or the zone is not empty.
 * @param {!yugi.model.Area} area The area to set.
 * @param {!yugi.model.Card} card The card to set.
 */
yugi.game.model.field.Field.prototype.setCardInZone = function(area, card) {
  this.setCardInZone_(area, card);
};


/**
 * Gets the card for the given zone.  Errors are thrown if the area is invalid.
 * @param {!yugi.model.Area} area The area to set.
 * @return {yugi.model.Card} The card in the zone or null if there isn't one.
 */
yugi.game.model.field.Field.prototype.getCardInZone = function(area) {
  var index = yugi.model.Area.getZoneIndex(area);
  if (yugi.model.Area.MONSTER_ZONES.contains(area)) {
    return this.monsterZone_[index];
  } else if (yugi.model.Area.SPELL_TRAP_ZONES.contains(area)) {
    return this.spellTrapZone_[index];
  } else {
    throw Error('Area ' + area + ' is not a zone.');
  }
};


/**
 * Removes the card from the given zone.  Errors are thrown if the area is
 * invalid.
 * @param {!yugi.model.Area} area The area to set.
 * @return {yugi.model.Card} The card removed or null if there was no card.
 */
yugi.game.model.field.Field.prototype.removeCardInZone = function(area) {
  var card = null;
  var index = yugi.model.Area.getZoneIndex(area);
  if (yugi.model.Area.MONSTER_ZONES.contains(area)) {
    card = this.monsterZone_[index];
    this.monsterZone_[index] = null;
    if (card) {
      this.logger.info('Removed ' + card.getName() + ' from ' + area);
      this.dispatchEvent(
          yugi.game.model.field.Field.EventType.MONSTERS_CHANGED);
    }
  } else if (yugi.model.Area.SPELL_TRAP_ZONES.contains(area)) {
    card = this.spellTrapZone_[index];
    this.spellTrapZone_[index] = null;
    if (card) {
      this.logger.info('Removing ' + card.getName() + ' from ' + area);
      this.dispatchEvent(
          yugi.game.model.field.Field.EventType.SPELLS_TRAPS_CHANGED);
    }
  } else {
    throw Error('Area ' + area + ' is not a zone.');
  }
  return card;
};


/**
 * @param {!yugi.model.Card} card The card to set.
 * @param {number=} opt_zone The zero-relative index into the monster zone
 *     array.  If undefined, then the first available index will be chosen.  An
 *     exception will be thrown if there are already 5 set.
 * @return {number} The zone in which the card now resides.
 */
yugi.game.model.field.Field.prototype.setMonsterCard = function(
    card, opt_zone) {
  var zone = this.getAvailableIndex_(this.monsterZone_);
  this.setCardInZone(this.getMonsterArea_(zone), card);
  return zone;
};


/**
 * @param {!yugi.model.Card} card The card to set.
 * @return {number} The zone in which the card now resides.
 */
yugi.game.model.field.Field.prototype.setSpellTrapCard = function(card) {
  var zone = this.getAvailableIndex_(this.spellTrapZone_);
  this.setCardInZone(this.getSpellTrapArea_(zone), card);
  return zone;
};


/**
 * Removes the card from the monster zone and returns it.
 * @param {number} zone The zero-relative index into the monster zone array.
 * @return {yugi.model.Card} The card in the zone or null if there wasn't one.
 */
yugi.game.model.field.Field.prototype.removeMonsterCard = function(zone) {
  return this.removeCardInZone(this.getMonsterArea_(zone));
};


/**
 * Removes the card from the spell/trap zone and returns it.
 * @param {number} zone The zero-relative index into the spell/trap zone array.
 * @return {yugi.model.Card} The card in the zone or null if there wasn't one.
 */
yugi.game.model.field.Field.prototype.removeSpellTrapCard = function(zone) {
  return this.removeCardInZone(this.getSpellTrapArea_(zone));
};


/**
 * @return {!yugi.game.model.field.Graveyard} The graveyard.
 */
yugi.game.model.field.Field.prototype.getGraveyard = function() {
  return this.graveyard_;
};


/**
 * @return {!yugi.game.model.field.Banish} The banished cards.
 */
yugi.game.model.field.Field.prototype.getBanish = function() {
  return this.banish_;
};


/**
 * @param {yugi.model.SpellCard} fieldCard The field card.
 */
yugi.game.model.field.Field.prototype.setFieldCard = function(fieldCard) {
  // TODO Improve this card comparison to check IDs?  May not be good enough.
  if (this.fieldCard_ == fieldCard) {
    return;
  }
  this.fieldCard_ = fieldCard;
  if (this.fieldCard_) {
    var fieldArea = this.isOpponent_ ?
        yugi.model.Area.OPP_FIELD : yugi.model.Area.PLAYER_FIELD;
    this.fieldCard_.getLocation().setArea(fieldArea);
    this.fieldCard_.getLocation().setIndex(0);
  }
  this.dispatchEvent(yugi.game.model.field.Field.EventType.FIELD_CARD_CHANGED);
};


/**
 * @return {yugi.model.SpellCard} The field card.
 */
yugi.game.model.field.Field.prototype.getFieldCard = function() {
  return this.fieldCard_;
};


/**
 * Removes all the cards from the field and returns them.
 * @return {!Array.<!yugi.model.Card>} The cards that were removed.
 */
yugi.game.model.field.Field.prototype.removeAll = function() {
  var cards = [];

  // Remove all the monster, spell, and trap cards.
  for (var i = 0; i < 5; i++) {

    var card = this.monsterZone_[i];
    if (card) {
      cards.push(card);
    }
    this.monsterZone_[i] = null;
    this.dispatchEvent(yugi.game.model.field.Field.EventType.MONSTERS_CHANGED);

    card = this.spellTrapZone_[i];
    if (card) {
      cards.push(card);
    }
    this.spellTrapZone_[i] = null;
    this.dispatchEvent(
        yugi.game.model.field.Field.EventType.SPELLS_TRAPS_CHANGED);
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
  goog.array.forEach(this.banish_.removeAll(), function(card) {
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
yugi.game.model.field.Field.prototype.removeCard = function(cardToRemove) {

  // Search the monster zones first.
  var removed = goog.array.removeIf(this.monsterZone_, function(card) {
    if (card) {
      return card.equals(cardToRemove);
    }
    return false;
  });

  // If the monster card was removed, then dispatch and be done.
  if (removed) {
    this.dispatchEvent(yugi.game.model.field.Field.EventType.MONSTERS_CHANGED);
  } else {
    // Not removed, so check the spell/trap zones.
    removed = goog.array.removeIf(this.spellTrapZone_, function(card) {
      if (card) {
        return card.equals(cardToRemove);
      }
      return false;
    });
  }

  // If the spell/trap was removed, then dispatch and be done.
  if (removed) {
    this.dispatchEvent(
        yugi.game.model.field.Field.EventType.SPELLS_TRAPS_CHANGED);
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
    removed = this.banish_.remove(cardToRemove);
  }

  return removed;
};


/**
 * Converts this object to a data object.
 * @return {!yugi.game.data.FieldData} The converted data object.
 */
yugi.game.model.field.Field.prototype.toData = function() {
  var fieldData = new yugi.game.data.FieldData();

  // Fill in the monster data.
  var monsters = new Array(this.monsterZone_.length);
  for (var i = 0; i < this.monsterZone_.length; i++) {
    var monsterCard = this.monsterZone_[i];
    if (monsterCard) {
      monsters[i] = yugi.game.data.CardData.createFromCard(monsterCard);
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
      spellTraps[i] = yugi.game.data.CardData.createFromCard(spellTrapCard);
    } else {
      spellTraps[i] = null;
    }
  }
  fieldData.setSpellTraps(spellTraps);

  // Fill in the field card.
  var fieldCardData = null;
  if (this.fieldCard_) {
    fieldCardData = yugi.game.data.CardData.createFromCard(this.fieldCard_);
  }
  fieldData.setFieldCardData(fieldCardData);

  // Fill in other data.
  fieldData.setGraveyardData(this.graveyard_.toData());
  fieldData.setBanishData(this.banish_.toData());

  return fieldData;
};


/**
 * Sets this state based on the given data.
 * @param {!yugi.game.data.FieldData} fieldData The data.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 */
yugi.game.model.field.Field.prototype.setFromData = function(
    fieldData, cardCache) {
  var monsters = fieldData.getMonsters();
  var spellTraps = fieldData.getSpellTraps();

  // Loop to set all monsters, spells, and traps on the field.
  for (var i = 0; i < 5; i++) {

    // Monster data.
    var monsterData = monsters[i];
    if (monsterData) {
      var monsterCard = /** @type {!yugi.model.MonsterCard} */ (
          cardCache.get(monsterData.getKey()));
      monsterData.syncToCard(monsterCard);
      this.setCardInZone_(this.getMonsterArea_(i), monsterCard, true);
    } else {
      this.monsterZone_[i] = null;
    }

    // Spell/trap data.
    var spellTrapData = spellTraps[i];
    if (spellTrapData) {
      var spellTrapCard =
          /** @type {!yugi.model.SpellCard|!yugi.model.TrapCard} */ (
          cardCache.get(spellTrapData.getKey()));
      spellTrapData.syncToCard(spellTrapCard);
      this.setCardInZone_(this.getSpellTrapArea_(i), spellTrapCard, true);
    } else {
      this.spellTrapZone_[i] = null;
    }
  }
  this.dispatchEvent(
      yugi.game.model.field.Field.EventType.MONSTERS_CHANGED);
  this.dispatchEvent(
      yugi.game.model.field.Field.EventType.SPELLS_TRAPS_CHANGED);

  // Graveyard
  this.graveyard_.setFromData(fieldData.getGraveyardData(), cardCache);

  // Banish
  this.banish_.setFromData(fieldData.getBanishData(), cardCache);

  // Grab the field card.
  var fieldCardData = fieldData.getFieldCardData();
  var fieldCard = null;
  if (fieldCardData) {
    fieldCard = /** @type {!yugi.model.SpellCard} */ (
        cardCache.get(fieldCardData.getKey()));
    fieldCardData.syncToCard(fieldCard);
  }
  this.setFieldCard(fieldCard);
};


/**
 * Sets the card for the given zone.  Errors are thrown if the area is invalid
 * or the zone is not empty.
 * @param {!yugi.model.Area} area The area to set.
 * @param {!yugi.model.Card} card The card to set.
 * @param {boolean=} opt_suppressEvent True if the event should be suppressed.
 * @private
 */
yugi.game.model.field.Field.prototype.setCardInZone_ = function(
    area, card, opt_suppressEvent) {

  // Set the new location.
  card.getLocation().setIndex(0); // Always zero until card attachments.
  card.getLocation().setArea(area);
  var suppressEvent = !!opt_suppressEvent;

  var index = yugi.model.Area.getZoneIndex(area);
  if (yugi.model.Area.MONSTER_ZONES.contains(area)) {
    this.monsterZone_[index] = card;
    this.logger.info('Setting ' + card.getName() + ' on ' + area);
    if (!suppressEvent) {
      this.dispatchEvent(
          yugi.game.model.field.Field.EventType.MONSTERS_CHANGED);
    }
  } else if (yugi.model.Area.SPELL_TRAP_ZONES.contains(area)) {
    this.spellTrapZone_[index] = card;
    this.logger.info('Setting ' + card.getName() + ' on ' + area);
    if (!suppressEvent) {
      this.dispatchEvent(
          yugi.game.model.field.Field.EventType.SPELLS_TRAPS_CHANGED);
    }
  } else {
    throw Error('Area ' + area + ' is not a zone.');
  }
};


/**
 * Finds the first empty index in the zone array and returns it.
 * @param {!Array.<!yugi.model.Card>} zoneArr The zone array to check.
 * @return {number} The first available index in the array or -1 if none.
 * @private
 */
yugi.game.model.field.Field.prototype.getAvailableIndex_ = function(zoneArr) {
  for (var i = 0; i < zoneArr.length; i++) {
    if (!zoneArr[i]) {
      return i;
    }
  }
  return -1;
};


/**
 * Converts a zone into the area it represents.  An error is thrown if the zone
 * is invalid.
 * @param {number} zone The zone to convert.
 * @return {!yugi.model.Area} area The area the zone represents.
 * @private
 */
yugi.game.model.field.Field.prototype.getMonsterArea_ = function(zone) {
  if (this.isOpponent_) {
    switch (zone) {
      case 0:
        return yugi.model.Area.OPP_MONSTER_1;
      case 1:
        return yugi.model.Area.OPP_MONSTER_2;
      case 2:
        return yugi.model.Area.OPP_MONSTER_3;
      case 3:
        return yugi.model.Area.OPP_MONSTER_4;
      case 4:
        return yugi.model.Area.OPP_MONSTER_5;
    }
  } else {
    switch (zone) {
      case 0:
        return yugi.model.Area.PLAYER_MONSTER_1;
      case 1:
        return yugi.model.Area.PLAYER_MONSTER_2;
      case 2:
        return yugi.model.Area.PLAYER_MONSTER_3;
      case 3:
        return yugi.model.Area.PLAYER_MONSTER_4;
      case 4:
        return yugi.model.Area.PLAYER_MONSTER_5;
    }
  }
  throw Error('Invalid zone to convert to an area');
};


/**
 * Converts a zone into the area it represents.  An error is thrown if the zone
 * is invalid.
 * @param {number} zone The zone to convert.
 * @return {!yugi.model.Area} area The area the zone represents.
 * @private
 */
yugi.game.model.field.Field.prototype.getSpellTrapArea_ = function(zone) {
  if (this.isOpponent_) {
    switch (zone) {
      case 0:
        return yugi.model.Area.OPP_SPELL_TRAP_1;
      case 1:
        return yugi.model.Area.OPP_SPELL_TRAP_2;
      case 2:
        return yugi.model.Area.OPP_SPELL_TRAP_3;
      case 3:
        return yugi.model.Area.OPP_SPELL_TRAP_4;
      case 4:
        return yugi.model.Area.OPP_SPELL_TRAP_5;
    }
  } else {
    switch (zone) {
      case 0:
        return yugi.model.Area.PLAYER_SPELL_TRAP_1;
      case 1:
        return yugi.model.Area.PLAYER_SPELL_TRAP_2;
      case 2:
        return yugi.model.Area.PLAYER_SPELL_TRAP_3;
      case 3:
        return yugi.model.Area.PLAYER_SPELL_TRAP_4;
      case 4:
        return yugi.model.Area.PLAYER_SPELL_TRAP_5;
    }
  }
  throw Error('Invalid zone to convert to an area');
};
