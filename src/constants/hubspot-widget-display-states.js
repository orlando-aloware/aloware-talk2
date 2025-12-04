/**
 * Display states for HubSpot Widget UI
 * These states control what UI is shown in the HubSpot calling widget (both WINDOW and REMOTE modes)
 */
export const DisplayState = Object.freeze({
  HIDE: 1,
  SHOW_ALERT_AGENT_ON_CALL: 2,
  SHOW_ALERT_CALL_FINISHED: 3,
  READY_FOR_CALLS: 4,
  CRITICAL_ERROR_HAPPENED: 5,
  INCOMING_CALL: 6, // For REMOTE mode custom incoming call UI
  CALLING_REMOTE_ACTIVE_CALL: 7, // For REMOTE mode active call UI
  HUBSPOT_INTEGRATION_DISABLED: 8 // When HubSpot integration is disabled
})
