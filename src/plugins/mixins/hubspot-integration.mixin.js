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
      if (!useEmbed) {
        return contact?.integration_data?.hubspot?.link
      }

      // Convert to an embed link
      const contactLink = contact?.integration_data?.hubspot?.link

      if (!contactLink) {
        return null
      }

      // Get the parts
      const parts = contactLink.match(/(https:\/\/app.hubspot.com)\/contacts\/(\d+)\/record\/0-1\/(\d+)/)
      if (!parts || parts.length < 4) {
        return null
      }

      return `${parts[1]}/embed/${parts[2]}/0-1/${parts[3]}`
    }
  }
}
