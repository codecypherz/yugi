/**
 * Defines the valid card areas.
 */

goog.provide('yugi.model.Area');

goog.require('goog.array');
goog.require('goog.structs.Set');
goog.require('yugi');


/**
 * The areas where a card could be.
 * @enum {string}
 */
yugi.model.Area = {
  OPP_BANISH: yugi.uniqueId('opp-banish'),
  OPP_DECK: yugi.uniqueId('opp-deck'),
  OPP_EXTRA_DECK: yugi.uniqueId('opp-extra-deck'),
  OPP_FIELD: yugi.uniqueId('opp-field'),
  OPP_GRAVEYARD: yugi.uniqueId('opp-graveyard'),
  OPP_HAND: yugi.uniqueId('opp-hand'),
  OPP_MONSTER_1: yugi.uniqueId('opp-monster-1'),
  OPP_MONSTER_2: yugi.uniqueId('opp-monster-2'),
  OPP_MONSTER_3: yugi.uniqueId('opp-monster-3'),
  OPP_MONSTER_4: yugi.uniqueId('opp-monster-4'),
  OPP_MONSTER_5: yugi.uniqueId('opp-monster-5'),
  OPP_SPELL_TRAP_1: yugi.uniqueId('opp-spell-trap-1'),
  OPP_SPELL_TRAP_2: yugi.uniqueId('opp-spell-trap-2'),
  OPP_SPELL_TRAP_3: yugi.uniqueId('opp-spell-trap-3'),
  OPP_SPELL_TRAP_4: yugi.uniqueId('opp-spell-trap-4'),
  OPP_SPELL_TRAP_5: yugi.uniqueId('opp-spell-trap-5'),
  PLAYER_BANISH: yugi.uniqueId('player-banish'),
  PLAYER_DECK: yugi.uniqueId('player-deck'),
  PLAYER_EXTRA_DECK: yugi.uniqueId('player-extra-deck'),
  PLAYER_FIELD: yugi.uniqueId('player-field'),
  PLAYER_GRAVEYARD: yugi.uniqueId('player-graveyard'),
  PLAYER_HAND: yugi.uniqueId('player-hand'),
  PLAYER_MONSTER_1: yugi.uniqueId('player-monster-1'),
  PLAYER_MONSTER_2: yugi.uniqueId('player-monster-2'),
  PLAYER_MONSTER_3: yugi.uniqueId('player-monster-3'),
  PLAYER_MONSTER_4: yugi.uniqueId('player-monster-4'),
  PLAYER_MONSTER_5: yugi.uniqueId('player-monster-5'),
  PLAYER_SPELL_TRAP_1: yugi.uniqueId('player-spell-trap-1'),
  PLAYER_SPELL_TRAP_2: yugi.uniqueId('player-spell-trap-2'),
  PLAYER_SPELL_TRAP_3: yugi.uniqueId('player-spell-trap-3'),
  PLAYER_SPELL_TRAP_4: yugi.uniqueId('player-spell-trap-4'),
  PLAYER_SPELL_TRAP_5: yugi.uniqueId('player-spell-trap-5'),
  UNSPECIFIED: yugi.uniqueId('unspecified')
};


/**
 * The set of areas that are player monster zones.
 * @type {!goog.structs.Set}
 * @const
 */
yugi.model.Area.PLAYER_MONSTER_ZONES = new goog.structs.Set([
  yugi.model.Area.PLAYER_MONSTER_1,
  yugi.model.Area.PLAYER_MONSTER_2,
  yugi.model.Area.PLAYER_MONSTER_3,
  yugi.model.Area.PLAYER_MONSTER_4,
  yugi.model.Area.PLAYER_MONSTER_5
]);


/**
 * The set of areas that are opponent monster zones.
 * @type {!goog.structs.Set}
 * @const
 */
yugi.model.Area.OPP_MONSTER_ZONES = new goog.structs.Set([
  yugi.model.Area.OPP_MONSTER_1,
  yugi.model.Area.OPP_MONSTER_2,
  yugi.model.Area.OPP_MONSTER_3,
  yugi.model.Area.OPP_MONSTER_4,
  yugi.model.Area.OPP_MONSTER_5
]);


/**
 * The set of areas that are monster zones.
 * @type {!goog.structs.Set}
 * @const
 */
yugi.model.Area.MONSTER_ZONES = new goog.structs.Set(goog.array.flatten(
    yugi.model.Area.PLAYER_MONSTER_ZONES.getValues(),
    yugi.model.Area.OPP_MONSTER_ZONES.getValues()));


/**
 * The set of areas that are player spell/trap zones.
 * @type {!goog.structs.Set}
 * @const
 */
yugi.model.Area.PLAYER_SPELL_TRAP_ZONES = new goog.structs.Set([
  yugi.model.Area.PLAYER_SPELL_TRAP_1,
  yugi.model.Area.PLAYER_SPELL_TRAP_2,
  yugi.model.Area.PLAYER_SPELL_TRAP_3,
  yugi.model.Area.PLAYER_SPELL_TRAP_4,
  yugi.model.Area.PLAYER_SPELL_TRAP_5
]);


/**
 * The set of areas that are opponent spell/trap zones.
 * @type {!goog.structs.Set}
 * @const
 */
yugi.model.Area.OPP_SPELL_TRAP_ZONES = new goog.structs.Set([
  yugi.model.Area.OPP_SPELL_TRAP_1,
  yugi.model.Area.OPP_SPELL_TRAP_2,
  yugi.model.Area.OPP_SPELL_TRAP_3,
  yugi.model.Area.OPP_SPELL_TRAP_4,
  yugi.model.Area.OPP_SPELL_TRAP_5
]);


/**
 * The set of areas that are spell/trap zones.
 * @type {!goog.structs.Set}
 * @const
 */
yugi.model.Area.SPELL_TRAP_ZONES = new goog.structs.Set(goog.array.flatten(
    yugi.model.Area.PLAYER_SPELL_TRAP_ZONES.getValues(),
    yugi.model.Area.OPP_SPELL_TRAP_ZONES.getValues()));


/**
 * Figures out the zone index for the given area.  An exception is thrown if an
 * invalid area is given.
 * @param {!yugi.model.Area} area The area to translate.
 * @return {number} The zero-relative zone index.
 */
yugi.model.Area.getZoneIndex = function(area) {
  switch (area) {
    case yugi.model.Area.PLAYER_MONSTER_1:
    case yugi.model.Area.PLAYER_SPELL_TRAP_1:
    case yugi.model.Area.OPP_MONSTER_1:
    case yugi.model.Area.OPP_SPELL_TRAP_1:
      return 0;
    case yugi.model.Area.PLAYER_MONSTER_2:
    case yugi.model.Area.PLAYER_SPELL_TRAP_2:
    case yugi.model.Area.OPP_MONSTER_2:
    case yugi.model.Area.OPP_SPELL_TRAP_2:
      return 1;
    case yugi.model.Area.PLAYER_MONSTER_3:
    case yugi.model.Area.PLAYER_SPELL_TRAP_3:
    case yugi.model.Area.OPP_MONSTER_3:
    case yugi.model.Area.OPP_SPELL_TRAP_3:
      return 2;
    case yugi.model.Area.PLAYER_MONSTER_4:
    case yugi.model.Area.PLAYER_SPELL_TRAP_4:
    case yugi.model.Area.OPP_MONSTER_4:
    case yugi.model.Area.OPP_SPELL_TRAP_4:
      return 3;
    case yugi.model.Area.PLAYER_MONSTER_5:
    case yugi.model.Area.PLAYER_SPELL_TRAP_5:
    case yugi.model.Area.OPP_MONSTER_5:
    case yugi.model.Area.OPP_SPELL_TRAP_5:
      return 4;
    default:
      throw Error('Invalid area attempted to convert to a zone index.');
  }
};
