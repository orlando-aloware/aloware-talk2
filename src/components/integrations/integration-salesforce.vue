<template>
    <div class="integration-wrapper"
        data-testid="integration-salesforce-wrapper">
        <q-card class="salesforce-card"
            data-testid="integration-salesforce-card"
            flat>
            <q-item class="p-0">
                <q-item-section v-if="contactLink">
                    <b-link target="_blank"
                      data-testid="integration-salesforce-salesforce-link"
                      :href="contactLink">
                      <i class="fab fa-salesforce salesforce-icon"></i>
                      <span class="integration-title"> Salesforce {{ salesforceModule }}</span>
                    </b-link>
                </q-item-section>
                <q-item-section v-else>
                    <a href="#"
                      data-testid="integration-salesforce-salesforce-a-tag"
                      onclick="return false;">
                      <i class="fab fa-salesforce salesforce-icon"></i>
                      <span class="integration-title"> Salesforce</span>
                    </a>
                </q-item-section>
            </q-item>

            <q-separator data-testid="integration-salesforce-separator" />

            <q-card-section
                data-testid="integration-salesforce-card-section-1"
                v-if="integrationData">
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
          this.integrationData = response.data
          this.contactIntegrationDataLoaded = true
        })
    }
  }
}
</script>
