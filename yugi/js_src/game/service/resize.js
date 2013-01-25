/**
 * Service for updating various things when the window is resized.
 */

goog.provide('yugi.game.service.Resize');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.cssom');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.math.Size');
goog.require('goog.string');
goog.require('goog.style');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.State');



/**
 * Service for updating various things when the window is resized.
 * @param {!yugi.game.ui.State} uiState The state of the game UI.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.game.service.Resize = function(uiState) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.service.Resize');

  /**
   * @type {!yugi.game.ui.State}
   * @private
   */
  this.uiState_ = uiState;

  /**
   * @type {!goog.dom.ViewportSizeMonitor}
   * @private
   */
  this.viewportSizeMonitor_ = new goog.dom.ViewportSizeMonitor();
  this.registerDisposable(this.viewportSizeMonitor_);

  /**
   * @type {number}
   * @private
   */
  this.lastCardSizeWidth_ = 0;

  /**
   * The current size of the card.
   * @type {!goog.math.Size}
   * @private
   */
  this.cardSize_ = new goog.math.Size(0, 0);

  var handler = new goog.events.EventHandler(this);
  this.registerDisposable(handler);

  handler.listen(this.viewportSizeMonitor_,
      goog.events.EventType.RESIZE,
      this.resize_);
  handler.listen(this.uiState_,
      yugi.game.ui.State.EventType.MODE_CHANGED,
      this.delayResize_);

  // Initialize.
  this.delayResize_();
};
goog.inherits(yugi.game.service.Resize, goog.events.EventTarget);


/**
 * Events dispatched by this service.
 * @enum {string}
 */
yugi.game.service.Resize.EventType = {
  RESIZED: goog.events.getUniqueId('resized')
};


/**
 * The width of a card as the percentage of the field.
 * @type {number}
 * @const
 * @private
 */
yugi.game.service.Resize.CARD_WIDTH_ = 7.5;


/**
 * The ratio used to calculate the height of the card based on the width.  Put
 * another way, the width should be 70% of the height.
 * @type {number}
 * @const
 * @private
 */
yugi.game.service.Resize.CARD_SIZE_RATIO_ = 0.7;


/**
 * @type {!yugi.game.service.Resize}
 * @private
 */
yugi.game.service.Resize.instance_;


/**
 * Registers the resize service.
 * @param {!yugi.game.ui.State} uiState The state of the game UI.
 * @return {!yugi.game.service.Resize} The registered instance.
 */
yugi.game.service.Resize.register = function(uiState) {
  yugi.game.service.Resize.instance_ = new yugi.game.service.Resize(uiState);
  return yugi.game.service.Resize.get();
};


/**
 * @return {!yugi.game.service.Resize} The service.
 */
yugi.game.service.Resize.get = function() {
  return yugi.game.service.Resize.instance_;
};


/**
 * @return {!goog.math.Size} The current size of a card.
 */
yugi.game.service.Resize.prototype.getCardSize = function() {
  return this.cardSize_;
};


/**
 * Delays the resize so that it takes place after the rest of the current thread
 * of JavaScript has executed.
 * @private
 */
yugi.game.service.Resize.prototype.delayResize_ = function() {
  goog.Timer.callOnce(this.resize_, 0, this);
};


/**
 * Resizes card elements to have the appropriate height.
 * @private
 */
yugi.game.service.Resize.prototype.resize_ = function() {

  // Don't do anything unless the field is being displayed.
  if (this.uiState_.getMode() != yugi.game.ui.State.Mode.FIELD) {
    return;
  }

  // Grab the first card size element.
  var rootElement = goog.dom.getDocument().body;
  var cardSizeElement = goog.dom.getElementByClass(
      yugi.game.ui.Css.CARD_SIZE, rootElement);
  if (!cardSizeElement) {
    this.logger.severe('No card size element found to compute height');
    return; // No card size element yet.
  }

  // Use the first card size element as the element by which to compute the
  // height of all card size elements.
  var cardSize = goog.style.getSize(cardSizeElement);
  if (this.lastCardSizeWidth_ == cardSize.width) {
    this.logger.fine('Card size width did not change: ' + cardSize.width);
    return; // Be efficient and do nothing if nothing changed.
  }
  this.logger.fine('Card size width changed to ' + cardSize + ' pixels');
  this.lastCardSizeWidth_ = cardSize.width;

  // Make sure to round the new height otherwise the actual card images will
  // sometimes show a gap between the card zone border.
  var newHeight = Math.round(
      cardSize.width / yugi.game.service.Resize.CARD_SIZE_RATIO_);
  this.logger.fine(
      'Calculated new card size height to be ' + newHeight + 'px.');
  this.cardSize_ = new goog.math.Size(cardSize.width, newHeight);

  // TODO Move this to the hand class and listen to the resize event.
  // Adjust the height of the hand containers to match the new card size.
  var handContainers = goog.dom.getElementsByClass(
      goog.getCssName('yugi-hand-container'), rootElement);
  goog.array.forEach(handContainers, function(handContainer) {
    if (goog.dom.classes.has(handContainer, goog.getCssName('opponent'))) {
      var halfHeight = Math.round(newHeight * 0.5);
      handContainer.style.height = halfHeight + 'px';
      handContainer.firstChild.style.marginTop = (-1 * (halfHeight + 8)) + 'px';
    } else {
      var height = Math.round(newHeight * 0.8);
      handContainer.style.height = height + 'px';
    }
  });

  // TODO There is a bug in this code.  A resize loop will occur if the height
  // of the window is very close to triggering a vertical scrollbar.  The
  // scenario is something like this.
  //
  // 1. Resize the window to be a little wider.
  // 2. The resize event fires, changing the height of the card to be taller.
  // 3. The vertical scrollbar appears since the height increased.
  // 4. The resize event fires, changing the height of the card to be smaller
  //    since there is now less horizontal space due to the scrollbar.
  // 5. The vertical scrollbard disappears since the height decreased.
  // 6. Go to step 2.  Infinite loop!

  // The rest of the code here replaces the actual height portion of the
  // card size class.  This was done instead of modifying the elements
  // themselves because cards added after a resize would be missed which would
  // complicate the implementation.
  this.changeCardSizeStyle_(newHeight);

  this.dispatchEvent(yugi.game.service.Resize.EventType.RESIZED);
};


/**
 * Changes the card size style to use the given height.
 * @param {number} newHeight The new card height.
 * @private
 */
yugi.game.service.Resize.prototype.changeCardSizeStyle_ = function(newHeight) {
  var styleSheet = goog.dom.getDocument().styleSheets[0];
  var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(styleSheet);
  if (!cssRuleList) {
    this.logger.severe('Failed to get the CSS rule list');
    return;
  }

  var index = -1;
  var cardSizeRule = goog.array.find(cssRuleList, function(cssRule, i) {
    var found = goog.string.caseInsensitiveCompare(
        cssRule.selectorText, '.' + yugi.game.ui.Css.CARD_SIZE) == 0;
    if (found) {
      index = i;
    }
    return found;
  });
  if (!cardSizeRule) {
    this.logger.severe('Failed to find the card size rule');
  }

  goog.cssom.removeCssRule(styleSheet, index);
  goog.cssom.addCssRule(
      styleSheet,
      '.' + yugi.game.ui.Css.CARD_SIZE + ' { ' +
      // Keep the width the same.
      'width: ' + yugi.game.service.Resize.CARD_WIDTH_ + '%; ' +
      // Only the height changes as a function of the width.
      'height: ' + newHeight + 'px; ' +
      '} ',
      index);
  this.logger.fine('Finished changing the card size CSS');
};
