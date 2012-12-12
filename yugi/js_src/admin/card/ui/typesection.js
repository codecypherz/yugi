/**
 * The sub section of the card editor for a specific card type.
 */

goog.provide('yugi.admin.card.ui.TypeSection');



/**
 * @interface
 */
yugi.admin.card.ui.TypeSection = function() { };


/**
 * Sets the fields to the default state.
 */
yugi.admin.card.ui.TypeSection.prototype.setFieldsToDefault;


/**
 * Clears all validation.
 */
yugi.admin.card.ui.TypeSection.prototype.clearValidation;


/**
 * Validates this section.
 * @return {boolean} True if the section is valid, false otherwise.
 */
yugi.admin.card.ui.TypeSection.prototype.validate;


/**
 * @param {!yugi.model.Card} card The card from which to set the fields.
 */
yugi.admin.card.ui.TypeSection.prototype.setFieldsFromCard;
