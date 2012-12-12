/**
 * Action for browsing a list of cards.
 */

goog.provide('yugi.game.action.Browse');

goog.require('yugi.game.model.Browser');
goog.require('yugi.game.ui.State');
goog.require('yugi.model.Action');



/**
 * Action for browsing a list of cards.
 * @param {!yugi.game.model.Browser.Type} type The type of browser.
 * @param {!yugi.model.CardList} cardList The card list to browse.
 * @param {!function(!yugi.model.Card)} createActionsFn The function that is
 *     called for each card that is rendered.  It must return an array of
 *     actions that can be taken for the card.
 * @param {boolean} opponent True if it is the opponent, false otherwise.
 * @param {function(): void=} opt_onFinish The callback for when finished.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.Browse =
    function(type, cardList, createActionsFn, opponent, opt_onFinish) {
  goog.base(this, 'Browse');

  /**
   * @type {!yugi.game.model.Browser.Type}
   * @private
   */
  this.type_ = type;

  /**
   * @type {!yugi.model.CardList}
   * @private
   */
  this.cardList_ = cardList;

  /**
   * @type {!function(!yugi.model.Card)}
   * @private
   */
  this.createActionsFn_ = createActionsFn;

  /**
   * @type {boolean}
   * @private
   */
  this.isOpponent_ = opponent;

  /**
   * The function called when browsing is finished.
   * @type {!function(): void}
   * @private
   */
  this.onFinish_ = opt_onFinish || function() { };

  /**
   * @type {!yugi.game.model.Browser}
   * @private
   */
  this.browser_ = yugi.game.model.Browser.get();

  /**
   * @type {!yugi.game.ui.State}
   * @private
   */
  this.uiState_ = yugi.game.ui.State.get();
};
goog.inherits(yugi.game.action.Browse, yugi.model.Action);


/** @override */
yugi.game.action.Browse.prototype.fire = function() {

  // Set up the browser model.
  this.browser_.update(this.cardList_, this.createActionsFn_, this.type_,
      this.isOpponent_, this.onFinish_);

  // Flip the UI state to show the card browser.
  this.uiState_.setMode(yugi.game.ui.State.Mode.BROWSING);
};
