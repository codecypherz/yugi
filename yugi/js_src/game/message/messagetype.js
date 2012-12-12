/**
 * Contains the knowledge of all message types.
 */

goog.provide('yugi.game.message.MessageType');


/**
 * The set of all message types used in the application.
 *
 * REMEMBER: Don't forget to update the switch in yugi.net.Channel so messages
 * can be deserialized and processed correctly.
 *
 * @enum {string}
 */
yugi.game.message.MessageType = {
  CARD_TRANSFER: 'card_transfer',
  CHAT: 'chat',
  CONNECTED: 'connected',
  DECK_SELECTED: 'deck_selected',
  DISCONNECTED: 'disconnected',
  JOIN_RESPONSE: 'join_response',
  STATE: 'state',
  SYNC_REQUEST: 'sync_request',
  SYNC_RESPONSE: 'sync_response',
  WAIT_FOR_SYNC: 'wait_for_sync'
};
