<template>
  <div class="integration-wrapper">
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

      <q-card-section v-if="integrationData && integrationData.contact_details">
        <p class="mb-0"
           v-if="integrationData.contact_details.name !== undefined">
          <span class="data-icon-label">Name: </span>
          <span class="data-value">
             <q-tooltip anchor="top middle"
                        self="center middle">
              {{ integrationData.contact_details.name }}
            </q-tooltip>
            {{ integrationData.contact_details.name }}
          </span>
        </p>
        <p class="mb-0"
           v-if="integrationData.contact_details.email && integrationData.contact_details.email.length > 0 && integrationData.contact_details.email[0].value">
          <span class="data-icon-label">Email: </span>
          <span class="data-value">{{ integrationData.contact_details.email[0].value }}</span>
        </p>
        <p class="mb-0"
           v-if="integrationData.contact_details.org_name">
          <span class="data-icon-label">Company: </span>
          <span class="data-value">{{ integrationData.contact_details.org_name }}</span>
        </p>
        <p class="mb-0"
           v-if="integrationData.contact_details.owner_name">
          <span class="data-icon-label">Owner: </span>
          <span class="data-value">{{ integrationData.contact_details.owner_name }}</span>
        </p>
      </q-card-section>

      <q-card-section>
        <b-row>
          <b-button class="text-white"
                    size="sm"
                    variant="primary"
                    tabindex="0"
                    block
                    @click="syncPipedrive">
            <i class="fa fa-sync-alt" v-if="!isSyncing"></i>
            <q-spinner-bars v-if="isSyncing"
                            color="white">
            </q-spinner-bars>
            {{ isSyncing ? 'Syncing...' : 'Sync with Pipedrive' }}
            <q-tooltip anchor="center start"
                       self="center left"
                       :offset="[-220, 10]">
              <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between {{ whiteLabelText }} and Pipedrive.</p>
              <p class="font-weight-bold">You'll want to click on this button if:</p>
              <p class="mt-1 mb-0">- The contact was recently merged in Pipedrive with another contact.</p>
              <p class="mt-0 mb-0">- You notice any inconsistencies between {{ whiteLabelText }} and Pipedrive data on this contact.</p>
            </q-tooltip>
          </b-button>
        </b-row>
      </q-card-section>

    </q-card>

  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import _ from 'lodash'
import {
  pipedriveIntegrationMixin,
  integrationMixin
} from 'src/plugins/mixins'

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

    ...mapState(['statics']),

    contactLink () {
      if (!this.contactIntegrationDataLoaded) {
        return
      }

      return this.pipedriveContactLink(this.contact)
    },

    whiteLabelText () {
      return this.statics.whitelabel ? this.statics.name : 'Aloware'
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
          this.contactIntegrationDataLoaded = true
        })
    },

    syncPipedrive (showAlert = true) {
      this.isSyncing = true
      talk2Api.V1.contact.syncPipedrive(this.contact.id).then(response => {
        this.isSyncing = false
        this.getData()

        if (showAlert) {
          this.$generalNotification('Contact has been successfully synced.')
        }
      })
    }

  },

  watch: {
    'contact.id': _.debounce(function () {
      if (this.contact && this.contact.id && (this.$route.params.id === this.contact.id.toString() || this.$route.name === 'Power Dialer')) {
        this.contactIntegrationDataLoaded = false
        this.getData()
      }
    }, 500)
  }
}
</script>
