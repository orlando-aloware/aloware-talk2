import { mapState } from 'vuex'
import { isEmpty } from 'lodash'

export default {
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
      const hasHsIntegrationData = (contact.integrations && contact.integrations.hubspot) || (contact.integration_data && contact.integration_data.hubspot)

      if (this.currentCompany &&
        this.currentCompany.hubspot_integration_enabled &&
        contact &&
        hasHsIntegrationData &&
        this.currentCompany.hubspot_marketing_portal_id) {
        return `https://${this.companyDomain}/contacts/${this.currentCompany.hubspot_marketing_portal_id}/`
      }

      return false
    },

    getHubspotLink (contact) {
      const baseLink = this.getHubspotContactBaseLink(contact)

      if (baseLink) {
        const contactId = this.getContactId(contact)
        return contactId ? `${baseLink}contact/${contactId}` : false
      }

      return false
    },

    getContactId (contact) {
      const contactId = { data: null }

      switch (true) {
        case contact.integration_data && !isEmpty(contact.integration_data):
          contactId.data = contact.integration_data.hubspot.contact_id
          break
        case contact.integrations && !isEmpty(contact.integrations):
          contactId.data = contact.integrations.hubspot.contact_id
          break
        default:
          contactId.data = null
      }

      return contactId.data
    }
  }
}
