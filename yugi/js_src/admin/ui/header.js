/**
 * The header for the card admin screen.
 */

goog.provide('yugi.admin.ui.Header');

goog.require('goog.Timer');
goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.admin.ui.soy');
goog.require('yugi.model.Notifier');



/**
 * The header for an admin screen.
 * @param {string} mainText The main text.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.admin.ui.Header = function(mainText) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.mainText_ = mainText;

  /**
   * @type {!yugi.model.Notifier}
   * @private
   */
  this.notifier_ = yugi.model.Notifier.get();
};
goog.inherits(yugi.admin.ui.Header, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.admin.ui.Header.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.admin.ui.Header');


/**
 * @type {Element}
 * @private
 */
yugi.admin.ui.Header.prototype.noticeContainer_;


/**
 * The ID of the timer that will fire to clear a posted notice.
 * @type {?number}
 * @private
 */
yugi.admin.ui.Header.prototype.timerId_ = null;


/**
 * The time, in milliseconds, before an error notice clears itself.
 * @type {number}
 * @const
 * @private
 */
yugi.admin.ui.Header.NOTICE_ERROR_TIMEOUT_ = 60 * 1000; // 1 minute.


/**
 * The time, in milliseconds, before a notice clears itself.
 * @type {number}
 * @const
 * @private
 */
yugi.admin.ui.Header.NOTICE_TIMEOUT_ = 10 * 1000; // 10 seconds.


/**
 * DOM IDs used by this component.
 * @enum {string}
 * @private
 */
yugi.admin.ui.Header.Id_ = {
  NOTICE_CONTAINER: 'notice-container'
};


/**
 * CSS used by this component.
 * @enum {string}
 * @private
 */
yugi.admin.ui.Header.Css_ = {
  HEADER: goog.getCssName('yugi-admin-header'),
  NOTICE_ERROR: goog.getCssName('yugi-notice-error')
};


/** @override */
yugi.admin.ui.Header.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.admin.ui.soy.HEADER, {
        mainText: this.mainText_,
        ids: this.makeIds(yugi.admin.ui.Header.Id_)
      }));
  goog.dom.classes.add(this.getElement(), yugi.admin.ui.Header.Css_.HEADER);
};


/** @override */
yugi.admin.ui.Header.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.noticeContainer_ = this.getElementByFragment(
      yugi.admin.ui.Header.Id_.NOTICE_CONTAINER);

  this.getHandler().listen(this.notifier_,
      yugi.model.Notifier.EventType.NOTICE,
      this.onNotice_);

  this.clearNotice_();
};


/**
 * Called when a notice is posted.
 * @param {!yugi.model.Notifier.NoticeEvent} e The notice event.
 * @private
 */
yugi.admin.ui.Header.prototype.onNotice_ = function(e) {
  var notice = e.notice;
  if (!this.isInDocument()) {
    this.logger.severe('Was not in the DOM when notice posted: ' + notice);
    return;
  }

  // Stop any active timer.
  this.clearTimer_();

  // Show the notice and adjust the error class.
  goog.style.showElement(this.noticeContainer_, true);
  this.noticeContainer_.innerHTML = e.notice;
  goog.dom.classes.enable(this.noticeContainer_,
      yugi.admin.ui.Header.Css_.NOTICE_ERROR, e.isError);

  // The timeout is different if it is an error.
  var timeout = e.isError ? yugi.admin.ui.Header.NOTICE_ERROR_TIMEOUT_ :
      yugi.admin.ui.Header.NOTICE_TIMEOUT_;
  this.timerId_ = goog.Timer.callOnce(this.clearNotice_, timeout, this);
};


/**
 * Clears the timer.
 * @private
 */
yugi.admin.ui.Header.prototype.clearTimer_ = function() {
  if (goog.isDefAndNotNull(this.timerId_)) {
    goog.Timer.clear(this.timerId_);
    this.timerId_ = null;
  }
};


/**
 * Clears the notice.
 * @private
 */
yugi.admin.ui.Header.prototype.clearNotice_ = function() {
  if (!this.isInDocument()) {
    return;
  }
  goog.style.showElement(this.noticeContainer_, false);
};
