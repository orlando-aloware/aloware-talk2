<template>
    <div class="integration-wrapper integration-wrapper-generic"
        data-testid="integration-zoho-wrapper">
        <q-card class="integration-card"
            data-testid="integration-zoho-card"
            flat>
            <q-item class="p-0">
              <span class='integration-jit-card-header'>
                <i class="fab fa-zoho zoho-icon integration-icon-in-header"></i>
                <span class="integration-title">ZohoCRM {{ zohoModule }}</span>
              </span>
            </q-item>

            <q-separator data-testid="integration-zoho-separator" />

            <q-card-section
                data-testid="integration-zoho-card-section-1"
                v-if="integrationData">
                <a class="external-contact-integration-link-icon color-primary"
                   target="_blank"
                   :href="contactLink">
                  <i class="fa fa-external-link" aria-hidden="true"/>
                </a>
                <p class="mb-0"
                    data-testid="integration-zoho-first-name"
                    v-if="integrationData.First_Name !== undefined">
                    <span class="data-icon-label">First Name: </span>
                    <span class="data-value">
                      <q-tooltip
                        anchor="top middle"
                        self="center middle"
                      >
                        {{ integrationData.First_Name }}
                      </q-tooltip>
                      {{ integrationData.First_Name }}
                    </span>
                </p>
                <p class="mb-0"
                    data-testid="integration-zoho-last-name"
                    v-if="integrationData.Last_Name !== undefined">
                    <span class="data-icon-label">Last Name: </span>
                    <span class="data-value">
                      <q-tooltip
                        anchor="top middle"
                        self="center middle"
                      >
                        {{ integrationData.Last_Name }}
                      </q-tooltip>
                      {{ integrationData.Last_Name }}
                    </span>
                </p>
                <p class="mb-0"
                    data-testid="integration-zoho-email"
                    v-if="integrationData.Email">
                    <span class="data-icon-label">Email: </span>
                    <span class="data-value">{{ integrationData.Email }}</span>
                </p>
                <p class="mb-0"
                   data-testid="integration-zoho-owner"
                   v-if="integrationData?.Owner?.name">
                  <span class="data-icon-label">Owner: </span>
                  <span class="data-value">
                    {{ integrationData.Owner.name }}</span>
                </p>
                <p class="mb-0"
                    data-testid="integration-zoho-phone"
                    v-if="integrationData.Phone">
                    <span class="data-icon-label">Phone: </span>
                    <span class="data-value">{{ integrationData.Phone }}</span>
                </p>
            </q-card-section>
          <sync-with-integration :integration_name='integrationName()'
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
import { ZOHO_INTEGRATION } from 'src/constants/integrations'

export default {
  name: 'integration-zoho',
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

    zohoModule () {
      if (this.integrationData) return this.integrationData.module.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())

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
    integrationName () {
      return ZOHO_INTEGRATION
    },
    getData () {
      this.contactIntegrationDataLoaded = false

      return this.getIntegrationData(this.contact, ZOHO_INTEGRATION)
        .then(response => {
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
