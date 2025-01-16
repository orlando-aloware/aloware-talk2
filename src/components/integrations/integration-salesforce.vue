<template>
    <div class="integration-wrapper integration-wrapper-generic"
        data-testid="integration-salesforce-wrapper">
        <q-card class="integration-card"
            data-testid="integration-salesforce-card"
            flat>
            <q-item class="p-0">
              <span class='integration-jit-card-header'>
                <i class="fab fa-salesforce salesforce-icon integration-icon-in-header"></i>
                <span class="integration-title">Salesforce {{ salesforceModule }}</span>
              </span>
            </q-item>

            <q-separator data-testid="integration-salesforce-separator" />

            <q-card-section
                data-testid="integration-salesforce-card-section-1"
                v-if="integrationData">
                <a class="external-contact-integration-link-icon color-primary"
                   target="_blank"
                   :href="contactLink">
                  <i class="fa fa-external-link" aria-hidden="true"/>
                </a>
                <p class="mb-0"
                    data-testid="integration-salesforce-first-name"
                    v-if="integrationData.first_name !== undefined">
                    <span class="data-icon-label">First Name: </span>
                    <span class="data-value">
                      <q-tooltip
                        anchor="top middle"
                        self="center middle"
                      >
                        {{ integrationData.first_name }}
                      </q-tooltip>
                      {{ integrationData.first_name }}
                    </span>
                </p>
                <p class="mb-0"
                    data-testid="integration-salesforce-last-name"
                    v-if="integrationData.last_name !== undefined">
                    <span class="data-icon-label">Last Name: </span>
                    <span class="data-value">
                      <q-tooltip
                        anchor="top middle"
                        self="center middle"
                      >
                        {{ integrationData.last_name }}
                      </q-tooltip>
                      {{ integrationData.last_name }}
                    </span>
                </p>
                <p class="mb-0"
                    data-testid="integration-salesforce-email"
                    v-if="integrationData.email">
                    <span class="data-icon-label">Email: </span>
                    <span class="data-value">{{ integrationData.email }}</span>
                </p>
                <p class="mb-0"
                    data-testid="integration-salesforce-phone"
                    v-if="integrationData.phone">
                    <span class="data-icon-label">Phone: </span>
                    <span class="data-value">{{ integrationData.phone }}</span>
                </p>
                <p class="mb-0"
                    data-testid="integration-salesforce-phone"
                    v-if="integrationData.fax">
                    <span class="data-icon-label">Fax: </span>
                    <span class="data-value">{{ integrationData.fax }}</span>
                </p>
                <p class="mb-0"
                    data-testid="integration-salesforce-phone"
                    v-if="integrationData.mobile_phone">
                    <span class="data-icon-label">Mobile Phone: </span>
                    <span class="data-value">{{ integrationData.mobile_phone }}</span>
                </p>
                <p class="mb-0"
                    data-testid="integration-salesforce-phone"
                    v-if="integrationData.home_phone">
                    <span class="data-icon-label">Home Phone: </span>
                    <span class="data-value">{{ integrationData.home_phone }}</span>
                </p>
                <p class="mb-0"
                    data-testid="integration-salesforce-phone"
                    v-if="integrationData.other_phone">
                    <span class="data-icon-label">Other Phone: </span>
                    <span class="data-value">{{ integrationData.other_phone }}</span>
                </p>
            </q-card-section>
          <sync-with-integration integration_name='salesforce'
                                 :contact_id='contact.id'
                                 @sync-complete="afterSyncComplete"/>
        </q-card>
    </div>
  </template>

<script>
import { mapState } from 'vuex'
import {
  integrationMixin
} from 'src/plugins/mixins'
import SyncWithIntegration from 'components/integrations/sync-with-integration.vue'

export default {
  name: 'integration-salesforce',
  components: { SyncWithIntegration },

  mixins: [
    integrationMixin
  ],

  props: {
    contact: {
      type: Object,
      required: true
    },

    dialerMode: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    contactLink () {
      if (!this.contactIntegrationDataLoaded || !this.integrationData.link) {
        return false
      }

      return this.integrationData.link
    },

    salesforceModule () {
      if (this.integrationData) return this.integrationData.type.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())

      return null
    }

  },

  async mounted () {
    if (this.contact && this.contact.id) {
      await this.getData()
    }
  },

  data () {
    return {
      integrationData: null,
      contactIntegrationDataLoaded: false
    }
  },

  methods: {
    getData () {
      this.contactIntegrationDataLoaded = false

      return this.getIntegrationData(this.contact, 'salesforce')
        .then(response => {
          console.warn(response.data, Object.keys(response.data).length, Object.keys(response.data))
          if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
            this.integrationData = response.data
          } else {
            this.integrationData = null
          }

          this.contactIntegrationDataLoaded = true
        })
    },
    afterSyncComplete () {
      this.getData()
        .then(() => {
          this.$generalNotification('Contact has been successfully synced.')
        })
    }
  }
}
</script>
