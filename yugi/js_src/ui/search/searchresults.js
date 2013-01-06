/**
 * The UI for displaying the results of card searches.
 */

goog.provide('yugi.ui.search.SearchResults');
goog.provide('yugi.ui.search.SearchResults.CardActionEvent');
goog.provide('yugi.ui.search.SearchResults.EventType');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('yugi.model.Card');
goog.require('yugi.model.Search');
goog.require('yugi.model.Selection');
goog.require('yugi.ui.search.soy');



/**
 * The UI for resulting card searches.
 * @param {string} actionButtonText The text to show on each button in the
 *     search results.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.ui.search.SearchResults = function(actionButtonText) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.actionButtonText_ = actionButtonText;

  /**
   * @type {!yugi.model.Search}
   * @private
   */
  this.search_ = yugi.model.Search.get();

  /**
   * @type {!yugi.model.Selection}
   * @private
   */
  this.selection_ = yugi.model.Selection.get();

  /**
   * @type {!goog.events.EventHandler}
   * @private
   */
  this.resultsHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.resultsHandler_);
};
goog.inherits(yugi.ui.search.SearchResults, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.ui.search.SearchResults.prototype.logger =
    goog.debug.Logger.getLogger('yugi.ui.search.SearchResults');


/**
 * @type {Element}
 * @private
 */
yugi.ui.search.SearchResults.prototype.emptyContent_;


/**
 * @type {Element}
 * @private
 */
yugi.ui.search.SearchResults.prototype.table_;


/**
 * The set of buttons for rendered rows.
 * @type {Array.<!goog.ui.Button>}
 * @private
 */
yugi.ui.search.SearchResults.prototype.rowButtons_;


/**
 * The types of events dispatched by this component.
 * @enum {string}
 */
yugi.ui.search.SearchResults.EventType = {
  CARD_ACTION: goog.events.getUniqueId('card-action')
};


/**
 * The DOM IDs used in this component.
 * @enum {string}
 * @private
 */
yugi.ui.search.SearchResults.Id_ = {
  EMPTY_CONTENT: 'empty-content',
  TABLE: 'table'
};


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.ui.search.SearchResults.Css_ = {
  CELL: goog.getCssName('yugi-search-cell'),
  MONSTER: goog.getCssName('yugi-monster-card'),
  ROW: goog.getCssName('yugi-search-row'),
  ROW_ACTION_BUTTON: goog.getCssName('yugi-search-results-action-button'),
  SPELL: goog.getCssName('yugi-spell-card'),
  TRAP: goog.getCssName('yugi-trap-card')
};


/**
 * Maps the card to type to a CSS class.
 * @type {!Object.<!yugi.model.Card.Type, string>}
 * @const
 * @private
 */
yugi.ui.search.SearchResults.TYPE_TO_CSS_ = goog.object.create(
    yugi.model.Card.Type.MONSTER, yugi.ui.search.SearchResults.Css_.MONSTER,
    yugi.model.Card.Type.SPELL, yugi.ui.search.SearchResults.Css_.SPELL,
    yugi.model.Card.Type.TRAP, yugi.ui.search.SearchResults.Css_.TRAP);


/** @override */
yugi.ui.search.SearchResults.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.ui.search.soy.RESULTS, {
        ids: this.makeIds(yugi.ui.search.SearchResults.Id_)
      }));
};


/** @override */
yugi.ui.search.SearchResults.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Grab element references.
  this.table_ = this.getElementByFragment(
      yugi.ui.search.SearchResults.Id_.TABLE);
  this.emptyContent_ = this.getElementByFragment(
      yugi.ui.search.SearchResults.Id_.EMPTY_CONTENT);

  // Hide the table initially.
  goog.style.showElement(this.table_, false);

  this.getHandler().listen(this.search_,
      yugi.model.Search.EventType.SEARCHING,
      this.onSearching_);
  this.getHandler().listen(this.search_,
      yugi.model.Search.EventType.RESULTS,
      this.onResults_);
};


/** @override */
yugi.ui.search.SearchResults.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');
  this.resultsHandler_.removeAll();
};


/**
 * Called when search results are returned.
 * @param {!yugi.model.Search.ResultsEvent} e The results event.
 * @private
 */
yugi.ui.search.SearchResults.prototype.onResults_ = function(e) {
  this.logger.info('Rendering search results.');

  var dom = this.getDomHelper();
  var css = yugi.ui.search.SearchResults.Css_;

  // Wipe the table clean.
  this.clearResults_();

  var cards = e.cards;
  goog.style.showElement(this.emptyContent_, cards.length == 0);
  goog.style.showElement(this.table_, cards.length > 0);

  // If there are no cards, then we can leave early.
  if (cards.length == 0) {
    this.showEmptyResults_();
    return;
  }

  var cardButtonList = new Array();

  // Create a tbody to add to the table.  This is for efficient DOM
  // manipulation, since the tbody will be in memory but not actually in the
  // DOM.  Rendering per row would be really slow.
  var tbody = dom.createDom(goog.dom.TagName.TBODY);

  var firstRow = null;

  // We have cards, so render all the rows.
  goog.array.forEach(cards, function(card) {
    var row = dom.createDom(goog.dom.TagName.TR);
    if (!firstRow) {
      firstRow = row;
    }
    tbody.appendChild(row);
    var rowClass = yugi.ui.search.SearchResults.TYPE_TO_CSS_[card.getType()];
    goog.dom.classes.add(row, css.ROW, rowClass);

    // Listen to row focus.
    this.resultsHandler_.listen(row,
        goog.events.EventType.CLICK,
        goog.bind(this.selection_.setSelected, this.selection_,
            card, row));

    // Name
    var nameCell = this.appendCell_(row);
    goog.dom.setTextContent(nameCell, card.getName());

    // Type
    var typeCell = this.appendCell_(row);
    goog.dom.setTextContent(typeCell, card.getType());

    // The action button for the row.
    var buttonCell = this.appendCell_(row);
    var button = dom.createDom(goog.dom.TagName.BUTTON);
    goog.dom.setTextContent(button, this.actionButtonText_);
    goog.dom.classes.add(button, css.ROW_ACTION_BUTTON);
    buttonCell.appendChild(button);

    // Create a card/button pair and add it to the list.
    cardButtonList.push({
      card: card,
      buttonElement: button
    });
  }, this);

  this.table_.appendChild(tbody);

  // Select the first card.
  this.selection_.setSelected(cards[0], firstRow);

  // Delay the decoration of the buttons to make the UI appear snappier.
  goog.Timer.callOnce(
      goog.bind(this.decorateRowButtons_, this, cardButtonList), 0, this);
};


/**
 * Creates a cell element.
 * @param {!Element} row The row to which to append.
 * @return {!Element} The newly created/appended cell.
 * @private
 */
yugi.ui.search.SearchResults.prototype.appendCell_ = function(row) {
  var cell = goog.dom.createDom(
      goog.dom.TagName.TD,
      yugi.ui.search.SearchResults.Css_.CELL);
  row.appendChild(cell);
  return cell;
};


/**
 * Decorates the given button elements with closure buttons and adds listeners
 * that will take action on the card.
 * @param {!Array.<{card: !yugi.model.Card, buttonElement: !Element}>}
 *     cardButtonList The list of card/button pairs to which to attach closure
 *     buttons.
 * @private
 */
yugi.ui.search.SearchResults.prototype.decorateRowButtons_ =
    function(cardButtonList) {

  this.rowButtons_ = new Array();

  // Loop through each of the buttons to decorate and listen to them.
  goog.array.forEach(cardButtonList, function(cardButtonPair) {

    var card = cardButtonPair.card;
    var buttonElement = cardButtonPair.buttonElement;

    var button = new goog.ui.Button(null);
    this.rowButtons_.push(button);
    button.decorate(buttonElement);

    this.resultsHandler_.listen(button,
        goog.ui.Component.EventType.ACTION,
        goog.bind(this.onRowButtonAction_, this, card));

  }, this);
};


/**
 * Called when a row button is clicked.
 * @param {!yugi.model.Card} card The card that the action should be taken.
 * @private
 */
yugi.ui.search.SearchResults.prototype.onRowButtonAction_ = function(card) {
  this.dispatchEvent(new yugi.ui.search.SearchResults.CardActionEvent(card));
};


/**
 * Called when a search has started.
 * @private
 */
yugi.ui.search.SearchResults.prototype.onSearching_ = function() {
  this.clearResults_();
  goog.dom.setTextContent(this.emptyContent_, 'Searching...');
  goog.style.showElement(this.emptyContent_, true);
  goog.style.showElement(this.table_, false);
};


/**
 * Called when there are no results for a query.
 * @private
 */
yugi.ui.search.SearchResults.prototype.showEmptyResults_ = function() {
  goog.dom.setTextContent(this.emptyContent_, 'No cards found.');
  goog.style.showElement(this.emptyContent_, true);
  goog.style.showElement(this.table_, false);
};


/**
 * Clears all the search results UI.
 * @private
 */
yugi.ui.search.SearchResults.prototype.clearResults_ = function() {
  // Remove any previously decorated buttons.
  if (this.rowButtons_) {
    this.resultsHandler_.removeAll();
    goog.disposeAll(this.rowButtons_);
    this.rowButtons_ = null;
  }

  // Clear the table.
  this.table_.innerHTML = '';
};


/** @override */
yugi.ui.search.SearchResults.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.disposeAll(this.rowButtons_);
};



/**
 * The event that gets dispatched when a card should have action taken on it.
 * @param {!yugi.model.Card} card The card on which to take action.
 * @constructor
 * @extends {goog.events.Event}
 */
yugi.ui.search.SearchResults.CardActionEvent = function(card) {
  goog.base(this, yugi.ui.search.SearchResults.EventType.CARD_ACTION);

  /**
   * @type {!yugi.model.Card}
   */
  this.card = card;
};
goog.inherits(yugi.ui.search.SearchResults.CardActionEvent, goog.events.Event);
