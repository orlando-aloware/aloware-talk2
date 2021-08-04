import * as CommunicationDirections from '../../constants/communication-direction'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'
import * as CommunicationTypes from '../../constants/communication-types'

export default {
  methods: {
    stateToTextColor: function (dispositionStatus, type) {
      let color = ''
      if (type === CommunicationTypes.CALL) {
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'has-text-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'has-text-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          color = 'has-text-primary'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          color = 'has-text-warn'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW) {
          color = 'has-text-danger'
        }
      } else if (type === CommunicationTypes.SMS) {
        // if type is sms
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'has-text-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'has-text-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'has-text-danger'
        }
      } else {
        // if type is voicemail
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'has-text-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'has-text-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'has-text-danger'
        }
      }

      return color
    },

    stateToColor: function (dispositionStatus, type) {
      let color = ''
      if (type === CommunicationTypes.CALL) {
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'is-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'is-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          color = 'is-primary'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          color = 'is-warn'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW) {
          color = 'is-danger'
        }
      } else if (type === CommunicationTypes.SMS) {
        // if type is sms
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'is-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'is-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'is-danger'
        }
      } else {
        // if type is voicemail
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'is-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'is-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'is-danger'
        }
      }

      return color
    },

    stateToIcon: function (dispositionStatus, type, direction = null, answerStatus = null) {
      let icon = ''

      if (![CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(type)) {
        if (direction === CommunicationDirections.INBOUND) {
          icon += 'inbound-'
        } else {
          icon += 'outbound-'
        }
      }

      if (type === CommunicationTypes.CALL && (!answerStatus || answerStatus === 'all')) {
        icon += 'call-'
      } else if (type === CommunicationTypes.CALL && answerStatus === 'recorded') {
        icon += 'recorded-'
      } else if (type === CommunicationTypes.SMS) {
        icon += 'sms-'
      } else if (type === CommunicationTypes.EMAIL) {
        icon += 'email-'
      } else if (type === CommunicationTypes.RVM) {
        icon += 'voicemail-'
      } else if (type === CommunicationTypes.FAX) {
        icon += 'fax-'
      } else if (type === CommunicationTypes.NOTE) {
        icon += 'note-'
      } else if (type === CommunicationTypes.APPOINTMENT) {
        icon += 'appointment-'
      } else if (type === CommunicationTypes.REMINDER) {
        icon += 'reminder-'
      }

      if (![CommunicationTypes.RVM, CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(type)) {
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          icon += `inprogress-`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          icon += type === CommunicationTypes.CALL ? `answered-` : `completed-`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          icon += `abandoned-`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          icon += `missed-`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          icon += `failed-`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          icon += `failed-`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          icon += `deadend-`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW) {
          icon += `voicemail-`
        } else {
          icon += `failed-`
        }
      }

      console.log(icon + 'icon')

      return icon + 'icon'
    },

    rejectionToIcon: function (rejectionReason) {
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
