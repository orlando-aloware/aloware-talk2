<template>
  <b-overlay class="h-100"
             :show="isBusy">
    <div class="t-flex-group__no-bg flex-column border-top h-100 overflow-hidden">
      <div class="d-flex align-items-center">
        <div class="flex-grow-1">
          <SessionFilters :selected-integration="selectedIntegration"
                        @selected-tab="selectTab" />
        </div>
        <div class="ml-2" style="width: 200px;" v-if="supportedEnabledIntegrations.length > 1">
          <q-select class="break-all"
                    color="primary"
                    use-input
                    emit-value
                    map-options
                    dense
                    hide-bottom-space
                    :options="supportedEnabledIntegrations"
                    v-model="selectedIntegration">
          </q-select>
        </div>
      </div>
      <div class="t-panel-container h-100 flex-grow-0 overflow-hidden">
        <q-tab-panels class="bg-transparent h-100 overflow-hidden"
                      v-model="panel">

          <q-tab-panel class="p-0 h-100"
                       name="Details">
            <SessionContactPageDetails />
          </q-tab-panel>

          <q-tab-panel class="p-0"
                       name="Activity">
            <SessionContactPageActivity :panel="panel" />
          </q-tab-panel>

          <q-tab-panel class="p-0"
                       name="CRM View">
            <SessionContactPageCrm :selected-integration="selectedIntegration"
                                   :usePopup="false" />
          </q-tab-panel>

          <q-tab-panel class="p-0"
                       name="CRM Popup">
            <SessionContactPageCrm :selected-integration="selectedIntegration" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <template #overlay>
      <div class="text-center">
        <q-spinner-bars color="primary"
                        size="2em" />
        <div>
          Fetching contact information...
        </div>
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
import { hubspotIntegrationMixin } from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import { HUBSPOT_INTEGRATION, SALESFORCE_INTEGRATION } from 'src/constants/integrations'

export default {
  name: 'SessionPage',

  mixins: [
    hubspotIntegrationMixin
  ],

  components: {
    SessionFilters,
    SessionContactPageDetails,
    SessionContactPageActivity,
    SessionContactPageCrm
  },

  data () {
    return {
      panel: 'Details',
      cancelToken: null,
      source: null,
      isBusy: false,
      selectedIntegration: 'none'
    }
  },

  mounted () {
    if (this.supportedEnabledIntegrations.length > 0) {
      this.selectedIntegration = this.supportedEnabledIntegrations[0]
    }
  },

  computed: {
    ...mapState('powerDialer', ['activeTask', 'taskToCall']),

    supportedEnabledIntegrations () {
      const supportedIntegrations = [HUBSPOT_INTEGRATION, SALESFORCE_INTEGRATION]
      let enabledIntegrations = []

      supportedIntegrations.forEach(integration => {
        if (this.currentCompany?.[integration + '_integration_enabled']) {
          enabledIntegrations.push(integration)
        }
      })

      return enabledIntegrations
    }
  },

  created () {
    this.cancelToken = window.axios.CancelToken
    this.source = this.cancelToken.source()
  },

  methods: {
    ...mapActions('contacts', [
      'setContact',
      'setContactClone',
      'setContactPhoneNumbers'
    ]),

    ...mapActions('powerDialer', ['setActiveTask']),

    selectTab (val) {
      this.panel = val.name
    },

    getContactData (id, source) {
      if (!id || id === 'undefined') {
        console.log('Failed to get contact: Missing contact id!')
        return Promise.resolve()
      }

      return window.axios.get(`/api/v2/contacts/${id}`, { cancelToken: source })
    },

    getContactPhoneNumbers (contactId) {
      talk2Api.V1.contact.getPhoneNumbers(contactId)
        .then(response => {
          this.setContactPhoneNumbers(response.data)
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
    },

    getContactIntegrationData (contact) {
      return this.getIntegrationData(contact)
        .then(response => {
          contact.integration_data = response.data

          // update contact related states
          this.setContact(contact)
          this.setContactClone(contact)
        })
    }
  },

  watch: {
    'supportedEnabledIntegrations': function (value) {
      if (this.selectedIntegration === 'none') {
        if (value.length > 0) {
          this.selectedIntegration = value[0]
        }
      } else {
        if (!value.includes(this.selectedIntegration.toLowerCase())) {
          this.selectedIntegration = 'none'
        }
      }
    },
    'taskToCall': function (value) {
      if (!value) {
        return
      }

      this.source.cancel('Loading of contact data operation is canceled by the user.')
      this.source = this.cancelToken.source()
      this.isBusy = true

      this.getContactData(value.id, this.source.token)
        .then(res => {
          if (!res) {
            return
          }

          this.isBusy = false
          this.setContact(res.data)
          this.setContactClone(res.data)
          this.$VueEvent.fire('contact_activity_update_contact', res.data)

          this.getContactPhoneNumbers(res.data.id)
          this.getContactIntegrationData(res.data)
        }).catch(err => {
          this.$handleErrors(err.response)
          this.isBusy = false
        })
    }
  }
}
</script>
