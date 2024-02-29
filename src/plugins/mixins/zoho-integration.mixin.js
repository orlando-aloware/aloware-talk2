import { mapState } from 'vuex'

export default {
  data () {
    return {
      integrationName: 'zoho'
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    isZohoEnabled () {
      return this.currentCompany && this.currentCompany.zoho_integration_enabled
    }
  },

  methods: {
    getZohoContactLink (contact) {
      if (contact?.integration_data?.zoho?.contact_id) {
        return contact?.integration_data?.zoho?.contact_link
      }

      return contact?.integration_data?.zoho?.lead_link
    }
  }
}
