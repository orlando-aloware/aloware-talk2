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
    getHubspotContactBaseLink (contact) {
      if (this.currentCompany &&
        this.currentCompany.hubspot_integration_enabled &&
        contact &&
        contact.integration_data &&
        this.currentCompany.hubspot_marketing_portal_id) {
        return `https://${this.companyDomain}/contacts/${this.currentCompany.hubspot_marketing_portal_id}/`
      }

      return false
    },

    getHubspotContactLink (contact) {
      const baseLink = this.getHubspotContactBaseLink(contact)

      if (baseLink) {
        const contactId = this.getContactId(contact)
        return contactId ? `${baseLink}contact/${contactId}` : false
      }

      return false
    }
  }
}
