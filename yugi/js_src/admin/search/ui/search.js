/**
 * The UI for searching for cards.
 */

goog.provide('yugi.admin.search.ui.Search');

goog.require('goog.Uri');
goog.require('goog.debug.Logger');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.Config');
goog.require('yugi.admin.search.ui.soy');
goog.require('yugi.ui.search.SearchForm');
goog.require('yugi.ui.search.SearchResults');



/**
 * The UI for searching for cards.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.admin.search.ui.Search = function() {
  goog.base(this);

  /**
   * @type {!yugi.ui.search.SearchForm}
   * @private
   */
  this.searchForm_ = new yugi.ui.search.SearchForm();

  /**
   * @type {!yugi.ui.search.SearchResults}
   * @private
   */
  this.searchResults_ = new yugi.ui.search.SearchResults('Edit');

  /**
   * @type {!goog.ui.Button}
   * @private
   */
  this.backButton_ = new goog.ui.Button(null);

  this.addChild(this.searchForm_);
  this.addChild(this.searchResults_);
};
goog.inherits(yugi.admin.search.ui.Search, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.admin.search.ui.Search.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.admin.search.ui.Search');


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.admin.search.ui.Search.Id_ = {
  FORM: 'form',
  RESULTS: 'results'
};


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.admin.search.ui.Search.Css_ = {
  SEARCH: goog.getCssName('yugi-admin-search')
};


/** @override */
yugi.admin.search.ui.Search.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.admin.search.ui.soy.SEARCH, {
        ids: this.makeIds(yugi.admin.search.ui.Search.Id_)
      }));
  goog.dom.classes.add(this.getElement(),
      yugi.admin.search.ui.Search.Css_.SEARCH);
};


/** @override */
yugi.admin.search.ui.Search.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.searchForm_.render(this.getElementByFragment(
      yugi.admin.search.ui.Search.Id_.FORM));
  this.searchResults_.render(this.getElementByFragment(
      yugi.admin.search.ui.Search.Id_.RESULTS));

  this.getHandler().listen(this.searchResults_,
      yugi.ui.search.SearchResults.EventType.CARD_ACTION,
      this.onCardAction_);
};


/**
 * Called when a card is acted upon.
 * @param {!yugi.ui.search.SearchResults.CardActionEvent} e The action event.
 * @private
 */
yugi.admin.search.ui.Search.prototype.onCardAction_ = function(e) {

  // Redirect the user to the card edit screen.
  var uri = new goog.Uri();
  uri.setPath(yugi.Config.ServletPath.ADMIN_CARD);
  uri.setParameterValue(yugi.Config.UrlParameter.CARD_KEY, e.card.getKey());
  if (yugi.Config.isDevMode()) {
    uri.setParameterValue(yugi.Config.UrlParameter.MODE, yugi.Config.Mode.DEV);
  }
  window.location.href = uri.toString();
};
