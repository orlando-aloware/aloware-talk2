/**
 * HubSpot SoftPhone - Broadcast Channel Constants
 *
 * This file contains constants and types for cross-instance communication
 * between the Calling Remote (UI in HubSpot iframe) and Calling Window
 * (detached window with actual call logic).
 *
 * @see https://developers.hubspot.com/docs/apps/legacy-apps/extensions/calling-extensions/receive-incoming-calls
 */

/**
 * Broadcast Channel name for cross-instance communication (REMOTE <-> WINDOW)
 * This channel enables the Calling Remote and Calling Window to sync state
 */
export const BROADCAST_CHANNEL_NAME = 'hubspot-softphone-calling'

/**
 * Broadcast message types for REMOTE <-> WINDOW communication
 * These standardize the messages sent between Calling Remote and Calling Window
 *
 * - Calling Remote: Embedded in HubSpot, shows UI, sends user actions
 * - Calling Window: Detached window, handles Twilio connection, sends call state updates
 */
export const BroadcastMessageTypes = Object.freeze({
  /**
   * Sent when an inbound call is received from Aloware
   * Direction: WINDOW -> REMOTE
   */
  INCOMING_CALL_STARTED: 'INCOMING_CALL_STARTED',

  /**
   * Sent when a user accepts an inbound call in REMOTE mode
   * Direction: REMOTE -> WINDOW
   */
  ACCEPT_INBOUND_CALL: 'ACCEPT_INBOUND_CALL',

  /**
   * Sent when call audio is established and parties can hear each other
   */
  CALL_CONNECTED: 'CALL_CONNECTED',

  /**
   * Sent when either party hangs up the call
   * Direction: WINDOW -> REMOTE
   */
  CALL_ENDED: 'CALL_ENDED',

  /**
   * Sent when a call is canceled before connecting
   * Direction: REMOTE <-> WINDOW
   */
  CALL_CANCELLED: 'CALL_CANCELLED',

  /**
   * Sent when Remote loads and needs current call state from Window
   * Direction: REMOTE -> WINDOW
   */
  REQUEST_CURRENT_STATE: 'REQUEST_CURRENT_STATE',

  /**
   * Sent in response to REQUEST_CURRENT_STATE with current call information
   * Direction: WINDOW -> REMOTE
   */
  CURRENT_STATE_RESPONSE: 'CURRENT_STATE_RESPONSE',

  /**
   * Sent when a user successfully logs in from either instance
   * Direction: WINDOW <-> REMOTE
   */
  USER_LOGGED_IN: 'USER_LOGGED_IN',

  /**
   * Sent when user clicks reload widget button
   * Direction: WINDOW <-> REMOTE
   */
  WIDGET_RELOAD_REQUESTED: 'WIDGET_RELOAD_REQUESTED'
})

/**
 * Helper function to create a standardized broadcast message
 * @param {string} type - Message type from BroadcastMessageTypes
 * @param {object} payload - Message payload data
 * @returns {object} Standardized message object
 */
export function createBroadcastMessage (type, payload = {}) {
  return {
    type,
    payload,
    timestamp: Date.now()
  }
}
