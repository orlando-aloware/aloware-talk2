import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('cache', ['currentCompany']),

    isAloware () {
      return this.currentCompany.id === (process.env.APP_ENV === 'development' ? 7 : 47)
    },

    isLocal () {
      return process.env.APP_ENV === 'local'
    }
  }
}
