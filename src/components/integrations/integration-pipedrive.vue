<template>
  <div
    class="integration-wrapper integration-wrapper-generic"
    data-testid="integration-pipedrive-wrapper"
  >
    <q-card
      class="integration-card"
      data-testid="integration-pipedrive-card"
      flat
    >
      <q-item class="p-0">
        <span class='integration-jit-card-header'>
          <i class="pipedrive-btn integration-icon-in-header"></i>
          <span class="integration-title">Pipedrive</span>
        </span>
      </q-item>

      <q-separator data-testid="integration-pipedrive-separator" />

      <q-card-section
        v-if="integrationData && integrationData.contact_details"
        data-testid="integration-pipedrive-card-section-1"
      >
        <a
          class="external-contact-integration-link-icon color-primary"
          target="_blank"
          :href="contactLink"
        >
          <i
            class="fa fa-external-link"
            aria-hidden="true"
          />
        </a>
        <p
          class="mb-0"
          data-testid="integration-pipedrive-name"
          v-if="integrationData.contact_details.name !== undefined"
        >
          <span class="data-icon-label">Name: </span>
          <span class="data-value">
            <q-tooltip
              anchor="top middle"
              self="center middle"
            >
              {{ integrationData.contact_details.name }}
            </q-tooltip>
            {{ integrationData.contact_details.name }}
          </span>
        </p>
        <p
          class="mb-0"
          data-testid="integration-pipedrive-email"
          v-if="integrationData.contact_details.email && integrationData.contact_details.email.length > 0 && integrationData.contact_details.email[0].value"
        >
          <span class="data-icon-label">Email: </span>
          <span class="data-value">{{ integrationData.contact_details.email[0].value }}</span>
        </p>
        <p
          class="mb-0"
          data-testid="integration-pipedrive-company"
          v-if="integrationData.contact_details.org_name"
        >
          <span class="data-icon-label">Company: </span>
          <span class="data-value">{{ integrationData.contact_details.org_name }}</span>
        </p>
        <p
          class="mb-0"
          data-testid="integration-pipedrive-owner"
          v-if="integrationData.contact_details.owner_name"
        >
          <span class="data-icon-label">Owner: </span>
          <span class="data-value">{{ integrationData.contact_details.owner_name }}</span>
        </p>
      </q-card-section>

      <q-card-section data-testid="integration-pipedrive-card-section-2">
        <b-row>
          <b-button
            class="text-white"
            size="sm"
            variant="primary"
            tabindex="0"
            block
            data-testid="integration-pipedrive-sync-button"
            @click="syncPipedrive"
          >
            <i
              class="fa fa-sync-alt"
              v-if="!isSyncing"
            ></i>
            <q-spinner-bars
              v-if="isSyncing"
              data-testid="integration-pipedrive-sync-spinner"
              color="white"
            >
            </q-spinner-bars>
            {{ isSyncing ? 'Syncing...' : 'Sync with Pipedrive' }}
            <q-tooltip
              anchor="top middle"
              self="center middle"
              data-testid="integration-pipedrive-sync-tooltip"
              :offset="[-220, 10]"
            >
              <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between {{ whiteLabelName }} and Pipedrive.</p>
              <p class="font-weight-bold">You'll want to click on this button if:</p>
              <p class="mt-1 mb-0">- The contact was recently merged in Pipedrive with another contact.</p>
              <p class="mt-0 mb-0">- You notice any inconsistencies between {{ whiteLabelName }} and Pipedrive data on
                this contact.</p>
            </q-tooltip>
          </b-button>
        </b-row>
      </q-card-section>

    </q-card>

  </div>
</template>

<script>
import _ from 'lodash'
import talk2Api from 'src/plugins/api/api'
import {
  integrationMixin,
  pipedriveIntegrationMixin,
  simpsocialMixin
} from 'src/plugins/mixins'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'integration-pipedrive',

  components: { },

  mixins: [
    pipedriveIntegrationMixin,
    integrationMixin,
    simpsocialMixin
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

    isContactValid () {
      return this.contact && this.contact.id
    },

    isRouteMatch () {
      return this.$route.params.id === this.contact.id.toString() || this.$route.name === 'Power Dialer'
    },

    isContactAndRouteValid () {
      return this.isContactValid && this.isRouteMatch
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
      if (this.isContactAndRouteValid) {
        this.contactIntegrationDataLoaded = false
        this.getData()
      }
    }, 500)
  }
}
</script>
