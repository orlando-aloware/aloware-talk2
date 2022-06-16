<template>
  <b-overlay :show="isBusy">
    <div class="t-flex-group__no-bg flex-column border-top">

      <SessionFilters
        @selected-tab="selectTab" />

      <div class="t-panel-container">
        <q-tab-panels
          v-model="panel"
          class="bg-transparent">

          <q-tab-panel class="p-0" name="Details">
            <SessionContactPageDetails />
          </q-tab-panel>

          <q-tab-panel class="p-0" name="Activity">
            <SessionContactPageActivity :panel="panel" />
          </q-tab-panel>

          <q-tab-panel class="p-0" name="CRM View">
            <SessionContactPageCrm />
          </q-tab-panel>

        </q-tab-panels>
      </div>
    </div>
    <template #overlay>
      <div class="text-center">
        <q-spinner-bars color="primary"
                        size="2em" />
        <div>Fetching contact information...</div>
      </div>
    </template>
  </b-overlay>
</template>

<script>

import SessionFilters from 'src/components/power-dialer/sessions/session-filters'
import SessionContactPageDetails from './pages/session-contact-page-details'
import SessionContactPageActivity from './pages/session-contact-page-activity'
import SessionContactPageCrm from './pages/session-contact-page-crm'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'SessionPage',
  components: {
    SessionFilters,
    SessionContactPageDetails,
    SessionContactPageActivity,
    SessionContactPageCrm
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
      source: null,
      isBusy: false
    }
  },
  created () {
    this.cancelToken = window.axios.CancelToken
    this.source = this.cancelToken.source()
  },
  watch: {
    'taskToCall': function (value) {
      if (!value) {
        return
      }

      this.source.cancel('Loading of contact data operation is canceled by the user.')
      this.source = this.cancelToken.source()
      this.isBusy = true
      this.getContactData(value.id, this.source.token).then(res => {
        this.isBusy = false
        this.setContact(res.data)
      })
    }
  }
}
</script>
