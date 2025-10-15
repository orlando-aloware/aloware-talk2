import * as AgentStatus from 'src/constants/agent-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { DialerStatus } from 'src/constants/dialer-status'
import { DisplayState } from 'src/constants/hubspot-widget-display-states'
import { ComponentMode } from 'src/utils/HubSpotCallingExtensionsClient'

/**
 * HubSpot Widget Service
 *
 * Handles all business logic for the HubSpot calling widget, including:
 * - Call state management (incoming/active calls)
 * - Call flow orchestration (outbound/inbound)
 * - Contact fetching and campaign management
 * - Call validation and status checking
 * - UI state transitions
 */
class HubSpotWidgetService {
  constructor (dependencies) {
    // Vue dependencies (passed via dependency injection)
    this.$axios = dependencies.$axios
    this.$VueEvent = dependencies.$VueEvent
    this.$generalNotification = dependencies.$generalNotification
    this.$options = dependencies.$options // for filters
    this.$bvModal = dependencies.$bvModal

    // Vuex actions (passed via dependency injection)
    this.vuexActions = dependencies.vuexActions

    // Internal state
    this.incomingCallData = null
    this.activeCallData = null
    this.contactDetails = {
      contactName: '',
      contactTimezone: '',
      companyName: '',
      contactId: null
    }
  }

  // ============================================
  // Call State Management
  // ============================================

  /**
   * Shows incoming call UI (Used in REMOTE mode)
   *
   * @param {object} payload - Call payload with communication and contact
   * @param {object} dialerState - Current dialer state
   * @param {object} profileState - Current profile/agent state
   * @returns {object} Updated state { displayState, incomingCallData }
   */
  showIncomingCall (payload, dialerState, profileState) {
    const { communication, contact } = payload

    // Safety check: If call is already connected (check both dialer and agent status)
    const isCallConnected = dialerState?.currentStatus === DialerStatus.CALL_CONNECTED ||
                           profileState?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL

    if (isCallConnected) {
      console.log('[HubSpot Widget] Call already connected/on-call, showing active call UI instead of incoming')
      return this.showActiveCall({ communication, contact })
    }

    this.incomingCallData = { communication, contact }

    return {
      displayState: DisplayState.INCOMING_CALL,
      incomingCallData: this.incomingCallData
    }
  }

  /**
   * Hides incoming call UI (Used in REMOTE mode)
   *
   * @param {object} dialerState - Current dialer state
   * @param {object} profileState - Current profile/agent state
   * @returns {object} Updated state { displayState, incomingCallData, shouldWait }
   */
  hideIncomingCall (dialerState, profileState) {
    console.log('[HubSpot Widget] Hiding incoming call UI')

    // If call is already connected (check both dialer and agent status)
    // Don't transition to READY_FOR_CALLS - wait for CALL_CONNECTED broadcast
    const isCallConnected = dialerState?.currentStatus === DialerStatus.CALL_CONNECTED ||
                           profileState?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL

    if (isCallConnected) {
      console.log('[HubSpot Widget] Call already connected/on-call - keeping current state, waiting for broadcast')
      // Don't clear incomingCallData yet - keep it so we can use it for active call UI
      return {
        shouldWait: true,
        displayState: null,
        incomingCallData: this.incomingCallData
      }
    }

    this.incomingCallData = null

    return {
      shouldWait: false,
      displayState: DisplayState.READY_FOR_CALLS,
      incomingCallData: null
    }
  }

  /**
   * Shows active call UI in REMOTE mode
   *
   * @param {object} payload - Call payload with communication and contact
   * @returns {object} Updated state { displayState, activeCallData, incomingCallData }
   */
  showActiveCall (payload) {
    const { communication, contact } = payload

    console.log('[HubSpot Widget] Displaying active call UI for:', contact?.name)

    // Force clear any incoming call state
    this.incomingCallData = null

    this.activeCallData = { communication, contact }

    return {
      displayState: DisplayState.CALLING_REMOTE_ACTIVE_CALL,
      activeCallData: this.activeCallData,
      incomingCallData: null
    }
  }

  /**
   * Hides active call UI in REMOTE mode
   * @param {object} profileState - Current profile/agent state
   * @param {boolean} checkForceDisposition - Whether force disposition is required
   * @returns {object} Updated state { displayState, activeCallData, shouldKeepUI }
   */
  hideActiveCall (profileState, checkForceDisposition) {
    // If agent is in wrap-up, KEEP showing the Active Call UI with contact info
    // It will transition to Ready for Calls when wrap-up completes
    if (profileState?.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && checkForceDisposition) {
      console.log('[HubSpot Widget] Agent in wrap-up - keeping Active Call UI visible')
      return {
        shouldKeepUI: true,
        displayState: null,
        activeCallData: this.activeCallData
      }
    }

    console.log('[HubSpot Widget] No wrap-up - clearing Active Call UI')
    this.activeCallData = null

    return {
      shouldKeepUI: false,
      displayState: DisplayState.READY_FOR_CALLS,
      activeCallData: null
    }
  }

  /**
   * Initiates an outbound call
   *
   * @param {object} params - Call initiation parameters
   * @returns {object} Result with success status and updated state
   */
  async initiateOutboundCall (params) {
    const {
      dialer,
      profile,
      hubspotDialNumber,
      isAlwaysAskModeEnabled,
      campaignId,
      shouldUseCompanyCampaignId,
      shouldUseProfileCampaignId,
      currentCompany
    } = params

    this.$bvModal.hide('daytime-hours-confirmation')

    try {
      // Wait for dialer token generation with timeout
      const tokenGenerationTimeoutMs = 15000 // 15 seconds
      const tokenGenerationStartTime = Date.now()

      while (dialer.currentStatus === DialerStatus.GENERATING_TOKEN) {
        console.log('waiting for dialer token to be generated', dialer.currentStatus)

        // Check if we've exceeded the timeout
        if ((Date.now() - tokenGenerationStartTime) > tokenGenerationTimeoutMs) {
          console.error('Timeout waiting for dialer token generation')
          this.$generalNotification('Failed to initialize dialer. Please try again.', 'error', 5000, true)
          return {
            success: false,
            displayState: DisplayState.CRITICAL_ERROR_HAPPENED,
            error: 'Token generation timeout'
          }
        }

        await new Promise(resolve => setTimeout(resolve, 500)) // Check every 0.5sec
      }

      // Fetch contact details
      const contactResult = await this.fetchContactDetails(hubspotDialNumber, isAlwaysAskModeEnabled)
      if (!contactResult.success) {
        return {
          success: false,
          displayState: DisplayState.CRITICAL_ERROR_HAPPENED,
          error: contactResult.error
        }
      }

      // Update campaign ID if fetched
      let updatedCampaignId = campaignId
      if (contactResult.campaignId) {
        updatedCampaignId = contactResult.campaignId
      }

      const contactDetails = contactResult.contactDetails
      const lastCall = contactResult.lastCall

      // Check for active call status
      const hasActiveCall = this.validateActiveCallStatus(profile, dialer, null, profile?.last_call)
      if (hasActiveCall) {
        return {
          success: false,
          hasActiveCall: true
        }
      }

      // If dialing is initiating and current profile status is on wrap-up, reset agent status
      if (profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
        this.vuexActions.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-ResetAgentStatus')
      }

      this.$VueEvent.fire('resetCall')

      // Determine default campaign ID if not in always-ask mode
      if (!isAlwaysAskModeEnabled) {
        const defaultCampaignId = this.resolveDefaultCampaign(
          profile,
          currentCompany,
          shouldUseCompanyCampaignId,
          shouldUseProfileCampaignId
        )

        if (defaultCampaignId) {
          updatedCampaignId = defaultCampaignId
        }
      }

      return {
        success: true,
        displayState: DisplayState.HIDE,
        campaignId: updatedCampaignId,
        contactDetails: contactDetails,
        lastCall: lastCall
      }
    } catch (error) {
      console.error('Error during initiateOutboundCall:', error)
      return {
        success: false,
        displayState: DisplayState.CRITICAL_ERROR_HAPPENED,
        error: error.message
      }
    }
  }

  /**
   * Executes the dial flow logic - determines what action to take based on current state
   *
   * DIAL FLOW:
   * 1. Check for active call -> Skip if call in progress
   * 2. Check widget visibility -> Show alert if hidden
   * 3. Check for parked call -> Show alert if call is parked
   * 4. Validate all conditions:
   *    - HubSpot SDK initialized
   *    - Widget is visible
   *    - Component initialized
   *    - User profile loaded
   *    - Dialer is ready
   *    - Campaign selected (or always-ask mode enabled)
   *    - Not in forced disposition wrap-up
   * 5. If all conditions met → Make the call
   * 6. If dialer not ready → Retry after delay
   * 7. Otherwise → Show dialer UI for user interaction
   *
   * @returns {object} Result with action to take:
   *   - action: 'skip' | 'show_alert' | 'make_call' | 'retry' | 'show_dialer'
   *   - displayState: DisplayState constant
   *   - reason: String explaining why this action was chosen
   *   - retryDelay: Number of ms to wait before retry (if action is 'retry')
   */
  executeDialFlow (params) {
    const {
      dialer,
      profile,
      isCallingWidgetVisible,
      campaignId,
      isAlwaysAskModeEnabled,
      checkForceDisposition,
      callExtensionsInitialized,
      initialized
    } = params

    // Step 1: Validate no active call in progress
    const hasActiveCall = this.validateActiveCallStatus(profile, dialer, null, profile?.last_call)
    if (hasActiveCall) {
      return { action: 'skip', reason: 'active_call' }
    }

    // Step 2: Ensure widget is visible
    if (!isCallingWidgetVisible) {
      return {
        action: 'show_alert',
        displayState: DisplayState.SHOW_ALERT_CALL_FINISHED,
        reason: 'widget_hidden'
      }
    }

    // Step 3: Check for parked call (another call on hold)
    if (dialer?.parkedCall) {
      return {
        action: 'show_alert',
        displayState: DisplayState.SHOW_ALERT_AGENT_ON_CALL,
        reason: 'parked_call'
      }
    }

    // Step 4: Check if all conditions are met to make the call
    const canMakeCall = callExtensionsInitialized &&
      isCallingWidgetVisible &&
      initialized &&
      profile &&
      dialer?.isReady &&
      // If campaign is selected, ensure we're not in always-ask mode (which requires manual selection of the campaign)
      (campaignId !== null ? !isAlwaysAskModeEnabled : false) &&
      // If in wrap-up, ensure force disposition is not blocking
      (profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP ? !checkForceDisposition : true)

    // Step 5: All conditions met - proceed with call
    if (canMakeCall) {
      return {
        action: 'make_call',
        displayState: DisplayState.HIDE
      }
    }

    // Step 6: Dialer not ready - retry after delay
    if (!dialer?.isReady) {
      return {
        action: 'retry',
        retryDelay: 1000
      }
    }

    // Step 7: Conditions not met - show dialer UI for user interaction
    return {
      action: 'show_dialer',
      reason: 'conditions_not_met'
    }
  }

  /**
   * Validates parameters and initiates a call
   *
   * @param {object} params - Call parameters
   * @returns {object} Result with success status and call params
   */
  placeCall (params) {
    const { campaignId, hubspotDialNumber, contactDetails, profile, dialer } = params

    console.log('[HubSpot Widget] makeCall started')
    console.log('[HubSpot Widget] Current state:', {
      campaignId,
      hubspotDialNumber,
      contactDetails
    })

    if (!campaignId) {
      console.log('[HubSpot Widget] Campaign ID is null')
      this.$generalNotification('The dialer does not meet all the required criteria to start calling.', 'error', 5000, true)
      return {
        success: false,
        displayState: DisplayState.CRITICAL_ERROR_HAPPENED,
        error: 'Missing campaign ID'
      }
    }

    // Validate no active call
    const hasActiveCall = this.validateActiveCallStatus(profile, dialer, null, profile?.last_call)
    if (hasActiveCall) {
      console.log('[HubSpot Widget] validateHasActiveCallStatus returned true, returning early')
      return {
        success: false,
        hasActiveCall: true
      }
    }

    const callParams = {
      currentNumber: this.$options.filters.fixPhone(hubspotDialNumber?.phoneNumber),
      outboundCampaignId: campaignId.toString(),
      contactName: contactDetails.contactName,
      companyName: contactDetails.companyName,
      contactId: contactDetails.contactId
    }

    return {
      success: true,
      displayState: DisplayState.HIDE,
      callParams: callParams
    }
  }

  /**
   * Handles incoming call processing (Used in WINDOW mode)
   *
   * @param {object} communication - Call communication object
   * @param {string} componentMode - Current component mode
   * @param {object} extensions - HubSpot SDK extensions instance
   * @param {function} processActionNotification - Callback to process action notification
   * @param {function} publishBroadcast - Callback to publish broadcast
   * @returns {object} Result with actions to take
   */
  handleIncomingCall (communication, componentMode, extensions, processActionNotification, publishBroadcast) {
    console.log('[HubSpot Widget] Processing inbound call')

    // Notify HubSpot about the inbound call
    if (extensions) {
      const phoneNumber = this.$options.filters.fixPhone(communication.contact?.phone_number)

      try {
        extensions.incomingCall({
          phoneNumber: phoneNumber,
          contactName: communication.contact?.name || 'Unknown Caller',
          contactId: communication.contact?.id?.toString(),
          callId: communication.id?.toString()
        })
      } catch (error) {
        console.error('[HubSpot Widget] Error handling HubSpot notification:', error)
      }
    }

    // Process action notification (show accept/reject buttons in WINDOW mode)
    processActionNotification(communication, 'call')

    // Broadcast to REMOTE mode
    publishBroadcast('INCOMING_CALL_STARTED', {
      communication,
      contact: communication.contact
    })

    return {
      success: true,
      displayState: DisplayState.HIDE,
      dialerStatus: DialerStatus.RECEIVED_CALL_INVITE,
      communication,
      contact: communication.contact
    }
  }

  /**
   * Validates if there's an active call status that should prevent new calls
   *
   * @param {object} profile - User profile
   * @param {object} dialer - Dialer state
   * @param {string} componentMode - Component mode (window/remote)
   * @param {object} lastCall - Last call from profile
   * @returns {boolean} True if there's an active call
   */
  validateActiveCallStatus (profile, dialer, componentMode, lastCall) {
    let status = false

    if (profile.agent_status === AgentStatus.AGENT_STATUS_RINGING ||
        profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL ||
      (profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && this.vuexActions.checkForceDisposition)) {
      status = true
    }

    const activeCallStatuses = [
      DialerStatus.MAKING_CALL,
      DialerStatus.CALL_CONNECTED,
      DialerStatus.HANGING_UP_CALL,
      DialerStatus.CALL_DISCONNECTED,
      DialerStatus.WRAP_UP,
      DialerStatus.ANSWERING_CALL
    ]

    if (activeCallStatuses.includes(dialer?.currentStatus)) {
      status = true
    }

    // Check if there is no last communication on hold
    if (lastCall && lastCall.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW) {
      status = true
    }

    return status
  }

  /**
   * Checks if call is connected based on dialer and agent status
   *
   * @param {string} dialerStatus - Current dialer status
   * @param {number} agentStatus - Current agent status
   * @returns {boolean} True if call is connected
   */
  checkCallConnectionStatus (dialerStatus, agentStatus) {
    return dialerStatus === DialerStatus.CALL_CONNECTED ||
           agentStatus === AgentStatus.AGENT_STATUS_ON_CALL
  }

  /**
   * Determines if CALL_CONNECTED broadcast should be sent
   *
   * @param {string} componentMode - Component mode
   * @param {string} newStatus - New dialer status
   * @param {string} oldStatus - Old dialer status
   * @returns {boolean} True if should broadcast
   */
  shouldBroadcastCallConnected (componentMode, newStatus, oldStatus) {
    return componentMode === ComponentMode.WINDOW &&
           newStatus === DialerStatus.CALL_CONNECTED &&
           oldStatus !== DialerStatus.CALL_CONNECTED
  }

  /**
   * Fetches contact details from HubSpot API
   *
   * @param {object} hubspotDialNumber - Dial number from HubSpot
   * @param {boolean} isAlwaysAskModeEnabled - Whether always-ask mode is enabled
   * @returns {Promise<object>} Result with contact details
   */
  async fetchContactDetails (hubspotDialNumber, isAlwaysAskModeEnabled) {
    const withLastUsedCallLine = isAlwaysAskModeEnabled

    try {
      const res = await this.$axios.post('/api/v1/integrations/hubspot/find-contact', {
        params: hubspotDialNumber,
        with_last_used_call_line: withLastUsedCallLine,
        with_last_call: true
      })

      const contact = res?.data?.contact

      // Helper to get contact name (from mixin)
      const getContactName = (item) => {
        if (!item.first_name || !item.last_name) {
          return 'No Name'
        }
        return (item.first_name + ' ' + item.last_name).trim()
      }

      this.contactDetails.contactName = getContactName(contact)
      this.contactDetails.contactTimezone = contact.timezone
      this.contactDetails.companyName = contact.company_name
      this.contactDetails.contactId = contact.id

      const result = {
        success: true,
        contactDetails: this.contactDetails
      }

      if (withLastUsedCallLine) {
        result.campaignId = res?.data?.last_used_call_line
      }

      if (res?.data?.last_call) {
        result.lastCall = res.data.last_call
      }

      return result
    } catch (err) {
      console.error('Error fetching contact:', err)
      return {
        success: false,
        error: err
      }
    }
  }

  /**
   * Resolves the default campaign ID based on company and profile settings
   *
   * @param {object} profile - User profile
   * @param {object} currentCompany - Current company
   * @param {boolean} shouldUseCompanyCampaignId - Whether to use company campaign
   * @param {boolean} shouldUseProfileCampaignId - Whether to use profile campaign
   * @returns {number|null} Campaign ID or null
   */
  resolveDefaultCampaign (profile, currentCompany, shouldUseCompanyCampaignId, shouldUseProfileCampaignId) {
    if (shouldUseCompanyCampaignId) {
      return currentCompany.default_outbound_campaign_id
    } else if (shouldUseProfileCampaignId) {
      return profile.default_outbound_campaign_id
    }
    return null
  }

  /**
   * Handles accepting an incoming call
   *
   * @param {object} incomingCallData - Incoming call data
   * @param {object} dialerState - Current dialer state
   * @param {object} profileState - Current profile state
   * @returns {object} Result with action to take
   */
  acceptCall (incomingCallData, dialerState, profileState) {
    // Check if call is already connected
    const isCallConnected = this.checkCallConnectionStatus(dialerState?.currentStatus, profileState?.agent_status)

    if (isCallConnected) {
      console.log('[HubSpot Widget] Accept button clicked but call already connected/on-call - forcing active call UI')
      const { communication, contact } = incomingCallData || {}

      if (communication && contact) {
        return {
          action: 'show_active_call',
          ...this.showActiveCall({ communication, contact })
        }
      }

      return { action: 'skip' }
    }

    return {
      action: 'broadcast_accept',
      broadcast: {
        type: 'ACCEPT_INBOUND_CALL',
        payload: {
          communicationId: incomingCallData?.communication?.id,
          contactId: incomingCallData?.contact?.id
        }
      }
    }
  }

  /**
   * Handles declining an incoming call
   *
   * @param {object} incomingCallData - Incoming call data
   * @param {object} dialerState - Current dialer state
   * @param {object} profileState - Current profile state
   * @returns {object} Result with action to take
   */
  declineCall (incomingCallData, dialerState, profileState) {
    // Check if call is already connected
    const isCallConnected = this.checkCallConnectionStatus(dialerState?.currentStatus, profileState?.agent_status)

    if (isCallConnected) {
      const { communication, contact } = incomingCallData || {}
      if (communication && contact) {
        return {
          action: 'show_active_call',
          ...this.showActiveCall({ communication, contact })
        }
      }
      return { action: 'skip' }
    }

    return {
      action: 'broadcast_decline',
      broadcast: {
        type: 'CALL_CANCELLED',
        payload: {
          communicationId: incomingCallData?.communication?.id
        }
      },
      fireRejectEvent: true
    }
  }

  /**
   * Ends an active call
   *
   * @param {object} dialer - Dialer state
   * @param {boolean} checkForceDisposition - Whether force disposition is required
   * @returns {object} Events to fire
   */
  endActiveCall (dialer, checkForceDisposition) {
    const eventsToFire = []

    if (dialer?.currentStatus === DialerStatus.WRAP_UP && !checkForceDisposition) {
      eventsToFire.push('endWrapUp')
    }

    if (dialer?.communication?.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) {
      eventsToFire.push('hangupCall')
    }

    if (!checkForceDisposition) {
      eventsToFire.push('resetCall')
    }

    return {
      eventsToFire,
      displayState: DisplayState.HIDE
    }
  }

  /**
   * Prepares call connected data for broadcasting
   *
   * @param {object} dialer - Dialer state
   * @param {object} contactDetails - Contact details
   * @param {object} hubspotDialNumber - HubSpot dial number
   * @returns {object} Broadcast payload
   */
  prepareCallConnectedData (dialer, contactDetails, hubspotDialNumber) {
    // For outbound calls, use contactDetails which has the full contact info
    // For inbound calls, use dialer.contact which is already populated
    // For unparked calls, use dialer.communication.contact which is loaded after status change
    let contact = dialer?.contact

    // If contact is missing or has no name/phone, try communication.contact (for unparked calls)
    if (!contact || (!contact.name && !contact.phone_number)) {
      contact = dialer?.communication?.contact
    }

    // If still missing, try extracting from Twilio call customParameters (for unparked calls)
    if (!contact || (!contact.name && !contact.phone_number)) {
      const customParams = dialer?.call?.customParameters
      if (customParams && customParams.size > 0) {
        contact = {
          name: customParams.get('ContactName'),
          phone_number: dialer?.communication?.contact?.phone_number,
          company_name: customParams.get('CompanyName'),
          id: customParams.get('ContactId')
        }
      }
    }

    // Use contactDetails from outbound call flow as last resort
    if (!contact || (!contact.name && !contact.phone_number)) {
      contact = {
        name: contactDetails.contactName || dialer?.communication?.contact?.name,
        phone_number: hubspotDialNumber?.phoneNumber || dialer?.communication?.from_number || dialer?.communication?.to_number,
        company_name: contactDetails.companyName || dialer?.communication?.contact?.company_name,
        id: contactDetails.contactId || dialer?.communication?.contact?.id
      }
    }

    return {
      communication: dialer?.communication,
      contact: contact
    }
  }
}

export default HubSpotWidgetService
