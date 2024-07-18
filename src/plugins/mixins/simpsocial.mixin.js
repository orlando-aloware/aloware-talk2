import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState('auth', ['profile']),

    ...mapState('statics'),

    isSimpSocialIntegrationEnabled () {
      // return this.currentCompany && this.currentCompany.simpsocial_integration_enabled && this.profile
      return true
    },

    isSimpSocial () {
      return (this.currentCompany && this.currentCompany.reseller_id === 357) || this.statics?.domain?.includes('simpsocial')
    },

    whiteLabelName () {
      if (this.statics.whitelabel) {
        return this.statics?.name ?? 'Aloware'
      }

      return 'Aloware'
    }
  }
}
