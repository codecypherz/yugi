/**
 * Constants for the UI.
 */

goog.provide('yugi.game.ui');
goog.provide('yugi.game.ui.Css');


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
