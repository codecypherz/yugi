/**
 * Game UI methods and constants.
 */

goog.provide('yugi.game.ui');
goog.provide('yugi.game.ui.Css');
goog.provide('yugi.game.ui.ZIndex');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('yugi.model.Area');


/**
 * The maximum height of a card in pixels.
 * @type {number}
 * @const
 */
yugi.game.ui.MAX_CARD_HEIGHT = 200;


/**
 * Common CSS classes used throughout the application.
 * @enum {string}
 */
yugi.game.ui.Css = {
  CARD_SIZE: goog.getCssName('yugi-card-size'),
  MODE_SWAPPER_CONTAINER: goog.getCssName('yugi-mode-swapper-container'),
  OPPONENT: goog.getCssName('opponent')
};


/**
 * The set of z-indices used in the game.  This is kept in sync with the list in
 * game/ui/main.css.
 * @enum {number}
 */
yugi.game.ui.ZIndex = {
  CARD: 10,
  ATTACK_MASK: 200,
  ATTACK: 210,
  DRAG_ITEM: 250
};


/**
 * Gets the element for the given monster zone.
 * @param {number} zone The zone number.
 * @param {boolean=} opt_opponent True if it's the opponent's zone.
 * @return {Element} The monster zone element.
 */
yugi.game.ui.getMonsterZoneElement = function(zone, opt_opponent) {
  var id = yugi.game.ui.getMonsterArea(zone, opt_opponent);
  if (id) {
    return goog.dom.getElement(id);
  }
  return null;
};


/**
 * Gets the ID of the element for the given monster zone.
 * @param {number} zone The zone number.
 * @param {boolean=} opt_opponent True if it's the opponent's zone.
 * @return {yugi.model.Area} The monster zone ID.
 */
yugi.game.ui.getMonsterArea = function(zone, opt_opponent) {
  goog.asserts.assert(0 <= zone && zone <= 4);
  if (opt_opponent) {
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
  // Should never get here because of the assert above.
  throw Error('Invalide monster zone ID requets.');
};


/**
 * Gets the element for the given spell/trap zone.
 * @param {number} zone The zone number.
 * @param {boolean=} opt_opponent True if it's the opponent's zone.
 * @return {Element} The spell/trap zone element.
 */
yugi.game.ui.getSpellTrapZoneElement = function(zone, opt_opponent) {
  var id = yugi.game.ui.getSpellTrapZoneId(zone, opt_opponent);
  if (id) {
    return goog.dom.getElement(id);
  }
  return null;
};


/**
 * Gets the ID of the element for the given spell/trap zone.
 * @param {number} zone The zone number.
 * @param {boolean=} opt_opponent True if it's the opponent's zone.
 * @return {yugi.model.Area} The spell/trap zone ID.
 */
yugi.game.ui.getSpellTrapZoneId = function(zone, opt_opponent) {
  goog.asserts.assert(0 <= zone && zone <= 4);
  if (opt_opponent) {
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
  // Should never get here because of the assert above.
  throw Error('Invalide spell/trap zone ID requets.');
};
