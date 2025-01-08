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
    getHubspotContactBaseLink () {
      if (this.currentCompany &&
        this.currentCompany.hubspot_integration_enabled &&
        this.currentCompany.hubspot_marketing_portal_id) {
        return `https://${this.companyDomain}/embed/${this.currentCompany.hubspot_marketing_portal_id}/0-1/`
      }

      return false
    },

    getHubspotContactLink (contact, usePopup) {
      if (usePopup) {
        return contact?.integration_data?.hubspot?.link
      }

      if (!this.getHubspotContactBaseLink()) {
        return false
      }

      return this.getHubspotContactBaseLink() + contact?.integration_data?.hubspot?.contact_id
    }
  }
}
