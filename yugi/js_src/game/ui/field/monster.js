/**
 * This is the UI for a monster card in play.
 */

goog.provide('yugi.game.ui.field.Monster');

goog.require('goog.debug.Logger');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('yugi.game.action.CardTransfer');
goog.require('yugi.game.action.FieldToList');
goog.require('yugi.game.action.field.AddCounter');
goog.require('yugi.game.action.field.MonsterPosition');
goog.require('yugi.game.message.CardTransfer');
goog.require('yugi.game.ui');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.counters.Counters');
goog.require('yugi.model.Card');
goog.require('yugi.model.InformationCard');
goog.require('yugi.model.MonsterCard');
goog.require('yugi.model.Selection');
goog.require('yugi.model.util');
goog.require('yugi.ui.Image');
goog.require('yugi.ui.menu.Menu');



/**
 * This is the UI for a monster card in play.
 * @param {!yugi.model.MonsterCard} monsterCard The monster card.
 * @param {number} zone The zone in which the monster card resides.
 * @param {!yugi.game.model.Player} player The player to which the card belongs.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.field.Monster = function(monsterCard, zone, player) {
  goog.base(this);

  /**
   * @type {!yugi.model.MonsterCard}
   * @private
   */
  this.monsterCard_ = monsterCard;

  /**
   * @type {number}
   * @private
   */
  this.zone_ = zone;

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

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
  this.imageHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.imageHandler_);

  /**
   * @type {!yugi.game.ui.counters.Counters}
   * @private
   */
  this.counters_ = new yugi.game.ui.counters.Counters(monsterCard, player);
  this.addChild(this.counters_);
};
goog.inherits(yugi.game.ui.field.Monster, goog.ui.Component);


/**
 * @type {yugi.ui.menu.Menu}
 * @private
 */
yugi.game.ui.field.Monster.prototype.menu_ = null;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.ui.field.Monster.prototype.logger =
    goog.debug.Logger.getLogger('yugi.game.ui.field.Monster');


/**
 * CSS classes used in this widget.
 * @enum {string}
 * @private
 */
yugi.game.ui.field.Monster.Css_ = {
  ROOT: goog.getCssName('yugi-monster-card')
};


/** @override */
yugi.game.ui.field.Monster.prototype.createDom = function() {
  goog.base(this, 'createDom');
  var el = this.getElement();
  goog.dom.classes.add(el, yugi.game.ui.field.Monster.Css_.ROOT);
  goog.dom.classes.enable(el, yugi.game.ui.Css.OPPONENT,
      this.player_.isOpponent());

  this.counters_.render(el);
};


/** @override */
yugi.game.ui.field.Monster.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.monsterCard_,
      yugi.model.Card.EventType.POSITION_CHANGED,
      this.onPositionChanged_);

  this.onPositionChanged_();
};


/**
 * Called when the monster position changes.
 * @private
 */
yugi.game.ui.field.Monster.prototype.onPositionChanged_ = function() {

  // Reset.
  var element = this.getElement();
  element.innerHTML = '';
  this.imageHandler_.removeAll();
  goog.dispose(this.menu_);
  goog.dispose(this.counters_);

  var dom = this.getDomHelper();
  var img = dom.createDom(goog.dom.TagName.IMG);

  var position = this.monsterCard_.getPosition();

  // Render based on card position.
  switch (position) {
    case yugi.model.MonsterCard.Position.FACE_DOWN_DEFENSE:
      img.src = yugi.ui.Image.CARD_BACK;
      break;
    case yugi.model.MonsterCard.Position.FACE_UP_DEFENSE:
      // Fall through.
    case yugi.model.MonsterCard.Position.FACE_UP_ATTACK:
      img.src = this.monsterCard_.getImageSource(yugi.game.ui.CARD_HEIGHT);
      break;
    default:
      throw new Error('Unknown monster card position.');
  }

  // Use the position as CSS.
  goog.dom.classes.add(img, position);
  dom.append(element, img);

  // Set up menu actions.
  var actions = [];

  var player = this.player_;
  var card = this.monsterCard_;
  var zone = this.zone_;
  var field = player.getField();
  var pName = player.getName();
  var cName = card.getName();

  // For actions on face down cards, anonymize some of the card names.
  var anonCardName =
      position == yugi.model.MonsterCard.Position.FACE_DOWN_DEFENSE ?
          'a card' : cName;

  if (!player.isOpponent()) {

    // Add actions based on position.
    switch (position) {
      case yugi.model.MonsterCard.Position.FACE_DOWN_DEFENSE:
        actions.push(new yugi.game.action.field.MonsterPosition(
            'Flip',
            card, yugi.model.MonsterCard.Position.FACE_UP_DEFENSE,
            pName + ' flipped ' + cName + ' face up.'));
        actions.push(new yugi.game.action.field.MonsterPosition(
            'Flip summon',
            card, yugi.model.MonsterCard.Position.FACE_UP_ATTACK,
            pName + ' flip summoned ' + cName + '.'));
        break;
      case yugi.model.MonsterCard.Position.FACE_UP_DEFENSE:
        actions.push(new yugi.game.action.field.MonsterPosition(
            'Change battle position',
            card, yugi.model.MonsterCard.Position.FACE_UP_ATTACK,
            pName + ' switched ' + cName + ' to attack position.'));
        actions.push(new yugi.game.action.field.MonsterPosition(
            'Flip into face-down defense',
            card, yugi.model.MonsterCard.Position.FACE_DOWN_DEFENSE,
            pName + ' flipped ' + cName + ' to face down defense.'));
        break;
      case yugi.model.MonsterCard.Position.FACE_UP_ATTACK:
        actions.push(new yugi.game.action.field.MonsterPosition(
            'Change battle position',
            card, yugi.model.MonsterCard.Position.FACE_UP_DEFENSE,
            pName + ' switched ' + cName + ' to defense position.'));
        actions.push(new yugi.game.action.field.MonsterPosition(
            'Flip into face-down defense',
            card, yugi.model.MonsterCard.Position.FACE_DOWN_DEFENSE,
            pName + ' flipped ' + cName + ' to face down defense.'));
      default:
        break;
    }

    // Send to graveyard.
    actions.push(new yugi.game.action.FieldToList(
        'Send to graveyard', card, zone, player, field.getGraveyard(),
        pName + ' sent ' + cName + ' to the graveyard', true));

    // Banish.
    actions.push(new yugi.game.action.FieldToList(
        'Banish', card, zone, player, field.getBanishedCards(),
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
    if (position == yugi.model.MonsterCard.Position.FACE_DOWN_DEFENSE ||
        position == yugi.model.MonsterCard.Position.FACE_UP_DEFENSE) {
      this.menu_.renderWithOffset(element, -8, 20);
    } else {
      this.menu_.render(element);
    }
  }

  // Render the counters.
  this.counters_ = new yugi.game.ui.counters.Counters(card, player);
  this.addChild(this.counters_, true);

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
yugi.game.ui.field.Monster.prototype.onImageClick_ = function(image) {
  if (this.player_.isOpponent()) {
    // We don't want to show the player the opponent's face down monster.
    if (this.monsterCard_.getPosition() ==
        yugi.model.MonsterCard.Position.FACE_DOWN_DEFENSE) {
      this.selection_.setSelected(this.opponentCard_, image);
    } else {
      this.selection_.setSelected(this.monsterCard_, image);
    }
  } else {
    this.selection_.setSelected(this.monsterCard_, image);
  }
};


/** @override */
yugi.game.ui.field.Monster.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.dispose(this.menu_);
};
