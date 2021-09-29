<template>
  <div class="t-flex-group__no-bg flex-column border-top">
    <SessionTabsHeaders
      :tabs="panelList"
      @selected-tab="selectTab" />
    <div class="t-panel-container">
      <q-tab-panels
        v-model="panel"
        class="bg-transparent">

        <q-tab-panel class="p-0" name="Details">
          <!-- <div class="text-h6">Mails</div> -->
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

import SessionTabsHeaders from 'src/components/power-dialer/sessions/session-filters'
import SessionPageDetails from './pages/details'
import SessionPageActivity from './pages/activity'
import SessionPageCrm from './pages/crm'

export default {
  name: 'SessionPage',
  components: {
    SessionTabsHeaders,
    SessionPageDetails,
    SessionPageActivity,
    SessionPageCrm
  },
  methods: {
    selectTab (val) {
      console.log('val :>> ', val)
      this.panel = val.name
    }
  },
  data () {
    return {
      panel: 'Details',
      panelList: [
        {
          id: 1,
          name: 'Details'
        },
        {
          id: 2,
          name: 'Activity'
        },
        {
          id: 3,
          name: 'CRM View'
        }
      ]
    }
  }
}
</script>
