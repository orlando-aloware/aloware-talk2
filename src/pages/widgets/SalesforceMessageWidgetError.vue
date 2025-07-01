<template>
  <div class="row salesforce-widget-error-details q-pa-lg">
    <div class="col-12">
      <h4 class="text-black q-mb-md">{{ errorTitle }}</h4>
      <p class="q-mb-lg">{{ errorMessage }}</p>

      <div v-if="errorCode === HubspotMessageError.ERROR_NO_MATCHING_ALOWARE_AND_CRM_ACCOUNT_ID">
        <p>Fix by re-authenticating the Aloware Salesforce integration from <a
            class="text-blue"
            target="_blank"
            :href="integrationSettingsUrl"
          >Salesforce Settings</a>.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CONNECTED_ALOWARE_ACCOUNT_TO_CRM_DELETED">
        <p>Fix by uninstalling the Aloware app in Salesforce.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_ALOWARE_ACCOUNT_SUSPENDED">
        <p>Fix by sending an email to Aloware Support (<a
            class="text-blue"
            href="mailto:support@aloware.com"
          >support@aloware.com</a>).</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CRM_INTEGRATION_DISABLED">
        <p>Fix by enabling the Salesforce integration in Aloware from <a
            class="text-blue"
            target="_blank"
            :href="integrationSettingsUrl"
          >Salesforce Settings</a>.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CONTACT_FETCH_FAILED">
        <p>Try the following steps:</p>
        <p>1. Try refreshing the page.</p>
        <p>2. If error persists, try re-authenticating the Aloware Salesforce integration from <a
            target="_blank"
            class="text-blue"
            :href="integrationSettingsUrl"
          >Salesforce Settings</a>.</p>
        <p>3. If error persists, take a full screenshot and email Aloware Support (<a
            class="text-blue"
            href="mailto:support@aloware.com"
          >support@aloware.com</a>).</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CONTACT_NO_PHONE_NUMBER">
        <p>Fix by adding a valid phone number to the contact record on Salesforce.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CONTACT_INVALID_PHONE_NUMBER">
        <p>Fix by correctly formatting this contact's phone number on Salesforce.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_PHONE_NUMBER_ALREADY_EXISTS_IN_THE_CRM">
        <p>Fix by:</p>
        <p>1. Merging these contacts in Salesforce</p>
        <p>- OR -</p>
        <p>2. Removing the duplicated phone number from either one of these contacts in Salesforce.</p>
        <b-row v-if='contactId'>
          <b-button
            class="text-white"
            size="sm"
            variant="primary"
            tabindex="0"
            data-testid="integration-salesforce-sync-button"
            @click="syncSalesforce"
          >
            <i
              class="fa fa-sync-alt"
              v-if="!isSyncing"
            ></i>
            <q-spinner-bars
              v-if="isSyncing"
              data-testid="integration-salesforce-sync-spinner"
              color="white"
            >
            </q-spinner-bars>
            {{ isSyncing ? 'Syncing...' : 'Sync with Salesforce' }}
            <q-tooltip
              anchor="top middle"
              self="center middle"
              data-testid="integration-salesforce-sync-tooltip"
              :offset="[0, 50]"
            >
              <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between Aloware and Salesforce.</p>
              <p class="font-weight-bold">You'll want to click on this button if:</p>
              <p class="mt-1 mb-0">- The contact was recently merged in Salesforce with another contact.</p>
              <p class="mt-0 mb-0">- You notice any inconsistencies between Aloware and Salesforce data on
                this contact.</p>
            </q-tooltip>
          </b-button>
        </b-row>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_ASSOCIATED_MODULE_IS_NOT_ENABLED">
        <b-row v-if='objectType && objectId'>
          <p>To fix this:</p>
          <p>Click the button below to create an Aloware contact and link it to the current Salesforce object. Once linked, you'll be able to send messages through Aloware.</p>
          <b-button
            class="text-white"
            size="sm"
            variant="primary"
            tabindex="0"
            data-testid="integration-salesforce-force-create-aloware-contact-button"
            @click="forceCreateAlowareContact"
          >
            <i
              class="fa fa-sync-alt"
              v-if="!isSyncing"
            ></i>
            <q-spinner-bars
              v-if="isSyncing"
              data-testid="integration-salesforce-sync-spinner"
              color="white"
            >
            </q-spinner-bars>
            {{ isSyncing ? 'Syncing...' : 'Sync with Aloware' }}
          </b-button>
        </b-row>
      </div>
      <div v-else>
        <p>An unknown error has occurred.</p>
        <p>Please contact Aloware Support at
          <a class="text-blue" href="mailto:support@aloware.com">support@aloware.com</a>
          regarding this issue.
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import * as HubspotMessageError from 'src/constants/hubspot-message-widget-errors'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'salesforce-message-widget-error',
  data () {
    return {
      HubspotMessageError,
      isSyncing: false,
      integrationData: null,
      contactIntegrationDataLoaded: false
    }
  },
  computed: {
    errorTitle () {
      return this.$route.query.error_title ?? ''
    },
    errorMessage () {
      return this.$route.query.error_message ?? ''
    },
    errorCode () {
      return Number(this.$route.query.error_code ?? 0)
    },
    integrationSettingsUrl () {
      return window.axios.defaults.baseURL + '/integrations?tab=integrations&name=salesforce'
    },
    contactId () {
      return this.$route.query.contact_id ?? null
    },
    objectType () {
      return this.$route.query.object_type ?? null
    },
    objectId () {
      return this.$route.query.object_id ?? null
    }
  },
  methods: {
    forceCreateAlowareContact () {
      this.isSyncing = true
      talk2Api.V1.contact.forceCreateAlowareContactViaSalesforce(this.objectId, this.objectType).then(response => {
        this.isSyncing = false
        window.location.href = response.data.uri
      }).catch(error => {
        this.isSyncing = false
        this.$generalNotification('Failed to create Aloware contact. Please try again.', 'error')
        console.error('Error creating Aloware contact:', error)
      })
    },
    syncSalesforce () {
      this.isSyncing = true
      talk2Api.V1.contact.syncSalesforce(this.contactId).then(response => {
        this.isSyncing = false
        this.$generalNotification('Contact has been successfully synced.')
        setTimeout(() => {
          this.$router.push({
            name: 'Texting Widget (unknown-user)',
            params: {
              id: this.contactId
            }
          }).catch(err => {
            console.log(err)
          })
        }, 500)
      }).catch(error => {
        this.isSyncing = false
        this.$generalNotification('Failed to sync contact with Salesforce. Please try again.', 'negative')
        console.error('Error syncing Salesforce contact:', error)
      })
    }
  }
}
</script>

<style scoped>
.salesforce-widget-error-details {
  background: #fafbfc;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 32px 24px;
  margin: 32px auto;
  max-width: 700px;
  min-height: 220px;
}
.text-black {
  color: #222;
}
.q-mb-md {
  margin-bottom: 18px;
}
.q-mb-lg {
  margin-bottom: 28px;
}
.q-pa-lg {
  padding: 32px;
}
</style>
