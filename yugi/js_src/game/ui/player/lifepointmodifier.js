/**
 * A UI component that allows the modification of life points.
 */

goog.provide('yugi.game.ui.player.LifePointModifier');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.i18n.NumberFormat');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.game.service.LifePoint');



/**
 * A UI component that allows the modification of life points.
 * @param {!yugi.game.model.player.Player} player The player.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.player.LifePointModifier = function(player) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger(
      'yugi.game.ui.player.LifePointModifier');

  /**
   * @type {!yugi.game.model.player.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.game.service.LifePoint}
   * @private
   */
  this.lifePointService_ = yugi.game.service.LifePoint.get();

  /**
   * @type {!yugi.game.ui.player.LifePointModifier.Mode}
   * @private
   */
  this.mode_ = yugi.game.ui.player.LifePointModifier.Mode.ADD;

  /**
   * The set of values presented to the user.
   * @type {!Array.<number>}
   * @private
   */
  this.values_ = [
    100,
    200,
    500,
    1000
  ];

  /**
   * @type {!Array.<!goog.ui.Button>}
   * @private
   */
  this.modifyButtons_ = [];

  goog.array.forEach(this.values_, function(value) {
    var button = new goog.ui.Button(value + '');
    this.addChild(button);
    this.modifyButtons_.push(button);
  }, this);

  /**
   * @type {Element}
   * @private
   */
  this.inputModifier_ = null;

  /**
   * @type {HTMLInputElement}
   * @private
   */
  this.input_ = null;

  /**
   * @type {goog.events.KeyHandler}
   * @private
   */
  this.inputKeyHandler_ = null;

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.okButton_ = new goog.ui.Button('OK');
  this.addChild(this.okButton_);

  /**
   * @type {!goog.i18n.NumberFormat}
   * @private
   */
  this.numberFormatter_ = new goog.i18n.NumberFormat(
      goog.i18n.NumberFormat.Format.DECIMAL);

  /**
   * Keeps track of the last input value for each mode.
   * @type {!Object.<yugi.game.ui.player.LifePointModifier.Mode, number>}
   * @private
   */
  this.modeToLastInputValue_ = {};
};
goog.inherits(yugi.game.ui.player.LifePointModifier, goog.ui.Component);


/**
 * The various modes of the modifier.
 * @enum {string}
 */
yugi.game.ui.player.LifePointModifier.Mode = {
  ADD: 'add',
  SUBTRACT: 'subtract'
};


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.player.LifePointModifier.Css_ = {
  INPUT_SIGN: goog.getCssName('yugi-life-point-input-sign'),
  OK: goog.getCssName('yugi-life-point-input-ok'),
  ROOT: goog.getCssName('yugi-life-point-mod')
};


/**
 * Shows the life point modifier.
 * @param {!yugi.game.ui.player.LifePointModifier.Mode} mode The mode in which
 *     to show the modifier.
 */
yugi.game.ui.player.LifePointModifier.prototype.show = function(mode) {
  if (!this.isInDocument()) {
    return;
  }

  goog.dom.classes.enable(this.getElement(), this.mode_, false);
  this.mode_ = mode;
  goog.dom.classes.enable(this.getElement(), this.mode_, true);

  var modifierText = '';
  switch (this.mode_) {
    case yugi.game.ui.player.LifePointModifier.Mode.ADD:
      modifierText = '+ ';
      break;
    case yugi.game.ui.player.LifePointModifier.Mode.SUBTRACT:
      modifierText = '- ';
      break;
    default:
      break;
  }
  this.getDomHelper().setTextContent(this.inputModifier_, modifierText);

  for (var i = 0; i < this.values_.length; i++) {
    var value = this.values_[i];
    var button = this.modifyButtons_[i];
    button.setContent(modifierText + value);
  }

  goog.style.showElement(this.getElement(), true);

  var lastValue = this.modeToLastInputValue_[this.mode_] || 0;
  this.input_.value = lastValue ? String(lastValue) : '';
  this.input_.focus();
  this.input_.select();
};


/** @override */
yugi.game.ui.player.LifePointModifier.prototype.createDom = function() {
  var css = yugi.game.ui.player.LifePointModifier.Css_;
  var dom = this.getDomHelper();
  var element = dom.createDom(goog.dom.TagName.DIV, css.ROOT);
  element.tabIndex = 0; // Needed to make the modifier focusable.
  this.setElementInternal(element);

  // Render the modify buttons.
  goog.array.forEach(this.modifyButtons_, function(button) {
    button.render(element);
    button.getElement().tabIndex = 0;
  }, this);

  // Render the custom input.
  this.inputModifier_ = dom.createDom(goog.dom.TagName.DIV, css.INPUT_SIGN);
  element.appendChild(this.inputModifier_);
  this.input_ = /** @type {!HTMLInputElement} */ (
      dom.createDom(goog.dom.TagName.INPUT));
  element.appendChild(this.input_);
  this.okButton_.render(element);
  goog.dom.classes.add(this.okButton_.getElement(), css.OK);

  this.inputKeyHandler_ = new goog.events.KeyHandler(this.input_);
  this.registerDisposable(this.inputKeyHandler_);
};


/** @override */
yugi.game.ui.player.LifePointModifier.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.getElement(),
      goog.events.EventType.BLUR,
      this.onBlur_);
  this.getHandler().listen(this.input_,
      goog.events.EventType.BLUR,
      this.onBlur_);

  this.getHandler().listen(this.inputKeyHandler_,
      goog.events.KeyHandler.EventType.KEY,
      this.onInputKeyEvent_);

  // Listen to all the modifiers.
  goog.array.forEach(this.modifyButtons_, function(button) {
    this.getHandler().listen(button,
        goog.ui.Component.EventType.ACTION,
        this.onModifyButtonClicked_);
  }, this);

  this.getHandler().listen(this.okButton_,
      goog.ui.Component.EventType.ACTION,
      this.submitInput_);

  // Hide the modifier to begin with.
  this.hide_();
};


/**
 * Hides the life point modifier if the element is not a descendant of the root
 * element.
 * @private
 */
yugi.game.ui.player.LifePointModifier.prototype.onBlur_ = function() {
  // You have to use the timer here in order for active element to be set.
  goog.Timer.callOnce(function() {
    var dom = this.getDomHelper();
    if (!dom.contains(this.getElement(), dom.getActiveElement())) {
      this.hide_();
    }
  }, 0, this);
};


/**
 * Hides the life point modifier.
 * @private
 */
yugi.game.ui.player.LifePointModifier.prototype.hide_ = function() {
  goog.style.showElement(this.getElement(), false);
};


/**
 * Called when one of the modify buttons are clicked.
 * @param {!goog.events.Event} e The action event.
 * @private
 */
yugi.game.ui.player.LifePointModifier.prototype.onModifyButtonClicked_ =
    function(e) {
  var button = /** @type {!goog.ui.Button} */ (e.target);
  this.modify_(Number(button.getContent().substr(2)));
};


/**
 * Called when the input has a key event.
 * @param {!goog.events.KeyEvent} e The key event.
 * @private
 */
yugi.game.ui.player.LifePointModifier.prototype.onInputKeyEvent_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ENTER) {
    this.submitInput_();
  }
};


/**
 * Called when the OK button is clicked.
 * @private
 */
yugi.game.ui.player.LifePointModifier.prototype.submitInput_ = function() {
  var numberString = this.input_.value;
  var amount = NaN;
  try {
    amount = this.numberFormatter_.parse(numberString);
  } catch (e) {
    this.logger.warning('Failed to parse this as a number: ' + numberString);
    this.input_.focus();
    return;
  }
  if (isNaN(amount)) {
    this.logger.warning('Failed to parse this as a number: ' + numberString);
    this.input_.focus();
    return;
  }
  this.modify_(amount);
  this.modeToLastInputValue_[this.mode_] = amount;
};


/**
 * Modifies the players life points by the given amount according to the current
 * mode then hides the modifier.
 * @param {number} amount The amount by which to modify the life points.
 * @private
 */
yugi.game.ui.player.LifePointModifier.prototype.modify_ = function(amount) {

  var lifePoints = this.player_.getLifePoints();
  switch (this.mode_) {
    case yugi.game.ui.player.LifePointModifier.Mode.ADD:
      lifePoints += amount;
      break;
    case yugi.game.ui.player.LifePointModifier.Mode.SUBTRACT:
      lifePoints -= amount;
      break;
    default:
      break;
  }

  this.lifePointService_.updateLifePoints(lifePoints);
  this.hide_();
};
