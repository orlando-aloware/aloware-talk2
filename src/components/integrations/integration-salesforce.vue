<template>
    <div
      class="integration-wrapper"
      data-testid="integration-salesforce-wrapper"
    >
      <q-card
        class="salesforce-card"
        data-testid="integration-salesforce-card"
        flat
      >
        <q-item class="p-0">
          <q-item-section v-if="contactLink">
            <b-link
              target="_blank"
              data-testid="integration-salesforce-salesforce-link"
              :href="contactLink"
            >
              <i class="fab fa-salesforce salesforce-icon"></i>
              <span class="integration-title"> Salesforce</span>
            </b-link>
          </q-item-section>
          <q-item-section v-else>
            <a href="#"
              data-testid="integration-salesforce-salesforce-a-tag"
              onclick="return false;"
            >
              <i class="fab fa-salesforce salesforce-icon"></i>
              <span class="integration-title"> Salesforce</span>
            </a>
          </q-item-section>
        </q-item>

        <q-separator data-testid="integration-salesforce-separator" />

        <q-card-section
          data-testid="integration-salesforce-card-section-1"
          v-if="contact"
        >
          <p
            class="mb-0"
            data-testid="integration-salesforce-first-name"
            v-if="contact.first_name !== undefined"
          >
            <span class="data-icon-label">First Name: </span>
            <span class="data-value">
              <q-tooltip
                anchor="top middle"
                self="center middle"
              >
                {{ contact.first_name }}
              </q-tooltip>
              {{ contact.first_name }}
            </span>
          </p>
          <p
            class="mb-0"
            data-testid="integration-salesforce-last-name"
            v-if="contact.last_name !== undefined"
          >
            <span class="data-icon-label">Last Name: </span>
            <span class="data-value">
              <q-tooltip
                anchor="top middle"
                self="center middle"
              >
                {{ contact.last_name }}
              </q-tooltip>
              {{ contact.last_name }}
            </span>
          </p>
          <p
            class="mb-0"
            data-testid="integration-salesforce-email"
            v-if="contact.email"
          >
            <span class="data-icon-label">Email: </span>
            <span class="data-value">{{ contact.email }}</span>
          </p>
          <p
            class="mb-0"
            data-testid="integration-salesforce-phone"
            v-if="contact.phone_number"
          >
            <span class="data-icon-label">Phone: </span>
            <span class="data-value">{{ contact.phone_number }}</span>
          </p>
          <p
            class="mb-0"
            data-testid="integration-salesforce-module"
            v-if="contact.phone_number"
          >
            <span class="data-icon-label">Salesforce: </span>
            <span class="data-value">{{ salesforceModule }}</span>
          </p>
        </q-card-section>
      </q-card>
    </div>
  </template>

<script>
import { mapState } from 'vuex'
import {
  integrationMixin
} from 'src/plugins/mixins'

export default {
  name: 'integration-salesforce',

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
      if (!this.contact.integration_data?.salesforce?.contact_link && !this.contact.integration_data?.salesforce?.lead_link) {
        return
      }

      return this.contact.integration_data.salesforce.lead_link || this.contact.integration_data.salesforce.contact_link
    },

    salesforceModule () {
      if (this.contact.integration_data?.salesforce?.contact_link) return 'Contacts'
      if (this.contact.integration_data?.salesforce?.lead_link) return 'Leads'

      return null
    }

  },

  data () {
    return {
      integrationData: null,
      contactIntegrationDataLoaded: false
    }
  }
}
</script>
