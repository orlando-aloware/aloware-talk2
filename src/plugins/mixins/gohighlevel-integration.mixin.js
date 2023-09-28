import { mapState } from 'vuex'

export default {
  data () {
    return {
      integrationName: 'gohighlevel'
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  methods: {
    gohighlevelContactLink (contactId) {
      return this.currentCompany.gohighlevel_contact_link + contactId
    }
  }
}
