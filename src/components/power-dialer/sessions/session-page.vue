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
import { mapActions, mapState } from 'vuex'

export default {
  name: 'SessionPage',
  components: {
    SessionFilters,
    SessionPageDetails,
    SessionPageActivity,
    SessionPageCrm
  },
  computed: {
    ...mapState('powerDialer', ['activeTask', 'taskToCall'])
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
    ...mapActions('powerDialer', ['setActiveTask']),
    selectTab (val) {
      this.panel = val.name
    },
    getContactData (id, source) {
      return window.axios.get(`/api/v2/contacts/${id}`, { cancelToken: source })
    }
  },
  data () {
    return {
      panel: 'Details',
      cancelToken: null,
      source: null
    }
  },
  created () {
    this.cancelToken = window.axios.CancelToken
    this.source = this.cancelToken.source()
  },
  watch: {
    'taskToCall': function (value) {
      this.source.cancel('Loading of contact data operation is canceled by the user.')
      this.source = this.cancelToken.source()

      this.getContactData(value.id, this.source.token).then(res => {
        this.setContact(res.data)
      })
    }
  }
}
</script>
