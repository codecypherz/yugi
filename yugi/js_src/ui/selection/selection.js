/**
 * Renders information about something that is selected.
 */

goog.provide('yugi.ui.selection.Selection');

goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.model.Card');
goog.require('yugi.model.InformationCard');
goog.require('yugi.model.MonsterCard');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.Image');
goog.require('yugi.ui.selection.soy');



/**
 * Renders information about something that is selected.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.ui.selection.Selection = function() {
  goog.base(this);

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();
};
goog.inherits(yugi.ui.selection.Selection, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.ui.selection.Selection.prototype.image_;


/**
 * @type {Element}
 * @private
 */
yugi.ui.selection.Selection.prototype.detail_;


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.ui.selection.Selection.Id_ = {
  IMAGE: 'image',
  DETAIL: 'detail'
};


/**
 * CSS used within this component.
 * @enum {string}
 * @private
 */
yugi.ui.selection.Selection.Css_ = {
  SELECTION: goog.getCssName('yugi-selection')
};


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.ui.selection.Selection.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.ui.selection.Selection');


/** @override */
yugi.ui.selection.Selection.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.ui.selection.soy.SELECTION, {
        ids: this.makeIds(yugi.ui.selection.Selection.Id_)
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.ui.selection.Selection.Css_.SELECTION);
};


/** @override */
yugi.ui.selection.Selection.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.image_ = this.getElementByFragment(
      yugi.ui.selection.Selection.Id_.IMAGE);
  this.detail_ = this.getElementByFragment(
      yugi.ui.selection.Selection.Id_.DETAIL);

  this.getHandler().listen(this.selection_,
      yugi.model.Selection.EventType.SELECTED,
      this.onSelected_);
  this.getHandler().listen(this.selection_,
      yugi.model.Selection.EventType.DESELECTED,
      this.onDeselected_);

  this.displaySelected_(this.selection_.getSelected());
};


/**
 * Called when something gets selected.
 * @param {!yugi.model.Selection.SelectedEvent} e The selected event.
 * @private
 */
yugi.ui.selection.Selection.prototype.onSelected_ = function(e) {
  this.displaySelected_(e.selectable);
};


/**
 * Called when there is no selection.
 * @private
 */
yugi.ui.selection.Selection.prototype.onDeselected_ = function() {
  this.displaySelected_(null);
};


/**
 * Called when something gets selected.
 * @param {yugi.model.Selectable} selected The selected item to display.
 * @private
 */
yugi.ui.selection.Selection.prototype.displaySelected_ = function(selected) {
  if (!selected) {
    this.displayDefault_();
    return;
  }

  if (selected instanceof yugi.model.Card) {
    var card = /** @type {!yugi.model.Card} */ (selected);
    this.displayCard_(card);
  } else if (selected instanceof yugi.model.InformationCard) {
    var card = /** @type {!yugi.model.InformationCard} */ (selected);
    this.displayInformationCard_(card);
  }
};


/**
 * Displays the default unselected state.
 * @private
 */
yugi.ui.selection.Selection.prototype.displayDefault_ = function() {
  this.image_.src = yugi.ui.Image.CARD_BACK;
  this.detail_.innerHTML = '';
};


/**
 * Displays the given card.
 * @param {!yugi.model.Card} card The card to display.
 * @private
 */
yugi.ui.selection.Selection.prototype.displayCard_ = function(card) {
  this.logger.info('Displaying ' + card.getName());

  this.image_.src = card.getImageSource(321);

  if (card.getType() == yugi.model.Card.Type.MONSTER) {
    var monsterCard = /** @type {yugi.model.MonsterCard} */ (card);

    var levelLabel = 'Level';
    if (monsterCard.getExtraType() == yugi.model.MonsterCard.ExtraType.XYZ) {
      levelLabel = 'Rank';
    }

    this.detail_.innerHTML = yugi.ui.selection.soy.MONSTER_DESCRIPTION({
      name: monsterCard.getName(),
      description: monsterCard.getDescription(),
      levelLabel: levelLabel,
      level: monsterCard.getLevel(),
      attribute: monsterCard.getAttribute(),
      typeString: this.getMonsterTypeString_(monsterCard),
      attack: monsterCard.getAttackAsString(),
      defense: monsterCard.getDefenseAsString()
    });
  } else if (card.getType() == yugi.model.Card.Type.SPELL) {
    var spellCard = /** @type {yugi.model.SpellCard} */ (card);
    this.detail_.innerHTML = yugi.ui.selection.soy.SPELL_TRAP_DESCRIPTION({
      name: spellCard.getName(),
      spellTrapType: spellCard.getSpellType(),
      description: spellCard.getDescription()
    });
  } else {
    var trapCard = /** @type {yugi.model.TrapCard} */ (card);
    this.detail_.innerHTML = yugi.ui.selection.soy.SPELL_TRAP_DESCRIPTION({
      name: trapCard.getName(),
      spellTrapType: trapCard.getTrapType(),
      description: trapCard.getDescription()
    });
  }
};


/**
 * Figures out how to display the monster type info and returns it.
 * @param {!yugi.model.MonsterCard} card The monster card from which to extract
 *     type information.
 * @return {string} The monster type information.
 * @private
 */
yugi.ui.selection.Selection.prototype.getMonsterTypeString_ = function(card) {
  var typeString = card.getMonsterType();
  if (card.getExtraType()) {
    typeString += '/' + card.getExtraType();
  }
  if (card.isEffect()) {
    typeString += '/Effect';
  }
  return typeString;
};


/**
 * Displays an informational statement about the card.
 * @param {!yugi.model.InformationCard} card The information card.
 * @private
 */
yugi.ui.selection.Selection.prototype.displayInformationCard_ = function(card) {
  this.logger.info('Displaying information card.');
  this.image_.src = yugi.ui.Image.CARD_BACK;
  this.detail_.innerHTML = yugi.ui.selection.soy.INFO_CARD({
    info: card.getText()
  });
};
