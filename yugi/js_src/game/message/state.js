/**
 * The message containing some or all game state.
 */

goog.provide('yugi.game.message.State');

goog.require('goog.object');
goog.require('goog.string');
goog.require('yugi.game.data.GameData');
goog.require('yugi.game.data.PlayerData');
goog.require('yugi.game.message.Message');
goog.require('yugi.game.message.MessageType');
goog.require('yugi.model.Serializable');



/**
 * The message containing some or all game state.
 * @constructor
 * @extends {yugi.game.message.Message}
 */
yugi.game.message.State = function() {
  goog.base(this, yugi.game.message.MessageType.STATE);

  /**
   * @type {!yugi.model.Serializable}
   * @private
   */
  this.data_ = new yugi.game.message.State.DummyData_();

  /**
   * @type {!yugi.game.message.State.Type}
   * @private
   */
  this.dataType_ = yugi.game.message.State.Type.UNKNOWN;
};
goog.inherits(yugi.game.message.State, yugi.game.message.Message);


/**
 * The types of state messages.
 * @enum {string}
 */
yugi.game.message.State.Type = {
  GAME: 'g',
  PLAYER: 'p',
  UNKNOWN: 'u'
};


/**
 * @return {!yugi.model.Serializable} The data.
 */
yugi.game.message.State.prototype.getData = function() {
  return this.data_;
};


/**
 * @param {!yugi.model.Serializable} data The data to set.
 */
yugi.game.message.State.prototype.setData = function(data) {
  this.data_ = data;
};


/**
 * @return {!yugi.game.message.State.Type} The data type.
 */
yugi.game.message.State.prototype.getDataType = function() {
  return this.dataType_;
};


/**
 * @param {!yugi.game.message.State.Type} dataType The data type.
 */
yugi.game.message.State.prototype.setDataType = function(dataType) {
  this.dataType_ = dataType;
};


/** @override */
yugi.game.message.State.prototype.toJson = function() {
  var message = goog.base(this, 'toJson');

  // Make sure a data type was set.
  if (this.dataType_ == yugi.game.message.State.Type.UNKNOWN) {
    throw new Error('Failed to set the data type on the state message.');
  }

  message['dt'] = this.dataType_;
  message['d'] = this.data_.toJson();

  return message;
};


/** @override */
yugi.game.message.State.prototype.setFromJson = function(json) {
  goog.base(this, 'setFromJson', json);

  this.setDataTypeFromString_(json['dt']);

  var data = null;
  switch (this.dataType_) {
    case yugi.game.message.State.Type.GAME:
      data = new yugi.game.data.GameData();
      break;
    case yugi.game.message.State.Type.PLAYER:
      data = new yugi.game.data.PlayerData();
      break;
    default:
      break;
  }

  // Make sure there was a data object.
  if (!data) {
    throw new Error('No data object for: ' + this.dataType_ + '.  ' +
        'Did you forget to add to the case statement?');
  }

  // Set the data.
  data.setFromJson(json['d']);
  this.data_ = data;
};


/**
 * Sets the data type from the string.
 * @param {string} str The data type as a string.
 * @private
 */
yugi.game.message.State.prototype.setDataTypeFromString_ = function(str) {
  var dataType = /** @type {yugi.game.message.State.Type} */ (
      goog.object.findValue(yugi.game.message.State.Type,
          function(value, key, object) {
            return goog.string.caseInsensitiveCompare(value, str) == 0;
          }));
  if (dataType) {
    this.setDataType(dataType);
  } else {
    throw new Error('Failed to set the data type from this: ' + str);
  }
};



/**
 * Dummy data.
 * @constructor
 * @implements {yugi.model.Serializable}
 * @private
 */
yugi.game.message.State.DummyData_ = function() {
};


/** @override */
yugi.game.message.State.DummyData_.prototype.toJson = function() {
  return {};
};


/** @override */
yugi.game.message.State.DummyData_.prototype.setFromJson = function(json) { };
