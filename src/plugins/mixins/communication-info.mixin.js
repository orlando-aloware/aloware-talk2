import * as CommunicationDirections from '../../constants/communication-direction'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'
import * as CommunicationTypes from '../../constants/communication-types'

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

    stateToIcon: function (dispositionStatus, type, direction = null) {
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
        case this.REJECTION_REASON_BLOCKED:
          return 'phone_locked'
        case this.REJECTION_REASON_CREDITS:
          return 'money_off'
        case this.REJECTION_REASON_OTHER:
          return 'warning'
        case this.REJECTION_REASON_USER_NOT_FOUND:
          return 'error'
        case this.REJECTION_REASON_FAILED:
          return 'error'
      }
    },

    rejectionTooltipData (rejectionReason) {
      switch (rejectionReason) {
        case this.REJECTION_REASON_BLOCKED:
          return 'Could not route: the contact is blocked, if you want to take the call please unblock the contact from either the contacts section or from blocked contacts tab in company page.'
        case this.REJECTION_REASON_CREDITS:
          return 'Could not route: account doesn\'t have enough credits, please recharge your account or contact support.'
        case this.REJECTION_REASON_OTHER:
          return 'Could not route: please contact support.'
        case this.REJECTION_REASON_USER_NOT_FOUND:
          return 'Could not route: no eligible users can be found, please check your line\'s routing settings. Check notes for more information.'
        case this.REJECTION_REASON_FAILED:
          return 'Could not route: our carrier could not route this communication, please make sure the phone number is in service'
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

    dispositionTooltipData (dispositionStatus, type, direction = null) {
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW && direction === CommunicationDirections.INBOUND) {
        return 'Voicemail'
      }
      if (type === CommunicationTypes.RVM && direction === CommunicationDirections.OUTBOUND) {
        return 'RVM'
      }
      return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateDispositionStatusText(dispositionStatus))) + ' ' + this.$options.filters.fixCommDirection(direction) + ' ' + this.$options.filters.fixCommType(type)
    }
  }
}
