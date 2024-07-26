import _ from 'lodash'
import * as KycLogs from '../../constants/kyc-logs'
import * as ComplianceStatuses from '../../constants/compliance-status'
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

    ssuEnabled () {
      return this.statics?.xmas_enabled || false
    },

    isTrialKYC () {
      if (!this.ssuEnabled) {
        return false
      }

      return this.currentCompany?.is_kyc && this.currentCompany?.is_trial
    },

    isCompanyKYC () {
      if (!this.ssuEnabled) {
        return false
      }

      return this.currentCompany?.is_kyc
    },

    isCompanyBrandApproved () {
      return this.currentCompany?.a2p_brand?.status === ComplianceStatuses.STATUS_APPROVED
    },

    isKYCFilled () {
      if (!this.ssuEnabled) {
        return false
      }

      return this.currentCompany?.kyc_filled
    }
  },

  methods: {
    skipRestrictions (kycStatus) {
      return !this.ssuEnabled || kycStatus === KycLogs.KYC_STATUS_NONE
    },

    getStatus () {
      // Gets the KYC status from the company
      return this.currentCompany?.is_trial ? this.currentCompany.kyc_status : KycLogs.KYC_STATUS_NONE
    },

    enabledToCreateContacts () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return true
      }

      return KycLogs.CREATE_CONTACTS_ALLOWED.includes(kycStatus)
    },

    enabledToImportContacts () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return true
      }

      return KycLogs.IMPORT_CONTACTS_ALLOWED.includes(kycStatus)
    },

    enabledToCallNumber (phone) {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return true
      }

      phone = this.$options.filters.fixPhone(phone)

      if (phone === this.profile?.phone_number) {
        return KycLogs.ONESELF_CALLS_ALLOWED.includes(kycStatus)
      }

      return KycLogs.CALLS_TO_OTHERS_ALLOWED.includes(kycStatus)
    },

    enabledToTextNumber () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus) || this.isCompanyBrandApproved) {
        return true
      }

      return KycLogs.TEXTS_ALLOWED.includes(kycStatus)
    },

    singleTestNumberPurchased () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return true
      }

      return KycLogs.SINGLE_TEST_NUMBER_PURCHASED_ALLOWED.includes(kycStatus)
    },

    enabledToBuyNewNumbers () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return true
      }

      return KycLogs.BUY_NEW_NUMBERS_ALLOWED.includes(kycStatus)
    },

    enabledToAddSequences () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return true
      }

      return KycLogs.ADD_SEQUENCES_ALLOWED.includes(kycStatus)
    },

    enabledToAddBroadcasts () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return true
      }

      return KycLogs.ADD_BROADCASTS_ALLOWED.includes(kycStatus)
    },

    allowedToEnableIntegrationsPage () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return true
      }

      return KycLogs.ENABLE_INTEGRATIONS_ALLOWED.includes(kycStatus)
    },

    enabledToSkipTrialAndSubscribe () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return true
      }

      return KycLogs.SKIP_TRIAL_ALLOWED.includes(kycStatus)
    },

    isViewOnlyAccess () {
      const kycStatus = this.getStatus()

      if (this.skipRestrictions(kycStatus)) {
        return false
      }

      return KycLogs.VIEW_ONLY_ALLOWED.includes(kycStatus)
    },

    onOpenFinishRegistration () {
      const link = `${process.env.API_URL}/account?tab=compliance&open_register_business_information=true`
      return window.open(link, '_self')
    }
  }
})
