import * as CommunicationRejectionReasons from './communication-rejection-reasons'

export const REJECTION_REASONS = [
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_CREDITS,
    message: 'Unable to make the call due to insufficient credits'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_BLOCKED,
    message: 'This number is blocked, call cannot be completed'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_OTHER,
    message: 'The call could not be completed due to an unexpected issue'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_USER_NOT_FOUND,
    message: 'No associated user found for this call'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_FAILED,
    message: 'The call has failed and could not be connected'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_ANONYMOUS_CONTACT,
    message: 'Calls to anonymous contacts are not allowed'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_TRAFFIC_BLOCKED,
    message: 'The call was blocked due to traffic restrictions'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_NOT_MESSAGING_ENABLED,
    message: 'This number is not enabled for messaging; call cannot proceed'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_CAMPAIGN_DELETED,
    message: 'The associated campaign has been deleted; unable to make the call'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_CAMPAIGN_PAUSED,
    message: 'The campaign is paused; calls cannot be made at this time'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_CONTACT_DNC,
    message: 'The contact is on the Do Not Call list'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_COMPANY_DISABLED,
    message: 'The company account is currently disabled'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_MESSAGE_EMPTY,
    message: 'There is no message to send'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_NUMBER_IS_INTERNATIONAL,
    message: 'Calls to this country are not allowed'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_INVALID_OR_WRONG_PHONE_NUMBER,
    message: 'The phone number provided is wrong or invalid'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_TOLLFREE_NUMBER,
    message: 'Calls to toll-free numbers are not allowed'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_USER_NOT_PERMITTED_TO_MAKE_CALL,
    message: 'User does not have permission to make calls'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_USER_NOT_ACTIVE,
    message: 'The caller account is inactive'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_NO_POWER_DIALER_TASK_REMAINING,
    message: 'There were no power dialer tasks remaining to run'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_POWER_DIALER_TASK_NOT_QUEUED,
    message: 'The auto-dial task is not in the queue for this call'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_CAMPAIGN_NOT_FOUND,
    message: 'No associated campaign found for this call'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_INCOMING_NUMBER_NOT_FOUND,
    message: 'No incoming number is associated with this call'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_INVALID_USER,
    message: 'The user is not valid for this operation'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_INVALID_LINK_FORMAT,
    message: 'The call cannot be completed due to an invalid link format'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_CONNECTED_HS_ACCOUNT_NOT_FOUND,
    message: 'Unable to locate the connected HubSpot account'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_HS_CONTACT_NOT_FOUND,
    message: 'No HubSpot contact is associated with this call'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_HS_INVALID_PHONE_NUMBER,
    message: 'The HubSpot phone number provided is invalid'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_ACCOUNT_DISABLED_MESSAGING,
    message: 'Messaging capabilities are disabled for this account'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_DAILY_LIMIT_EXCEEDED,
    message: 'The daily limit for calls has been exceeded'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_CAMPAIGN_PROXY,
    message: 'The call was rejected because the line is a proxy'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_COMPANY_DELETED,
    message: 'The associated company has been deleted; unable to make the call'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_COMPANY_SUSPENDED,
    message: 'The call cannot proceed as the company has been suspended'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_CALL_TO_SELF_NUMBER,
    message: 'The call cannot be completed because the caller and recipient are the same'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_TRIAL_CALLS_LIMIT_EXCEEDED,
    message: 'Trial limits have been exceeded; calls cannot be made'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_EMERGENCY_NUMBER,
    message: 'Calls to emergency numbers are not allowed'
  },
  {
    type: CommunicationRejectionReasons.REJECTION_REASON_KYC_CALLS_OUTBOUND_RESTRICTION,
    message: 'Your KYC plan is not allowed to make calls to this number'
  }
]
