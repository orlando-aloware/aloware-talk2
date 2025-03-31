<template>
  <q-card-section data-testid="integration-sync-card-section">
    <b-row>
      <b-button
        class="text-white"
        size="sm"
        variant="primary"
        tabindex="0"
        block
        data-testid="integration-sync-button"
        @click="syncIntegration"
      >
        <i
          class="fa fa-sync-alt"
          v-if="!isSyncing"
        ></i>
        <q-spinner-bars
          v-if="isSyncing"
          data-testid="integration-sync-spinner"
          color="white"
        >
        </q-spinner-bars>
        {{ isSyncing ? 'Syncing...' : 'Sync with ' + getIntegrationTitle }}
        <q-tooltip
          anchor="top middle"
          self="center middle"
          data-testid="integration-sync-tooltip"
          :offset="[-220, 10]"
        >
          <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between {{ whiteLabelName }} and {{ getIntegrationTitle }}.</p>
          <p class="font-weight-bold">You'll want to click on this button if:</p>
          <p class="mt-1 mb-0">- The contact was recently merged in {{ getIntegrationTitle }} with another contact.</p>
          <p class="mt-0 mb-0">- You notice any inconsistencies between {{ whiteLabelName }} and {{ getIntegrationTitle
            }} data on this contact.</p>
        </q-tooltip>
      </b-button>
    </b-row>
  </q-card-section>
</template>
<script>
import { GUESTY_INTEGRATION, SALESFORCE_INTEGRATION, ZOHO_INTEGRATION } from 'src/constants/integrations'
import talk2Api from 'src/plugins/api/api'
import {
  simpsocialMixin
} from 'src/plugins/mixins'

export default {
  name: 'sync-with-integration',
  mixins: [
    simpsocialMixin
  ],
  props: {
    integration_title: {
      type: String,
      required: false
    },
    integration_name: {
      type: String,
      required: true
    },
    contact_id: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      isSyncing: false
    }
  },
  computed: {
    getIntegrationTitle () {
      return this.integration_title || this.integration_name.charAt(0).toUpperCase() + this.integration_name.slice(1)
    }
  },
  methods: {

    syncIntegration () {
      this.isSyncing = true
      let apiCall

      switch (this.integration_name) {
        case SALESFORCE_INTEGRATION:
          apiCall = talk2Api.V1.contact.syncSalesforce(this.contact_id)
          break
        case GUESTY_INTEGRATION:
          apiCall = talk2Api.V1.contact.syncGuesty(this.contact_id)
          break
        case ZOHO_INTEGRATION:
          apiCall = talk2Api.V1.contact.syncZoho(this.contact_id)
          break
        default:
          this.isSyncing = false
          this.$generalNotification('Unsupported integration.', 'error')
          return
      }

      apiCall.then(async _ => {
        await this.$emit('sync-complete')
      }).catch(e => {
        console.warn(e)
        this.$generalNotification('An error occurred during synchronization.', 'error')
      }).finally(_ => {
        this.isSyncing = false
      })
    }
  }
}
</script>
