import _ from 'lodash'
import { mapState } from 'vuex'

export default _.merge({
  computed: {
    ...mapState('auth', ['profile']),
    ...mapState('cache', ['currentCompany']),
    ...mapState('contacts', ['selectedLine']),

    currentKycStatus () {
      return this.getStatus()
    },

    isTrial () {
      return this.currentCompany?.is_trial
    },

    isCompanyA2pCampaignApproved () {
      return this.currentCompany?.is_a2p_campaign_approved
    },

    isKYCFilled () {
      return this.currentCompany?.kyc_filled
    }
  },

  methods: {
    getStatus () {
      // Gets the KYC status from the company
      return this.currentCompany.kyc_status
    },

    shouldAllowSmsTraffic (selectedLine) {
      if (!selectedLine) {
        return true
      }

      /**
       * Allow sms traffic on Dialer and Contact text Composer component
       */
      if (!selectedLine.is_10_dlc) {
        /**
         *  1 - No A2P Campaign + No 10DLC Line -> Allow messaging
         *  2 - A2P Campaign  + No 10DLC (TF) ->  Allow messaging
         */
        return true
      }

      if (this.isCanadaLine(selectedLine)) {
        /**
         * 3 - 10DLC Canada lines -> Allow messaging
         */
        return true
      }

      /**
       *   3 - A2P Campaign + 10DLC Line -> Allow messaging
       *   4 - No A2P Campaign + 10DLC -> Not allowed
       */
      return selectedLine.is_10_dlc && selectedLine.has_approved_a2p_use_case
    },

    enabledToImportContacts () {
      return true
    },

    enabledToCallNumber (phone) {
      return true
    },

    enabledToTextNumber () {
      return true
    },

    singleTestNumberPurchased () {
      return true
    },

    enabledToBuyNewNumbers () {
      return true
    },

    enabledToAddSequences () {
      return true
    },

    enabledToAddBroadcasts () {
      return true
    },

    allowedToEnableIntegrationsPage () {
      return true
    },

    enabledToSkipTrialAndSubscribe () {
      return true
    },

    onOpenFinishRegistration () {
      const link = `${process.env.API_URL}/account?tab=compliance&open_register_business_information=true`
      return window.open(link, '_self')
    },

    isCanadaLine (selectedLine) {
      return selectedLine?.incoming_numbers?.filter(number => number.country === 'CA').length > 0
    }
  }
})
