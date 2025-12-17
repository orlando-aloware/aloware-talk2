<template>
  <b-card class="bg-transparent border-0 text-center">
    <div class="t-grouped-buttons pr-1">
      <div
        v-for="(filter, idx) in tabs"
        :key="idx"
        class="link px-1"
        style="display:contents;">
        <div
          :class="`t-grouped-buttons__btn cursor-pointer ml-1 ${currentTab === filter.key ? 'active' : ''} ${filter.enabled ? '' : 'disabled'}`"
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

const DEFAULT_TAB = 'details'

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
          key: 'details',
          name: 'Details',
          enabled: true
        },
        {
          key: 'activity',
          name: 'Activity',
          enabled: true
        }
      ]

      if ([HUBSPOT_INTEGRATION, 'none'].includes(this.selectedIntegration.toLowerCase())) {
        tabs.push({
          key: 'crm_view',
          name: 'CRM View',
          enabled: this.integrationEnabled
        })
      }

      tabs.push({
        key: 'crm_popup',
        name: 'CRM Popup',
        enabled: this.integrationEnabled
      })

      return tabs
    }
  },

  methods: {
    clicked (value, enabled = undefined) {
      if (enabled) {
        this.currentTab = value.key
        this.$emit('selected-tab', value)
      }
    }
  },

  data () {
    return {
      currentTab: DEFAULT_TAB
    }
  },
  watch: {
    'selectedIntegration' (newValue) {
      // when we switch integration need to make sure we are not at the iframe tab that is not working with salesforce
      if (newValue.toLowerCase() === SALESFORCE_INTEGRATION && this.currentTab === 'crm_view') {
        this.currentTab = DEFAULT_TAB
        this.$emit('selected-tab', this.tabs[0])
      }
    }
  }
}
</script>
