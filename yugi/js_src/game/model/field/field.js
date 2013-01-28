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
 * The set of all areas that belong to the field.
 * @type {!goog.structs.Set}
 * @private
 * @const
 */
yugi.game.model.field.Field.ZONES_ = new goog.structs.Set(goog.array.flatten(
    yugi.model.Area.MONSTER_ZONES.getValues(),
    yugi.model.Area.SPELL_TRAP_ZONES.getValues(),
    yugi.model.Area.PLAYER_FIELD,
    yugi.model.Area.OPP_FIELD));


/**
 * Checks to see if the area belongs to the field and is a zone.
 * @param {!yugi.model.Area} area The area to check.
 * @return {boolean} True if the area is a field area zone.
 */
yugi.game.model.field.Field.prototype.isZone = function(area) {
  return yugi.game.model.field.Field.ZONES_.contains(area);
};


/**
 * Checks to see if the field zone is empty.  An error is thrown if it is not a
 * field zone area.
 * @param {!yugi.model.Area} area The area to check.
 * @return {boolean} True if the area is empty.
 */
yugi.game.model.field.Field.prototype.isEmpty = function(area) {
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
 * Sets the card for the given area.  Errors are thrown if the area is invalid.
 * @param {!yugi.model.Area} area The area to set.
 * @param {yugi.model.Card} card The card to set.
 * @return {yugi.model.Card} The card that used to be in the area, if any.
 */
yugi.game.model.field.Field.prototype.setCard = function(area, card) {
  return this.setCard_(area, card);
};


/**
 * Gets the card for the given area.  Errors are thrown if the area is invalid.
 * @param {!yugi.model.Area} area The area to set.
 * @return {yugi.model.Card} The card in the zone or null if there isn't one.
 */
yugi.game.model.field.Field.prototype.getCard = function(area) {
  if (yugi.model.Area.MONSTER_ZONES.contains(area)) {
    return this.monsterZone_[yugi.model.Area.getZoneIndex(area)];
  } else if (yugi.model.Area.SPELL_TRAP_ZONES.contains(area)) {
    return this.spellTrapZone_[yugi.model.Area.getZoneIndex(area)];
  } else if (yugi.model.Area.PLAYER_FIELD == area ||
             yugi.model.Area.OPP_FIELD == area) {
    return this.fieldCard_;
  } else {
    throw Error('Area ' + area + ' is invalid.');
  }
};


/**
 * Convenience method when seeking just the field card.
 * @return {yugi.model.SpellCard} The current field card.
 */
yugi.game.model.field.Field.prototype.getFieldCard = function() {
  return this.fieldCard_;
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
  this.setCard(this.getMonsterArea_(zone), card);
  return zone;
};


/**
 * @param {!yugi.model.Card} card The card to set.
 * @return {number} The zone in which the card now resides.
 */
yugi.game.model.field.Field.prototype.setSpellTrapCard = function(card) {
  var zone = this.getAvailableIndex_(this.spellTrapZone_);
  this.setCard(this.getSpellTrapArea_(zone), card);
  return zone;
};


/**
 * Removes the card from the monster zone and returns it.
 * @param {number} zone The zero-relative index into the monster zone array.
 * @return {yugi.model.Card} The card in the zone or null if there wasn't one.
 */
yugi.game.model.field.Field.prototype.removeMonsterCard = function(zone) {
  return this.setCard(this.getMonsterArea_(zone), null);
};


/**
 * Removes the card from the spell/trap zone and returns it.
 * @param {number} zone The zero-relative index into the spell/trap zone array.
 * @return {yugi.model.Card} The card in the zone or null if there wasn't one.
 */
yugi.game.model.field.Field.prototype.removeSpellTrapCard = function(zone) {
  return this.setCard(this.getSpellTrapArea_(zone), null);
};


/**
 * Removes all the cards from the field.
 */
yugi.game.model.field.Field.prototype.removeAll = function() {
  goog.array.forEach(
      yugi.game.model.field.Field.ZONES_.getValues(),
      function(area) {
        this.setCard(area, null);
      }, this);
};


/**
 * Searches through everything the field has and removes the card. Events are
 * dispatched as expected.
 * @param {!yugi.model.Card} cardToRemove The card to remove.
 * @return {boolean} True if the card was removed or not.
 */
yugi.game.model.field.Field.prototype.removeCard = function(cardToRemove) {

  // Find the area for the card.
  var areaWithCard = null;
  var found = goog.array.some(
      yugi.game.model.field.Field.ZONES_.getValues(),
      function(area) {
        var card = this.getCard(area);
        if (card && card.equals(cardToRemove)) {
          areaWithCard = area;
          return true; // Breaks the loop early.
        }
        return false;
      }, this);

  // If the card was found, remove it.
  if (found && areaWithCard) {
    this.setCard(areaWithCard, null);
    return true;
  }

  // The card was not found.
  return false;
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

  return fieldData;
};


/**
 * Sets this state based on the given data.
 * @param {!yugi.game.data.FieldData} fieldData The data.
 * @param {!yugi.model.CardCache} cardCache The cache of cards.
 */
yugi.game.model.field.Field.prototype.setFromData = function(
    fieldData, cardCache) {

  // Reset the data.
  this.monsterZone_ = new Array(5);
  this.spellTrapZone_ = new Array(5);
  this.fieldCard_ = null;

  // Gather all the card data into one bundle.
  var cardDataArr = goog.array.concat(
      fieldData.getMonsters(),
      fieldData.getSpellTraps(),
      fieldData.getFieldCardData());

  // Set all the cards from the card data.
  goog.array.forEach(cardDataArr, function(cardData) {
    if (cardData) {
      var card = cardCache.get(cardData.getKey());
      cardData.syncToCard(card);
      this.setCard_(card.getLocation().getArea(), card, true);
    }
  }, this);

  // Dispatch all the change events to bring listeners in sync.
  this.dispatchEvent(
      yugi.game.model.field.Field.EventType.MONSTERS_CHANGED);
  this.dispatchEvent(
      yugi.game.model.field.Field.EventType.SPELLS_TRAPS_CHANGED);
  this.dispatchEvent(
      yugi.game.model.field.Field.EventType.FIELD_CARD_CHANGED);
};


/**
 * Sets the card for the given zone.  Errors are thrown if the area is invalid
 * or the zone is not empty.
 * @param {!yugi.model.Area} area The area to set.
 * @param {yugi.model.Card} card The card to set.
 * @param {boolean=} opt_suppressEvent True if the event should be suppressed.
 * @return {yugi.model.Card} The card that used to be in the area, if any.
 * @private
 */
yugi.game.model.field.Field.prototype.setCard_ = function(
    area, card, opt_suppressEvent) {

  // Set the new location.
  if (card) {
    card.getLocation().setIndex(0); // Always zero until card attachments.
    card.getLocation().setArea(area);
    this.logger.info('Setting ' + card.getName() + ' on ' + area);
  }

  var suppressEvent = !!opt_suppressEvent;
  var event;
  var oldCard = null;

  if (yugi.model.Area.MONSTER_ZONES.contains(area)) {

    // Change a monster area.
    var i = yugi.model.Area.getZoneIndex(area);
    oldCard = this.monsterZone_[i];
    this.monsterZone_[i] = card;
    event = yugi.game.model.field.Field.EventType.MONSTERS_CHANGED;

  } else if (yugi.model.Area.SPELL_TRAP_ZONES.contains(area)) {

    // Change a spell/trap area.
    var i = yugi.model.Area.getZoneIndex(area);
    oldCard = this.spellTrapZone_[i];
    this.spellTrapZone_[yugi.model.Area.getZoneIndex(area)] = card;
    event = yugi.game.model.field.Field.EventType.SPELLS_TRAPS_CHANGED;

  } else if (yugi.model.Area.PLAYER_FIELD == area ||
             yugi.model.Area.OPP_FIELD == area) {

    // Change the field area.
    oldCard = this.fieldCard_;
    this.fieldCard_ = /** @type {!yugi.model.SpellCard} */ (card);
    event = yugi.game.model.field.Field.EventType.FIELD_CARD_CHANGED;

  } else {
    throw Error('Area ' + area + ' is not a zone.');
  }

  if (!suppressEvent) {
    this.dispatchEvent(event);
  }

  return oldCard;
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
