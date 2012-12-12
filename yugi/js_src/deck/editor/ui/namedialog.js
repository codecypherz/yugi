/**
 * This UI prompts the user to start a new game.
 */

goog.provide('yugi.deck.editor.ui.NameDialog');

goog.require('goog.debug.Logger');
goog.require('goog.string');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.LabelInput');
goog.require('yugi.deck.editor.model.Constructor');
goog.require('yugi.deck.editor.ui.soy');



/**
 * Prompts the user for the information to start a new game.
 * @constructor
 * @extends {goog.ui.Dialog}
 */
yugi.deck.editor.ui.NameDialog = function() {
  goog.base(this);

  this.setTitle('Set Deck Name');
  this.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());

  /**
   * @type {!yugi.deck.editor.model.Constructor}
   * @private
   */
  this.constructor_ = yugi.deck.editor.model.Constructor.get();

  /**
   * @type {!goog.ui.LabelInput}
   * @private
   */
  this.nameInput_ = new goog.ui.LabelInput(
      yugi.deck.editor.ui.NameDialog.DEFAULT_DECK_NAME_);
  this.addChild(this.nameInput_);
};
goog.inherits(yugi.deck.editor.ui.NameDialog, goog.ui.Dialog);


/**
 * The default deck name.
 * @type {string}
 * @const
 * @private
 */
yugi.deck.editor.ui.NameDialog.DEFAULT_DECK_NAME_ = 'Untitled Deck';


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.editor.ui.NameDialog.prototype.logger =
    goog.debug.Logger.getLogger('yugi.deck.editor.ui.NameDialog');


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.deck.editor.ui.NameDialog.Id_ = {
  NAME_INPUT: 'name-input'
};


/** @override */
yugi.deck.editor.ui.NameDialog.prototype.createDom = function() {
  goog.base(this, 'createDom');

  this.setContent(yugi.deck.editor.ui.soy.NAME_DIALOG({
    ids: this.makeIds(yugi.deck.editor.ui.NameDialog.Id_)
  }));
};


/** @override */
yugi.deck.editor.ui.NameDialog.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Decorate the components.
  if (!this.nameInput_.wasDecorated()) {
    this.nameInput_.decorate(this.getElementByFragment(
        yugi.deck.editor.ui.NameDialog.Id_.NAME_INPUT));
  }

  // Initialize the dialog.
  this.nameInput_.reset();

  // Listen for when to set the name.
  this.getHandler().listen(this,
      goog.ui.Dialog.EventType.SELECT,
      this.onSelect_);
};


/**
 * Shows the dialog with the given name.
 * @param {string} name The name to start with.
 */
yugi.deck.editor.ui.NameDialog.prototype.show = function(name) {
  this.setVisible(true);
  this.nameInput_.setValue(name);
  this.nameInput_.focusAndSelect();
};


/**
 * Called when a button on the dialog is pressed.
 * @param {!goog.ui.Dialog.Event} e The event.
 * @private
 */
yugi.deck.editor.ui.NameDialog.prototype.onSelect_ = function(e) {
  if (e.key == goog.ui.Dialog.DefaultButtonKeys.OK) {
    this.setName_();
  }
};


/**
 * Sets the name of the deck to what the user entered.
 * @private
 */
yugi.deck.editor.ui.NameDialog.prototype.setName_ = function() {
  var input = goog.string.trim(this.nameInput_.getValue());
  var name = yugi.deck.editor.ui.NameDialog.DEFAULT_DECK_NAME_;
  if (input) {
    name = input;
  }
  this.logger.info('Setting the deck name to this: ' + name);
  this.constructor_.setName(name);
};
