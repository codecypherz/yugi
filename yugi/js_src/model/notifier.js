/**
 * The model for notifying users of things.
 */

goog.provide('yugi.model.Notifier');
goog.provide('yugi.model.Notifier.EventType');
goog.provide('yugi.model.Notifier.NoticeEvent');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');



/**
 * The model for notifying users of things.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
yugi.model.Notifier = function() {
  goog.base(this);
};
goog.inherits(yugi.model.Notifier, goog.events.EventTarget);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.model.Notifier.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.model.Notifier');


/**
 * @type {!yugi.model.Notifier}
 * @private
 */
yugi.model.Notifier.instance_;


/**
 * Events dispatched by this model.
 * @enum {string}
 */
yugi.model.Notifier.EventType = {
  NOTICE: goog.events.getUniqueId('notice')
};


/**
 * Registers an instance of the model.
 * @return {!yugi.model.Notifier} The registered instance.
 */
yugi.model.Notifier.register = function() {
  yugi.model.Notifier.instance_ = new yugi.model.Notifier();
  return yugi.model.Notifier.get();
};


/**
 * @return {!yugi.model.Notifier} The model for the notifier.
 */
yugi.model.Notifier.get = function() {
  return yugi.model.Notifier.instance_;
};


/**
 * @param {string} notice The notice to post.
 * @param {boolean=} opt_isError True if this is an error notice or not.
 */
yugi.model.Notifier.prototype.post = function(notice, opt_isError) {
  this.logger.info('Posting notice: ' + notice);
  var isError = opt_isError || false;
  this.dispatchEvent(new yugi.model.Notifier.NoticeEvent(notice, isError));
};



/**
 * The event that gets dispatched when user needs to be notified of something.
 * @param {string} notice The notice being posted.
 * @param {boolean} isError True if this is an error notice or not.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.model.Notifier.NoticeEvent = function(notice, isError) {
  goog.base(this, yugi.model.Notifier.EventType.NOTICE);

  /**
   * @type {string}
   */
  this.notice = notice;

  /**
   * @type {boolean}
   */
  this.isError = isError;
};
goog.inherits(yugi.model.Notifier.NoticeEvent, goog.events.Event);
