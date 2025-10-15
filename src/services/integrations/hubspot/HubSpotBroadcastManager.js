import { BROADCAST_CHANNEL_NAME, BroadcastMessageTypes, createBroadcastMessage } from 'src/constants/hubspot-softphone-broadcast'
import { ComponentMode } from 'src/utils/HubSpotCallingExtensionsClient'
import * as AgentStatus from 'src/constants/agent-status'
import { DialerStatus } from 'src/constants/dialer-status'

/**
 * HubSpot Broadcast Manager
 *
 * Manages all cross-instance communication between the Calling Remote (HubSpot iframe)
 * and Calling Window (detached popup) using the BroadcastChannel API.
 *
 * Responsibilities:
 * - Initialize and manage BroadcastChannel lifecycle
 * - Send and receive broadcast messages
 * - Handle state synchronization between instances
 * - Manage login synchronization
 */
class HubSpotBroadcastManager {
  constructor (dependencies = {}) {
    this.broadcastChannel = null
    this.componentMode = ComponentMode.UNKNOWN
    this.messageHandlers = new Map()

    // Store dependencies
    this.onMessageCallback = dependencies.onMessageCallback || null
  }

  /**
   * Initializes the BroadcastChannel for cross-instance communication
   *
   * @param {string} componentMode - Component mode (WINDOW or REMOTE)
   * @param {function} onMessageCallback - Callback to handle incoming messages
   * @returns {boolean} True if initialization was successful
   */
  initialize (componentMode, onMessageCallback) {
    this.componentMode = componentMode
    this.onMessageCallback = onMessageCallback

    try {
      this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
      this.broadcastChannel.onmessage = this.handleMessage.bind(this)
      console.log(`[${componentMode}] BroadcastChannel '${BROADCAST_CHANNEL_NAME}' initialized successfully`)
      return true
    } catch (error) {
      console.error(`[${componentMode}] Failed to initialize BroadcastChannel:`, error)
      return false
    }
  }

  /**
   * Handles incoming broadcast messages
   *
   * @param {MessageEvent} event - Broadcast message event
   * @private
   */
  handleMessage (event) {
    const { type, payload } = event.data

    console.log(`[${this.componentMode}] Received broadcast:`, type, payload)

    // Call the component's callback if provided
    if (this.onMessageCallback) {
      this.onMessageCallback(event)
    }

    // Call any registered message type handlers
    if (this.messageHandlers.has(type)) {
      const handler = this.messageHandlers.get(type)
      handler(payload)
    }
  }

  /**
   * Publishes a broadcast message to other instances
   *
   * @param {string} type - Message type from BroadcastMessageTypes
   * @param {object} payload - Message payload data
   * @returns {boolean} True if message was sent successfully
   */
  publish (type, payload = {}) {
    if (!this.broadcastChannel) {
      console.warn(`[${this.componentMode}] Cannot publish broadcast - channel not initialized`)
      return false
    }

    try {
      const message = createBroadcastMessage(type, payload)
      this.broadcastChannel.postMessage(message)
      console.log(`[${this.componentMode}] Published broadcast:`, type, payload)
      return true
    } catch (error) {
      console.error(`[${this.componentMode}] Failed to publish broadcast:`, error)
      return false
    }
  }

  /**
   * Registers a handler for a specific message type
   *
   * @param {string} messageType - Message type from BroadcastMessageTypes
   * @param {function} handler - Handler function to call when message is received
   */
  registerHandler (messageType, handler) {
    this.messageHandlers.set(messageType, handler)
  }

  /**
   * Unregisters a handler for a specific message type
   *
   * @param {string} messageType - Message type from BroadcastMessageTypes
   */
  unregisterHandler (messageType) {
    this.messageHandlers.delete(messageType)
  }

  /**
   * Clears all registered handlers
   */
  clearHandlers () {
    this.messageHandlers.clear()
  }

  /**
   * Closes the BroadcastChannel and cleans up resources
   */
  close () {
    if (this.broadcastChannel) {
      this.broadcastChannel.close()
      this.broadcastChannel = null
      console.log(`[${this.componentMode}] BroadcastChannel closed`)
    }

    this.clearHandlers()
    this.onMessageCallback = null
  }

  /**
   * Checks if the BroadcastChannel is initialized and ready
   *
   * @returns {boolean} True if channel is ready
   */
  isReady () {
    return !!this.broadcastChannel
  }

  /**
   * Broadcasts that an incoming call has started
   *
   * @param {object} communication - Communication object
   * @param {object} contact - Contact object
   */
  broadcastIncomingCallStarted (communication, contact) {
    return this.publish(BroadcastMessageTypes.INCOMING_CALL_STARTED, {
      communication,
      contact
    })
  }

  /**
   * Broadcasts that user accepted an inbound call
   *
   * @param {number} communicationId - Communication ID
   * @param {number} contactId - Contact ID
   */
  broadcastAcceptInboundCall (communicationId, contactId) {
    return this.publish(BroadcastMessageTypes.ACCEPT_INBOUND_CALL, {
      communicationId,
      contactId
    })
  }

  /**
   * Broadcasts that a call is connected
   *
   * @param {object} communication - Communication object
   * @param {object} contact - Contact object
   */
  broadcastCallConnected (communication, contact) {
    return this.publish(BroadcastMessageTypes.CALL_CONNECTED, {
      communication,
      contact
    })
  }

  /**
   * Broadcasts that a call has ended
   *
   * @param {number} callId - Call ID
   * @param {number} endedAt - Timestamp when call ended
   */
  broadcastCallEnded (callId, endedAt) {
    return this.publish(BroadcastMessageTypes.CALL_ENDED, {
      callId,
      endedAt
    })
  }

  /**
   * Broadcasts that a call was cancelled
   *
   * @param {number} communicationId - Communication ID
   */
  broadcastCallCancelled (communicationId) {
    return this.publish(BroadcastMessageTypes.CALL_CANCELLED, {
      communicationId
    })
  }

  /**
   * Requests current call state from the other instance
   *
   * @param {string} requestId - Unique request ID
   */
  requestCurrentState (requestId) {
    return this.publish(BroadcastMessageTypes.REQUEST_CURRENT_STATE, {
      requestId,
      timestamp: Date.now()
    })
  }

  /**
   * Sends current state in response to a state request
   *
   * @param {object} params - State parameters
   * @returns {boolean} True if broadcast was sent
   */
  sendCurrentState (params) {
    const {
      requestId,
      profile,
      dialer,
      incomingCallData,
      activeCallData
    } = params

    const agentStatus = profile?.agent_status
    const dialerStatus = dialer?.currentStatus

    let hasActiveCall = false
    let callType = null
    let communication = null
    let contact = null

    // Check for incoming call (ringing)
    if (agentStatus === AgentStatus.AGENT_STATUS_RINGING) {
      hasActiveCall = true
      callType = 'incoming'
      communication = dialer?.communication || incomingCallData?.communication
      contact = dialer?.contact || incomingCallData?.contact
    } else if (agentStatus === AgentStatus.AGENT_STATUS_ON_CALL ||
               dialerStatus === DialerStatus.CALL_CONNECTED ||
               dialerStatus === DialerStatus.MAKING_CALL) {
      hasActiveCall = true
      callType = 'active'
      communication = dialer?.communication || activeCallData?.communication
      contact = dialer?.contact || activeCallData?.contact
    }

    return this.publish(BroadcastMessageTypes.CURRENT_STATE_RESPONSE, {
      requestId,
      hasActiveCall,
      callType,
      communication,
      contact
    })
  }

  /**
   * Broadcasts that user logged in successfully
   *
   * @param {number} userId - User ID (optional)
   */
  broadcastUserLoggedIn (userId = null) {
    return this.publish(BroadcastMessageTypes.USER_LOGGED_IN, {
      userId,
      timestamp: Date.now()
    })
  }

  /**
   * Broadcasts widget reload request
   *
   * @param {string} reason - Reason for reload
   */
  broadcastWidgetReload (reason = 'user_action') {
    return this.publish(BroadcastMessageTypes.WIDGET_RELOAD_REQUESTED, {
      reason,
      timestamp: Date.now()
    })
  }

  /**
   * Creates a temporary BroadcastChannel, sends a message, and closes it
   * Useful for one-off broadcasts (e.g., login success) where
   * a persistent channel is not needed
   *
   * @param {string} type - Message type
   * @param {object} payload - Message payload
   * @returns {Promise<boolean>} True if message was sent successfully
   */
  static sendOneTimeBroadcast (type, payload = {}) {
    return new Promise((resolve) => {
      try {
        console.log('[Broadcast Manager] Creating one-time BroadcastChannel')
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)

        const message = createBroadcastMessage(type, payload)
        channel.postMessage(message)
        console.log('[Broadcast Manager] One-time broadcast sent:', type, payload)

        channel.close()
        console.log('[Broadcast Manager] One-time BroadcastChannel closed')

        resolve(true)
      } catch (error) {
        console.error('[Broadcast Manager] Failed to send one-time broadcast:', error)
        resolve(false)
      }
    })
  }

  /**
   * Creates a temporary BroadcastChannel for listening to specific message types
   * Useful for temporary listeners (e.g., login form waiting for login from other instance)
   *
   * @param {function} onMessage - Callback to handle messages
   * @returns {object} Object with close method to cleanup the listener
   */
  static createTemporaryListener (onMessage) {
    try {
      console.log('[Broadcast Manager] Creating temporary listener')
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
      channel.onmessage = onMessage

      return {
        close: () => {
          channel.close()
          console.log('[Broadcast Manager] Temporary listener closed')
        }
      }
    } catch (error) {
      console.error('[Broadcast Manager] Failed to create temporary listener:', error)
      return {
        close: () => {}
      }
    }
  }
}

export default HubSpotBroadcastManager
