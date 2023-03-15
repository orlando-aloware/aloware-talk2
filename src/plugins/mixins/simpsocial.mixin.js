import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState('auth', ['profile']),

    isSimpSocialIntegrationEnabled () {
      return this.currentCompany && this.currentCompany.simpsocial_integration_enabled && this.profile
    },

    isSimpsocial () {
      return this.currentCompany && this.currentCompany.reseller_id === 357
    },

    isNotSimpsocial () {
      return this.currentCompany && this.currentCompany.reseller_id !== 357
    }
  }
}
