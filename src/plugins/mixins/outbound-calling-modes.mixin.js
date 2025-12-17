import { mapState } from 'vuex'
import {
  OUTBOUND_CALLING_MODE_USER_DEFAULT
} from 'src/constants/user-outbound-calling-modes'

export default {
  computed: {
    ...mapState('auth', ['profile']),
    ...mapState('cache', ['currentCompany']),

    accountForceOutboundLine () {
      return this.currentCompany && this.currentCompany.force_outbound_line
    },

    accountIsSelectManuallyOutboundCallingMode () {
      return this.currentCompany.default_outbound_campaign_id !== null
    },

    userIsSelectManuallyOutboundCallingMode () {
      return this.profile.outbound_calling_mode === OUTBOUND_CALLING_MODE_USER_DEFAULT &&
        this.profile.default_outbound_campaign_id
    },

    userIsUseCompanyDefaultOutboundCallingMode () {
      return this.profile.outbound_calling_mode === OUTBOUND_CALLING_MODE_USER_DEFAULT &&
        !this.profile.default_outbound_campaign_id &&
        this.currentCompany.default_outbound_campaign_id
    },

    shouldMakeCallDirectlyAccountLevel () {
      if (!this.accountForceOutboundLine) {
        if (this.userIsUseCompanyDefaultOutboundCallingMode) {
          return true
        }

        return false
      }

      if (this.accountIsSelectManuallyOutboundCallingMode) {
        return true
      }

      return false
    },

    shouldMakeCallDirectlyUserLevel () {
      if (this.accountForceOutboundLine) {
        return false
      }

      if (this.userIsSelectManuallyOutboundCallingMode) {
        return true
      }

      return false
    }
  }
}
