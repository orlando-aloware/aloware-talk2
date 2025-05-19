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
        // If the link for an HS contact object if it exists, use the company embed link if it does not
        return contact?.integration_data?.hubspot?.embed_link || contact?.integration_data?.hubspot?.company_link
      }

      // Return the contact link, or if it does not exists, the company link
      return contact?.integration_data?.hubspot?.link || contact?.integration_data?.hubspot?.company_link
    }
  }
}
