import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('cache', ['currentCompany']),

    isAloware () {
      const companyId = process.env.NODE_ENV === 'development' ? 7 : 47
      return this.currentCompany.id === companyId
    }
  }
}
