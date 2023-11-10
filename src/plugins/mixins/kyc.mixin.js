import _ from 'lodash'
import * as KycLogs from '../../constants/kyc-logs'
import { mapState } from 'vuex'

export default _.merge({
  computed: {
    ...mapState('auth', ['profile']),
    ...mapState('cache', ['currentCompany']),

    viewOnly () {
      return this.isViewOnlyAccess()
    },

    currentKycStatus () {
      return this.getStatus()
    },

    isDisabled () {
      const source = this.getSource()
      const status = this.getStatus(null, source)
      return status !== KycLogs.KYC_STATUS_NONE && this.currentCompany?.is_trial
    }
  },

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
      // Gets the KYC status from the company
      if (source) {
        status = source?.company?.kyc_status
      }

      if (!source?.company?.is_trial || !status) {
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

      if (status === KycLogs.KYC_STATUS_NONE) {
        return true
      }

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

      if (status === KycLogs.KYC_STATUS_NONE) {
        return true
      }

      return KycLogs.IMPORT_CONTACTS_ALLOWED.includes(status)
    },

    enabledToCallNumber (phone) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      // source = this.getSource(source)

      if (!this.profile) {
        return false
      }

      const source = this.getSource()
      const status = this.getStatus(null, source)
      if (status === KycLogs.KYC_STATUS_NONE) {
        return true
      }

      phone = this.$options.filters.fixPhone(phone)

      if (phone === this.profile.phone_number) {
        return KycLogs.ONESELF_CALLS_ALLOWED.includes(status)
      }

      return KycLogs.CALLS_TO_OTHERS_ALLOWED.includes(status)
    },

    enabledToTextNumber (phone) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      // source = this.getSource(source)
      if (!this.profile) {
        return false
      }

      const source = this.getSource()
      const status = this.getStatus(null, source)
      if (status === KycLogs.KYC_STATUS_NONE) {
        return true
      }

      phone = this.$options.filters.fixPhone(phone)

      if (phone === this.profile.phone_number) {
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

      if (status === KycLogs.KYC_STATUS_NONE) {
        return true
      }

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

      if (status === KycLogs.KYC_STATUS_NONE) {
        return true
      }

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

      if (status === KycLogs.KYC_STATUS_NONE) {
        return true
      }

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

      if (status === KycLogs.KYC_STATUS_NONE) {
        return true
      }

      return KycLogs.SKIP_TRIAL_ALLOWED.includes(status)
    },

    isViewOnlyAccess (status = null, source = null) {
      // this has been added to provide us with a way to check kyc status in beforeRouteEnter
      // if user is logged out of the system when session expires
      source = this.getSource(source)
      if (!source) {
        return true
      }

      status = this.getStatus(status, source)

      if (status === KycLogs.KYC_STATUS_NONE) {
        return false
      }

      return KycLogs.VIEW_ONLY_ALLOWED.includes(status) && this.currentCompany?.is_trial
    }
  }
})
