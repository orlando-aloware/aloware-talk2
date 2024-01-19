<template>
  <q-card class="bg-grey-1 h-100"
          flat
          :class="{ 'h-93': isTrialBannerVisible }"
          :disabled="sessionLoader">
    <contact-sequence class="w-100 mb-2"
                      :contact="contact"
                      v-if="contact && !contact.is_dnc && hasPermissionTo('update contact')"/>
    <div class="contact-info-wrapper pb-2 flex-column">
      <contact-phones no-bottom-padding />
      <b-card class="d-inline-flex flex-wrap contact-action-button border-0 w-100"
              no-body>
        <b-card-body class="pt-1">
          <b-button variant="light"
                    size="sm"
                    class="custom-action-button my-1"
                    :disabled="contact.is_dnc"
                    @click="addAppointmentOpen(true)">
            <q-tooltip anchor="bottom middle"
                       self="center middle">
              Add appointment
            </q-tooltip>
            <calendar-icon />
          </b-button>
          <b-button variant="light"
                    size="sm"
                    class="custom-action-button my-1"
                    :disabled="contact.is_dnc"
                    @click="addReminderOpen(true)">
            <q-tooltip anchor="bottom middle"
                       self="center middle">
              Add reminder
            </q-tooltip>
            <timer-icon />
          </b-button>
        </b-card-body>
      </b-card>
    </div>
    <contact-tags class="mb-2"
                 :contact="contact" />
    <contact-notes class="mb-2"
                   :contact="contact"
                   @input="onNotesInput" />
    <contact-integrations class="mb-2"
                          :contact="contact" />
    <contact-scheduled-messages class="mb-2"/>
    <contact-activity-counts class="mb-2"
                             :summary="communicationsSummary.summaries"/>
    <contact-lines class="mb-2"/>
    <contact-ring-groups class="mb-2" />
    <contact-broadcast class="mb-2" />
  </q-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ContactSequence from 'components/contacts/contact-sequence'
import ContactPhones from 'components/contacts/contact-phones'
import ContactTags from 'components/generic-selectors/contact-tags'
import ContactNotes from 'components/contacts/contact-notes'
import ContactIntegrations from 'src/components/contacts/contact-integrations'
import ContactActivityCounts from 'src/components/contacts/contact-activity-counts'
import ContactLines from 'src/components/contacts/contact-lines'
import ContactRingGroups from 'src/components/contacts/contact-ring-groups'
import ContactBroadcast from 'src/components/contacts/contact-broadcast'
import ContactScheduledMessages from 'src/components/contacts/contact-scheduled-messages'
import TimerIcon from 'src/components/icons/timer-icon'
import CalendarIcon from 'src/components/icons/calendar-icon'
import {
  aclMixin,
  contactMixin
} from 'src/plugins/mixins'
import { CALL, SMS } from 'src/constants/communication-types'
import { INBOUND, OUTBOUND } from 'src/constants/communication-direction'

export default {
  name: 'DetailsTools',

  components: {
    ContactSequence,
    ContactPhones,
    ContactTags,
    ContactNotes,
    ContactIntegrations,
    ContactScheduledMessages,
    ContactActivityCounts,
    ContactLines,
    ContactRingGroups,
    ContactBroadcast,
    TimerIcon,
    CalendarIcon
  },

  mixins: [
    aclMixin,
    contactMixin
  ],

  computed: {
    ...mapGetters('powerDialer', [
      'sessionLoader'
    ]),

    ...mapGetters('contacts', [
      'contact'
    ]),

    ...mapState(['isTrialBannerVisible'])
  },

  methods: {
    ...mapActions('contacts', [
      'updateChangedContactProperties',
      'addAppointmentOpen',
      'addReminderOpen'
    ]),

    onNotesInput (value) {
      this.updateChangedContactProperties({
        name: 'notes',
        value: value
      })
    }
  },

  watch: {
    'contact.id': {
      handler (id) {
        if (id) {
          this.fetchContactInfo(true, id, true)
        }
      }
    }
  },

  async mounted () {
    if (this.contact) {
      // listens to newly communication added
      // used in communications count summary
      this.$VueEvent.listen('new_communication', communication => {
        // checks if the new comm is not from the current contact, then return
        if (communication.contact_id !== this.contactId) {
          return
        }

        if (!this.checkCommunicationMatchesUserAccessibility(communication)) {
          return
        }

        this.communicationsSummary.summaries.total_count++
        const type = communication.type
        const direction = communication.direction

        if (type === CALL && direction === INBOUND) {
          this.communicationsSummary.summaries.inbound_calls_count++
        } else if (type === CALL && direction === OUTBOUND) {
          this.communicationsSummary.summaries.outbound_calls_count++

          // if no outbound call and the new com. is an outbound call, assign.
          if (!this.communicationsSummary.first_outbound_call) {
            this.communicationsSummary.first_outbound_call = communication
          }
        } else if (type === SMS && direction === INBOUND) {
          this.communicationsSummary.summaries.inbound_texts_count++
        } else if (type === SMS && direction === OUTBOUND) {
          this.communicationsSummary.summaries.outbound_texts_count++
        }
      })
    }
  }
}
</script>
