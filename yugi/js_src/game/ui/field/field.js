/**
 * This UI for all the cards in play.
 */

goog.provide('yugi.game.ui.field.Field');

goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Field');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.ui.field.OpponentZone');
goog.require('yugi.game.ui.field.PlayerZone');
goog.require('yugi.game.ui.field.soy');
goog.require('yugi.model.Card');



/**
 * This UI for all the cards in play.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.field.Field = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = yugi.game.model.Game.get();

  /**
   * @type {!yugi.game.ui.field.OpponentZone}
   * @private
   */
  this.opponentZone_ = new yugi.game.ui.field.OpponentZone();
  this.addChild(this.opponentZone_);

  /**
   * @type {!yugi.game.ui.field.PlayerZone}
   * @private
   */
  this.playerZone_ = new yugi.game.ui.field.PlayerZone();
  this.addChild(this.playerZone_);

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.fieldCardHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.fieldCardHandler_);
};
goog.inherits(yugi.game.ui.field.Field, goog.ui.Component);


/**
 * The ID of the field element.
 * @type {string}
 * @const
 */
yugi.game.ui.field.Field.ID = 'field';


/**
 * The container for the field image.
 * @type {Element}
 * @private
 */
yugi.game.ui.field.Field.prototype.imageDiv_ = null;


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.field.Field.Id_ = {
  IMAGE_DIV: 'image-div',
  OPPONENT_ZONE: 'opponent-zone',
  PLAYER_ZONE: 'player-zone'
};


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.field.Field.Css_ = {
  ROOT: goog.getCssName('yugi-field')
};


/** @override */
yugi.game.ui.field.Field.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.field.soy.FIELD, {
        ids: this.makeIds(yugi.game.ui.field.Field.Id_)
      }));
  goog.dom.classes.add(this.getElement(), yugi.game.ui.field.Field.Css_.ROOT);
  this.getElement().id = yugi.game.ui.field.Field.ID;
};


/** @override */
yugi.game.ui.field.Field.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.imageDiv_ = this.getElementByFragment(
      yugi.game.ui.field.Field.Id_.IMAGE_DIV);

  this.opponentZone_.render(this.getElementByFragment(
      yugi.game.ui.field.Field.Id_.OPPONENT_ZONE));
  this.playerZone_.render(this.getElementByFragment(
      yugi.game.ui.field.Field.Id_.PLAYER_ZONE));

  this.getHandler().listen(this.game_.getPlayer().getField(),
      yugi.game.model.Field.EventType.FIELD_CARD_CHANGED,
      this.onFieldCardChanged_);
  this.getHandler().listen(this.game_.getOpponent().getField(),
      yugi.game.model.Field.EventType.FIELD_CARD_CHANGED,
      this.onFieldCardChanged_);
};


/**
 * Called when the field card changes.  The background image of the field
 * changes to reflect the active field card.
 * @private
 */
yugi.game.ui.field.Field.prototype.onFieldCardChanged_ = function() {

  // Clear the existing image.
  this.imageDiv_.innerHTML = '';
  this.fieldCardHandler_.removeAll();

  // Figure out which card to show.
  var card = this.game_.getPlayer().getField().getFieldCard();
  if (!card) {
    card = this.game_.getOpponent().getField().getFieldCard();
  }

  // If we have a card, listen for when if flips face up or face down.
  if (card) {
    this.fieldCardHandler_.listen(card,
        yugi.model.Card.EventType.POSITION_CHANGED,
        this.onFieldCardChanged_);

    // Render the image for the field card.
    if (card.isFaceUp()) {
      var dom = this.getDomHelper();
      var img = dom.createDom(goog.dom.TagName.IMG);
      img.src = card.getImageSource(1000, true);
      dom.append(this.imageDiv_, img);
    }
  }
};
