/**
 * The card editor.
 */

goog.provide('yugi.admin.card.ui.Editor');

goog.require('goog.Uri');
goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('goog.ui.Component');
goog.require('yugi.Config');
goog.require('yugi.admin.card.model.Loader');
goog.require('yugi.admin.card.ui.MonsterSection');
goog.require('yugi.admin.card.ui.SpellSection');
goog.require('yugi.admin.card.ui.TrapSection');
goog.require('yugi.admin.card.ui.soy');
goog.require('yugi.admin.ui.util');
goog.require('yugi.model.Card');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.SpellCard');
goog.require('yugi.model.TrapCard');



/**
 * The card editor.
 * @param {string} uploadUrl The upload URL for the card image.  This is created
 *     server-side by the blobstore service.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.admin.card.ui.Editor = function(uploadUrl) {
  goog.base(this);

  /**
   * This will be set as the form action in order to upload images.  This is
   * created server-side by the blobstore service.
   * @type {string}
   * @private
   */
  this.uploadUrl_ = uploadUrl;

  /**
   * Loads cards from the server.
   * @type {!yugi.admin.card.model.Loader}
   * @private
   */
  this.loader_ = yugi.admin.card.model.Loader.get();

  /**
   * @type {!yugi.model.Notifier}
   * @private
   */
  this.notifier_ = yugi.model.Notifier.get();

  /**
   * The input field for the card type.
   * @type {!goog.ui.ComboBox}
   * @private
   */
  this.cardTypeCombo_ = new goog.ui.ComboBox();
  this.cardTypeCombo_.setUseDropdownArrow(true);
  this.cardTypeCombo_.setFieldName('type');

  goog.object.forEach(yugi.model.Card.Type, function(value, key, object) {
    this.cardTypeCombo_.addItem(new goog.ui.ComboBoxItem(value));
  }, this);

  /**
   * The section for monster card information.
   * @type {!yugi.admin.card.ui.MonsterSection}
   * @private
   */
  this.monsterSection_ = new yugi.admin.card.ui.MonsterSection();

  /**
   * The section for spell card information.
   * @type {!yugi.admin.card.ui.SpellSection}
   * @private
   */
  this.spellSection_ = new yugi.admin.card.ui.SpellSection();

  /**
   * The section for trap card information.
   * @type {!yugi.admin.card.ui.TrapSection}
   * @private
   */
  this.trapSection_ = new yugi.admin.card.ui.TrapSection();

  /**
   * The save button.
   * @type {!goog.ui.Button}
   * @private
   */
  this.saveButton_ = new goog.ui.Button(null);

  /**
   * The cancel button.
   * @type {!goog.ui.Button}
   * @private
   */
  this.cancelButton_ = new goog.ui.Button(null);

  /**
   * The delete button.
   * @type {!goog.ui.Button}
   * @private
   */
  this.deleteButton_ = new goog.ui.Button(null);

  this.addChild(this.cardTypeCombo_);
  this.addChild(this.monsterSection_);
  this.addChild(this.spellSection_);
  this.addChild(this.trapSection_);
  this.addChild(this.saveButton_);
  this.addChild(this.cancelButton_);
  this.addChild(this.deleteButton_);
};
goog.inherits(yugi.admin.card.ui.Editor, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.admin.card.ui.Editor.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.admin.card.ui.Editor');


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.hiddenKeyInput_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.imageDiv_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.imageInput_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.nameLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.nameInput_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.nameCheckDiv_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.descriptionLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.descriptionInput_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.cardTypeLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.cardTypeDiv_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.Editor.prototype.form_;


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.admin.card.ui.Editor.Id_ = {
  CANCEL_BUTTON: 'cancel-button',
  CARD_TYPE_DIV: 'card-type-div',
  CARD_TYPE_LABEL: 'card-type-label',
  DELETE_BUTTON: 'delete-button',
  DESCRIPTION_INPUT: 'description-input',
  DESCRIPTION_LABEL: 'description-label',
  FIELDS_SECTION: 'fields-section',
  FORM: 'form',
  HIDDEN_KEY_INPUT: 'hidden-key-input',
  IMAGE_DIV: 'image-div',
  IMAGE_INPUT: 'image-input',
  NAME_CHECK_DIV: 'name-check-div',
  NAME_INPUT: 'name-input',
  NAME_LABEL: 'name-label',
  SAVE_BUTTON: 'save-button'
};


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.admin.card.ui.Editor.Css_ = {
  DOES_NOT_EXIST: goog.getCssName('yugi-card-does-not-exist'),
  EXISTS: goog.getCssName('yugi-card-exists')
};


/** @override */
yugi.admin.card.ui.Editor.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.admin.card.ui.soy.EDITOR, {
        formAction: this.uploadUrl_,
        ids: this.makeIds(yugi.admin.card.ui.Editor.Id_)
      }));
};


/** @override */
yugi.admin.card.ui.Editor.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Grab a reference to elements of interest.
  this.hiddenKeyInput_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.HIDDEN_KEY_INPUT);

  this.imageDiv_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.IMAGE_DIV);
  this.imageInput_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.IMAGE_INPUT);

  this.nameLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.NAME_LABEL);
  this.nameInput_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.NAME_INPUT);
  this.nameCheckDiv_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.NAME_CHECK_DIV);

  this.descriptionLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.DESCRIPTION_LABEL);
  this.descriptionInput_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.DESCRIPTION_INPUT);

  this.cardTypeLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.CARD_TYPE_LABEL);
  this.cardTypeDiv_ = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.CARD_TYPE_DIV);

  this.form_ = this.getElementByFragment(yugi.admin.card.ui.Editor.Id_.FORM);

  var fieldsSection = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.FIELDS_SECTION);
  var saveButton = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.SAVE_BUTTON);
  var cancelButton = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.CANCEL_BUTTON);
  var deleteButton = this.getElementByFragment(
      yugi.admin.card.ui.Editor.Id_.DELETE_BUTTON);

  // Store the card key in the hidden input field.
  this.hiddenKeyInput_.value = this.loader_.getCardKey();

  // Render the card type combo.
  this.cardTypeCombo_.render(this.cardTypeDiv_);

  // Render all the sub sections.
  this.monsterSection_.render(fieldsSection);
  this.spellSection_.render(fieldsSection);
  this.trapSection_.render(fieldsSection);

  // Trigger a card type change to load the subsection correctly.
  this.onCardTypeChange_();

  // Decorate some buttons.
  if (!this.saveButton_.wasDecorated()) {
    this.saveButton_.decorate(saveButton);
  }
  if (!this.cancelButton_.wasDecorated()) {
    this.cancelButton_.decorate(cancelButton);
  }
  if (!this.deleteButton_.wasDecorated()) {
    this.deleteButton_.decorate(deleteButton);
  }

  // Attach listeners.
  this.getHandler().listen(this.nameInput_,
      goog.events.EventType.BLUR,
      this.onNameInputBlur_);
  this.getHandler().listen(this.cardTypeCombo_,
      goog.ui.Component.EventType.CHANGE,
      this.onCardTypeChange_);

  this.getHandler().listen(this.saveButton_,
      goog.ui.Component.EventType.ACTION,
      this.save_);
  this.getHandler().listen(this.cancelButton_,
      goog.ui.Component.EventType.ACTION,
      this.cancel_);
  this.getHandler().listen(this.deleteButton_,
      goog.ui.Component.EventType.ACTION,
      this.delete_);

  this.getHandler().listen(this.loader_,
      yugi.admin.card.model.Loader.EventType.LOAD_ERROR,
      this.onLoadError_);
  this.getHandler().listen(this.loader_,
      yugi.admin.card.model.Loader.EventType.LOADED,
      this.onLoad_);
  this.getHandler().listen(this.loader_,
      yugi.admin.card.model.Loader.EventType.EXISTS,
      this.onCardExists_);
  this.getHandler().listen(this.loader_,
      yugi.admin.card.model.Loader.EventType.DOES_NOT_EXIST,
      this.onCardDoesNotExist_);
  this.getHandler().listen(this.loader_,
      yugi.admin.card.model.Loader.EventType.CARD_EXISTS_ERROR,
      this.onCardExistsError_);

  // Give focus to an input field.
  this.nameInput_.focus();

  // Load the card if one was specified.
  this.loader_.load();
};


/**
 * Called when the card type changes.  The appropriate card detail section is
 * now shown.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.onCardTypeChange_ = function() {

  // Clear all the sections.
  this.monsterSection_.setFieldsToDefault();
  this.spellSection_.setFieldsToDefault();
  this.trapSection_.setFieldsToDefault();

  // Show the correct section depending on the card type value.
  var cardType = this.cardTypeCombo_.getValue();

  goog.style.showElement(this.monsterSection_.getElement(),
      cardType == yugi.model.Card.Type.MONSTER);
  goog.style.showElement(this.spellSection_.getElement(),
      cardType == yugi.model.Card.Type.SPELL);
  goog.style.showElement(this.trapSection_.getElement(),
      cardType == yugi.model.Card.Type.TRAP);
};


/**
 * Saves the card.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.save_ = function() {

  // Use the card key presence to determine if in edit mode.
  var cardKey = this.loader_.getCardKey();

  // Clear all validation.
  yugi.admin.ui.util.markInvalid(this.imageDiv_, false);
  yugi.admin.ui.util.markInvalid(this.nameLabel_, false);
  yugi.admin.ui.util.markInvalid(this.descriptionLabel_, false);
  yugi.admin.ui.util.markInvalid(this.cardTypeLabel_, false);

  // Validate the image (only if a new card).
  if (!cardKey && goog.string.isEmptySafe(this.imageInput_.value)) {
    yugi.admin.ui.util.markInvalid(this.imageDiv_, true);
    this.imageInput_.focus();
    return;
  }

  // Validate the name.
  var name = goog.string.trim(this.nameInput_.value);
  if (goog.string.isEmptySafe(name)) {
    yugi.admin.ui.util.markInvalid(this.nameLabel_, true);
    this.nameInput_.focus();
    return;
  }

  // Validate the description.
  var description = goog.string.trim(this.descriptionInput_.value);
  if (goog.string.isEmptySafe(description)) {
    yugi.admin.ui.util.markInvalid(this.descriptionLabel_, true);
    this.descriptionInput_.focus();
    return;
  }

  // Validate the card type.
  var cardTypeString = this.cardTypeCombo_.getValue();
  var cardType = null;
  var cardTypeFound = goog.object.findValue(yugi.model.Card.Type,
      function(value, key, obj) {
        cardType = value;
        return goog.string.caseInsensitiveCompare(cardTypeString, value) == 0;
      });
  if (!cardTypeFound) {
    yugi.admin.ui.util.markInvalid(this.cardTypeLabel_, true);
    this.cardTypeDiv_.focus();
    return;
  }

  // Validate the section.
  var section = this.monsterSection_;
  if (cardType == yugi.model.Card.Type.SPELL) {
    section = this.spellSection_;
  } else if (cardType == yugi.model.Card.Type.TRAP) {
    section = this.trapSection_;
  }
  section.clearValidation();
  var sectionValid = section.validate();
  if (!sectionValid) {
    this.logger.info('The subsection was not valid.');
    return;
  }

  // Now save the card.
  this.logger.info('Saving card information.');
  this.form_.submit();
};


/**
 * Cancels the saving of the card.  Takes you back to the search screen.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.cancel_ = function() {
  window.location.reload();
};


/**
 * Deletes the given card.  Just refreshes the page if nothing has been saved.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.delete_ = function() {
  // Confirm the delete.
  if (!confirm('Please make sure this card is not being used in a deck ' +
      'somewhere.\n\nDelete this card?')) {
    return;
  }

  var cardKey = this.loader_.getCardKey();
  if (cardKey) {
    // Ask the server to delete.
    var uri = new goog.Uri();
    uri.setPath(yugi.Config.ServletPath.ADMIN_CARD_DELETE);
    uri.setParameterValue(yugi.Config.UrlParameter.CARD_KEY, cardKey);
    window.location.href = uri.toString();
  } else {
    // No card key, so just cancel.
    this.cancel_();
  }
};


/**
 * Called when there is an error loading the card.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.onLoadError_ = function() {
  alert('Failed to load the card.');
};


/**
 * Called when the card successfully loads from the server.
 * @param {!yugi.admin.card.model.Loader.LoadedEvent} e The load event.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.onLoad_ = function(e) {
  var card = e.card;

  this.nameInput_.value = card.getName();
  this.descriptionInput_.value = card.getDescription();
  this.imageDiv_.innerHTML =
      '<img src="' + card.getImageSource(443) + '"></img>';

  var cardType = yugi.model.Card.Type.MONSTER;
  var section = this.monsterSection_;

  if (card instanceof yugi.model.SpellCard) {
    cardType = yugi.model.Card.Type.SPELL;
    section = this.spellSection_;
  } else if (card instanceof yugi.model.TrapCard) {
    cardType = yugi.model.Card.Type.TRAP;
    section = this.trapSection_;
  }

  this.cardTypeCombo_.setValue(cardType);
  section.setFieldsFromCard(card);
};


/**
 * Called when the name input field loses focus.  The card name is checked with
 * the server to see if it already exists.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.onNameInputBlur_ = function() {
  var name = goog.string.trim(this.nameInput_.value);

  // Don't do a name check if there is no name entered.
  if (goog.string.isEmptySafe(name)) {
    return;
  }

  // Don't do a name check if the original name is the same.  This is true when
  // a card has been loaded by key, but the user hasn't changed anything.
  if (goog.string.caseInsensitiveCompare(name,
      this.loader_.getOriginalName()) == 0) {
    return;
  }

  // It's either a new card or the name was edited on an existing card.
  goog.dom.classes.enable(this.nameCheckDiv_,
      yugi.admin.card.ui.Editor.Css_.EXISTS, false);
  goog.dom.classes.enable(this.nameCheckDiv_,
      yugi.admin.card.ui.Editor.Css_.DOES_NOT_EXIST, false);
  this.nameCheckDiv_.innerHTML = 'Checking...';
  this.loader_.checkCardExists(name);
};


/**
 * Called when it is known that the card exists.
 * @param {!yugi.admin.card.model.Loader.ExistsEvent} e The exists event.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.onCardExists_ = function(e) {

  // Create the edit URL for the existing card.
  var card = e.card;
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.ADMIN_CARD);
  uri.setParameterValue(yugi.Config.UrlParameter.CARD_KEY, card.getKey());
  if (yugi.Config.isDevMode()) {
    uri.setParameterValue(yugi.Config.UrlParameter.MODE, yugi.Config.Mode.DEV);
  }

  // Say that it exists and make a link to edit the card.
  goog.dom.classes.enable(this.nameCheckDiv_,
      yugi.admin.card.ui.Editor.Css_.EXISTS, true);
  goog.dom.classes.enable(this.nameCheckDiv_,
      yugi.admin.card.ui.Editor.Css_.DOES_NOT_EXIST, false);
  this.nameCheckDiv_.innerHTML = '<a href="' + uri.toString() +
      '" title="' + card.getName() + ' already exists.  Click to edit."' +
      '>Exists</a>';
};


/**
 * Called when it is known that the card does not yet exist.
 * @param {!yugi.admin.card.model.Loader.DoesNotExistEvent} e The event.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.onCardDoesNotExist_ = function(e) {
  goog.dom.classes.enable(this.nameCheckDiv_,
      yugi.admin.card.ui.Editor.Css_.EXISTS, false);
  goog.dom.classes.enable(this.nameCheckDiv_,
      yugi.admin.card.ui.Editor.Css_.DOES_NOT_EXIST, true);
  this.nameCheckDiv_.innerHTML = 'Valid';
};


/**
 * Called when the card check fails.  The user is notified.
 * @private
 */
yugi.admin.card.ui.Editor.prototype.onCardExistsError_ = function() {
  this.notifier_.post('Failed to lookup card.', true);
};
