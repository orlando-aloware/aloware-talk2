import { mapGetters, mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

export default {
  mixins: [
    aclMixin
  ],

  computed: {
    ...mapState('auth', [
      'profile'
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
      return this.campaign?.has_tollfree_pn
    },

    showMessageSentAsMmsWarning () {
      return this.useMmsRate && !this.hasTollFreePhoneNumber
    },

    showMessageSentFromTollFreeNumberWarning () {
      return !this.useMmsRate && this.hasTollFreePhoneNumber
    },

    showMessageSentFromTollFreeNumberAsMmsWarning () {
      return this.useMmsRate && this.hasTollFreePhoneNumber
    },

    shouldShowWarning () {
      return this.showMessageSentAsMmsWarning || this.showMessageSentFromTollFreeNumberWarning || this.showMessageSentFromTollFreeNumberAsMmsWarning
    }
  }
}
