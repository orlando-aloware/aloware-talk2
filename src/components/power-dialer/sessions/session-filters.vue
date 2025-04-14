<template>
  <b-card class="bg-transparent border-0 text-center">
    <div class="t-grouped-buttons pr-1">
      <div
        v-for="(filter, key) in tabs"
        :key="key"
        class="link px-1"
        style="display:contents;">
        <div
          :class="`t-grouped-buttons__btn cursor-pointer ml-1 ${id === filter.id ? 'active' : ''} ${filter.enabled ? '' : 'disabled'}`"
          @click="clicked(filter, filter.enabled)">
          <div class="t-badge-name">
            {{ filter.name }}
          </div>
          <q-tooltip v-if="(filter.name === 'CRM View' || filter.name === 'CRM Popup') && !integrationEnabled"
                     content-class="bg-grey-light11"
                     anchor="bottom start"
                     self="center start"
                     :offset="[0, 18]">
            Integration is disabled.
          </q-tooltip>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
import { HUBSPOT_INTEGRATION, SALESFORCE_INTEGRATION } from 'src/constants/integrations'

const DEFAULT_TAB = 1

export default {
  name: 'SessionFilters',
  props: {
    selectedIntegration: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapGetters('contacts', [
      'contact'
    ]),

    integrationEnabled () {
      switch (this.selectedIntegration.toLowerCase()) {
        case HUBSPOT_INTEGRATION:
          return this.currentCompany?.hubspot_integration_enabled
        case SALESFORCE_INTEGRATION:
          return this.currentCompany?.salesforce_integration_enabled
        default:
          return false
      }
    },

    tabs () {
      let tabs = [
        {
          id: 1,
          name: 'Details',
          enabled: true
        },
        {
          id: 2,
          name: 'Activity',
          enabled: true
        }
      ]

      if (this.selectedIntegration.toLowerCase() !== SALESFORCE_INTEGRATION) {
        tabs.push({
          id: 3,
          name: 'CRM View',
          enabled: this.integrationEnabled
        })
      }

      tabs.push({
        id: 4,
        name: 'CRM Popup',
        enabled: this.integrationEnabled
      })

      return tabs
    }
  },

  methods: {
    clicked (value, enabled = undefined) {
      if (enabled) {
        this.id = value.id
        this.$emit('selected-tab', value)
      }
    }
  },

  data () {
    return {
      id: DEFAULT_TAB
    }
  },
  watch: {
    'selectedIntegration' (newValue) {
      // when we switch integration need to make sure we are not at the iframe tab that is not working with salesforce
      if (newValue.toLowerCase() === SALESFORCE_INTEGRATION && this.id === 3) {
        this.id = DEFAULT_TAB
        this.$emit('selected-tab', this.tabs[0])
      }
    }
  }
}
</script>
