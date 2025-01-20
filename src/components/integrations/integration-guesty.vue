<template>
  <div class="integration-wrapper integration-wrapper-generic"
       data-testid="integration-guesty-wrapper">
    <q-card class="integration-card"
            data-testid="integration-guesty-card"
            flat>
      <q-item class="p-0">
          <span class='integration-jit-card-header'>
            <i class="fab fa-guesty guesty-icon integration-icon-in-header"></i>
            <span class="integration-title">Guesty</span>
          </span>
      </q-item>

      <q-separator data-testid="integration-guesty-separator" />

      <q-card-section
        data-testid="integration-guesty-card-section-1"
        v-if="integrationData">
        <a class="external-contact-integration-link-icon color-primary"
           target="_blank"
           :href="contactLink">
          <i class="fa fa-external-link" aria-hidden="true"/>
        </a>
        <p class="mb-0"
           data-testid="integration-guesty-first-name"
           v-if="integrationData.firstName !== undefined">
          <span class="data-icon-label">First Name: </span>
          <span class="data-value">
                      <q-tooltip
                        anchor="top middle"
                        self="center middle"
                      >
                        {{ integrationData.firstName }}
                      </q-tooltip>
                      {{ integrationData.firstName }}
                    </span>
        </p>
        <p class="mb-0"
           data-testid="integration-guesty-last-name"
           v-if="integrationData.lastName !== undefined">
          <span class="data-icon-label">Last Name: </span>
          <span class="data-value">
                      <q-tooltip
                        anchor="top middle"
                        self="center middle"
                      >
                        {{ integrationData.lastName }}
                      </q-tooltip>
                      {{ integrationData.lastName }}
                    </span>
        </p>
        <p class="mb-0"
           data-testid="integration-guesty-email"
           v-if="integrationData.email">
          <span class="data-icon-label">Email: </span>
          <span class="data-value">{{ integrationData.email }}</span>
        </p>
        <p class="mb-0"
           data-testid="integration-guesty-phone"
           v-if="integrationData.phone">
          <span class="data-icon-label">Phone: </span>
          <span class="data-value">{{ integrationData.phone }}</span>
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
import { GUESTY_INTEGRATION } from 'src/constants/integrations'

export default {
  name: 'integration-guesty',
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
      return GUESTY_INTEGRATION
    },
    getData () {
      this.contactIntegrationDataLoaded = false

      return this.getIntegrationData(this.contact, GUESTY_INTEGRATION)
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
