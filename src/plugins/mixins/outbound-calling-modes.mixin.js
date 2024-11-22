import { mapState } from 'vuex'
import {
  OUTBOUND_CALLING_MODE_SELECTOR_ALWAYS_ASK,
  OUTBOUND_CALLING_MODE_SELECTOR_SELECT_MANUALLY,
  OUTBOUND_CALLING_MODE_SELECTOR_USE_COMPANY_DEFAULT
} from 'src/constants/user-outbound-calling-modes'

export default {
  computed: {
    ...mapState('settings', ['user']),

    isAlwaysAskOutboundCallingMode () {
      console.log('profile', this.user.outbound_calling_selector)
      return this.user.outbound_calling_selector === OUTBOUND_CALLING_MODE_SELECTOR_ALWAYS_ASK
    },

    isSelectManuallyOutboundCallingMode () {
      return this.user.outbound_calling_selector === OUTBOUND_CALLING_MODE_SELECTOR_SELECT_MANUALLY
    },

    isUseCompanyDefaultOutboundCallingMode () {
      return this.user.outbound_calling_selector === OUTBOUND_CALLING_MODE_SELECTOR_USE_COMPANY_DEFAULT
    }
  }
}
