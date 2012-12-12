/**
 * This is the UI for displaying the channel connection status.
 */

goog.provide('yugi.game.ui.connection.Status');

goog.require('goog.dom.classes');
goog.require('goog.ui.Component');
goog.require('yugi.game.net.Channel');



/**
 * This is the UI for displaying the channel connection status.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.connection.Status = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = yugi.game.net.Channel.get();
};
goog.inherits(yugi.game.ui.connection.Status, goog.ui.Component);


/**
 * Classes used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.connection.Status.Css_ = {
  CLOSED: goog.getCssName('yugi-connection-closed'),
  OPEN: goog.getCssName('yugi-connection-open'),
  ROOT: goog.getCssName('yugi-connection')
};


/** @override */
yugi.game.ui.connection.Status.prototype.createDom = function() {
  var element = this.getDomHelper().createDom('SPAN', {
    'class': yugi.game.ui.connection.Status.Css_.ROOT,
    'title': 'The server connection status'
  });
  this.setElementInternal(element);
};


/** @override */
yugi.game.ui.connection.Status.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen for channel events.
  this.getHandler().listen(this.channel_,
      [yugi.game.net.Channel.EventType.OPENED,
       yugi.game.net.Channel.EventType.CLOSED],
      this.updateStatus_);

  this.updateStatus_();
};


/**
 * Updates the status widget based on the state of the channel.
 * @private
 */
yugi.game.ui.connection.Status.prototype.updateStatus_ = function() {

  var element = this.getElement();
  var isOpen = this.channel_.isOpen();

  goog.dom.classes.enable(
      element, yugi.game.ui.connection.Status.Css_.OPEN, isOpen);
  goog.dom.classes.enable(
      element, yugi.game.ui.connection.Status.Css_.CLOSED, !isOpen);

  var statusText = isOpen ? 'Connected' : 'Disconnected';
  element.innerHTML = statusText;
};
