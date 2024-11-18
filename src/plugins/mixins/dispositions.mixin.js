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

    isNotDisposed () {
      const isForceCallDisposition = this.currentCompany && this.currentCompany.force_call_disposition && !this.isCallDisposed
      const isForceContactDisposition = this.currentCompany && this.currentCompany.force_contact_disposition && !this.isContactDisposed

      return isForceCallDisposition || isForceContactDisposition
    },

    isHighlightedCallDisposition () {
      if (this.isCallDisposed) {
        return false
      }

      const isForcedCallDisposition = this.currentCompany && this.currentCompany.force_call_disposition

      return isForcedCallDisposition && !this.isCallDisposed
    },

    isHighlightedContactDisposition () {
      if (this.isContactDisposed) {
        return false
      }

      const isForcedContactDisposition = this.currentCompany && this.currentCompany.force_contact_disposition

      return isForcedContactDisposition && !this.isContactDisposed
    },

    hasContactDisposition () {
      return this.dialer.contact &&
        (this.dialer.contact.disposition_status_id || this.dialer.contact.disposition_status_id === 0)
    },

    hasCallDisposition () {
      return this.dialer.communication &&
        (this.dialer.communication.call_disposition_id || this.dialer.communication.call_disposition_id === 0)
    },

    checkForceDisposition () {
      const shouldForceContactDisposition = this.currentCompany?.force_contact_disposition &&
        !this.profile?.last_call?.contact?.disposition_status_id
      const shouldForceCallDisposition = this.currentCompany?.force_call_disposition &&
        !this.profile?.last_call?.call_disposition_id

      return shouldForceContactDisposition || shouldForceCallDisposition
    },

    requireSmsSending () {
      // console.log('requireSmsSending', { tasksSentSmsTemplates: this.tasksSentSmsTemplates, activeTask: this.activeTask })

      if (!this.activeTask) {
        return false
      }

      // if forcing to send_sms and sms template is not sent yet
      return Boolean(this.sessionSettings.force_sms) && !this.tasksSentSmsTemplates[this.activeTask.id]
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
      const newValue = value || value === 0
      this.setIsCallDisposed(newValue)
    },

    onContactDisposed (value) {
      const newValue = value || value === 0
      this.setIsContactDisposed(newValue)
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
