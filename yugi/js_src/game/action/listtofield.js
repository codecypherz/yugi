/**
 * Action for moving a card from a list to the field.
 */

goog.provide('yugi.game.action.ListToField');

goog.require('yugi.game.model.Chat');
goog.require('yugi.game.service.Sync');
goog.require('yugi.model.Action');
goog.require('yugi.model.Area');
goog.require('yugi.model.Card');
goog.require('yugi.model.SpellCard');



/**
 * Action for moving a card from a list to the field.
 * @param {string} title The name of the action.
 * @param {!yugi.model.Card} card The card.
 * @param {!yugi.game.model.Player} player The player.
 * @param {!yugi.model.CardList} source The source list.
 * @param {string} chatText The text to chat after the action is performed.
 * @param {boolean=} opt_faceUp True if face up or not after action fires.
 * @param {boolean=} opt_rotated True if rotated or not after action fires.
 * @param {boolean=} opt_shuffle True if the source list should be shuffled
 *     after.  This is false by default.
 * @constructor
 * @extends {yugi.model.Action}
 */
yugi.game.action.ListToField = function(title, card, player, source, chatText,
    opt_faceUp, opt_rotated, opt_shuffle) {
  goog.base(this, title);

  /**
   * @type {!yugi.model.Card}
   * @private
   */
  this.card_ = card;

  /**
   * @type {!yugi.game.model.Player}
   * @private
   */
  this.player_ = player;

  /**
   * @type {!yugi.model.CardList}
   * @private
   */
  this.source_ = source;

  /**
   * @type {string}
   * @private
   */
  this.chatText_ = chatText;

  /**
   * @type {boolean}
   * @private
   */
  this.faceUp_ = opt_faceUp || false;

  /**
   * @type {boolean}
   * @private
   */
  this.rotated_ = opt_rotated || false;

  /**
   * @type {boolean}
   * @private
   */
  this.shuffle_ = opt_shuffle || false;

  /**
   * @type {!yugi.game.service.Sync}
   * @private
   */
  this.syncService_ = yugi.game.service.Sync.get();

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = yugi.game.model.Chat.get();
};
goog.inherits(yugi.game.action.ListToField, yugi.model.Action);


/** @override */
yugi.game.action.ListToField.prototype.fire = function() {

  var chatText = '';

  // Set the card in the first monster zone or first spell/trap zone depending
  // on the card.
  var field = this.player_.getField();

  if (this.card_.getType() == yugi.model.Card.Type.MONSTER) {

    // Make sure there's room for the card.
    if (!field.hasEmptyMonsterZone()) {
      // TODO Make this more noticeable for the user.
      this.chat_.sendSystemLocal('You need to free a monster zone first.');
      return;
    }

    var zone = field.setMonsterCard(this.card_);
    chatText = this.chatText_ + ' in monster zone ' + (zone + 1);

  } else {
    var spellTrapCard =
        /** @type {!yugi.model.SpellCard|!yugi.model.TrapCard} */ (this.card_);

    // Special case for field card.
    if (spellTrapCard instanceof yugi.model.SpellCard &&
        spellTrapCard.getSpellType() == yugi.model.SpellCard.Type.FIELD) {

      // Make sure the field card spot is open.
      if (field.getFieldCard()) {
        this.chat_.sendSystemLocal('Remove the existing field card first.');
      }

      // Set the new field card.
      field.setCard(yugi.model.Area.PLAYER_FIELD, spellTrapCard);

      // Chat about the change.
      if (this.faceUp_) {
        chatText = this.player_.getName() + ' activated ' +
            this.card_.getName();
      } else {
        chatText = this.player_.getName() + ' set a field card';
      }

    } else {

      // Make sure there's room for the card.
      if (!field.hasEmptySpellTrapZone()) {
        // TODO Make this more noticeable for the user.
        this.chat_.sendSystemLocal('You need to free a spell/trap zone first.');
        return;
      }

      var zone = field.setSpellTrapCard(spellTrapCard);
      chatText = this.chatText_ + ' in spell/trap zone ' + (zone + 1);
    }
  }

  // Remove the card from the source.
  this.source_.remove(this.card_);

  // Maybe shuffle.
  if (this.shuffle_) {
    this.source_.shuffle();
    chatText += ' and shuffled';
  }
  chatText += '.';

  this.card_.setFaceUp(this.faceUp_);
  this.card_.setRotated(this.rotated_);

  this.chat_.sendSystemRemote(chatText);

  this.syncService_.sendPlayerState();
};
