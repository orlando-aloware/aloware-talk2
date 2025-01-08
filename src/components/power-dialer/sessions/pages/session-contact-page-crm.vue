<template>
  <div class="row full-height">
    <div class="col-12 p-0">
      <div class="hubspot-iframe-container" v-if="usePopup && hubspotLink">
        The CRM will display in a popup. <br />
        <a href="#" @click.prevent="openHubspotLink">Click here to manually open the CRM.</a>
      </div>
      <div class="hubspot-iframe-container" v-if="!usePopup && hubspotLink">
        <iframe class="hubspot-crm-iframe"
                :src="hubspotLink"
                frameborder="0"
                id="hubspot-crm">
        </iframe>
      </div>
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapState } from 'vuex'
import { hubspotIntegrationMixin } from 'src/plugins/mixins'
import { isEmpty } from 'lodash'

export default {
  name: 'SessionContactPageCrm',

  props: {
    usePopup: {
      type: Boolean,
      default: true
    }
  },

  mounted () {
    if (this.usePopup && !isEmpty(this.hubspotLink)) {
      this.openHubspotLink()
    }
  },

  mixins: [
    hubspotIntegrationMixin
  ],

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState('contacts', ['contact']),

    hubspotLink () {
      return this.getHubspotContactLink(this.contact, this.usePopup)
    },

    test () {
      const iframe = document.getElementById('hubspot-crm')
      return iframe.contentWindow
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setContact',
      'setContactClone'
    ]),

    openHubspotLink () {
      if (isEmpty(this.hubspotLink)) {
        return
      }

      window.open(this.hubspotLink, 'hubspot-crm', 'width=1200,height=800')
    },

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
  },
  watch: {
    contact: {
      deep: true,
      handler (newValue, oldValue) {
        const oldHubspotLink = this.getHubspotContactLink(oldValue, this.usePopup)
        const newHubspotLink = this.getHubspotContactLink(newValue, this.usePopup)

        // if it's the same contact (contact was immediately redialed)
        // but hubspot link is gone, reuse the old contact.
        if (oldValue?.id === newValue?.id && isEmpty(newHubspotLink) && !isEmpty(oldHubspotLink)) {
          this.setContact(oldValue)
          this.setContactClone(oldValue)
        }

        if (this.usePopup) {
          this.openHubspotLink()
        }
      }
    }
  }
}
</script>

<style scoped>
.hubspot-iframe-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.5rem;
  color: #000;
  text-align: center;
}
</style>
