import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState('auth', ['profile']),

    isSimpSocialIntegrationEnabled () {
      return this.currentCompany && this.currentCompany.simpsocial_integration_enabled && this.profile
    },

    isSimpSocial () {
      return this.currentCompany && this.currentCompany.reseller_id === 357
    }
  }
}
