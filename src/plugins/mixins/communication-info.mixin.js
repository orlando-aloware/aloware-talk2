import * as CommunicationDirections from '../../constants/communication-direction'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'
import * as CommunicationTypes from '../../constants/communication-types'
import * as CommunicationRejectionReasons from '../../constants/communication-rejection-reasons'
import * as CallbackStatus from '../../constants/callback-status'
import { head } from 'lodash'

export default {
  methods: {
    stateToTextColor (dispositionStatus, type) {
      const color = { data: '' }
      if (type === CommunicationTypes.CALL) {
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color.data = 'has-text-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color.data = 'has-text-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          color.data = 'has-text-primary'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          color.data = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color.data = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color.data = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          color.data = 'has-text-warn'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW) {
          color.data = 'has-text-danger'
        }
        return color.data
      }
      if (type === CommunicationTypes.SMS) {
        // if type is sms
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color.data = 'has-text-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color.data = 'has-text-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color.data = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color.data = 'has-text-danger'
        }
        return color.data
      }
      // if type is voicemail
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
        color.data = 'has-text-info'
      } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
        color.data = 'has-text-success'
      } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
        color.data = 'has-text-danger'
      } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
        color.data = 'has-text-danger'
      }
      return color.data
    },

    stateToColor (dispositionStatus, type) {
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
        return 'is-info'
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
        return 'is-success'
      }
      if (type === CommunicationTypes.CALL && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
        return 'is-primary'
      }
      if (type === CommunicationTypes.CALL && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
        return 'is-danger'
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
        return 'is-danger'
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
        return 'is-danger'
      }
      if (type === CommunicationTypes.CALL && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
        return 'is-warn'
      }
      if (type === CommunicationTypes.CALL && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW) {
        return 'is-danger'
      }

      return ''
    },

    stateToIcon: function (dispositionStatus, type, direction = null, callbackStatus = null) {
      const icon = { data: '' }

      if (![CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(type)) {
        icon.data += (direction === CommunicationDirections.INBOUND) ? 'inbound-' : 'outbound-'
      }
      if (type === CommunicationTypes.CALL) {
        icon.data += 'call-'
      }
      if (type === CommunicationTypes.SMS) {
        icon.data += 'sms-'
      }
      if (type === CommunicationTypes.EMAIL) {
        icon.data += 'email-'
      }
      if (type === CommunicationTypes.RVM) {
        icon.data += 'voicemail-'
      }
      if (type === CommunicationTypes.FAX) {
        icon.data += 'fax-'
      }
      if (type === CommunicationTypes.NOTE) {
        icon.data += 'note-'
      }
      if (type === CommunicationTypes.APPOINTMENT) {
        icon.data += 'appointment-'
      }
      if (type === CommunicationTypes.REMINDER) {
        icon.data += 'reminder-'
      }

      if ([CommunicationTypes.RVM, CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(type)) {
        return `${icon.data}icon`
      }

      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
        return `${icon.data}inprogress-icon`
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
        return `${icon.data}${(type === CommunicationTypes.CALL ? 'answered' : 'completed')}-icon`
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
        if (direction === CommunicationDirections.INBOUND && callbackStatus === CallbackStatus.CALLBACK_STATUS_REQUESTED) {
          return `${icon.data}callback-pending-icon`
        }
        return `${icon.data}abandoned-icon`
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
        return `${icon.data}missed-icon`
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
        return `${icon.data}${(type === CommunicationTypes.FAX ? 'inprogress' : 'failed')}-icon`
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
        return `${icon.data}failed-icon`
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
        return `${icon.data}deadend-icon`
      }
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW) {
        return `${icon.data}voicemail-icon`
      }

      return `${icon.data}failed-icon`
    },

    rejectionToIcon (rejectionReason) {
      switch (rejectionReason) {
        case CommunicationRejectionReasons.REJECTION_REASON_BLOCKED:
          return 'phone_locked'
        case CommunicationRejectionReasons.REJECTION_REASON_CREDITS:
          return 'money_off'
        case CommunicationRejectionReasons.REJECTION_REASON_OTHER:
          return 'warning'
        case CommunicationRejectionReasons.REJECTION_REASON_USER_NOT_FOUND:
          return 'error'
        case CommunicationRejectionReasons.REJECTION_REASON_FAILED:
          return 'error'
        default:
          return 'warning'
      }
    },

    rejectionTooltipData (rejectionReason, type) {
      switch (rejectionReason) {
        case CommunicationRejectionReasons.REJECTION_REASON_BLOCKED:
          return 'The contact was blocked.'
        case CommunicationRejectionReasons.REJECTION_REASON_CREDITS:
          return 'Account didn\'t have enough credits.'
        case CommunicationRejectionReasons.REJECTION_REASON_OTHER:
          return 'Please contact support.'
        case CommunicationRejectionReasons.REJECTION_REASON_USER_NOT_FOUND:
          return 'No eligible users could be found.'
        case CommunicationRejectionReasons.REJECTION_REASON_FAILED:
          return 'Our carrier could not route this communication.'
        case CommunicationRejectionReasons.REJECTION_REASON_ANONYMOUS_CONTACT:
          let placeHolder = 'send a message'
          switch (type) {
            case CommunicationTypes.CALL:
              placeHolder = 'make a call'
              break
            case CommunicationTypes.RVM:
              placeHolder = 'send an RVM'
              break
            case CommunicationTypes.EMAIL:
              placeHolder = 'send an email'
              break
            case CommunicationTypes.FAX:
              placeHolder = 'send a fax'
              break
          }
          return `Cannot ${placeHolder} to an anonymous contact.`
        case CommunicationRejectionReasons.REJECTION_REASON_TRAFFIC_BLOCKED:
          return 'SMS traffic was blocked by Twilio.'
        case CommunicationRejectionReasons.REJECTION_REASON_NOT_MESSAGING_ENABLED:
          return 'Phone number was not messaging enabled.'
        case CommunicationRejectionReasons.REJECTION_REASON_CAMPAIGN_DELETED:
          return 'Line was deleted.'
        case CommunicationRejectionReasons.REJECTION_REASON_CAMPAIGN_PAUSED:
          return 'Line was paused.'
        case CommunicationRejectionReasons.REJECTION_REASON_CAMPAIGN_PROXY:
          return 'Line was proxied.'
        case CommunicationRejectionReasons.REJECTION_REASON_CONTACT_DNC:
          return 'Contact was DNC.'
        case CommunicationRejectionReasons.REJECTION_REASON_COMPANY_DISABLED:
          return 'Company was not enabled.'
        case CommunicationRejectionReasons.REJECTION_REASON_MESSAGE_EMPTY:
          return 'Message body was required.'
        case CommunicationRejectionReasons.REJECTION_REASON_NUMBER_IS_INTERNATIONAL:
          return 'The contact phone number was international.'
        case CommunicationRejectionReasons.REJECTION_REASON_FAX_NUMBER_NOT_FOUND:
          return 'We couldn\'t send a fax from a non-fax capable number.'
        case CommunicationRejectionReasons.REJECTION_REASON_INVALID_OR_WRONG_PHONE_NUMBER:
          return 'Phone number was wrong or invalid.'
        case CommunicationRejectionReasons.REJECTION_REASON_TOLLFREE_NUMBER:
          return 'Phone number was toll-free.'
        case CommunicationRejectionReasons.REJECTION_REASON_USER_NOT_PERMITTED_TO_MAKE_CALL:
          return 'Received a call from a user without the permission to make an outbound call.'
        case CommunicationRejectionReasons.REJECTION_REASON_USER_NOT_ACTIVE:
          return 'Received a call from a paused user.'
        case CommunicationRejectionReasons.REJECTION_REASON_NO_AUTO_DIAL_TASK_REMAINING:
          return 'There were no power dialer tasks remaining to run.'
        case CommunicationRejectionReasons.REJECTION_REASON_AUTO_DIAL_TASK_NOT_QUEUED:
          return 'Tried to run a power dialer task that is not queued.'
        case CommunicationRejectionReasons.REJECTION_REASON_CAMPAIGN_NOT_FOUND:
          return 'Couldn\'t find an outbound line for this call.'
        case CommunicationRejectionReasons.REJECTION_REASON_INCOMING_NUMBER_NOT_FOUND:
          return 'Couldn\'t find an outbound incoming number for this call.'
        case CommunicationRejectionReasons.REJECTION_REASON_INVALID_USER:
          return 'Received a call from an undefined user.'
        case CommunicationRejectionReasons.REJECTION_REASON_INVALID_LINK_FORMAT:
          return '[From HubSpot] The link format was incorrect.'
        case CommunicationRejectionReasons.REJECTION_REASON_CONNECTED_HS_ACCOUNT_NOT_FOUND:
          return '[From HubSpot] Could not find the connected HubSpot account.'
        case CommunicationRejectionReasons.REJECTION_REASON_HS_CONTACT_NOT_FOUND:
          return '[From HubSpot] Could not find the associated contact with the HubSpot deal.'
        case CommunicationRejectionReasons.REJECTION_REASON_HS_INVALID_PHONE_NUMBER:
          return '[From HubSpot] Could not find a phone number associated with the contact on the HubSpot deal.'
        case CommunicationRejectionReasons.REJECTION_REASON_DAILY_LIMIT_EXCEEDED:
          return 'Daily outbound messages limit exceeded.'
        case CommunicationRejectionReasons.REJECTION_REASON_COMPANY_DELETED:
          return 'Company was deleted.'
        case CommunicationRejectionReasons.REJECTION_REASON_COMPANY_SUSPENDED:
          return 'Company was suspended.'
        case CommunicationRejectionReasons.REJECTION_REASON_LINE_IS_SPAMMING:
          return 'SPAM Detected: Stopped sending the same message multiple times from the same line.'
        case CommunicationRejectionReasons.REJECTION_REASON_SHORTCODE_TO_NON_US_NUMBER:
          return 'Short Code is not allowed to send messages to non-US numbers.'
        case CommunicationRejectionReasons.REJECTION_REASON_LRN_TYPE_IS_LANDLINE:
          return 'Landlines are not capable of receiving SMS/MMS.'
        case CommunicationRejectionReasons.REJECTION_REASON_MESSAGING_DISABLED:
          return 'Messaging is disabled for this line.'
        case CommunicationRejectionReasons.REJECTION_REASON_CALL_TO_SELF_NUMBER:
          return 'You cannot place a call to your own number.'
      }
    },

    getAttemptingClass (attemptingUser, dispositionStatus, userId) {
      if (userId && userId === attemptingUser && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED) {
        return 'text-dark-greenish'
      } else if (userId && userId !== attemptingUser && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED) {
        return 'text-muted'
      } else if (userId && userId !== attemptingUser && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS) {
        return 'text-muted'
      } else if (userId && userId === attemptingUser && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS) {
        return 'text-indigo-500'
      } else {
        return 'text-danger'
      }
    },

    dispositionTooltipData (dispositionStatus, type, direction = null, callbackStatus = null) {
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW && direction === CommunicationDirections.INBOUND) {
        return 'Voicemail'
      }

      if (type === CommunicationTypes.RVM && direction === CommunicationDirections.OUTBOUND) {
        return 'RVM'
      }

      if (direction === CommunicationDirections.INBOUND && [CallbackStatus.CALLBACK_STATUS_INITIATED, CallbackStatus.CALLBACK_STATUS_REQUESTED].includes(callbackStatus)) {
        return 'Callback ' + this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateCallbackStatusText(callbackStatus)))
      }

      return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateDispositionStatusText(dispositionStatus))) + ' ' + this.$options.filters.fixCommDirection(direction) + ' ' + this.$options.filters.fixCommType(type)
    },

    getUuidFromURL (url) {
      if (!url) {
        return null
      }

      const lastPart = this.getFilenameFromURL(url, true)

      return head(lastPart.split('.'))
    },

    getFilenameFromURL (url, skipCheck = false) {
      if (!skipCheck && !url) {
        return null
      }

      return head(url.split('?')).split('/').pop()
    }
  }
}
