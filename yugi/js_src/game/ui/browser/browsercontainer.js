/**
 * A UI component that allows you to browse an arbitrary set of cards.
 */

goog.provide('yugi.game.ui.browser.BrowserContainer');

goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.soy');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.game.model.Browser');
goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.ui.Css');
goog.require('yugi.game.ui.State');
goog.require('yugi.game.ui.browser.soy');
goog.require('yugi.model.CardList');
goog.require('yugi.ui.browser.CardBrowser');



/**
 * A UI component that allows you to browse an arbitrary set of cards.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.browser.BrowserContainer = function() {
  goog.base(this);

  /**
   * @type {!yugi.ui.browser.CardBrowser}
   * @private
   */
  this.cardBrowser_ = new yugi.ui.browser.CardBrowser();
  this.addChild(this.cardBrowser_);

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.returnButton_ = new goog.ui.Button(null);
  this.addChild(this.returnButton_);

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = yugi.game.model.Game.get();

  /**
   * @type {!yugi.game.model.Browser}
   * @private
   */
  this.browser_ = yugi.game.model.Browser.get();

  /**
   * @type {!yugi.game.ui.State}
   * @private
   */
  this.uiState_ = yugi.game.ui.State.get();

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = yugi.game.model.Chat.get();

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.cardListHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.cardListHandler_);
};
goog.inherits(yugi.game.ui.browser.BrowserContainer, goog.ui.Component);


/**
 * @type {Element}
 * @private
 */
yugi.game.ui.browser.BrowserContainer.prototype.titleElement_ = null;


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.ui.browser.BrowserContainer.prototype.logger =
    goog.debug.Logger.getLogger('yugi.game.ui.browser.BrowserContainer');


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.browser.BrowserContainer.Id_ = {
  BROWSER: 'browser',
  RETURN_BUTTON: 'return-button',
  TITLE: 'title'
};


/** @override */
yugi.game.ui.browser.BrowserContainer.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.browser.soy.BROWSER_CONTAINER, {
        ids: this.makeIds(yugi.game.ui.browser.BrowserContainer.Id_)
      }));
  goog.dom.classes.add(
      this.getElement(), yugi.game.ui.Css.MODE_SWAPPER_CONTAINER);
};


/** @override */
yugi.game.ui.browser.BrowserContainer.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.titleElement_ = this.getElementByFragment(
      yugi.game.ui.browser.BrowserContainer.Id_.TITLE);

  this.cardBrowser_.render(this.getElementByFragment(
      yugi.game.ui.browser.BrowserContainer.Id_.BROWSER));

  if (!this.returnButton_.wasDecorated()) {
    this.returnButton_.decorate(this.getElementByFragment(
        yugi.game.ui.browser.BrowserContainer.Id_.RETURN_BUTTON));
  }

  this.getHandler().listen(this.returnButton_,
      goog.ui.Component.EventType.ACTION,
      this.return_);

  this.getHandler().listen(this.browser_,
      yugi.game.model.Browser.EventType.UPDATED,
      this.onUpdate_);
};


/**
 * Called when the browsing data gets updated.
 * @private
 */
yugi.game.ui.browser.BrowserContainer.prototype.onUpdate_ = function() {

  // Set the new action creation function.
  this.cardBrowser_.setCreateActionsFn(this.browser_.getCreateActionsFn());

  // Grab the card list and listen to it for changes.
  this.cardListHandler_.removeAll();
  var cardList = this.browser_.getCardList();
  this.cardListHandler_.listen(cardList,
      yugi.model.CardList.EventType.CARDS_CHANGED,
      this.onCardsChanged_);

  // Start browsing the cards in the list.
  this.cardBrowser_.browse(cardList.getCards());

  var type = this.browser_.getType();
  var title = '';

  // Tell the other player this player is now browsing.
  if (this.browser_.isOpponent()) {
    title = 'Browsing your opponent\'s ' + type;
    this.chat_.sendSystemRemote(
        this.game_.getPlayer().getName() + ' started browsing ' +
        this.game_.getOpponent().getName() + '\'s ' + type + '.');
  } else {
    title = 'Browsing your ' + type;
    this.chat_.sendSystemRemote(this.game_.getPlayer().getName() +
        ' started browsing their ' + type + '.');
  }
  this.titleElement_.innerHTML = title;
};


/**
 * Called when the list being browsed changes.
 * @private
 */
yugi.game.ui.browser.BrowserContainer.prototype.onCardsChanged_ = function() {
  this.cardBrowser_.browse(this.browser_.getCardList().getCards());
};


/**
 * Called when the return button is clicked.
 * @private
 */
yugi.game.ui.browser.BrowserContainer.prototype.return_ = function() {

  // Tell the other player this player stopped browsing.
  var type = this.browser_.getType();
  if (this.browser_.isOpponent()) {
    this.chat_.sendSystemRemote(
        this.game_.getPlayer().getName() + ' stopped browsing ' +
        this.game_.getOpponent().getName() + '\'s ' + type + '.');
  } else {
    this.chat_.sendSystemRemote(this.game_.getPlayer().getName() +
        ' stopped browsing their ' + type + '.');
  }
  this.browser_.finish();

  // Go back to the field UI.
  this.uiState_.setMode(yugi.game.ui.State.Mode.FIELD);
};
