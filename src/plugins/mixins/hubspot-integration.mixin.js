import { mapState } from 'vuex'
import { isEmpty } from 'lodash'
import talk2Api from 'src/plugins/api/api'

export default {
  data () {
    return {
      integration_name: 'hubspot'
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
    getIntegrationData (contact) {
      return talk2Api.V1.contact.getIntegrationData(contact.id, {
        params: {
          integration_name: this.integration_name,
          dialer_mode: this.dialer_mode ? 1 : 0
        }
      })
    },

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

    getHubspotLink (contact) {
      const baseLink = this.getHubspotContactBaseLink(contact)

      if (baseLink) {
        const contactId = this.getContactId(contact)
        return contactId ? `${baseLink}contact/${contactId}` : false
      }

      return false
    },

    getContactId (contact) {
      if (contact?.integration_data && !isEmpty(contact.integration_data)) {
        return contact.integration_data.vid
      }

      return null
    }
  }
}
