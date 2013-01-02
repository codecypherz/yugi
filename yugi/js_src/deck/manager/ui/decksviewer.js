/**
 * Displays an arbitrary list of decks.
 */

goog.provide('yugi.deck.manager.ui.DecksViewer');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.Config');
goog.require('yugi.deck.manager.model.Decks');
goog.require('yugi.deck.manager.model.DeleteAction');
goog.require('yugi.deck.manager.ui.deck.soy');
goog.require('yugi.model.Notifier');
goog.require('yugi.service.DeckService');
goog.require('yugi.service.DecksService');
goog.require('yugi.service.url');
goog.require('yugi.ui.menu.Menu');
goog.require('yugi.util.deck');



/**
 * Displays an arbitrary list of decks.
 * @param {boolean} readOnly True if in read only mode.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.deck.manager.ui.DecksViewer = function(readOnly) {
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this.readOnly_ = readOnly;

  /**
   * @type {!yugi.service.DecksService}
   * @private
   */
  this.decksService_ = yugi.service.DecksService.get();

  /**
   * @type {!yugi.service.DeckService}
   * @private
   */
  this.deckService_ = yugi.service.DeckService.get();

  /**
   * @type {!yugi.deck.manager.model.Decks}
   * @private
   */
  this.decks_ = yugi.deck.manager.model.Decks.get();

  /**
   * @type {!yugi.model.Notifier}
   * @private
   */
  this.notifier_ = yugi.model.Notifier.get();

  /**
   * @type {!Array.<!yugi.ui.menu.Menu>}
   * @private
   */
  this.menus_ = new Array();
};
goog.inherits(yugi.deck.manager.ui.DecksViewer, goog.ui.Component);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.deck.manager.ui.DecksViewer.prototype.logger = goog.debug.Logger.getLogger(
    'yugi.deck.manager.ui.DecksViewer');


/**
 * The CSS names used by this component.
 * @enum {string}
 * @private
 */
yugi.deck.manager.ui.DecksViewer.Css_ = {
  VIEWER: goog.getCssName('yugi-deck-viewer')
};


/** @override */
yugi.deck.manager.ui.DecksViewer.prototype.createDom = function() {
  goog.base(this, 'createDom');
  goog.dom.setTextContent(this.getElement(), 'Loading...');
  goog.dom.classes.add(this.getElement(),
      yugi.deck.manager.ui.DecksViewer.Css_.VIEWER);
};


/** @override */
yugi.deck.manager.ui.DecksViewer.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen to the decks service for when all decks have been loaded.
  this.getHandler().listen(this.decksService_,
      yugi.service.DecksService.EventType.LOADED,
      this.onDecksLoaded_);
  this.getHandler().listen(this.decksService_,
      yugi.service.DecksService.EventType.LOAD_ERROR,
      this.onLoadError_);

  // Listen to the deck service for when a deck has been deleted.
  this.getHandler().listen(this.deckService_,
      yugi.service.DeckService.EventType.DELETED,
      this.onDeckDeleted_);
  this.getHandler().listen(this.deckService_,
      yugi.service.DeckService.EventType.DELETE_ERROR,
      this.onDeleteError_);

  // Listen to the model keeping track of all the decks.
  this.getHandler().listen(this.decks_,
      yugi.deck.manager.model.Decks.EventType.DECKS_CHANGED,
      this.renderDecks_);
};


/**
 * Called when all of the decks have loaded.
 * @param {!yugi.service.DecksService.LoadEvent} e The load event.
 * @private
 */
yugi.deck.manager.ui.DecksViewer.prototype.onDecksLoaded_ = function(e) {
  this.logger.info('Setting the decks on the decks model.');
  this.decks_.setDecks(e.decks);
};


/**
 * Called when a deck was deleted.
 * @private
 */
yugi.deck.manager.ui.DecksViewer.prototype.onDeckDeleted_ = function() {
  this.notifier_.post('Deck successfully deleted.');
};


/**
 * Renders the given decks.
 * @private
 */
yugi.deck.manager.ui.DecksViewer.prototype.renderDecks_ = function() {
  this.logger.info('Rendering decks.');

  // Clear any existing structure.
  var element = this.getElement();
  element.innerHTML = '';
  goog.array.forEach(this.menus_, function(menu) {
    goog.dispose(menu);
  });
  this.menus_ = new Array();

  // Render each deck.
  goog.array.forEach(this.decks_.getDecks(), function(deck) {
    var servlet = this.readOnly_ ?
        yugi.Config.ServletPath.DECK_VIEWER :
        yugi.Config.ServletPath.DECK_EDITOR;
    var deckPath = yugi.service.url.build(
        servlet, yugi.Config.UrlParameter.DECK_KEY, deck.getKey());

    var deckElement = goog.soy.renderAsElement(
        yugi.deck.manager.ui.deck.soy.DECK, {
          deckPath: deckPath,
          name: deck.getName(),
          imageSource: deck.getImageSource(210)
        });
    goog.dom.appendChild(element, deckElement);

    // Don't render actions in read only mode.
    if (!this.readOnly_) {
      // Set up the menus for the deck.
      var actions = new Array();
      actions.push(new yugi.deck.manager.model.DeleteAction(deck, this.decks_));
      var menu = new yugi.ui.menu.Menu(actions);
      menu.render(deckElement);
      this.menus_.push(menu);
    }

  }, this);

  // Don't create the "new deck" deck if in read only mode.
  if (!this.readOnly_) {

    // Figure out the request to make to build a new deck.
    var newDeckRequestStr = yugi.service.url.build(
        yugi.Config.ServletPath.DECK_EDITOR);
    var newDeckRequestUri = goog.Uri.parse(newDeckRequestStr);
    // Forward the structure deck aspect.
    yugi.util.deck.setStructureDeckRequest(newDeckRequestUri,
        yugi.util.deck.isStructureDeckRequest(window.location.href));

    // Render the area for creating a new deck.
    goog.dom.appendChild(element, goog.soy.renderAsElement(
        yugi.deck.manager.ui.deck.soy.NEW_DECK, {
          newDeckPath: newDeckRequestUri.toString()
        }));
  }
};


/**
 * Called when loading the decks fail.
 * @private
 */
yugi.deck.manager.ui.DecksViewer.prototype.onLoadError_ = function() {
  this.notifier_.post('Failed to load any decks.  Try refreshing the page.',
      true);
};


/**
 * Called when deleting the deck fails.
 * @private
 */
yugi.deck.manager.ui.DecksViewer.prototype.onDeleteError_ = function() {
  this.notifier_.post('Failed to delete the deck.  Try refreshing the page.',
      true);
};
