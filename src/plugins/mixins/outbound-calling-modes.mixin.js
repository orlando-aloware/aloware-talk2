import { mapState } from 'vuex'
import {
  OUTBOUND_CALLING_MODE_SELECTOR_ALWAYS_ASK,
  OUTBOUND_CALLING_MODE_SELECTOR_SELECT_MANUALLY,
  OUTBOUND_CALLING_MODE_SELECTOR_USE_COMPANY_DEFAULT
} from 'src/constants/user-outbound-calling-modes'

export default {
  computed: {
    ...mapState('settings', ['user']),
    ...mapState('cache', ['currentCompany']),

    forceOutboundLine () {
      return this.currentCompany && this.currentCompany.force_outbound_line
    },

    isAlwaysAskOutboundCallingMode () {
      return this.user?.outbound_calling_selector === OUTBOUND_CALLING_MODE_SELECTOR_ALWAYS_ASK
    },

    isSelectManuallyOutboundCallingMode () {
      return this.user?.outbound_calling_selector === OUTBOUND_CALLING_MODE_SELECTOR_SELECT_MANUALLY
    },

    isUseCompanyDefaultOutboundCallingMode () {
      return this.user?.outbound_calling_selector === OUTBOUND_CALLING_MODE_SELECTOR_USE_COMPANY_DEFAULT
    }
  }
}
