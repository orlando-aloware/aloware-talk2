<template>
  <div class="t-flex-group__no-bg flex-column border-top">

    <SessionFilters
      @selected-tab="selectTab" />

    <div class="t-panel-container">
      <q-tab-panels
        v-model="panel"
        class="bg-transparent">

        <q-tab-panel class="p-0" name="Details">
          <SessionPageDetails />
        </q-tab-panel>

        <q-tab-panel class="p-0" name="Activity">
          <SessionPageActivity />
        </q-tab-panel>

        <q-tab-panel class="p-0" name="CRM View">
          <SessionPageCrm />
        </q-tab-panel>

      </q-tab-panels>
    </div>
  </div>
</template>

<script>

import SessionFilters from 'src/components/power-dialer/sessions/session-filters'
import SessionPageDetails from './pages/session-page-details'
import SessionPageActivity from './pages/session-page-activity'
import SessionPageCrm from './pages/session-page-crm'

export default {
  name: 'SessionPage',
  components: {
    SessionFilters,
    SessionPageDetails,
    SessionPageActivity,
    SessionPageCrm
  },
  methods: {
    selectTab (val) {
      this.panel = val.name
    }
  },
  data () {
    return {
      panel: 'Details'
    }
  }
}
</script>
