import { mapState } from 'vuex'

export default {
  data () {
    return {
      integrationName: 'hubspot'
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    isHubspotEnabled () {
      return this.currentCompany && this.currentCompany.hubspot_integration_enabled
    },

    companyDomain () {
      return this.currentCompany.hubspot_company_ui_domain || 'app.hubspot.com'
    }
  },

  methods: {
    getHubspotContactLink (contact, useEmbed) {
      if (useEmbed) {
        return contact?.integration_data?.hubspot?.embed_link
      }

      return contact?.integration_data?.hubspot?.link
    }
  }
}
