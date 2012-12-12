/**
 * A UI component that allows you to browse an arbitrary set of cards.
 */

goog.provide('yugi.ui.browser.CardBrowser');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.browser.soy');
goog.require('yugi.ui.menu.Menu');



/**
 * A UI component that allows you to browse an arbitrary set of cards.
 * @param {function(!yugi.model.Card)=} opt_createActionsFn The function that is
 *     called for each card that is rendered.  It must return an array of
 *     actions that can be taken for the card.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.ui.browser.CardBrowser = function(opt_createActionsFn) {
  goog.base(this);

  /**
   * The function that will create actions for cards in the card list.
   * @type {!function(!yugi.model.Card)}
   * @private
   */
  this.createActionsFn_ = opt_createActionsFn || function() { };

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

  /**
   * @type {!Array.<!yugi.ui.menu.Menu>}
   * @private
   */
  this.menus_ = new Array();

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.cardHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.cardHandler_);
};
goog.inherits(yugi.ui.browser.CardBrowser, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.ui.browser.CardBrowser.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.ui.browser.CardBrowser');


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.ui.browser.CardBrowser.Css_ = {
  CARD_BROWSER: goog.getCssName('yugi-card-browser')
};


/** @override */
yugi.ui.browser.CardBrowser.prototype.createDom = function() {
  goog.base(this, 'createDom');
  goog.dom.classes.add(this.getElement(),
      yugi.ui.browser.CardBrowser.Css_.CARD_BROWSER);
};


/**
 * @param {!function(!yugi.model.Card)} fn The create actions function.
 */
yugi.ui.browser.CardBrowser.prototype.setCreateActionsFn = function(fn) {
  this.createActionsFn_ = fn;
};


/**
 * Renders all the given cards so they can be browsed.
 * @param {!Array.<!yugi.model.Card>} cards The cards to browse.
 */
yugi.ui.browser.CardBrowser.prototype.browse = function(cards) {
  if (!this.isInDocument()) {
    this.logger.warning('Tried to browse some cards while not in the DOM.');
    return;
  }

  // Reset the browser.
  var element = this.getElement();
  this.cardHandler_.removeAll();
  element.innerHTML = '';
  goog.array.forEach(this.menus_, function(menu) {
    goog.dispose(menu);
  });
  this.menus_ = new Array();

  goog.array.forEach(cards, function(card) {

    // Render the card.
    var cardElement = goog.soy.renderAsElement(yugi.ui.browser.soy.CARD, {
      imageSource: card.getImageSource(128)
    });
    goog.dom.appendChild(element, cardElement);

    // Attach menu actions to the card.
    var actions = this.createActionsFn_(card);
    if (actions && actions.length > 0) {
      var menu = new yugi.ui.menu.Menu(this.createActionsFn_(card));
      menu.render(cardElement);
      this.menus_.push(menu);
    }

    // Listen for card selection.
    this.cardHandler_.listen(cardElement,
        goog.events.EventType.CLICK,
        goog.bind(this.selection_.setSelected, this.selection_,
            card, cardElement));

  }, this);
};
