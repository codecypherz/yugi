/**
 * The section for the fields of a spell card.
 */

goog.provide('yugi.admin.card.ui.SpellSection');

goog.require('goog.object');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('goog.ui.Component');
goog.require('yugi.admin.card.ui.TypeSection');
goog.require('yugi.admin.card.ui.soy');
goog.require('yugi.admin.ui.util');
goog.require('yugi.model.SpellCard');



/**
 * The section for the fields of a spell card.
 * @constructor
 * @extends {goog.ui.Component}
 * @implements {yugi.admin.card.ui.TypeSection}
 */
yugi.admin.card.ui.SpellSection = function() {
  goog.base(this);

  /**
   * The input field for the spell type.
   * @type {!goog.ui.ComboBox}
   * @private
   */
  this.spellTypeCombo_ = new goog.ui.ComboBox();
  this.spellTypeCombo_.setUseDropdownArrow(true);
  this.spellTypeCombo_.setFieldName('spell_type');

  goog.object.forEach(yugi.model.SpellCard.Type, function(value, key, object) {
    this.spellTypeCombo_.addItem(new goog.ui.ComboBoxItem(value));
  }, this);

  this.addChild(this.spellTypeCombo_);
};
goog.inherits(yugi.admin.card.ui.SpellSection, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.SpellSection.prototype.spellTypeLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.SpellSection.prototype.spellTypeDiv_;


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.admin.card.ui.SpellSection.Id_ = {
  SPELL_TYPE_DIV: 'spell-type-div',
  SPELL_TYPE_LABEL: 'spell-type-label'
};


/** @override */
yugi.admin.card.ui.SpellSection.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.admin.card.ui.soy.SPELL_SECTION, {
        ids: this.makeIds(yugi.admin.card.ui.SpellSection.Id_)
      }));
};


/** @override */
yugi.admin.card.ui.SpellSection.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.spellTypeLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.SpellSection.Id_.SPELL_TYPE_LABEL);
  this.spellTypeDiv_ = this.getElementByFragment(
      yugi.admin.card.ui.SpellSection.Id_.SPELL_TYPE_DIV);

  this.spellTypeCombo_.render(this.spellTypeDiv_);
};


/** @override */
yugi.admin.card.ui.SpellSection.prototype.setFieldsToDefault = function() {
  this.spellTypeCombo_.setValue(yugi.model.SpellCard.Type.NORMAL);
};


/** @override */
yugi.admin.card.ui.SpellSection.prototype.clearValidation = function() {
  yugi.admin.ui.util.markInvalid(this.spellTypeLabel_, false);
};


/** @override */
yugi.admin.card.ui.SpellSection.prototype.validate = function() {
  var spellType = this.getSpellType_();
  if (!spellType) {
    yugi.admin.ui.util.markInvalid(this.spellTypeLabel_, true);
    this.spellTypeDiv_.focus();
    return false;
  }
  return true;
};


/**
 * Attempts to match the text in the combo box to a valid type.
 * @return {?yugi.model.SpellCard.Type} The matching type, if found.
 * @private
 */
yugi.admin.card.ui.SpellSection.prototype.getSpellType_ = function() {
  var spellTypeString = this.spellTypeCombo_.getValue();
  var spellType = null;
  var spellTypeFound = goog.object.findValue(yugi.model.SpellCard.Type,
      function(value, key, obj) {
        spellType = value;
        return goog.string.caseInsensitiveCompare(spellTypeString, value) == 0;
      });
  return spellTypeFound ? spellType : null;
};


/** @override */
yugi.admin.card.ui.SpellSection.prototype.setFieldsFromCard = function(card) {
  var spellCard = /** {!yugi.model.SpellCard} */ (card);

  this.spellTypeCombo_.setValue(spellCard.getSpellType());
};
