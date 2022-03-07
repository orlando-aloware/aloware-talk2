<template>
  <div class="t-flex-group__no-bg flex-column border-top">

    <SessionTabsHeaders
      @selected-tab="selectTab" />

    <div class="t-panel-container">
      <q-tab-panels
        v-model="panel"
        class="bg-transparent">

        <q-tab-panel class="p-0" name="Details">
          <!-- <div class="text-h6">Mails</div> -->
          <ContactDetails />
        </q-tab-panel>

        <q-tab-panel class="p-0" name="Activity">
          <ContactActivity />
        </q-tab-panel>

        <q-tab-panel class="p-0" name="CRM View">
          <ContactCrm />
        </q-tab-panel>

      </q-tab-panels>
    </div>
  </div>
</template>

<script>

import SessionTabsHeaders from 'src/components/power-dialer/sessions/session-filters'
import ContactDetails from './pages/details'
import ContactActivity from './pages/activity'
import ContactCrm from './pages/crm'

export default {
  name: 'SessionPage',
  components: {
    SessionTabsHeaders,
    ContactDetails,
    ContactActivity,
    ContactCrm
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
