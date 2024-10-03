import { mapState } from 'vuex'
import { simpsocialMixin } from 'src/plugins/mixins'

export default {
  mixins: [simpsocialMixin],

  computed: {
    ...mapState(['statics']),

    appLogo () {
      if (this.statics.whitelabel) {
        return this.statics.logo && this.statics.logo.replace(/\//, '') // replace first occurrence of '/'
      }

      if (this.isSimpSocial) {
        return '/assets/images/logos/simpsocial.png'
      }

      return 'app-icons/misc/logo.svg'
    }
  }
}
