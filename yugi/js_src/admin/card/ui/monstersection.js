/**
 * The section for the fields of a monster card.
 */

goog.provide('yugi.admin.card.ui.MonsterSection');

goog.require('goog.object');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('goog.ui.Component');
goog.require('yugi.admin.card.ui.TypeSection');
goog.require('yugi.admin.card.ui.soy');
goog.require('yugi.admin.ui.util');
goog.require('yugi.model.MonsterCard');



/**
 * The section for the fields of a monster card.
 * @constructor
 * @extends {goog.ui.Component}
 * @implements {yugi.admin.card.ui.TypeSection}
 */
yugi.admin.card.ui.MonsterSection = function() {
  goog.base(this);

  /**
   * The input field for the monster attribute.
   * @type {!goog.ui.ComboBox}
   * @private
   */
  this.attributeCombo_ = new goog.ui.ComboBox();
  this.attributeCombo_.setUseDropdownArrow(true);
  this.attributeCombo_.setFieldName('monster_attribute');

  /**
   * The input field for the monster type.
   * @type {!goog.ui.ComboBox}
   * @private
   */
  this.monsterTypeCombo_ = new goog.ui.ComboBox();
  this.monsterTypeCombo_.setUseDropdownArrow(true);
  this.monsterTypeCombo_.setFieldName('monster_type');

  /**
   * The input field for the extra monster type.
   * @type {!goog.ui.ComboBox}
   * @private
   */
  this.extraMonsterTypeCombo_ = new goog.ui.ComboBox();
  this.extraMonsterTypeCombo_.setUseDropdownArrow(true);
  this.extraMonsterTypeCombo_.setFieldName('monster_extra_type');

  // Populate the combo boxes.
  goog.object.forEach(yugi.model.MonsterCard.Attribute,
      function(value, key, object) {
        this.attributeCombo_.addItem(new goog.ui.ComboBoxItem(value));
      }, this);
  goog.object.forEach(yugi.model.MonsterCard.Type,
      function(value, key, object) {
        this.monsterTypeCombo_.addItem(new goog.ui.ComboBoxItem(value));
      }, this);
  goog.object.forEach(yugi.model.MonsterCard.ExtraType,
      function(value, key, object) {
        this.extraMonsterTypeCombo_.addItem(new goog.ui.ComboBoxItem(value));
      }, this);

  this.addChild(this.attributeCombo_);
  this.addChild(this.monsterTypeCombo_);
  this.addChild(this.extraMonsterTypeCombo_);
};
goog.inherits(yugi.admin.card.ui.MonsterSection, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.attributeLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.attributeDiv_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.monsterTypeLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.monsterTypeDiv_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.monsterExtraTypeLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.monsterExtraTypeDiv_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.levelLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.levelInput_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.attackLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.attackInput_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.defenseLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.defenseInput_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.effectLabel_;


/**
 * @type {Element}
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.effectCheckbox_;


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.admin.card.ui.MonsterSection.Id_ = {
  MONSTER_ATTRIBUTE_DIV: 'monster-attribute-div',
  MONSTER_ATTRIBUTE_LABEL: 'monster-attribute-label',
  MONSTER_EXTRA_TYPE_DIV: 'monster-extra-type-div',
  MONSTER_EXTRA_TYPE_LABEL: 'monster-extra-type-label',
  MONSTER_ATTACK_INPUT: 'monster-attack-input',
  MONSTER_ATTACK_LABEL: 'monster-attack-label',
  MONSTER_DEFENSE_INPUT: 'monster-defense-input',
  MONSTER_DEFENSE_LABEL: 'monster-defense-label',
  MONSTER_EFFECT_CHECKBOX: 'monster-effect-checkbox',
  MONSTER_EFFECT_LABEL: 'monster-effect-label',
  MONSTER_LEVEL_INPUT: 'monster-level-input',
  MONSTER_LEVEL_LABEL: 'monster-level-label',
  MONSTER_TYPE_DIV: 'monster-type-div',
  MONSTER_TYPE_LABEL: 'monster-type-label'
};


/** @override */
yugi.admin.card.ui.MonsterSection.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.admin.card.ui.soy.MONSTER_SECTION, {
        ids: this.makeIds(yugi.admin.card.ui.MonsterSection.Id_)
      }));
};


/** @override */
yugi.admin.card.ui.MonsterSection.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.attributeLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_ATTRIBUTE_LABEL);
  this.attributeDiv_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_ATTRIBUTE_DIV);

  this.monsterTypeLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_TYPE_LABEL);
  this.monsterTypeDiv_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_TYPE_DIV);

  this.monsterExtraTypeLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_EXTRA_TYPE_LABEL);
  this.monsterExtraTypeDiv_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_EXTRA_TYPE_DIV);

  this.levelLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_LEVEL_LABEL);
  this.levelInput_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_LEVEL_INPUT);

  this.effectLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_EFFECT_LABEL);
  this.effectCheckbox_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_EFFECT_CHECKBOX);

  this.attackLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_ATTACK_LABEL);
  this.attackInput_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_ATTACK_INPUT);

  this.defenseLabel_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_DEFENSE_LABEL);
  this.defenseInput_ = this.getElementByFragment(
      yugi.admin.card.ui.MonsterSection.Id_.MONSTER_DEFENSE_INPUT);

  this.attributeCombo_.render(this.attributeDiv_);
  this.monsterTypeCombo_.render(this.monsterTypeDiv_);
  this.extraMonsterTypeCombo_.render(this.monsterExtraTypeDiv_);
};


/** @override */
yugi.admin.card.ui.MonsterSection.prototype.setFieldsToDefault = function() {
  this.levelInput_.value = '';
  this.effectCheckbox_.checked = null;

  this.attributeCombo_.setValue('');
  this.monsterTypeCombo_.setValue('');
  this.extraMonsterTypeCombo_.setValue('');

  this.attackInput_.value = '';
  this.defenseInput_.value = '';
};


/** @override */
yugi.admin.card.ui.MonsterSection.prototype.clearValidation = function() {
  yugi.admin.ui.util.markInvalid(this.levelLabel_, false);
  yugi.admin.ui.util.markInvalid(this.effectLabel_, false);
  yugi.admin.ui.util.markInvalid(this.attributeLabel_, false);
  yugi.admin.ui.util.markInvalid(this.monsterTypeLabel_, false);
  yugi.admin.ui.util.markInvalid(this.monsterExtraTypeLabel_, false);
  yugi.admin.ui.util.markInvalid(this.attackLabel_, false);
  yugi.admin.ui.util.markInvalid(this.defenseLabel_, false);
};


/** @override */
yugi.admin.card.ui.MonsterSection.prototype.validate = function() {

  // Monster level.
  var level = this.getLevel_();
  if (!goog.isDefAndNotNull(level) || isNaN(level) || level < 1) {
    yugi.admin.ui.util.markInvalid(this.levelLabel_, true);
    this.levelInput_.focus();
    return false;
  }

  // No need to validate the monster effect checkbox.

  // Monster attribute.
  var attribute = this.getAttribute_();
  if (!attribute) {
    yugi.admin.ui.util.markInvalid(this.attributeLabel_, true);
    this.attributeDiv_.focus();
    return false;
  }

  // Monster type.
  var monsterType = this.getMonsterType_();
  if (!monsterType) {
    yugi.admin.ui.util.markInvalid(this.monsterTypeLabel_, true);
    this.monsterTypeDiv_.focus();
    return false;
  }

  // Monster extra type.  This field is not required.  If the user specified one
  // it must be in the enum, however.
  if (goog.string.trim(this.extraMonsterTypeCombo_.getValue())) {
    var monsterExtraType = this.getMonsterExtraType_();
    if (!monsterExtraType) {
      yugi.admin.ui.util.markInvalid(this.monsterExtraTypeLabel_, true);
      this.monsterExtraTypeDiv_.focus();
      return false;
    }
  }

  // Monster attack must be a valid number <= 0 unless it is '?'
  var attack = this.getAttack_();
  if (!goog.isDefAndNotNull(attack) || isNaN(attack) ||
      (attack < 0 && attack != yugi.model.MonsterCard.VARIABLE_NUMBER)) {
    yugi.admin.ui.util.markInvalid(this.attackLabel_, true);
    this.attackInput_.focus();
    return false;
  }

  // Monster defense must be a valid number <= 0 unless it is '?'
  var defense = this.getDefense_();
  if (!goog.isDefAndNotNull(defense) || isNaN(defense) ||
      (defense < 0 && defense != yugi.model.MonsterCard.VARIABLE_NUMBER)) {
    yugi.admin.ui.util.markInvalid(this.defenseLabel_, true);
    this.defenseInput_.focus();
    return false;
  }

  return true;
};


/**
 * Tries to get the level from the text input.
 * @return {?number} The monster level that was entered, null if empty or could
 *     not parse.
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.getLevel_ = function() {
  var levelString = goog.string.trim(this.levelInput_.value);
  var level = null;
  if (levelString && goog.string.isNumeric(levelString)) {
    level = parseInt(levelString, 10);
  }
  return level;
};


/**
 * Attempts to match the text in the combo box to a valid attribute.
 * @return {?yugi.model.MonsterCard.Attribute} The matching attribute, if found.
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.getAttribute_ = function() {
  var attributeString = this.attributeCombo_.getValue();
  var attribute = null;
  var attributeFound = goog.object.findValue(yugi.model.MonsterCard.Attribute,
      function(value, key, obj) {
        attribute = value;
        return goog.string.caseInsensitiveCompare(attributeString, value) == 0;
      });
  return attributeFound ? attribute : null;
};


/**
 * Attempts to match the text in the combo box to a valid type.
 * @return {?yugi.model.MonsterCard.Type} The matching type, if found.
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.getMonsterType_ = function() {
  var monsterTypeString = this.monsterTypeCombo_.getValue();
  var monsterType = null;
  var monsterTypeFound = goog.object.findValue(yugi.model.MonsterCard.Type,
      function(value, key, obj) {
        monsterType = value;
        return goog.string.caseInsensitiveCompare(monsterTypeString, value) ==
            0;
      });
  return monsterTypeFound ? monsterType : null;
};


/**
 * Attempts to match the text in the combo box to a valid extra type.
 * @return {?yugi.model.MonsterCard.ExtraType} The matching extra type, if
 *     found.
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.getMonsterExtraType_ = function() {
  var extraTypeString = this.extraMonsterTypeCombo_.getValue();
  var extraType = null;
  var extraTypeFound = goog.object.findValue(yugi.model.MonsterCard.ExtraType,
      function(value, key, obj) {
        extraType = value;
        return goog.string.caseInsensitiveCompare(extraTypeString, value) == 0;
      });
  return extraTypeFound ? extraType : null;
};


/**
 * Tries to get the attack from the text input.
 * @return {?number} The monster attack that was entered, null if empty or could
 *     not parse.
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.getAttack_ = function() {
  var attackString = goog.string.trim(this.attackInput_.value);
  return yugi.model.MonsterCard.attackOrDefenseFromString(attackString);
};


/**
 * Tries to get the defense from the text input.
 * @return {?number} The monster defense that was entered, null if empty or
 *     could not parse.
 * @private
 */
yugi.admin.card.ui.MonsterSection.prototype.getDefense_ = function() {
  var defenseString = goog.string.trim(this.defenseInput_.value);
  return yugi.model.MonsterCard.attackOrDefenseFromString(defenseString);
};


/** @override */
yugi.admin.card.ui.MonsterSection.prototype.setFieldsFromCard = function(card) {
  var monsterCard = /** {!yugi.model.MonsterCard} */ (card);

  this.attributeCombo_.setValue(monsterCard.getAttribute());
  this.monsterTypeCombo_.setValue(monsterCard.getMonsterType());

  // Extra type is optional.
  if (monsterCard.getExtraType()) {
    this.extraMonsterTypeCombo_.setValue(monsterCard.getExtraType());
  } else {
    this.extraMonsterTypeCombo_.setValue('');
  }

  this.levelInput_.value = monsterCard.getLevel() + '';
  this.effectCheckbox_.checked = monsterCard.isEffect() ? 'on' : null;

  this.attackInput_.value = monsterCard.getAttackAsString();
  this.defenseInput_.value = monsterCard.getDefenseAsString();
};
