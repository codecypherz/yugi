/**
 * This is the UI for a monster card in play.
 */

goog.provide('yugi.game.ui.zone.Monster');

goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('yugi.game.action.CardTransfer');
goog.require('yugi.game.action.FieldToList');
goog.require('yugi.game.action.field.AddCounter');
goog.require('yugi.game.action.field.DeclareAttack');
goog.require('yugi.game.action.field.Position');
goog.require('yugi.game.message.CardTransfer');
goog.require('yugi.game.model.Attack');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.model.player.Field');
goog.require('yugi.game.ui');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.ZIndex');
goog.require('yugi.game.ui.attack.Sword');
goog.require('yugi.game.ui.counters.Counters');
goog.require('yugi.game.ui.dragdrop.DragDrop');
goog.require('yugi.model.Area');
goog.require('yugi.model.Card');
goog.require('yugi.model.InformationCard');
goog.require('yugi.model.Selection');
goog.require('yugi.model.util');
goog.require('yugi.ui.Image');
goog.require('yugi.ui.menu.Menu');



/**
 * This is the UI for a monster zone.
 * @param {!yugi.model.Area} area The area this zone is rendering.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.zone.Monster = function(area) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @protected
   */
  this.logger = goog.debug.Logger.getLogger('yugi.game.ui.zone.Monster');

  /**
   * @type {!yugi.model.Area}
   * @private
   */
  this.area_ = area;

  /**
   * @type {yugi.model.Card}
   * @private
   */
  this.card_ = null;

  /**
   * @type {yugi.ui.menu.Menu}
   * @private
   */
  this.menu_ = null;

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

  /**
   * @type {!yugi.game.model.Attack}
   * @private
   */
  this.attack_ = yugi.game.model.Attack.get();

  /**
   * @type {!yugi.game.ui.dragdrop.DragDrop}
   * @private
   */
  this.dragDropService_ = yugi.game.ui.dragdrop.DragDrop.get();

  /**
   * @type {!yugi.model.InformationCard}
   * @private
   */
  this.opponentCard_ = new yugi.model.InformationCard(
      'This is your opponent\'s monster card');

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.cardHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.cardHandler_);

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.imageHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.imageHandler_);

  /**
   * @type {yugi.game.ui.counters.Counters}
   * @private
   */
  this.counters_ = null;

  /**
   * @type {yugi.game.ui.attack.Sword}
   * @private
   */
  this.sword_ = null;

  // Figure out which player owns this area.
  var game = yugi.game.model.Game.get();
  var player;
  if (yugi.model.Area.PLAYER_MONSTER_ZONES.contains(area)) {
    player = game.getPlayer();
  } else {
    player = game.getOpponent();
  }

  /**
   * @type {!yugi.game.model.player.Player}
   * @private
   */
  this.player_ = player;
};
goog.inherits(yugi.game.ui.zone.Monster, goog.ui.Component);


/**
 * CSS classes used in this widget.
 * @enum {string}
 * @private
 */
yugi.game.ui.zone.Monster.Css_ = {
  ROOT: goog.getCssName('yugi-monster-zone'),
  ROTATED: goog.getCssName('yugi-monster-rotated')
};


/**
 * @return {!yugi.model.Area} The area of the monster zone.
 */
yugi.game.ui.zone.Monster.prototype.getArea = function() {
  return this.area_;
};


/** @override */
yugi.game.ui.zone.Monster.prototype.createDom = function() {
  goog.base(this, 'createDom');
  var el = this.getElement();
  goog.dom.classes.add(el, yugi.game.ui.zone.Monster.Css_.ROOT);
  goog.dom.classes.enable(el, yugi.game.ui.Css.OPPONENT,
      this.player_.isOpponent());

  // Further rendering happens later.
};


/** @override */
yugi.game.ui.zone.Monster.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Update the z-index when attack state changes.
  this.getHandler().listen(this.attack_,
      [yugi.game.model.Attack.EventType.CANCELED,
       yugi.game.model.Attack.EventType.CARD_DECLARED,
       yugi.game.model.Attack.EventType.DECLARATION_STARTED,
       yugi.game.model.Attack.EventType.PLAYER_DECLARED],
      this.updateImageZIndex_);

  this.getHandler().listen(this.player_.getField(),
      yugi.game.model.player.Field.EventType.MONSTERS_CHANGED,
      this.setUpCard_);

  this.setUpCard_();
};


/**
 * Sets the z-index of the image based on the state of an attack declaration.
 * @private
 */
yugi.game.ui.zone.Monster.prototype.updateImageZIndex_ = function() {
  var imageElement = this.getImageElement_();
  if (!imageElement) {
    return; // No card for this zone, so just return.
  }

  if (this.attack_.getState() == yugi.game.model.Attack.State.DECLARING &&
      (this.attack_.getDeclaringCard() == this.card_ ||
       this.player_.isOpponent())) {
    imageElement.style.zIndex = yugi.game.ui.ZIndex.ATTACK;
  } else {
    imageElement.style.zIndex = yugi.game.ui.ZIndex.CARD;
  }
};


/**
 * @return {Element} The monster image element.
 * @private
 */
yugi.game.ui.zone.Monster.prototype.getImageElement_ = function() {
  return goog.dom.getFirstElementChild(this.getElement());
};


/**
 * Sets up listeners for the card in this zone and renders it.
 * @private
 */
yugi.game.ui.zone.Monster.prototype.setUpCard_ = function() {
  this.cardHandler_.removeAll();

  this.card_ = this.player_.getField().getCard(this.area_);

  if (this.card_) {
    this.cardHandler_.listen(this.card_,
        [yugi.model.Card.EventType.FLIPPED,
         yugi.model.Card.EventType.ROTATED],
        this.renderCard_);

    this.renderCard_();
  } else {
    this.clearCard_();
  }
};


/**
 * Clears any card that was previously rendered.
 * @private
 */
yugi.game.ui.zone.Monster.prototype.clearCard_ = function() {
  var image = this.getImageElement_();
  if (image) {
    this.dragDropService_.removeSource(image);
  }

  this.getElement().innerHTML = '';
  this.imageHandler_.removeAll();
  goog.dispose(this.menu_);
  goog.dispose(this.counters_);
  goog.dispose(this.sword_);
};


/**
 * Renders the card.
 * @private
 */
yugi.game.ui.zone.Monster.prototype.renderCard_ = function() {

  // Remove any previously rendered card.
  this.clearCard_();

  // Convenient aliases.
  var element = this.getElement();
  var player = this.player_;
  var card = this.card_;
  var field = player.getField();
  var pName = player.getName();
  var cName = card.getName();
  var zone = yugi.model.Area.getZoneIndex(this.area_);

  var dom = this.getDomHelper();
  var img = dom.createDom(goog.dom.TagName.IMG, yugi.game.ui.Css.CARD_SIZE);
  if (card.isFaceUp()) {
    img.src = card.getImageSource(yugi.game.ui.MAX_CARD_HEIGHT);
  } else {
    img.src = yugi.ui.Image.CARD_BACK;
  }

  // Use the position as CSS.
  goog.dom.classes.enable(
      img, yugi.game.ui.zone.Monster.Css_.ROTATED, card.isRotated());
  element.appendChild(img);

  // Only add as a source if this is a player monster.
  if (!this.player_.isOpponent()) {
    this.dragDropService_.addSource(img, card);
  }

  // Update the z-index now in case there is an attack declaration in progress.
  this.updateImageZIndex_();

  // Set up menu actions.
  var actions = [];

  // For actions on face down cards, anonymize some of the card names.
  var anonCardName = card.isFaceUp() ? cName : 'a card';

  if (!player.isOpponent()) {

    if (card.isFaceUp()) {
      actions.push(new yugi.game.action.field.DeclareAttack(card, zone));
    }

    // Add actions based on position.
    if (card.isFaceUp()) {
      if (card.isRotated()) {

        // Face up defense.
        actions.push(new yugi.game.action.field.Position(
            'Change battle position', card, true, false,
            pName + ' switched ' + cName + ' to attack position.'));
        actions.push(new yugi.game.action.field.Position(
            'Flip into face-down defense', card, false, true,
            pName + ' flipped ' + cName + ' to face down defense.'));
      } else {

        // Face up attack.
        actions.push(new yugi.game.action.field.Position(
            'Change battle position', card, true, true,
            pName + ' switched ' + cName + ' to defense position.'));
        actions.push(new yugi.game.action.field.Position(
            'Flip into face-down defense', card, false, true,
            pName + ' flipped ' + cName + ' to face down defense.'));
      }
    } else {

      // Face down defense.
      actions.push(new yugi.game.action.field.Position(
          'Flip', card, true, true,
          pName + ' flipped ' + cName + ' face up.'));
      actions.push(new yugi.game.action.field.Position(
          'Flip summon', card, true, false,
          pName + ' flip summoned ' + cName + '.'));
    }

    // Send to graveyard.
    actions.push(new yugi.game.action.FieldToList(
        'Send to graveyard', card, zone, player, player.getGraveyard(),
        pName + ' sent ' + cName + ' to the graveyard', true));

    // Banish.
    actions.push(new yugi.game.action.FieldToList(
        'Banish', card, zone, player, player.getBanish(),
        pName + ' banished ' + cName, true));

    // Add counter.
    actions.push(new yugi.game.action.field.AddCounter(card, player));

    // Extra deck cards are handled specially.
    if (yugi.model.util.isExtraDeckCard(card)) {
      actions.push(new yugi.game.action.FieldToList(
          'Return to deck', card, zone, player,
          player.getDeck().getExtraCardList(),
          pName + ' returned ' + anonCardName + ' to their deck', false, true));
    } else {
      actions.push(new yugi.game.action.FieldToList(
          'Return to hand', card, zone, player, player.getHand(),
          pName + ' brought ' + anonCardName + ' to their hand'));

      var deck = player.getDeck().getMainCardList();

      actions.push(new yugi.game.action.FieldToList(
          'Shuffle into deck', card, zone, player, deck,
          pName + ' shuffled ' + anonCardName + ' into their deck', false,
          true));

      actions.push(new yugi.game.action.FieldToList(
          'Send to top of deck', card, zone, player, deck,
          pName + ' sent ' + anonCardName + ' to the top of their deck', true));

      actions.push(new yugi.game.action.FieldToList(
          'Send to bottom of deck', card, zone, player, deck,
          pName + ' sent ' + anonCardName + ' to the bottom of their deck',
          false));
    }

    actions.push(new yugi.game.action.CardTransfer(
        card, yugi.game.message.CardTransfer.Location.FIELD));
  }

  // Don't render the menu unless there are actions.
  if (actions.length > 0) {
    this.menu_ = new yugi.ui.menu.Menu(actions);
    if (card.isRotated()) {
      this.menu_.renderWithOffset(element, '-12%', '20%');
    } else {
      this.menu_.renderWithOffset(element, '5%', '4%');
    }
  }

  // Render the counters.
  this.counters_ = new yugi.game.ui.counters.Counters(card, player);
  this.addChild(this.counters_, true);

  // Render the sword.
  this.sword_ = new yugi.game.ui.attack.Sword(card, zone);
  this.addChild(this.sword_, true);

  // Listen for image selection.
  this.imageHandler_.listen(img,
      goog.events.EventType.CLICK,
      goog.bind(this.onImageClick_, this, img));
};


/**
 * Called when a monster image is clicked.
 * @param {Element} image The image element.
 * @private
 */
yugi.game.ui.zone.Monster.prototype.onImageClick_ = function(image) {

  // Clicks are different if an attack is being declared.
  if (this.attack_.getState() == yugi.game.model.Attack.State.DECLARING) {
    if (this.player_.isOpponent()) {

      // TODO Make the attack stuff use area instead of zone.
      var zone = yugi.model.Area.getZoneIndex(this.area_);

      // Opponent monster!  This means an attack declaration has been made.
      this.attack_.declareCard(
          goog.asserts.assert(this.card_),
          zone,
          goog.asserts.assert(goog.dom.getParentElement(this.getElement())));

    } else {

      // Player monster, so cancel the attack.
      this.attack_.cancel();
    }
  } else {

    // No attack going on, so just select the card.
    if (this.player_.isOpponent() && !this.card_.isFaceUp()) {

      // Don't show opponent's face down monsters.
      this.selection_.setSelected(this.opponentCard_, image);
    } else {
      this.selection_.setSelected(this.card_, image);
    }
  }
};


/** @override */
yugi.game.ui.zone.Monster.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.dispose(this.menu_);
};
