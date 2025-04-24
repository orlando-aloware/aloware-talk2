import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['statics']),

    whiteLabelName () {
      if (this.statics?.whitelabel) {
        return this.statics?.name ?? 'Aloware'
      }

      return 'Aloware'
    },

    whiteLabelText () {
      return this.statics?.whitelabel ? '' : 'Aloware '
    },

    whiteLabelContactText () {
      return this.statics?.whitelabel ? '' : 'Aloware'
    },

    whiteLabelProfileText () {
      return this.statics?.whitelabel ? '' : ' on Aloware'
    }
  }
}
