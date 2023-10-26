import _ from 'lodash'
import * as KycLogs from '../../constants/kyc-logs'
import { mapState } from 'vuex'

export default _.merge({
  methods: {
    getSource (source = null) {
      // this has been added to provide us with a way to check if user is logged in
      if (!source) {
        source = this.profile
      } else {
        source = _.get(source, 'profile', null)
      }

      return source
    },

    getStatus (status = null, source = null) {
      // Gets the KYC status from the compay
      if (source) {
        status = source?.company?.kyc_status
      }

      if (!status) {
        status = KycLogs.KYC_STATUS_NONE
      }

      return status
    },

    enabledToCreateContacts (status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return false
      }

      status = this.getStatus(status, source)

      return KycLogs.CREATE_CONTACTS_ALLOWED.includes(status)
    },

    enabledToImportContacts (status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return false
      }

      status = this.getStatus(status, source)

      return KycLogs.IMPORT_CONTACTS_ALLOWED.includes(status)
    },

    enabledToCallNumber (phone, status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return false
      }

      status = this.getStatus(status, source)

      if (phone === source.phone_number) {
        return KycLogs.ONESELF_CALLS_ALLOWED.includes(status)
      }

      return KycLogs.CALLS_TO_OTHERS_ALLOWED.includes(status)
    },

    enabledToTextNumber (phone, status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return false
      }

      status = this.getStatus(status, source)

      if (phone === source.phone_number) {
        return KycLogs.ONESELF_TEXTS_ALLOWED.includes(status)
      }

      return KycLogs.TEXTS_TO_OTHERS_ALLOWED.includes(status)
    },

    singleTestNumberPurchased (status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return false
      }

      status = this.getStatus(status, source)

      return KycLogs.SINGLE_TEST_NUMBER_PURCHASED_ALLOWED.includes(status)
    },

    enabledToBuyNewNumbers (status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return false
      }

      status = this.getStatus(status, source)

      return KycLogs.BUY_NEW_NUMBERS_ALLOWED.includes(status)
    },

    enabledToVisitIntegrationsPage (status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return false
      }

      status = this.getStatus(status, source)

      return KycLogs.VISIT_INTEGRATIONS_ALLOWED.includes(status)
    },

    enabledToSkipTrialAndSubscribe (status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return false
      }

      status = this.getStatus(status, source)

      return KycLogs.SKIP_TRIAL_ALLOWED.includes(status)
    },

    isViewOnlyAccess (status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return false
      }

      status = this.getStatus(status, source)

      return KycLogs.VIEW_ONLY_ALLOWED.includes(status)
    }
  },
  computed: {
    ...mapState('auth', ['profile']),
    viewOnly () {
      return this.isViewOnlyAccess()
    },
    currentKycStatus () {
      return this.getStatus()
    }
  }
})
