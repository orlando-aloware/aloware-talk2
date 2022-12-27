<template>
<!-- PLAT-972 - INTEGRATION CARDS COMPONENT! -->
  <div class="hubspot-integration-wrapper">
    <q-card class="hubspot-card"
            flat>
      <q-item class="p-0">
        <q-item-section v-if="contactLink">
          <b-link target="_blank"
                  :href="contactLink">
            <table>
              <tr>
                <td><img class="pipedrive-btn" /></td>
                <td><span class="integration-title">Pipedrive</span></td>
              </tr>
            </table>
          </b-link>
        </q-item-section>
        <q-item-section v-else>
          <a href="#"
             onclick="return false;">
              <table>
                <tr>
                  <td><img class="pipedrive-btn" /></td>
                  <td><span class="integration-title">Pipedrive</span></td>
                </tr>
              </table>
          </a>
        </q-item-section>
      </q-item>

      <q-separator/>

      <q-card-section v-if="integrationData && integrationData.properties">
        <p class="mb-0"
           v-if="integrationData.properties.firstname !== undefined && integrationData.properties.lastname !== undefined">
          <span class="data-icon-label">Name: </span>
          <span class="data-value">
             <q-tooltip anchor="top middle"
                        self="center middle">
              {{ integrationData.properties.firstname.value + ' ' + integrationData.properties.lastname.value }}
            </q-tooltip>
            {{ integrationData.properties.firstname.value + ' ' + integrationData.properties.lastname.value }}
          </span>
        </p>
        <p class="mb-0"
           v-if="integrationData.properties.email">
          <span class="data-icon-label">Email: </span>
          <span class="data-value">{{ integrationData.properties.email.value }}</span>
        </p>
        <p class="mb-0"
           v-if="integrationData.properties.company">
          <span class="data-icon-label">Company: </span>
          <span class="data-value">{{ integrationData.properties.company.value }}</span>
        </p>
        <p class="mb-0"
           v-if="integrationData.properties.hubspot_owner">
          <span class="data-icon-label">Owner: </span>
          <span class="data-value">{{ integrationData.properties.hubspot_owner.firstName + ' ' + integrationData.properties.hubspot_owner.lastName }}</span>
        </p>
      </q-card-section>

      <q-card-section class="pt-0 pb-0"
                      v-if="integrationData && integrationData.properties">
        <q-card class="deals mb-1"
                v-for="(deal, index) in integrationData.properties.deals"
                :key="index"
                flat bordered>
          <q-card-section>
            <q-card-section class="p-0">
              <h6 class="mb-2">
                <b-link class="deals-title ml-0"
                        :href="hubspotContactBaseLink + 'deal/' + deal.dealId"
                        target="_blank">
                  {{ deal.properties.dealname.value }}
                </b-link>
              </h6>
              <p class="mb-1 d-flex">
                <span class="data-icon-label">Amount: </span>
                <span class="data-value ml-1"
                      v-if="deal.properties && deal.properties.amount">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ deal.properties.amount.value | toCurrency }}
                  </q-tooltip>
                  {{ deal.properties.amount.value | toCurrency }}
                </span>
              </p>
              <p class="mb-1 d-flex">
                <span class="data-icon-label">Pipeline: </span>
                <span class="data-value ml-1">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ deal.properties.pipeline.label }}
                  </q-tooltip>
                  {{ deal.properties.pipeline.label }}
                </span>
              </p>
              <p class="mb-1 d-flex">
                <span class="data-icon-label">Stage: </span>
                <span class="data-value ml-1">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ deal.properties.dealstage.label }}
                  </q-tooltip>
                  {{ deal.properties.dealstage.label }}
                </span>
              </p>
            </q-card-section>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-section>
        <b-row>
          <b-button class="text-white"
                    size="sm"
                    variant="primary"
                    tabindex="0"
                    block
                    @click="(() => {})"> <!-- PENDING PLAT-972 -->
            <i class="fa fa-sync-alt" v-if="!isSyncing"></i>
            <q-spinner-bars v-if="isSyncing"
                            color="white">
            </q-spinner-bars>
            {{ isSyncing ? 'Syncing...' : 'Sync with Pipedrive' }}
            <q-tooltip anchor="center start"
                       self="center left"
                       :offset="[-220, 10]">
              <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between Aloware and HubSpot.</p>
              <p class="font-weight-bold">You'll want to click on this button if:</p>
              <p class="mt-1 mb-0">- The contact was recently merged in HubSpot with another contact.</p>
              <p class="mt-0 mb-0">- You notice any inconsistencies between Aloware and HubSpot data on this contact.</p>
            </q-tooltip>
          </b-button>
        </b-row>
      </q-card-section>

    </q-card>

  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import _ from 'lodash'
import { pipedriveIntegrationMixin, integrationMixin } from 'src/plugins/mixins'

export default {
  name: 'integration-pipedrive',

  components: { },

  mixins: [
    pipedriveIntegrationMixin,
    integrationMixin
  ],

  props: {
    contact: {
      type: Object,
      required: true
    },

    dialer_mode: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    contactLink () {
      if (!this.contactIntegrationDataLoaded) {
        return
      }

      return this.pipedriveContactLink(this.contact)
    }
  },

  data () {
    return {
      isSyncing: false,
      integrationData: null,
      contactIntegrationDataLoaded: false
    }
  },

  async mounted () {
    if (this.contact && this.contact.id) {
      this.getData()
    }
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'setContactClone']),

    getData () {
      return this.getIntegrationData(this.contact, 'pipedrive')
        .then(response => {
          this.integrationData = response.data
          this.contact.integration_data = response.data

          // update contact related states
          this.setContact(this.contact)
          this.setContactClone(this.contact)

          this.contactIntegrationDataLoaded = true
        }).catch(err => {
          console.log('err', err)
        })
    }

  },

  watch: {
    'contact.id': _.debounce(function () {
      if (this.contact && this.contact.id && this.$route.params.id === this.contact.id.toString()) {
        this.contactIntegrationDataLoaded = false
        this.getData()
      }
    }, 500)
  }
}
</script>
