/**
 * This knows how to render a stack of cards.
 */

goog.provide('yugi.game.ui.field.Stack');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.game.ui');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.dragdrop.DragDrop');
goog.require('yugi.game.ui.field.soy');
goog.require('yugi.model.InformationCard');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.Image');
goog.require('yugi.ui.menu.Menu');



/**
 * This knows how to render a stack of cards.
 * @param {boolean} isFaceUp True if the stack of cards is face up or not.
 * @param {boolean} isOpponent True if this stack is the opponent's or not.
 * @param {string=} opt_infoText The information text for the face down stack.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.field.Stack = function(isFaceUp, isOpponent, opt_infoText) {
  goog.base(this);

  /**
   * @type {!Array.<!yugi.model.Action>}
   * @private
   */
  this.actions_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.isFaceUp_ = isFaceUp;

  /**
   * @type {boolean}
   * @private
   */
  this.isOpponent_ = isOpponent;

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

  /**
   * @type {!yugi.game.ui.dragdrop.DragDrop}
   * @private
   */
  this.dragDropService_ = yugi.game.ui.dragdrop.DragDrop.get();

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.clickHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.clickHandler_);

  /**
   * @type {!yugi.model.InformationCard}
   * @private
   */
  this.infoCard_ = new yugi.model.InformationCard(opt_infoText);
  this.registerDisposable(this.infoCard_);

  /**
   * @type {yugi.ui.menu.Menu}
   * @private
   */
  this.menu_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.imagesElement_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.labelElement_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.lastImage_ = null;
};
goog.inherits(yugi.game.ui.field.Stack, goog.ui.Component);


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.field.Stack.Id_ = {
  IMAGES: 'images',
  LABEL: 'label'
};


/**
 * CSS classes used in this widget.
 * @enum {string}
 * @private
 */
yugi.game.ui.field.Stack.Css_ = {
  CARD: goog.getCssName('yugi-card')
};


/** @override */
yugi.game.ui.field.Stack.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.field.soy.STACK, {
        ids: this.makeIds(yugi.game.ui.field.Stack.Id_),
        isOpponent: this.isOpponent_
      }));
};


/** @override */
yugi.game.ui.field.Stack.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.imagesElement_ = this.getElementByFragment(
      yugi.game.ui.field.Stack.Id_.IMAGES);
  goog.dom.classes.enable(this.imagesElement_, yugi.game.ui.Css.OPPONENT,
      this.isOpponent_);

  this.labelElement_ = this.getElementByFragment(
      yugi.game.ui.field.Stack.Id_.LABEL);
};


/**
 * @param {!Array.<!yugi.model.Action>} actions The actions that can be taken on
 *     the stack of cards.
 */
yugi.game.ui.field.Stack.prototype.setActions = function(actions) {
  this.actions_ = actions;
};


/**
 * @param {!Array.<!yugi.model.Card>} cards The cards that are in the stack.
 */
yugi.game.ui.field.Stack.prototype.setCards = function(cards) {

  // Clear the last rendering.
  if (this.lastImage_) {
    this.dragDropService_.removeSource(this.lastImage_);
  }
  this.imagesElement_.innerHTML = '';
  this.clickHandler_.removeAll();
  goog.dispose(this.menu_);

  // First determine if card images should be shown or if the "no cards"
  // div should be shown.
  var numCards = cards.length;

  goog.style.showElement(this.imagesElement_, numCards > 0);

  // If there are any cards, we want to render something.
  if (numCards > 0) {

    // This card's image will be rendered if the stack is face up.
    var cardOnTop = cards[0];

    // Figure out which image will be repeated.
    var imageSource = this.isFaceUp_ ?
        cardOnTop.getImageSource(yugi.game.ui.MAX_CARD_HEIGHT) :
        yugi.ui.Image.CARD_BACK;

    // Show fewer images than there are cards.
    var numImages = Math.ceil(numCards / 10);
    this.lastImage_ = null;
    for (var i = 0; i < numImages; i++) {

      // Create the image with the source.
      var image = goog.dom.createDom(
          goog.dom.TagName.IMG,
          [yugi.game.ui.field.Stack.Css_.CARD,
           yugi.game.ui.Css.CARD_SIZE]);
      image.src = imageSource;

      // Shift the image to create the stacked look.
      image.style.top = (i * -1) + 'px';
      image.style.left = i + 'px';

      // Add the image.
      goog.dom.appendChild(this.imagesElement_, image);
      this.lastImage_ = image;
    }

    if (!this.lastImage_) {
      throw new Error('There are cards in the stack, but no image.');
    }
    this.clickHandler_.listen(this.lastImage_,
        goog.events.EventType.CLICK,
        goog.bind(this.onImageClick_, this, this.lastImage_, cardOnTop));

    // Make the top item draggable.
    if (!this.isOpponent_) {
      this.dragDropService_.addSource(this.lastImage_, cardOnTop);
    }

    // Attach a menu if there are any actions.
    if (this.actions_.length > 0) {
      this.menu_ = new yugi.ui.menu.Menu(this.actions_);

      // Render the menu such that the icon sits properly on the last image.
      var offset = numImages - 1;
      this.menu_.renderWithOffset(this.imagesElement_,
          yugi.ui.menu.Menu.DEFAULT_RIGHT - offset,
          yugi.ui.menu.Menu.DEFAULT_TOP - offset);
    }
  }

  // Label the stack with the current count.
  this.labelElement_.innerHTML = this.getLabel() + ': ' + numCards;
};


/**
 * @return {string} The text for this stack.
 * @protected
 */
yugi.game.ui.field.Stack.prototype.getLabel = function() {
  return 'Label';
};


/**
 * Called when the top of the stack is clicked.
 * @param {Element} image The image that was clicked.
 * @param {!yugi.model.Card} card The card associated with the image.
 * @private
 */
yugi.game.ui.field.Stack.prototype.onImageClick_ = function(image, card) {
  if (this.isFaceUp_) {
    this.selection_.setSelected(card, image);
  } else {
    this.selection_.setSelected(this.infoCard_, image);
  }
};


/** @override */
yugi.game.ui.field.Stack.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.dispose(this.menu_);
};
