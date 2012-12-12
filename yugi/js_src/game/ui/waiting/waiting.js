/**
 * This is the UI for waiting for another player to join.
 */

goog.provide('yugi.game.ui.waiting.Waiting');

goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.Config');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.ui.waiting.soy');
goog.require('yugi.service.url');



/**
 * This is the UI for waiting for another player to join.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.waiting.Waiting = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = yugi.game.model.Game.get();
};
goog.inherits(yugi.game.ui.waiting.Waiting, goog.ui.Component);


/**
 * The CSS classes used by this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.waiting.Waiting.Css_ = {
  ROOT: goog.getCssName('yugi-waiting')
};


/** @override */
yugi.game.ui.waiting.Waiting.prototype.createDom = function() {

  // Build the URL for joining the game through the landing page.  This is
  // needed so the user wanting to join will properly get prompted for their
  // player name and go through the normal flow.  The intent is for this to
  // merely prevent the opponent from having to first find the game on the
  // landing page.
  var joinLink = yugi.service.url.buildAbsolute(
      yugi.Config.ServletPath.LANDING,
      yugi.Config.UrlParameter.GAME_KEY, this.game_.getKey());

  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.waiting.soy.HTML, {
        joinLink: joinLink
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.game.ui.waiting.Waiting.Css_.ROOT);
};
