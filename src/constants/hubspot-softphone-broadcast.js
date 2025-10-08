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
 * Broadcast Channel name for cross-instance communication (remote ↔ window)
 * This channel enables the Calling Remote and Calling Window to sync state
 */
export const BROADCAST_CHANNEL_NAME = 'hubspot-softphone-calling'

/**
 * Broadcast message types for remote ↔ window communication
 * These standardize the messages sent between Calling Remote and Calling Window
 *
 * Architecture:
 * - Calling Remote: Embedded in HubSpot, shows UI, sends user actions
 * - Calling Window: Detached window, handles Twilio connection, sends call state updates
 */
export const BroadcastMessageTypes = Object.freeze({
  // ============================================
  // Outbound Call Events
  // ============================================
  /**
   * Sent when user clicks to dial a number in HubSpot
   * Direction: Remote → Window
   * Payload: { phoneNumber, contactName, campaignId, hubspotDialNumber }
   */
  OUTGOING_CALL_STARTED: 'OUTGOING_CALL_STARTED',

  /**
   * Sent when the call is actually being placed via Twilio
   * Direction: Window → Remote
   * Payload: { phoneNumber, contactId, callId }
   */
  OUTGOING_CALL_INITIATED: 'OUTGOING_CALL_INITIATED',

  // ============================================
  // Inbound Call Events
  // ============================================
  /**
   * Sent when an inbound call is received from Aloware
   * Direction: Window → Remote
   * Payload: { communication, contact }
   */
  INCOMING_CALL_STARTED: 'INCOMING_CALL_STARTED',

  /**
   * Sent when the inbound call invite is processed by Twilio
   * Direction: Window → Remote
   * Payload: { callId, communicationId }
   */
  INCOMING_CALL_RECEIVED: 'INCOMING_CALL_RECEIVED',

  // ============================================
  // Call State Events
  // ============================================
  /**
   * Sent when a call is answered (inbound or outbound)
   * Direction: Window → Remote
   * Payload: { callId, answeredAt }
   */
  CALL_ANSWERED: 'CALL_ANSWERED',

  /**
   * Sent when call audio is established and parties can hear each other
   * Direction: Window → Remote
   * Payload: { callId, connectedAt }
   */
  CALL_CONNECTED: 'CALL_CONNECTED',

  /**
   * Sent when either party hangs up the call
   * Direction: Window → Remote (or Remote → Window for user-initiated hangup)
   * Payload: { callId, endedAt, duration }
   */
  CALL_ENDED: 'CALL_ENDED',

  /**
   * Sent when call wrap-up/disposition is completed
   * Direction: Window → Remote
   * Payload: { callId, dispositionId, notes }
   */
  CALL_COMPLETED: 'CALL_COMPLETED',

  /**
   * Sent when a call is cancelled before connecting
   * Direction: Remote → Window (or Window → Remote)
   * Payload: { callId, reason }
   */
  CALL_CANCELLED: 'CALL_CANCELLED',

  // ============================================
  // Agent State Events
  // ============================================
  /**
   * Sent when agent changes their status
   * Direction: Remote → Window (or Window → Remote)
   * Payload: { agentStatus, previousStatus }
   */
  AGENT_STATUS_CHANGED: 'AGENT_STATUS_CHANGED',

  /**
   * Sent when agent becomes available for calls
   * Direction: Remote → Window
   * Payload: { agentId, timestamp }
   */
  AGENT_AVAILABLE: 'AGENT_AVAILABLE',

  /**
   * Sent when agent goes unavailable (break, logged out, etc.)
   * Direction: Remote → Window
   * Payload: { agentId, reason, timestamp }
   */
  AGENT_UNAVAILABLE: 'AGENT_UNAVAILABLE',

  // ============================================
  // Configuration Events
  // ============================================
  /**
   * Sent when the selected campaign changes
   * Direction: Remote → Window (or Window → Remote)
   * Payload: { campaignId, campaignName }
   */
  CAMPAIGN_CHANGED: 'CAMPAIGN_CHANGED',

  // ============================================
  // Error Events
  // ============================================
  /**
   * Sent when an error occurs that needs to be broadcast
   * Direction: Window → Remote (or Remote → Window)
   * Payload: { errorType, errorMessage, errorDetails }
   */
  ERROR_OCCURRED: 'ERROR_OCCURRED'
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

/**
 * Helper function to validate a broadcast message
 * @param {object} message - Message to validate
 * @returns {boolean} True if message is valid
 */
export function isValidBroadcastMessage (message) {
  if (!message || typeof message !== 'object') {
    return false
  }

  if (!message.type || typeof message.type !== 'string') {
    return false
  }

  if (!Object.values(BroadcastMessageTypes).includes(message.type)) {
    return false
  }

  return true
}
