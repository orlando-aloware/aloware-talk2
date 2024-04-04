// A call/SMS was received by our system but not shown to user because company was out of credit
export const REJECTION_REASON_CREDITS = 1
// A call/SMS was received by our system but was blocked because caller's phone number is blocked.
export const REJECTION_REASON_BLOCKED = 2
// A call/SMS was received by our system but was blocked because of other reasons, e.g.: .
export const REJECTION_REASON_OTHER = 3
// A call/SMS was received by our system, but it doesn't have a user
export const REJECTION_REASON_USER_NOT_FOUND = 4
// A call/SMS was failed
export const REJECTION_REASON_FAILED = 5
// A call/SMS was rejected to send by our system because of an anonymous contact
export const REJECTION_REASON_ANONYMOUS_CONTACT = 6
// A call/SMS was rejected to send by our system because of traffic blocking by Twilio
export const REJECTION_REASON_TRAFFIC_BLOCKED = 7
// A call/SMS was rejected to send by our system because phone number is not messaging enabled
export const REJECTION_REASON_NOT_MESSAGING_ENABLED = 8
// A call/SMS was rejected to send by our system because campaign is deleted
export const REJECTION_REASON_CAMPAIGN_DELETED = 9
// A call/SMS was rejected to send by our system because campaign is paused
export const REJECTION_REASON_CAMPAIGN_PAUSED = 10
// A call/SMS was rejected to send by our system because contact is in DNC
export const REJECTION_REASON_CONTACT_DNC = 11
// A call/SMS was rejected to send by our system because company is disabled
export const REJECTION_REASON_COMPANY_DISABLED = 12
// A call/SMS was rejected to send by our system because message is empty
export const REJECTION_REASON_MESSAGE_EMPTY = 13
// A call/SMS was rejected to send by our system because recipient's number is international
export const REJECTION_REASON_NUMBER_IS_INTERNATIONAL = 14
// A fax was rejected to send by our system because no fax number was found for the sender
export const REJECTION_REASON_FAX_NUMBER_NOT_FOUND = 15
// A communication is rejected due to invalid or erroneous phone number
export const REJECTION_REASON_INVALID_OR_WRONG_PHONE_NUMBER = 16
// A communication is rejected due the phone number is toll-free
export const REJECTION_REASON_TOLLFREE_NUMBER = 17
// A communication is rejected due not permitted to make call
export const REJECTION_REASON_USER_NOT_PERMITTED_TO_MAKE_CALL = 18
// A communication is rejected due the caller is not active
export const REJECTION_REASON_USER_NOT_ACTIVE = 19
// A communication is rejected cause there is no auto dial task remaining
export const REJECTION_REASON_NO_AUTO_DIAL_TASK_REMAINING = 20
// A communication is rejected due the auto dial task is not queued
export const REJECTION_REASON_AUTO_DIAL_TASK_NOT_QUEUED = 21
// A communication is rejected due the absence of campaign
export const REJECTION_REASON_CAMPAIGN_NOT_FOUND = 22
// A communication is rejected due the absence of incoming number
export const REJECTION_REASON_INCOMING_NUMBER_NOT_FOUND = 23
// A communication is rejected cause the user is invalid
export const REJECTION_REASON_INVALID_USER = 24
// A communication is rejected due the link format is invalid
export const REJECTION_REASON_INVALID_LINK_FORMAT = 25
// A communication is rejected due the absence of connected HS account
export const REJECTION_REASON_CONNECTED_HS_ACCOUNT_NOT_FOUND = 26
// A communication is rejected due the absence of connected HS contact
export const REJECTION_REASON_HS_CONTACT_NOT_FOUND = 27
// A communication is rejected due the connected HS phone number is invalid
export const REJECTION_REASON_HS_INVALID_PHONE_NUMBER = 28
// A communication is rejected because the account SMS capability is disabled
export const REJECTION_REASON_ACCOUNT_DISABLED_MESSAGING = 29
// A communication is rejected due the daily limit is exceeded
export const REJECTION_REASON_DAILY_LIMIT_EXCEEDED = 30
// A SMS/MMS was rejected to send by our system because contact is not tcpa approved
export const REJECTION_REASON_CONTACT_IS_NOT_TCPA_APPROVED = 31
// A SMS/MMS was rejected to send by our system because contact is opted out
export const REJECTION_REASON_PHONE_NUMBER_OPTED_OUT = 32
// A fax/call was rejected to send by our system because line is proxy
export const REJECTION_REASON_CAMPAIGN_PROXY = 33
// A call/SMS was rejected to send by our system because company is deleted
export const REJECTION_REASON_COMPANY_DELETED = 34
// A call/SMS was rejected to send by our system because company is suspended
export const REJECTION_REASON_COMPANY_SUSPENDED = 35
// An Sms/Mms was rejected to send by our system because line is sending the same message to the same contact.
export const REJECTION_REASON_LINE_IS_SPAMMING = 36
// An Sms/Mms was rejected to send by our system because Short Code is sending the message to a non-US number.
export const REJECTION_REASON_SHORTCODE_TO_NON_US_NUMBER = 37
// An Sms/Mms was rejected to send by our system because a landline it's not a number capable of receiving it.
export const REJECTION_REASON_LRN_TYPE_IS_LANDLINE = 38
// Bulk messaging is disabled for this company and the message is created by sequence or broadcast.
export const REJECTION_REASON_MESSAGING_DISABLED = 39
// A call was rejected by our system because caller and callee numbers are the same.
export const REJECTION_REASON_CALL_TO_SELF_NUMBER = 40
// A text was rejected by our system because line and contact phone number are the same.
export const REJECTION_REASON_SMS_TO_SELF_NUMBER = 41
// A call/SMS was rejected to send by our system because trial limit is exceeded
export const REJECTION_REASON_TRIAL_LIMIT_EXCEEDED = 42
// Rejected to send by our system because provider allows only one attachment
export const REJECTION_REASON_PROVIDER_ALLOWS_ONLY_ONE_ATTACHMENT = 43
