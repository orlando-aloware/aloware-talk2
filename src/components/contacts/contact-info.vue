<template>
  <b-card class="border-0 contact-info-wrapper alw-contact-info" data-testid="contact-info-wrapper">
    <contact-info-header
      :active-integrations="activeIntegrations"
      :contact="contact"
      :is-read-only="isReadOnly"
      :team-inbox="teamInbox"
    />

    <div class="alw-contact-info-section">
      <contact-info-phone :contact="contact" />
      <contact-info-time
        :timezone="contact.timezone"
        class="alw-contact-info-time-section"
      />

    </div>

    <contact-info-badges :contact="contact" :phone="phone" class="mt-1" />

    <!-- Multiple integrations go on their own line after phone -->
    <contact-info-integrations
      v-if="activeIntegrations.length > 1"
      :integrations="activeIntegrations"
    />

    <div class="d-inline-flex flex-wrap contact-action-button mt-1">
      <b-button class="custom-action-button my-1"
                data-testid="contact-info-call-button"
                size="sm"
                variant="light"
                @click="onCallClick">
        <q-tooltip anchor="top middle"
                   content-class="fs-12"
                   data-testid="contact-info-call-tooltip"
                   self="center middle">
          Call
        </q-tooltip>
        <call-icon height="14"
                   width="14" />
        <q-popup-proxy v-model="showLineSelectorPopup"
                       no-parent-event>
          <div class="d-flex line-selector-popup-wrapper">
            <line-selector
              :generic-multiselect="false"
              :pre-selected-team-inbox-line-id="contactLastLineUsedId"
              :use-only-actives="true"
              :width="lineSelectorWidth"
              check-blocked-messaging
              class="line-selector flex-grow-1"
              hide-bottom-space
              prepend="From:"
              @change="onLineChange"
              @initiateCall="forceInitiateCall"
              @invalid-line-selection="onInvalidLineSelection"
            >
            </line-selector>
            <q-btn
              :disable="!selectedLine"
              :ripple="true"
              align="right"
              class="icon-btn auto-size height-32 ml-1 mt-1"
              flat
              icon="img:app-icons/dialer/call_btn.svg"
              padding="none"
              rounded
              size="32px"
              @click="callContact">
            </q-btn>
          </div>
        </q-popup-proxy>
      </b-button>

      <b-button v-if="hasPermissionTo('toggle block contact') && !contact.is_blocked"
                :disabled="isProcessingBlock || isReadOnly"
                class="custom-action-button my-1"
                data-testid="contact-info-block-button"
                size="sm"
                variant="light"
                @click="blockContact">
        <q-tooltip anchor="top middle"
                   content-class="fs-12"
                   self="center middle">
          Block
        </q-tooltip>
        <i v-if="!isProcessingBlock"
           class="fa fa-lock"
           data-testid="contact-info-block-icon">
        </i>
        <q-spinner-bars v-if="isProcessingBlock"
                        class="mr-1"
                        color="blue"
                        data-testid="contact-info-block-spinner" />
      </b-button>

      <b-button v-if="hasPermissionTo('toggle block contact') && contact.is_blocked"
                :disabled="isProcessingBlock || isReadOnly"
                class="custom-action-button my-1"
                data-testid="contact-info-unblock-button"
                size="sm"
                variant="light"
                @click="unBlockContact">
        <q-tooltip anchor="top middle"
                   content-class="fs-12"
                   self="center middle">
          Unblock
        </q-tooltip>
        <q-spinner-bars v-if="isProcessingBlock"
                        class="mr-1"
                        color="blue"
                        data-testid="contact-info-unblock-spinner" />
        <i v-if="!isProcessingBlock"
           class="fa fa-lock-open"
           data-testid="contact-info-unblock-icon">
        </i>
      </b-button>

      <contact-dnc-actions :contact="contact"
                           :disabled="isReadOnly"
                           class="mr-2 my-1"
                           data-testid="contact-info-dnc-actions"></contact-dnc-actions>

      <b-button :disabled="contact.is_dnc || isReadOnly"
                class="custom-action-button my-1"
                data-testid="contact-info-add-appointment-button"
                size="sm"
                variant="light"
                @click="addAppointmentOpen(true)">
        <q-tooltip anchor="top middle"
                   content-class="fs-12"
                   data-testid="contact-info-add-appointment-tooltip"
                   self="center middle">
          Add appointment
        </q-tooltip>
        <calendar-icon />
      </b-button>
      <b-button :disabled="contact.is_dnc || isReadOnly"
                class="custom-action-button my-1"
                data-testid="contact-info-add-reminder-button"
                size="sm"
                variant="light"
                @click="addReminderOpen(true)">
        <q-tooltip anchor="top middle"
                   content-class="fs-12"
                   data-testid="contact-info-add-reminder-tooltip"
                   self="center middle">
          Add reminder
        </q-tooltip>
        <timer-icon></timer-icon>
      </b-button>
      <b-button :disabled="isReadOnly"
                class="custom-action-button my-1"
                data-testid="contact-info-add-power-dialer-button"
                size="sm"
                variant="light"
                @click="openPowerDialerModal">
        <q-tooltip anchor="top middle"
                   content-class="fs-12"
                   data-testid="contact-info-add-power-dialer-tooltip"
                   self="center middle">
          Add to power dialer
        </q-tooltip>
        <add-call-icon />
      </b-button>
      <b-button :disabled="isRemovingFromPowerDialerLists || !hasPowerDialerLists || isReadOnly"
                class="custom-action-button my-1"
                data-testid="contact-info-remove-power-dialer-button"
                size="sm"
                variant="light"
                @click="removeContactFromPowerDialerLists">
        <q-tooltip anchor="top middle"
                   content-class="fs-12"
                   data-testid="contact-info-remove-power-dialer-tooltip"
                   self="center middle">
          {{ hasPowerDialerListsText }}
        </q-tooltip>
        <call-remove-icon />
      </b-button>
      <b-button v-if="hasRole('Company Admin') && !hasCompanyIntegrationsEnabled && !isReadOnly"
                class="custom-action-button my-1"
                data-testid="contact-info-merge-button"
                size="sm"
                variant="light"
                @click="openMergeContactModal">
        <q-tooltip anchor="top middle"
                   content-class="fs-12"
                   data-testid="contact-info-merge-tooltip"
                   self="center middle">
          Merge
        </q-tooltip>
        <merge-contact-icon />
      </b-button>
      <b-button v-if="isAdmin && !isFromTeamInbox"
                :disabled="isExportingCommunications || isReadOnly"
                class="custom-action-button my-1"
                data-testid="contact-info-export-button"
                size="sm"
                variant="light"
                @click="handleExportCommunications">
        <q-tooltip anchor="top middle"
                   content-class="fs-12"
                   data-testid="contact-info-export-tooltip"
                   self="center middle">
          Export communications
        </q-tooltip>
        <i v-if="!isExportingCommunications" class="fa fa-arrow-up-from-bracket"></i>
        <q-spinner-bars v-if="isExportingCommunications"
                        class="mr-1"
                        color="blue"
                        size="14px" />
      </b-button>
    </div>
    <calendar-event-manager
      modal-id="appointment-modal"
      called-from="appointment-modal"
      :contact="contact"
      :from-team-inbox="fromTeamInbox"
      :team-inbox-id="teamInboxId"
      :hide-event-type-selector="true"
      :hide-contact-selector="true"
      :default-event-type="12"
      save-button-text="Add Event"
      saving-text="Adding Event..."
      cancel-button-text="Close"
      :simple-mode="true"
      data-testid="contact-info-appointment-form-modal"
    />
    <contact-add-reminder-modal :from-team-inbox="fromTeamInbox"
                                data-testid="contact-info-add-reminder-modal"></contact-add-reminder-modal>
    <power-dialer-add-modal :params="addPowerDialerParams"
                            :redirect="false"
                            data-testid="contact-info-power-dialer-add-modal"
                            @saved="onSavedPowerDialer">
    </power-dialer-add-modal>
    <contact-remove-from-lists-confirmation :contact="contact"
                                            data-testid="contact-remove-from-lists-confirmation"
                                            @close="onCloseContactRemoveFromListsConfirmation"
                                            @confirm="onConfirmContactRemoveFromListsConfirmation"
                                            @error="onErrorContactRemoveFromLists" />
    <merge-contact-modal v-if="isMergeContactOpen"
                         :contact="contact"
                         data-testid="contact-info-merge-contact-modal">
    </merge-contact-modal>
  </b-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import TimerIcon from 'src/components/icons/timer-icon'
import CalendarIcon from 'src/components/icons/calendar-icon'
import CallIcon from 'src/components/icons/call-icon'
import AddCallIcon from 'src/components/icons/add-call-icon'
import CallRemoveIcon from 'src/components/icons/call-remove-icon'
import MergeContactIcon from 'src/components/icons/merge-contact-icon'
import CalendarEventManager from 'src/components/calendar/calendar-event-manager.vue'
import ContactAddReminderModal from 'src/components/contacts/contact-add-reminder-modal'
import PowerDialerAddModal from 'src/components/power-dialer/power-dialer-add-modal.vue'
import ContactRemoveFromListsConfirmation from 'src/components/contacts/contact-remove-from-lists-confirmation.vue'
import MergeContactModal from 'src/components/contacts/merge-contact-modal.vue'
import {
  aclMixin,
  contactMixin,
  integrationMixin,
  teamInboxPropsMixin,
  timezoneCheckMixin,
  userMixin
} from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import talk2TeamInboxApi from 'src/plugins/api/teamInboxApi'
import ContactDncActions from 'components/contacts/contact-dnc-actions'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import { LRN_NOT_PERFORMED } from 'src/constants/lrn-types'
import ContactInfoHeader from './contact-info/contact-info-header.vue'
import ContactInfoPhone from './contact-info/contact-info-phone.vue'
import ContactInfoBadges from './contact-info/contact-info-badges.vue'
import ContactInfoTime from './contact-info/contact-info-time.vue'
import LineSelector from 'components/generic-selectors/line-selector'
import ContactInfoIntegrations from 'components/contacts/contact-info/header/integrations/contact-info-integrations.vue'
import {
  GUESTY_INTEGRATION,
  HUBSPOT_INTEGRATION,
  PIPEDRIVE_INTEGRATION,
  SALESFORCE_INTEGRATION,
  ZOHO_INTEGRATION
} from 'src/constants/integrations'

export default {
  name: 'contact-info',

  props: {
    campaignId: {
      required: true
    }
  },

  mixins: [
    aclMixin,
    timezoneCheckMixin,
    teamInboxPropsMixin,
    integrationMixin,
    contactMixin,
    userMixin
  ],

  components: {
    ContactInfoIntegrations,
    ContactInfoHeader,
    ContactInfoPhone,
    ContactInfoBadges,
    ContactInfoTime,
    ContactDncActions,
    ContactAddReminderModal,
    CalendarEventManager,
    PowerDialerAddModal,
    ContactRemoveFromListsConfirmation,
    MergeContactModal,
    AddCallIcon,
    CallRemoveIcon,
    CallIcon,
    CalendarIcon,
    TimerIcon,
    MergeContactIcon,
    LineSelector
  },

  computed: {
    ...mapState(['isMobile']),

    ...mapState('cache', ['currentCompany']),

    ...mapState('contacts', ['isMergeContactOpen']),

    ...mapState('auth', ['profile']),

    ...mapState('TeamInbox', ['contactsLastUsedLines', 'activeInboxId']),

    ...mapGetters('contacts', [
      'contact',
      'contactPhoneNumbers'
    ]),

    lineSelectorWidth () {
      return this.$q.screen.width <= 1366 ? '200px' : '220px'
    },

    phone () {
      return this.contactPhoneNumbers.find(phone => phone.phone_number === this.contact.phone_number)
    },

    addPowerDialerParams () {
      return {
        contact_ids: [this.contact.id]
      }
    },

    hasPowerDialerLists () {
      return this.contact?.power_dialer_lists?.length > 0
    },

    hasPowerDialerListsText () {
      return this.hasPowerDialerLists ? 'Remove contact from all Power Dialer lists' : 'This contact is not part of any Power Dialer list'
    },

    isAlwaysAskEnabled () {
      return this.profile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_ALWAYS_ASK
    },

    defaultOutboundCampaignId () {
      if (this.profile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT) {
        return this.profile?.default_outbound_campaign_id ?? this.currentCompany?.default_outbound_campaign_id
      }

      return null
    },

    contactLastLineUsedKey () {
      return `${this.activeInboxId}-${this.contact.id}`
    },

    isFromTeamInbox () {
      return !!this.activeInboxId
    },

    activeIntegrations () {
      if (!this.contact?.integration_data) return []

      const INTEGRATIONS = [
        { name: 'gohighlevel', label: 'GoHighLevel' },
        { name: GUESTY_INTEGRATION, label: 'Guesty' },
        { name: HUBSPOT_INTEGRATION, label: 'HubSpot' },
        { name: PIPEDRIVE_INTEGRATION, label: 'Pipedrive' },
        { name: SALESFORCE_INTEGRATION, label: 'Salesforce' },
        { name: ZOHO_INTEGRATION, label: 'Zoho' }
      ]

      return INTEGRATIONS.reduce((acc, integration) => {
        const data = this.contact.integration_data[integration.name]
        if (!data) {
          return acc
        }

        let link = null
        if (integration.name === SALESFORCE_INTEGRATION) {
          const priority = Array.isArray(data?.priority) && data.priority.length > 0
            ? data.priority
            : ['leads', 'contacts', 'accounts']
          for (const entity of priority) {
            const candidate = data[`${entity}_link`]
            if (candidate && candidate !== '#') {
              link = candidate
              break
            }
          }
        } else {
          link = data?.link
        }

        if (link && link !== '#') {
          acc.push({
            ...integration,
            link
          })
        }
        return acc
      }, [])
    }
  },

  data () {
    return {
      isProcessingBlock: false,
      isRemovingFromPowerDialerLists: false,
      selectedLine: null,
      showLineSelectorPopup: false,
      LRN_NOT_PERFORMED,
      contactLastLineUsedId: null,
      isExportingCommunications: false
    }
  },

  methods: {
    ...mapActions('contacts', [
      'addAppointmentOpen',
      'addReminderOpen',
      'addPowerDialerOpen',
      'addMergeContactOpen'
    ]),

    ...mapActions(['setShowPhone']),

    openPowerDialerModal () {
      this.addPowerDialerOpen(true)
    },

    openMergeContactModal () {
      this.addMergeContactOpen(true)
    },

    initiateCall () {
      const data = {
        currentNumber: this.contact.phone_number,
        contactName: this.contact.name,
        companyName: this.contact.company_name,
        contactId: this.contact.id,
        contactTimezone: this.contact.timezone
      }

      if (this.isMobile) {
        this.setShowPhone(true)

        setTimeout(() => {
          this.$VueEvent.fire('changePhoneNumber', data)
        }, 100)

        return
      }

      if (!this.isFromTeamInbox || !this.hasCompanyTeamInboxLineManagementEnhancements) {
        if (!this.isAlwaysAskEnabled && this.defaultOutboundCampaignId) {
          // If the outbound calling mode is not always ask and there is a default outbound campaign id, use it
          data.outboundCampaignId = this.defaultOutboundCampaignId
        }
      } else {
        // If the call is being placed from the team inbox, use the selected line or the default outbound campaign id
        data.outboundCampaignId = this.selectedLine || this.defaultOutboundCampaignId
      }

      const event = !data.outboundCampaignId ? 'callContact' : 'makeCall'
      this.$VueEvent.fire(event, data)
    },

    onCallClick () {
      if (this.hasCompanyTeamInboxLineManagementEnhancements) {
        const showLineSelectorPopup = this.isAlwaysAskEnabled ||
          (this.defaultOutboundCampaignId && this.defaultOutboundCampaignId !== this.contactLastLineUsedId)

        if (this.isFromTeamInbox && showLineSelectorPopup) {
          // Show popup and wait for user to select line
          this.contactLastLineUsedId = this.contactsLastUsedLines.get(this.contactLastLineUsedKey)
          this.showLineSelectorPopup = !this.showLineSelectorPopup
          this.selectedLine = this.contactLastLineUsedId
          return
        }
      }

      // If we don't need to show the line selector popup, directly call the contact
      this.callContact()
    },

    forceInitiateCall (campaignId) {
      this.selectedLine = campaignId
      this.callContact()
    },

    callContact () {
      this.showLineSelectorPopup = false

      const params = {
        timezone: this.contact.timezone,
        name: this.contact.name,
        calls_notifications_open_time: this.currentCompany.calls_notifications_open_time,
        calls_notifications_close_time: this.currentCompany.calls_notifications_close_time
      }

      this.checkContactTimezone(params, this.initiateCall)
    },

    blockContact () {
      this.isProcessingBlock = true

      talk2Api.V1.contact.update(this.contact.id, { is_blocked: 1 }).then(() => {
        this.contact.is_blocked = true
        this.isProcessingBlock = false
        this.$generalNotification('Contact was successfully blocked.', 'success')
      })
    },

    unBlockContact () {
      this.isProcessingBlock = true

      talk2Api.V1.contact.update(this.contact.id, { is_blocked: 0 }).then(() => {
        this.contact.is_blocked = false
        this.isProcessingBlock = false
        this.$generalNotification('Contact was successfully unblocked.', 'success')
      })
    },

    removeContactFromPowerDialerLists () {
      this.$bvModal.show('contact-remove-from-lists-confirmation')
    },

    onCloseContactRemoveFromListsConfirmation () {
      this.$bvModal.hide('contact-remove-from-lists-confirmation')
    },

    onConfirmContactRemoveFromListsConfirmation () {
      this.$bvModal.hide('contact-remove-from-lists-confirmation')

      this.isRemovingFromPowerDialerLists = true
      this.fetchContact(false)
      setTimeout(() => {
        this.isRemovingFromPowerDialerLists = false
      }, 4000)
    },

    onSavedPowerDialer () {
      this.fetchContact(false)
      this.isRemovingFromPowerDialerLists = false
    },

    onErrorContactRemoveFromLists (error) {
      this.$bvModal.hide('contact-remove-from-lists-confirmation')
      console.log('error', error)
      if (!error?.response) {
        return
      }

      this.$handleErrors(error?.response, 'error')
    },

    onLineChange (line) {
      this.selectedLine = line
    },

    onInvalidLineSelection () {
      this.selectedLine = null
    },

    async handleExportCommunications () {
      this.isExportingCommunications = true

      try {
        if (this.teamInbox) {
          await talk2TeamInboxApi.contact.exportCommunications(this.contact.id)
        } else {
          await talk2Api.V2.contacts.exportCommunications(this.contact.id)
        }
        this.$generalNotification('Contact communications export request has been successfully submitted and is queued for processing.')
      } catch (error) {
        console.log(error)
        this.$generalNotification('Unable to process export request! Please try again later.', 'error')
      } finally {
        this.isExportingCommunications = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/breakpoints.scss';

.alw-contact-info {
  // Override bootstrap card padding for custom layout
  ::v-deep .card-body {
    padding: 16px;
  }

  // Remove Quasar item section padding if present
  ::v-deep .q-item__section--side {
    padding-right: 0;
  }

  // Smooth transitions for all elements within contact-info
  &,
  & * {
    transition: all 0.3s ease;
  }
}

.alw-contact-info-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

</style>
