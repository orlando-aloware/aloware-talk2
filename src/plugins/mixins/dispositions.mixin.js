import { mapActions, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import _ from 'lodash'

export default {
  computed: {
    ...mapState([
      'dialer',
      'isCallDisposed',
      'isContactDisposed'
    ]),

    ...mapState('cache', ['currentCompany']),

    ...mapFields('powerDialer', [
      'activeTask',
      'sessionSettings',
      'tasksSentSmsTemplates'
    ]),

    contact () {
      const contact = this.dialer.contact
      return !contact ? _.get(this.dialer, 'callFishing.contact', null) : contact
    },

    isForcedRedialEnabled () {
      return this.sessionSettings?.min_redials > 0
    },

    isForcedCallDisposition () {
      return (this.currentCompany && this.currentCompany.force_call_disposition) || this.isForcedRedialEnabled
    },

    isForcedContactDisposition () {
      return this.currentCompany && this.currentCompany.force_contact_disposition
    },

    isNotDisposed () {
      const isForceCallDisposition = this.isForcedCallDisposition && !this.isCallDisposed
      const isForceContactDisposition = this.isForcedContactDisposition && !this.isContactDisposed

      return isForceCallDisposition || isForceContactDisposition || this.isForcedSmsSending
    },

    isHighlightedCallDisposition () {
      if (this.isCallDisposed) {
        return false
      }

      const isForcedCallDisposition = this.currentCompany && this.currentCompany.force_call_disposition

      return (isForcedCallDisposition || this.isForcedRedialEnabled) && !this.isCallDisposed
    },

    isHighlightedContactDisposition () {
      if (this.isContactDisposed) {
        return false
      }

      // prevent showing the required border if the call is starting to be executed
      if (['READY', 'MAKING_CALL'].includes(this.dialer.currentStatus)) {
        return false
      }

      const isForcedContactDisposition = this.currentCompany && this.currentCompany.force_contact_disposition

      return isForcedContactDisposition && !this.isContactDisposed
    },

    isHighlightedSmsTemplate () {
      if (!this.isCallDisposed) {
        return false
      }

      return this.isForcedSmsSending
    },

    hasContactDisposition () {
      return this.dialer.contact &&
        (this.dialer.contact.disposition_status_id || this.dialer.contact.disposition_status_id === 0)
    },

    hasCallDisposition () {
      return this.dialer.communication &&
        (this.dialer.communication.call_disposition_id || this.dialer.communication.call_disposition_id === 0)
    },

    callDisposition () {
      return this.dialer.communication?.call_disposition_id
    },

    // get force disposition status from current user session
    checkDialerForceDisposition () {
      const shouldForceContactDisposition = this.currentCompany?.force_contact_disposition &&
        !this.dialer?.contact?.disposition_status_id
      const shouldForceCallDisposition = this.currentCompany?.force_call_disposition &&
        !this.dialer?.communication?.call_disposition_id
      return shouldForceContactDisposition || shouldForceCallDisposition
    },

    // get force disposition from cached last_call
    checkForceDisposition () {
      const shouldForceContactDisposition = this.currentCompany?.force_contact_disposition &&
        !this.profile?.last_call?.contact?.disposition_status_id
      const shouldForceCallDisposition = this.currentCompany?.force_call_disposition &&
        !this.profile?.last_call?.call_disposition_id

      return shouldForceContactDisposition || shouldForceCallDisposition
      // if (this.currentCompany?.force_call_disposition) {
      //   if (this.dialer.communication) {
      //     if (!this.dialer.communication.call_disposition_id) {
      //       return true
      //     }
      //   } else {
      //     if (!this.profile?.last_call?.call_disposition_id) {
      //       return true
      //     }
      //   }
      // }
      //
      // if (this.currentCompany?.force_contact_disposition) {
      //   if (this.dialer.contact) {
      //     if (!this.dialer.contact.disposition_status_id) {
      //       return true
      //     }
      //   } else {
      //     if (!this.profile?.last_call?.disposition_status_id) {
      //       return true
      //     }
      //   }
      // }
      //
      // return false
    },

    isOnPowerDialerSessionRoute () {
      return this.$route?.meta?.id === 'power-dialer-session'
    },

    isForcedSmsSending () {
      if (!this.activeTask) {
        return false
      }

      if (!this.isOnPowerDialerSessionRoute) {
        return false
      }

      // selected call disposition is a successful call disposition
      const successfulCallDispositionsIds = this.sessionSettings?.successful_call_disposition_ids
      const successfulCallDispositionSelected = successfulCallDispositionsIds?.includes(this.callDisposition)

      // if force redial is enabled, force sms sending if the
      // selected call disposition is not one of the successful call dispositions
      // and the sms template has not been sent yet
      return this.isForcedRedialEnabled &&
        this.sessionSettings?.force_sms &&
        !successfulCallDispositionSelected &&
        !this.tasksSentSmsTemplates[this.activeTask.id]
    }
  },

  created () {
    if (this.hasContactDisposition) {
      this.setIsContactDisposed(true)
    }

    if (this.hasCallDisposition) {
      this.setIsCallDisposed(true)
    }
  },

  methods: {
    ...mapActions([
      'setIsCallDisposed',
      'setIsContactDisposed'
    ]),

    onCallDisposed (value) {
      this.setIsCallDisposed(value > 0)
    },

    onContactDisposed (value) {
      this.setIsContactDisposed(value > 0)
    },

    clearDispositions () {
      const hasCallDispositionId = this.dialer.communication &&
        (this.dialer.communication.call_disposition_id || this.dialer.communication.call_disposition_id === 0)
      const hasContactDispositionId = this.contact &&
        (this.contact.disposition_status_id || this.contact.disposition_status_id === 0)

      if (!hasCallDispositionId) {
        this.setIsCallDisposed(false)
      }

      if (!hasContactDispositionId) {
        this.setIsContactDisposed(false)
      }
    }
  },

  watch: {
    isNotDisposed (newValue) {
      this.$VueEvent.fire('pauseWrapUp', newValue)
    },

    'dialer.currentStatus': function (value) {
      const isCallInprogress = ['CALL_CONNECTED', 'WRAP_UP']

      if (isCallInprogress.includes(value) && this.isNotDisposed) {
        this.$VueEvent.fire('pauseWrapUp', true)
      }
    },

    hasContactDisposition (value) {
      this.setIsContactDisposed(value)
    },

    hasCallDisposition (value) {
      this.setIsCallDisposed(value)
    }
  }
}
