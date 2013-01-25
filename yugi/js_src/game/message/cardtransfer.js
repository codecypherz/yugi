/**
 * The message used to transfer a card between players.
 */

goog.provide('yugi.game.message.CardTransfer');
goog.provide('yugi.game.message.CardTransfer.Location');

goog.require('goog.object');
goog.require('goog.string');
goog.require('yugi.game.data.CardData');
goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');



/**
 * The message used to transfer a card between players.
 * @constructor
 * @extends {yugi.game.message.Message}
 */
yugi.game.message.CardTransfer = function() {
  goog.base(this, yugi.game.message.MessageType.CARD_TRANSFER);

  /**
   * Describes the card being transfered in enough detail for the other client
   * to pull it from its own cache and set it up.
   * @type {!yugi.game.data.CardData}
   * @private
   */
  this.cardData_ = new yugi.game.data.CardData();

  // TODO This should be refactored to use yugi.model.Area.

  /**
   * The place the card should end up for the opponent.
   * @type {!yugi.game.message.CardTransfer.Location}
   * @private
   */
  this.destination_ = yugi.game.message.CardTransfer.Location.HAND;
};
goog.inherits(yugi.game.message.CardTransfer, yugi.game.message.Message);


/**
 * The various card locations that could be transferred to.
 * @enum {string}
 */
yugi.game.message.CardTransfer.Location = {
  FIELD: 'f',
  HAND: 'h'
};


/**
 * @return {!yugi.game.data.CardData} The card data.
 */
yugi.game.message.CardTransfer.prototype.getCardData = function() {
  return this.cardData_;
};


/**
 * @param {!yugi.game.data.CardData} data The card data.
 */
yugi.game.message.CardTransfer.prototype.setCardData = function(data) {
  this.cardData_ = data;
};


/**
 * @return {!yugi.game.message.CardTransfer.Location} The destination.
 */
yugi.game.message.CardTransfer.prototype.getDestination = function() {
  return this.destination_;
};


/**
 * @param {!yugi.game.message.CardTransfer.Location} destination The
 *     destination.
 */
yugi.game.message.CardTransfer.prototype.setDestination =
    function(destination) {
  this.destination_ = destination;
};


/** @override */
yugi.game.message.CardTransfer.prototype.toJson = function() {
  var message = goog.base(this, 'toJson');

  message['c'] = this.cardData_.toJson();
  message['d'] = this.destination_;

  return message;
};


/** @override */
yugi.game.message.CardTransfer.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);

  this.cardData_ = yugi.game.data.CardData.createFromJson(json['c']);
  this.setDestinationFromString_(json['d']);
};


/**
 * Sets the destination from the string.
 * @param {string} destStr The destination as a string value.
 * @private
 */
yugi.game.message.CardTransfer.prototype.setDestinationFromString_ =
    function(destStr) {
  var destination = /** @type {yugi.game.message.CardTransfer.Location} */ (
      goog.object.findValue(yugi.game.message.CardTransfer.Location,
          function(value, key, object) {
            return goog.string.caseInsensitiveCompare(value, destStr) == 0;
          }));
  if (destination) {
    this.setDestination(destination);
  }
};
