<template>
  <div class="row hubspot-widget-error-details">
    <div class="col-12">
      <h4 class="text-black">{{ errorTitle }}</h4>
      <p>{{ errorMessage }}</p>

      <div v-if="errorCode === HubspotMessageError.ERROR_NO_MATCHING_ALOWARE_AND_CRM_ACCOUNT_ID">
        <p>Fix by re-authenticating the Aloware HubSpot integration from <a class="text-blue" target="_blank" :href="integrationSettingsUrl">HubSpot Settings</a>.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CONNECTED_ALOWARE_ACCOUNT_TO_CRM_DELETED">
        <p>Fix by uninstalling the Aloware app in HubSpot.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_ALOWARE_ACCOUNT_SUSPENDED">
        <p>Fix by sending an email to Aloware Support (<a class="text-blue" href="mailto:support@aloware.com">support@aloware.com</a>).</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CRM_INTEGRATION_DISABLED">
        <p>Fix by enabling the HubSpot integration in Aloware from <a class="text-blue" target="_blank" :href="integrationSettingsUrl">HubSpot Settings</a>.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CONTACT_FETCH_FAILED">
        <p>Try the following steps:</p>
        <p>1. Try refreshing the page.</p>
        <p>2. If error persists, try re-authenticating the Aloware HubSpot integration from <a target="_blank" class="text-blue" :href="integrationSettingsUrl">HubSpot Settings</a>.</p>
        <p>3. If error persists, take a full screenshot and email Aloware Support (<a class="text-blue" href="mailto:support@aloware.com">support@aloware.com</a>).</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CONTACT_NO_PHONE_NUMBER">
        <p>Fix by adding a valid phone number to the contact record on HubSpot.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_CONTACT_INVALID_PHONE_NUMBER">
        <p>Fix by correctly formatting this contact’s phone number on HubSpot.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_PHONE_NUMBER_ALREADY_EXISTS_IN_THE_CRM">
        <p>Fix by:</p>
        <p>1. Merging these contacts in HubSpot</p>
        <p>- OR -</p>
        <p>2. Removing the duplicated phone number from either one of these contacts in HubSpot.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_NO_ASSOCIATED_WITH_DEAL_CONTACT">
        <p>Fix by adding a contact with a valid phone number to this deal record on HubSpot.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_NO_ASSOCIATED_WITH_TICKET_CONTACT">
        <p>Fix by adding a contact with a valid phone number to this ticket record on HubSpot.</p>
      </div>
      <div v-else-if="errorCode === HubspotMessageError.ERROR_NOT_FOUND_USER_WITH_HUBSPOT_EMAIL">
        <p>Try the following steps:</p>
        <p>1. Make sure this user exists on Aloware with the same email address.</p>
        <p>2. Pull HubSpot users from <a class="text-blue" target="_blank" :href="integrationSettingsUrl">HubSpot Settings</a>.</p>
      </div>
    </div>
  </div>
</template>
<script>
import * as HubspotMessageError from 'src/constants/hubspot-message-widget-errors'

export default {
  name: 'Error',
  data () {
    return {
      HubspotMessageError
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
      return window.axios.defaults.baseURL + '/integrations?tab=integrations&name=hubspot'
    }
  }
}
</script>
