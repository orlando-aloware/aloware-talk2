import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import * as Roles from '../../constants/roles'

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
      const isAgent = this.hasRole(Roles.COMPANY_AGENT)

      if (isAgent && !isUserEnabled) {
        return false
      }

      return isCompanyEnabled
    }
  }
}
