<template>
  <div class="w-100 h-100 px-2">

    <b-overlay class="d-flex w-100 h-100"
               rounded="sm"
               :show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>

      <div class="col-4 p-1 px-2 d-flex flex-column">
        <q-card class="p-3 flex-grow-0"
                flat>
          <q-card-section class="p-0">
            <div class="text-subtitle1 text-weight-medium">
              Scripts
            </div>
          </q-card-section>
        </q-card>

        <details-scripts class="flex-grow-1 h-100 overflow-hidden"
                        :resources="scripts" />
      </div>

      <div class="col-4 p-1 px-2 d-flex flex-column h-100">
        <q-card class="p-3 flex-grow-0 mb-2"
                flat
                v-if="isHubspotEnabled && hubspotLink">
          <q-card-section class="p-0">
            <b-link class="text-weight-medium text-decoration-none"
                    target="_blank"
                    :href="hubspotLink">
              <hubspot-icon />
              <span class="session-integration-title ml-1">Open in HubSpot</span>
            </b-link>
          </q-card-section>
        </q-card>

        <q-card class="p-3 flex-grow-0 mb-2"
                flat
                v-if="isZohoEnabled && zohoLink">
          <q-card-section class="p-0">
            <b-link class="text-weight-medium text-decoration-none"
                    target="_blank"
                    :href="zohoLink">
              <zoho-icon />
              <span class="session-integration-title ml-1">Open in Zoho</span>
            </b-link>
          </q-card-section>
        </q-card>

        <details-contact-information class="flex-grow-1 h-100 overflow-hidden d-flex flex-column"
                                   :resources="contact"
                                   v-if="contact" />
      </div>
      <div class="col-4 p-1 px-2 h-100 overflow-y-scroll">

        <details-tools />
      </div>

    </b-overlay>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
import DetailsScripts from './details-scripts'
import DetailsContactInformation from './details-contact-information'
import DetailsTools from './details-tools'
import HubspotIcon from 'components/icons/hubspot-icon'
import { hubspotIntegrationMixin, zohoIntegrationMixin } from 'src/plugins/mixins'
import ZohoIcon from 'components/icons/zoho-icon'

export default {
  name: 'SessionContactPageDetails',

  mixins: [
    hubspotIntegrationMixin, zohoIntegrationMixin
  ],

  components: {
    ZohoIcon,
    DetailsScripts,
    DetailsContactInformation,
    DetailsTools,
    HubspotIcon
  },

  data () {
    return {
      loading: false,
      scripts: {
        leads: '',
        options: [
          { value: 1, label: 'Cold Leads' },
          { value: 2, label: 'Hot Leads' },
          { value: 3, label: 'Sample Leads' }
        ],
        message: 'Hi, my name’s Natasha. I saw that you recently purchased a home. Are you by chance looking for car insurance?<br/><br/>Great. Let me tell you about some products we offer.<br/><br/>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br/><br/>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Hi, my name’s Natasha. I saw that you recently purchased a home. Are you by chance looking for car insurance?<br/><br/>Great. Let me tell you about some products we offer.'
      }
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState('contacts', ['contact']),

    ...mapGetters('powerDialer', [
      'sessionLoader'
    ]),

    hubspotLink () {
      return this.getHubspotContactLink(this.contact)
    },

    zohoLink () {
      return this.getZohoContactLink(this.contact)
    }
  }
}
</script>
