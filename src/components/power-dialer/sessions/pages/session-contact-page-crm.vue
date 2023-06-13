<template>
  <div class="row full-height">
    <div class="col-12 p-0">
      <div v-if="!isReferrizer"
           class="hubspot-iframe-container">
        <iframe class="hubspot-crm-iframe"
                :src="hubspotLink"
                frameborder="0"
                id="hubspot-crm"
                v-if="hubspotLink">
        </iframe>
      </div>

      <div v-if="isReferrizer"
           class="referrizer-iframe-container">
        <iframe class="referrizer-crm-iframe"
                :src="referrizerLink"
                :key="contact.id"
                frameborder="0"
                id="referrizer-crm"
                v-if="referrizerLink">
        </iframe>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
import { hubspotIntegrationMixin } from 'src/plugins/mixins'

export default {
  name: 'SessionContactPageCrm',

  mixins: [
    hubspotIntegrationMixin
  ],

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState('contacts', ['contact']),

    hubspotLink () {
      return this.getHubspotContactLink(this.contact)
    },

    referrizerLink () {
      if (!this.isReferrizer) {
        return null
      }

      const customUrl = this.currentCompany?.crm_view_custom_url

      if (!customUrl) {
        return null
      }

      const url = new URL(customUrl)
      const params = new URLSearchParams(url.search)
      const mappedParams = this.getMappedUrlParams(params)

      return `${url.origin}?` + mappedParams.join('&')
    },

    isReferrizer () {
      // dev testing
      if (process.env.APP_ENV !== 'production') {
        return this.profile.company.id === 7
      }

      return this.profile.company.id === 2140
    },

    test () {
      const iframe = document.getElementById('hubspot-crm')
      return iframe.contentWindow
    }
  },

  methods: {
    getMappedUrlParams (params) {
      const agentName = this.profile.name
      const leadNumber = this.contact.phone_number
      const firstName = this.contact.first_name
      const address = this.contact.address
      const companyName = this.contact.company_name
      const city = this.contact.cnam_city
      const state = this.contact.cnam_state
      const zipcode = this.contact.cnam_zipcode
      const email = this.contact.email
      const website = this.contact.website
      const userId = this.profile.id
      let mappedParams = []

      for (const entry of params.entries()) {
        let [key, value] = entry

        // map and convert to its equivalent actual value
        if (/\[*\]/.test(value)) {
          switch (value) {
            case '[AgentName]':
              value = agentName
              break

            case '[LeadNumber]':
              value = leadNumber
              break

            case '[FirstName]':
              value = firstName
              break

            case '[Address]':
              value = address
              break

            case '[CompanyName]':
              value = companyName
              break

            case '[FullState]':
              value = city
              break

            case '[City]':
              value = state
              break

            case '[ZipCode]':
              value = zipcode
              break

            case '[Email]':
              value = email
              break

            case '[Website]':
              value = website
              break

            case '[UserId]':
              value = userId
              break
          }
        }

        mappedParams.push(`${key}=${value}`)
      }

      return mappedParams
    }
  }
}
</script>
