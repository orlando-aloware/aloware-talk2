import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

export default {
  mixins: [
    aclMixin
  ],

  computed: {
    ...mapState('auth', [
      'profile'
    ]),

    canUseBroadcast () {
      const isCompanyEnabled = this.profile.bulk_rvm_enabled || this.profile.bulk_sms_enabled
      const isUserEnabled = this.hasPermissionTo('create broadcast message') || this.hasPermissionTo('create broadcast rvm')

      if (!isUserEnabled) {
        return false
      }

      return isCompanyEnabled
    }
  }
}
