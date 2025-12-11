// Dialer status constants
// These represent the various states the dialer can be in during its lifecycle
export const DialerStatus = Object.freeze({
  // Initial states
  OFFLINE: 'OFFLINE',
  GENERATING_TOKEN: 'GENERATING_TOKEN',
  TOKEN_GENERATED: 'TOKEN_GENERATED',
  READY: 'READY',

  // Incoming call states
  RECEIVED_CALL_INVITE: 'RECEIVED_CALL_INVITE',
  ANSWERING_CALL: 'ANSWERING_CALL',
  REJECTING_CALL: 'REJECTING_CALL',
  INVITE_CANCELLED: 'INVITE_CANCELLED',

  // Outgoing call states
  MAKING_CALL: 'MAKING_CALL',

  // Active call states
  CALL_CONNECTED: 'CALL_CONNECTED',

  // Call termination states
  HANGING_UP_CALL: 'HANGING_UP_CALL',
  CALL_DISCONNECTED: 'CALL_DISCONNECTED',
  WRAP_UP: 'WRAP_UP',

  // Error and restart states
  GOT_ERROR: 'GOT_ERROR',
  RESTARTING: 'RESTARTING'
})
