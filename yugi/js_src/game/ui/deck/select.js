/**
 * This is the UI for choosing a deck to play with.
 */

goog.provide('yugi.game.ui.deck.Select');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.ui.Component');
goog.require('yugi.game.message.DeckSelected');
goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.Decks');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.net.Channel');
goog.require('yugi.game.ui.deck.select.soy');
goog.require('yugi.model.User');



/**
 * This is the deck selection UI.
 * @constructor
 * @extends {goog.ui.Component}
 */
yugi.game.ui.deck.Select = function() {
  goog.base(this);

  /**
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = yugi.game.net.Channel.get();

  /**
   * @type {!yugi.game.model.Decks}
   * @private
   */
  this.decksModel_ = yugi.game.model.Decks.get();

  /**
   * @type {!yugi.model.User}
   * @private
   */
  this.user_ = yugi.model.User.get();

  /**
   * @type {!yugi.game.model.Game}
   * @private
   */
  this.game_ = yugi.game.model.Game.get();

  /**
   * @type {!yugi.game.model.Chat}
   * @private
   */
  this.chat_ = yugi.game.model.Chat.get();
};
goog.inherits(yugi.game.ui.deck.Select, goog.ui.Component);


/**
 * DOM IDs used within this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.deck.Select.Id_ = {
  PLAYER_DECKS: 'player-decks',
  STRUCTURE_DECKS: 'structure-decks'
};


/**
 * The CSS classes used by this component.
 * @enum {string}
 * @private
 */
yugi.game.ui.deck.Select.Css_ = {
  ROOT: goog.getCssName('yugi-deck-select')
};


/** @override */
yugi.game.ui.deck.Select.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsElement(
      yugi.game.ui.deck.select.soy.HTML, {
        ids: this.makeIds(yugi.game.ui.deck.Select.Id_),
        signedIn: this.user_.isSignedIn()
      }));
  goog.dom.classes.add(this.getElement(), yugi.game.ui.deck.Select.Css_.ROOT);
};


/** @override */
yugi.game.ui.deck.Select.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen for when the full set of decks return from the server.
  this.getHandler().listen(this.decksModel_,
      yugi.game.model.Decks.EventType.STRUCTURE_DECKS_LOADED,
      this.renderStructureDecks_);
  this.getHandler().listen(this.decksModel_,
      yugi.game.model.Decks.EventType.USER_DECKS_LOADED,
      this.renderUserDecks_);

  this.maybeRenderDecks_();
};


/**
 * Renders decks if the data is already there.
 * @private
 */
yugi.game.ui.deck.Select.prototype.maybeRenderDecks_ = function() {
  if (this.decksModel_.getStructureDecks()) {
    this.renderStructureDecks_();
  }
  if (this.decksModel_.getUserDecks()) {
    this.renderUserDecks_();
  }
};


/**
 * Renders the structure decks.
 * @private
 */
yugi.game.ui.deck.Select.prototype.renderStructureDecks_ = function() {
  var element = this.getElementByFragment(
      yugi.game.ui.deck.Select.Id_.STRUCTURE_DECKS);
  element = goog.asserts.assert(element);
  var decks = goog.asserts.assert(this.decksModel_.getStructureDecks());
  this.renderDecks_(element, decks);
};


/**
 * Renders the user decks.
 * @private
 */
yugi.game.ui.deck.Select.prototype.renderUserDecks_ = function() {
  var element = this.getElementByFragment(
      yugi.game.ui.deck.Select.Id_.PLAYER_DECKS);
  element = goog.asserts.assert(element);
  var decks = goog.asserts.assert(this.decksModel_.getUserDecks());
  this.renderDecks_(element, decks);
};


/**
 * Render all the decks into the given element.
 * @param {!Element} element The element into which to render the decks.
 * @param {!Array.<!yugi.model.Deck>} decks The decks to render.
 * @private
 */
yugi.game.ui.deck.Select.prototype.renderDecks_ = function(element, decks) {

  // Clear the children, then render.
  goog.dom.removeChildren(element);

  // Render differently if no decks were found.
  if (decks.length == 0) {
    // The assumption here is that there is always at least one structure deck,
    // so the message is aimed at the absence of player decks for the signed in
    // user.
    goog.dom.setTextContent(element, 'You have not created any decks yet.');
  } else {

    // Render each deck.
    goog.array.forEach(decks, function(deck) {

      var deckElement = goog.soy.renderAsElement(
          yugi.game.ui.deck.select.soy.DECK, {
            name: deck.getName(),
            imageSource: deck.getImageSource(210),
            deckId: deck.getKey(),
            deckName: deck.getName()
          });
      goog.dom.appendChild(element, deckElement);

      // Listen for when the deck is clicked.
      this.getHandler().listen(deckElement,
          goog.events.EventType.CLICK,
          goog.bind(this.onDeckClick_, this, deck));

    }, this);
  }
};


/**
 * Called when a deck is clicked.
 * @param {!yugi.model.Deck} deck The deck that was clicked.
 * @private
 */
yugi.game.ui.deck.Select.prototype.onDeckClick_ = function(deck) {

  // Tell the opponent about the game state change.
  this.chat_.sendSystemRemote(
      this.game_.getPlayer().getName() + ' chose a deck and shuffled it.');

  // Start loading the deck the player just selected.
  var deckKey = deck.getKey();
  this.game_.getPlayer().selectDeck(deckKey);

  // Tell the other player about the deck selection.
  var deckSelectedMessage = new yugi.game.message.DeckSelected();
  deckSelectedMessage.setDeckKey(deckKey);
  this.channel_.send(deckSelectedMessage);
};
