// Call is still going on.
export const DISPOSITION_STATUS_INPROGRESS = 'in-progress'
// call is abandoned without ringing target.
export const DISPOSITION_STATUS_ABANDONED = 'abandoned'
// target party did not answer the call.
export const DISPOSITION_STATUS_MISSED = 'missed'
// A successful call (parties talked)
export const DISPOSITION_STATUS_COMPLETED = 'completed'
// The call failed for some reason.
export const DISPOSITION_STATUS_FAILED = 'failed'
// The call hit a dead end.
export const DISPOSITION_STATUS_DEADEND = 'dead-end'
// communication was rejected from carrier before sending
export const DISPOSITION_STATUS_INVALID = 'invalid'
// virtual status for automation rules
export const DISPOSITION_STATUS_PLACED = 'placed'
// voicemail disposition
export const DISPOSITION_STATUS_VOICEMAIL = 'voicemail'
// Call is still going on.
export const DISPOSITION_STATUS_INPROGRESS_NEW = 1
// call is abandoned without ringing target.
export const DISPOSITION_STATUS_ABANDONED_NEW = 2
// target party did not answer the call.
export const DISPOSITION_STATUS_MISSED_NEW = 3
// A successful call (parties talked)
export const DISPOSITION_STATUS_COMPLETED_NEW = 4
// The call failed for some reason.
export const DISPOSITION_STATUS_FAILED_NEW = 5
// The call hit a dead end.
export const DISPOSITION_STATUS_DEADEND_NEW = 6
// communication was rejected from carrier before sending
export const DISPOSITION_STATUS_INVALID_NEW = 7
// virtual status for automation rules
export const DISPOSITION_STATUS_PLACED_NEW = 8
// virtual status for automation rules
export const DISPOSITION_STATUS_VOICEMAIL_NEW = 12

// appointment statuses
export const DISPOSITION_STATUS_APPOINTMENT_ATTENDED = 9
export const DISPOSITION_STATUS_APPOINTMENT_CANCELED = 10
export const DISPOSITION_STATUS_APPOINTMENT_SET = 11
