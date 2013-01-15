/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('yugi.game');
goog.provide('yugi.game.Main');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('yugi.Main');
goog.require('yugi.game.handler.CardTransfer');
goog.require('yugi.game.handler.Connection');
goog.require('yugi.game.handler.DeckSelected');
goog.require('yugi.game.handler.JoinResponse');
goog.require('yugi.game.handler.State');
goog.require('yugi.game.handler.SyncRequest');
goog.require('yugi.game.handler.SyncResponse');
goog.require('yugi.game.handler.WaitForSync');
goog.require('yugi.game.model.Browser');
goog.require('yugi.game.model.Chat');
goog.require('yugi.game.model.ChatInterceptor');
goog.require('yugi.game.model.Decks');
goog.require('yugi.game.model.Game');
goog.require('yugi.game.model.Synchronization');
goog.require('yugi.game.net.Channel');
goog.require('yugi.game.service.LifePoint');
goog.require('yugi.game.service.Resize');
goog.require('yugi.game.service.Sync');
goog.require('yugi.game.ui.Main');
goog.require('yugi.game.ui.State');
goog.require('yugi.model.CardCache');
goog.require('yugi.model.Notifier');
goog.require('yugi.model.Selection');
goog.require('yugi.model.User');
goog.require('yugi.service.AuthService');
goog.require('yugi.service.DeckService');
goog.require('yugi.service.DecksService');



/**
 * The container for all the main components of the application.
 * @param {string} signInOutUrl The URL to use to either sign in or out.
 * @param {string} deckManagerUrl The URL for the deck manager.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} gameKey The key identifying the game session.
 * @param {string} channelToken The token for this clients access to the
 *     appengine channel.
 * @param {string} playerName The name of the player.
 * @constructor
 * @extends {yugi.Main}
 */
yugi.game.Main = function(signInOutUrl, deckManagerUrl, userJson,
    gameKey, channelToken, playerName) {
  goog.base(this);

  this.logger.info('Game key = ' + gameKey);
  this.logger.info('Channel token = ' + channelToken);
  this.logger.info('Player name = ' + playerName);

  // Create all of the model/service classes.

  /**
   * The channel used to communicate with the server.
   * @type {!yugi.game.net.Channel}
   * @private
   */
  this.channel_ = yugi.game.net.Channel.register(channelToken, gameKey,
      playerName);

  // Register generic models.
  var user = yugi.model.User.register(userJson);
  var authService = yugi.service.AuthService.register(
      signInOutUrl, deckManagerUrl);
  var cardCache = yugi.model.CardCache.register();
  var selectionModel = yugi.model.Selection.register();
  var notifier = yugi.model.Notifier.register();

  // Register generic services.
  var deckService = yugi.service.DeckService.register();
  var decksService = yugi.service.DecksService.register();

  // Register game models.
  var game = yugi.game.model.Game.register(gameKey, playerName, deckService,
      cardCache);
  var syncService = yugi.game.service.Sync.register(this.channel_, game);
  var decksModel = yugi.game.model.Decks.register(decksService, user);

  var chatInterceptor = new yugi.game.model.ChatInterceptor(game);
  var chat = yugi.game.model.Chat.register(this.channel_, playerName,
      chatInterceptor);

  var lifePointService = yugi.game.service.LifePoint.register(
      game.getPlayer(), chat, syncService);

  // Setters required because of dependency order.
  chatInterceptor.setChatModel(chat);
  chatInterceptor.setLifePointService(lifePointService);

  var synchronization = yugi.game.model.Synchronization.register(game,
      deckService, cardCache);
  var browser = yugi.game.model.Browser.register();

  // Register UI models.
  var state = yugi.game.ui.State.register();
  var resizeService = yugi.game.service.Resize.register(state);

  // Register handlers.
  var handlers = [
    new yugi.game.handler.CardTransfer(
        this.channel_, game, chat, syncService, cardCache),
    new yugi.game.handler.Connection(this.channel_, game, chat),
    new yugi.game.handler.DeckSelected(this.channel_, game),
    new yugi.game.handler.State(this.channel_, game, cardCache),
    new yugi.game.handler.JoinResponse(this.channel_, game, chat),
    new yugi.game.handler.SyncRequest(this.channel_, game),
    new yugi.game.handler.SyncResponse(this.channel_, synchronization),
    new yugi.game.handler.WaitForSync(this.channel_, synchronization)
  ];

  // Render the main element.
  var dom = goog.dom.getDomHelper();
  var mainComponent = new yugi.game.ui.Main();
  mainComponent.render(dom.getElement('centered'));

  // Register all the disposables.
  this.registerDisposable(mainComponent);
  this.registerDisposable(this.channel_);
  this.registerDisposable(selectionModel);
  this.registerDisposable(cardCache);
  this.registerDisposable(notifier);
  this.registerDisposable(chat);
  this.registerDisposable(chatInterceptor);
  this.registerDisposable(resizeService);
  this.registerDisposable(state);
  this.registerDisposable(game);
  this.registerDisposable(decksModel);
  this.registerDisposable(synchronization);
  this.registerDisposable(browser);
  this.registerDisposable(deckService);
  this.registerDisposable(decksService);
  this.registerDisposable(syncService);
  this.registerDisposable(user);
  this.registerDisposable(authService);
  goog.array.forEach(handlers, function(handler) {
    this.registerDisposable(handler);
  }, this);

  // Start loading the player decks and structure decks.
  decksModel.load();
};
goog.inherits(yugi.game.Main, yugi.Main);


/**
 * @type {!goog.debug.Logger}
 * @protected
 */
yugi.game.Main.prototype.logger = goog.debug.Logger.getLogger('yugi.game.Main');


/**
 * Main entry point to the program.  All bootstrapping happens here.
 * @param {string} signInOutUrl The URL to use to either sign in or out.
 * @param {string} deckManagerUrl The URL for the deck manager.
 * @param {string} userJson The user object as raw JSON.
 * @param {string} gameKey The key identifying the game session.
 * @param {string} channelToken The token for this clients access to the
 *     appengine channel.
 * @param {string} playerName The name of the player.
 */
yugi.game.bootstrap = function(signInOutUrl, deckManagerUrl, userJson,
    gameKey, channelToken, playerName) {
  new yugi.game.Main(signInOutUrl, deckManagerUrl, userJson, gameKey,
      channelToken, playerName);
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('yugi.game.bootstrap', yugi.game.bootstrap);
