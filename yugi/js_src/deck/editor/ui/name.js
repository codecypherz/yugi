/**
 * The UI for editing a deck name.
 */

goog.provide('yugi.deck.editor.ui.Name');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('yugi.deck.editor.model.Constructor');
goog.require('yugi.deck.editor.ui.NameDialog');
goog.require('yugi.model.Deck');



/**
 * The UI for editing a deck name.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.deck.editor.ui.Name = function() {
  goog.base(this);

  /**
   * @type {!yugi.deck.editor.model.Constructor}
   * @private
   */
  this.constructor_ = yugi.deck.editor.model.Constructor.get();

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.deckHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.deckHandler_);

  /**
   * @type {!yugi.deck.editor.ui.NameDialog}
   * @private
   */
  this.nameDialog_ = new yugi.deck.editor.ui.NameDialog();
  this.addChild(this.nameDialog_);
};
goog.inherits(yugi.deck.editor.ui.Name, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.deck.editor.ui.Name.prototype.nameElement_ = null;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.ui.Name.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.deck.editor.ui.Name');


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.Name.Css_ = {
  ROOT: goog.getCssName('yugi-deck-name')
};


/** @override */
yugi.deck.editor.ui.Name.prototype.createDom = function() {
  this.setElementInternal(goog.dom.createDom(goog.dom.TagName.DIV,
      yugi.deck.editor.ui.Name.Css_.ROOT));
};


/** @override */
yugi.deck.editor.ui.Name.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.nameElement_ = this.getElement();

  this.getHandler().listen(this.nameElement_,
      goog.events.EventType.CLICK,
      this.onNameClick_);

  // Listen for when the deck changes so the deck listener can be updated.
  this.getHandler().listen(this.constructor_,
      yugi.deck.editor.model.Constructor.EventType.DECK_CHANGED,
      this.onDeckChanged_);

  // Sync up the UI with the current deck.
  this.onDeckChanged_();
};


/**
 * Removes listeners to the previous deck and attaches new listeners to the new
 * deck.
 * @private
 */
yugi.deck.editor.ui.Name.prototype.onDeckChanged_ = function() {
  this.deckHandler_.removeAll();

  // Listen for when the name changes on the new deck.
  this.deckHandler_.listen(this.constructor_.getDeck(),
      yugi.model.Deck.EventType.NAME_CHANGED,
      this.onNameChanged_);

  // Synchronize the UI with the new name value.
  this.onNameChanged_();
};


/**
 * Updates the UI to reflect the current name value of the deck.
 * @private
 */
yugi.deck.editor.ui.Name.prototype.onNameChanged_ = function() {
  this.nameElement_.innerHTML = this.constructor_.getDeck().getName();
};


/**
 * Opens up the deck name dialog.
 * @private
 */
yugi.deck.editor.ui.Name.prototype.onNameClick_ = function() {
  this.logger.info('Opening the deck name dialog.');
  this.nameDialog_.show(this.constructor_.getDeck().getName());
};
