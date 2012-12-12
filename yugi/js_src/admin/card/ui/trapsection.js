/**
 * The section for the fields of a trap card.
 */

goog.provide('yugi.admin.card.ui.TrapSection');

goog.require('goog.object');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('goog.ui.Component');
goog.require('yugi.admin.card.ui.TypeSection');
goog.require('yugi.admin.card.ui.soy');
goog.require('yugi.admin.ui.util');
goog.require('yugi.model.TrapCard');



/**
 * The section for the fields of a trap card.
 * @constructor
 * @extends {goog.ui.Component}
 * @implements {yugi.admin.card.ui.TypeSection}
 */
yugi.admin.card.ui.TrapSection = function() {
  goog.base(this);

  /**
   * The input field for the trap type.
   * @type {!goog.ui.ComboBox}
   * @private
   */
  this.trapTypeCombo_ = new goog.ui.ComboBox();
  this.trapTypeCombo_.setUseDropdownArrow(true);
  this.trapTypeCombo_.setFieldName('trap_type');

  goog.object.forEach(yugi.model.TrapCard.Type, function(value, key, object) {
    this.trapTypeCombo_.addItem(new goog.ui.ComboBoxItem(value));
  }, this);

  this.addChild(this.trapTypeCombo_);
};
goog.inherits(yugi.admin.card.ui.TrapSection, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.TrapSection.prototype.trapTypeLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.TrapSection.prototype.trapTypeDiv_;


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.admin.card.ui.TrapSection.Id_ = {
  TRAP_TYPE_DIV: 'trap-type-div',
  TRAP_TYPE_LABEL: 'trap-type-label'
};


/** @override */
yugi.admin.card.ui.TrapSection.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.admin.card.ui.soy.TRAP_SECTION, {
        ids: this.makeIds(yugi.admin.card.ui.TrapSection.Id_)
      }));
};


/** @override */
yugi.admin.card.ui.TrapSection.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.trapTypeLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.TrapSection.Id_.TRAP_TYPE_LABEL);
  this.trapTypeDiv_ = this.getElementByFragment(
      yugi.admin.card.ui.TrapSection.Id_.TRAP_TYPE_DIV);

  this.trapTypeCombo_.render(this.trapTypeDiv_);
};


/** @override */
yugi.admin.card.ui.TrapSection.prototype.setFieldsToDefault = function() {
  this.trapTypeCombo_.setValue(yugi.model.TrapCard.Type.NORMAL);
};


/** @override */
yugi.admin.card.ui.TrapSection.prototype.clearValidation = function() {
  yugi.admin.ui.util.markInvalid(this.trapTypeLabel_, false);
};


/** @override */
yugi.admin.card.ui.TrapSection.prototype.validate = function() {
  var trapType = this.getTrapType_();
  if (!trapType) {
    yugi.admin.ui.util.markInvalid(this.trapTypeLabel_, true);
    this.trapTypeDiv_.focus();
    return false;
  }
  return true;
};


/**
 * Attempts to match the text in the combo box to a valid type.
 * @return {?yugi.model.TrapCard.Type} The matching type, if found.
 * @private
 */
yugi.admin.card.ui.TrapSection.prototype.getTrapType_ = function() {
  var trapTypeString = this.trapTypeCombo_.getValue();
  var trapType = null;
  var trapTypeFound = goog.object.findValue(yugi.model.TrapCard.Type,
      function(value, key, obj) {
        trapType = value;
        return goog.string.caseInsensitiveCompare(trapTypeString, value) == 0;
      });
  return trapTypeFound ? trapType : null;
};


/** @override */
yugi.admin.card.ui.TrapSection.prototype.setFieldsFromCard = function(card) {
  var trapCard = /** {!yugi.model.TrapCard} */ (card);

  this.trapTypeCombo_.setValue(trapCard.getTrapType());
};
