import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['statics']),

    appLogo () {
      if (this.statics.whitelabel) {
        return this.statics.logo && this.statics.logo.replace(/\//, '') // replace first occurrence of '/'
      }

      return 'app-icons/misc/logo.svg'
    },

    isSimpSocial () {
      return this.statics?.domain?.includes('simpsocial')
    }
  }
}
