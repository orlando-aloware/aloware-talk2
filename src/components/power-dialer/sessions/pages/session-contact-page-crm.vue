<template>
  <div class="row full-height">
    <div class="col-12 p-0">
      <div class="integration-iframe-container" v-if="usePopup && integrationLink">
        The CRM will display in a popup. <br />
        <a href="#" @click.prevent="openIntegrationLink">Click here to manually open the CRM.</a>
      </div>
      <div class="integration-iframe-container" v-if="!usePopup && integrationLink">
        <iframe class="integration-crm-iframe"
                :src="integrationLink"
                frameborder="0"
                id="integration-crm">
        </iframe>
      </div>
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapState } from 'vuex'
import { hubspotIntegrationMixin } from 'src/plugins/mixins'
import { isEmpty } from 'lodash'
import { HUBSPOT_INTEGRATION, SALESFORCE_INTEGRATION } from 'src/constants/integrations'

export default {
  name: 'SessionContactPageCrm',

  props: {
    usePopup: {
      type: Boolean,
      default: true
    },
    selectedIntegration: {
      type: String,
      required: true
    }
  },

  mounted () {
    if (this.usePopup && !isEmpty(this.integrationLink)) {
      this.openIntegrationLink()
    }
  },

  mixins: [
    hubspotIntegrationMixin
  ],

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState('contacts', ['contact']),

    integrationLink () {
      switch (this.selectedIntegration.toLowerCase()) {
        case SALESFORCE_INTEGRATION:
          return this.getSalesforceLink(this.contact)
        case HUBSPOT_INTEGRATION:
          return this.getHubspotContactLink(this.contact, !this.usePopup)
        default:
          return null
      }
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setContact',
      'setContactClone'
    ]),

    getSalesforceLink (contact) {
      return contact?.integration_data?.salesforce?.link
    },

    openIntegrationLink () {
      if (isEmpty(this.integrationLink)) {
        return
      }

      window.open(this.integrationLink, 'integration-crm', 'width=1200,height=800')
    }
  },
  watch: {
    contact: {
      deep: true,
      handler (newValue, oldValue) {
        let oldLink = null
        let newLink = null
        switch (this.selectedIntegration.toLowerCase()) {
          case HUBSPOT_INTEGRATION:
            oldLink = this.getHubspotContactLink(oldValue, !this.usePopup)
            newLink = this.getHubspotContactLink(newValue, !this.usePopup)
            break
          case SALESFORCE_INTEGRATION:
            oldLink = this.getSalesforceLink(oldValue)
            newLink = this.getSalesforceLink(newValue)
            break
        }

        // if it's the same contact (contact was immediately redialed)
        // but hubspot link is gone, reuse the old contact.
        if (oldValue?.id === newValue?.id && isEmpty(newLink) && !isEmpty(oldLink)) {
          this.setContact(oldValue)
          this.setContactClone(oldValue)
        }

        if (this.usePopup) {
          this.openIntegrationLink()
        }
      }
    },
    'selectedIntegration' () {
      if (this.usePopup) {
        this.openIntegrationLink()
      }
    }
  }
}
</script>

<style scoped>
.integration-iframe-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.5rem;
  color: #000;
  text-align: center;
}
</style>
