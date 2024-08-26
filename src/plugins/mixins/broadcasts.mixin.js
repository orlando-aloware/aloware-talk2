import { mapGetters, mapState } from 'vuex'
import { aclMixin, smsMixin } from 'src/plugins/mixins'

export default {
  data () {
    return {
      charactersPerPage: 160
    }
  },

  mixins: [
    aclMixin,
    smsMixin
  ],

  computed: {
    ...mapState('auth', [
      'profile'
    ]),

    ...mapState('broadcast', [
      'selectedCampaign',
      'smartEncodedMessageLength',
      'contactsLength'
    ]),

    ...mapGetters('contacts', [
      'messageComposer'
    ]),

    canUseBroadcast () {
      const isCompanyEnabled = this.profile.bulk_rvm_enabled || this.profile.bulk_sms_enabled
      const isUserEnabled = this.hasPermissionTo('create broadcast message') || this.hasPermissionTo('create broadcast rvm')

      if (!isUserEnabled) {
        return false
      }

      return isCompanyEnabled
    },

    useMmsRate () {
      return this.messageComposer.sms.attachments.length > 0 || this.messageComposer.sms.gif_url.length > 0
    },

    hasTollFreePhoneNumber () {
      return this.selectedCampaign?.has_tollfree_pn
    },

    localSmsRate () {
      return this.profile.rate.local_sms
    },

    localMmsRate () {
      return this.profile.rate.local_mms
    },

    tollfreeSmsRate () {
      return this.profile.rate.tollfree_sms
    },

    tollfreeMmsRate () {
      return this.profile.rate.tollfree_mms
    },

    rvmRate () {
      return this.profile.rate.rvm
    },

    sendLongMessagesAsMms () {
      return this.selectedCampaign?.send_long_messages_as_mms
    },

    shouldApplyMmsRate () {
      return this.useMmsRate || this.sendLongMessagesAsMms
    },

    showMessageSentAsMmsDueToAssets () {
      return this.useMmsRate && !this.sendLongMessagesAsMms && !this.hasTollFreePhoneNumber
    },

    showMessageSentAsMmsWarning () {
      return this.shouldApplyMmsRate && !this.hasTollFreePhoneNumber
    },

    showMessageSentFromTollFreeNumberWarning () {
      return !this.shouldApplyMmsRate && this.hasTollFreePhoneNumber
    },

    showMessageSentFromTollFreeNumberAsMmsWarning () {
      return this.shouldApplyMmsRate && this.hasTollFreePhoneNumber
    },

    shouldShowWarning () {
      return this.showMessageSentAsMmsWarning || this.showMessageSentFromTollFreeNumberWarning || this.showMessageSentFromTollFreeNumberAsMmsWarning
    }
  },

  methods: {
    messageCount () {
      const messageLength = this.smartEncodedMessageLength

      if (messageLength === 0) {
        this.segments = 0
        this.charactersPerPage = 160
        return this.segments
      } else if (this.shouldApplyMmsRate) {
        this.segments = 1
        this.charactersPerPage = 1600
        return this.segments
      }

      // @see https://www.twilio.com/docs/glossary/what-sms-character-limit
      // 1. when encoded in GSM-7
      //  - the SMS can contain up to 160 characters, but only if there's a single segment
      //  - if there are more than 1 segments, each segment can contain 153 characters, as 7 are used for the segment headers
      // 2. when encoded in UCS-2
      //  - the SMS can contain up to 70 characters, but only if there's a single segment
      //  - if there are more than 1 segments, each segment can contain 67 characters, as 3 are used for the segment headers
      const charactersPerSinglePage = this.hasUnicode ? 70 : 160
      const charactersPerMultiplePages = this.hasUnicode ? 67 : 153

      if (messageLength <= charactersPerSinglePage) {
        this.segments = 1
        this.charactersPerPage = charactersPerSinglePage
      } else {
        this.segments = Math.ceil(messageLength / charactersPerMultiplePages)
        this.charactersPerPage = charactersPerMultiplePages
      }

      return this.segments
    },

    getEstimatedPrice () {
      let messageRate = this.localSmsRate
      if (this.hasTollFreePhoneNumber && this.shouldApplyMmsRate) {
        messageRate = this.tollfreeMmsRate
      } else if (this.hasTollFreePhoneNumber) {
        messageRate = this.tollfreeSmsRate
      } else if (this.shouldApplyMmsRate) {
        messageRate = this.localMmsRate
      } else if (this.type === 'rvm') {
        messageRate = this.rvmRate
      }

      return this.contactsLength * this.messageCount() * messageRate
    }
  }
}
