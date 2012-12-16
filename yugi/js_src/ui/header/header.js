/**
 * The header widget.
 */

goog.provide('yugi.ui.header.Header');

goog.require('goog.Timer');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('yugi.Config');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.User');
goog.require('yugi.service.AuthService');
goog.require('yugi.service.url');
goog.require('yugi.ui.header.soy');



/**
 * The header widget.
 * @param {string} signInUrl The URL to visit to sign in.
 * @param {string} signOutUrl The URL to visit to sign out.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.ui.header.Header = function(signInUrl, signOutUrl) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.signInUrl_ = signInUrl;

  /**
   * @type {string}
   * @private
   */
  this.signOutUrl_ = signOutUrl;

  /**
   * @type {!yugi.model.User}
   * @private
   */
  this.user_ = yugi.model.User.get();

  /**
   * @type {!yugi.model.Notifier}
   * @private
   */
  this.notifier_ = yugi.model.Notifier.get();

  /**
   * @type {!yugi.service.AuthService}
   * @private
   */
  this.authService_ = yugi.service.AuthService.get();
};
goog.inherits(yugi.ui.header.Header, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.ui.header.Header.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.ui.header.Header');


/**
 * @type {Element}
 * @private
 */
yugi.ui.header.Header.prototype.linkContainer_;


/**
 * @type {Element}
 * @private
 */
yugi.ui.header.Header.prototype.noticeContainer_;


/**
 * The ID of the timer that will fire to clear a posted notice.
 * @type {?number}
 * @private
 */
yugi.ui.header.Header.prototype.timerId_ = null;


/**
 * The time, in milliseconds, before an error notice clears itself.
 * @type {number}
 * @const
 * @private
 */
yugi.ui.header.Header.NOTICE_ERROR_TIMEOUT_ = 60 * 1000; // 1 minute.


/**
 * The time, in milliseconds, before a notice clears itself.
 * @type {number}
 * @const
 * @private
 */
yugi.ui.header.Header.NOTICE_TIMEOUT_ = 10 * 1000; // 10 seconds.


/**
 * DOM IDs used by this component.
 * @enum {string}
 * @private
 */
yugi.ui.header.Header.Id_ = {
  NOTICE_CONTAINER: 'notice-container'
};


/**
 * CSS used by this component.
 * @enum {string}
 * @private
 */
yugi.ui.header.Header.Css_ = {
  HEADER: goog.getCssName('yugi-header'),
  NOTICE_ERROR: goog.getCssName('yugi-notice-error')
};


/** @override */
yugi.ui.header.Header.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.ui.header.soy.HEADER, {
        ids: this.makeIds(yugi.ui.header.Header.Id_)
      }));
  goog.dom.classes.add(this.getElement(), yugi.ui.header.Header.Css_.HEADER);
};


/** @override */
yugi.ui.header.Header.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Also render the links.
  this.linkContainer_ = goog.soy.renderAsElement(yugi.ui.header.soy.LINKS, {
    gamesUrl: yugi.service.url.build(yugi.Config.ServletPath.MAIN),
    deckManagerUrl: yugi.service.url.build(
        yugi.Config.ServletPath.DECK_MANAGER),
    signInDeckManagerUrl: this.authService_.buildLoginUrl(
        yugi.Config.ServletPath.DECK_MANAGER),
    structureDeckManagerUrl: yugi.service.url.build(
        yugi.Config.ServletPath.DECK_MANAGER,
        yugi.Config.UrlParameter.STRUCTURE,
        'true'),
    cardSearchUrl: yugi.service.url.build(
        yugi.Config.ServletPath.ADMIN_CARD_SEARCH),
    cardUploadUrl: yugi.service.url.build(
        yugi.Config.ServletPath.ADMIN_CARD),
    signInUrl: this.signInUrl_,
    signOutUrl: this.signOutUrl_,
    signedIn: this.user_.isSignedIn(),
    isAdmin: this.user_.isAdmin(),
    userName: this.user_.getName()
  });
  goog.dom.getDocument().body.appendChild(this.linkContainer_);

  this.noticeContainer_ = this.getElementByFragment(
      yugi.ui.header.Header.Id_.NOTICE_CONTAINER);

  this.getHandler().listen(this.notifier_,
      yugi.model.Notifier.EventType.NOTICE,
      this.onNotice_);

  this.clearNotice_();
};


/** @override */
yugi.ui.header.Header.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');
  goog.dom.removeNode(this.linkContainer_);
};


/**
 * Called when a notice is posted.
 * @param {!yugi.model.Notifier.NoticeEvent} e The notice event.
 * @private
 */
yugi.ui.header.Header.prototype.onNotice_ = function(e) {
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
      yugi.ui.header.Header.Css_.NOTICE_ERROR, e.isError);

  // The timeout is different if it is an error.
  var timeout = e.isError ? yugi.ui.header.Header.NOTICE_ERROR_TIMEOUT_ :
      yugi.ui.header.Header.NOTICE_TIMEOUT_;
  this.timerId_ = goog.Timer.callOnce(this.clearNotice_, timeout, this);
};


/**
 * Clears the timer.
 * @private
 */
yugi.ui.header.Header.prototype.clearTimer_ = function() {
  if (goog.isDefAndNotNull(this.timerId_)) {
    goog.Timer.clear(this.timerId_);
    this.timerId_ = null;
  }
};


/**
 * Clears the notice.
 * @private
 */
yugi.ui.header.Header.prototype.clearNotice_ = function() {
  if (!this.isInDocument()) {
    return;
  }
  goog.style.showElement(this.noticeContainer_, false);
};
