<template>
  <div class="h-100">
    <div class="mobile-header align-items-center justify-content-between pr-3"
         v-if="$q.screen.lt.md">
      <div class="mobile-header-labels h-100 align-items-center justify-content-start">
        <back-button @click="$emit('back')"/>
        <span class="pr-1 contact-name">
          {{ contactName }} Details
        </span>
      </div>
      <profile class="p-0"
               :hide-profile-info="true"/>
    </div>
    <div class="contact-details-wrapper">
      <div class="details-component-container"
           ref="detailsComponentContainer">
        <contact-info></contact-info>
        <contact-phones></contact-phones>
        <contact-information :first-outbound-call="communicationsSummary.first_outbound_call">
        </contact-information>
        <contact-tags :contact="contact">
        </contact-tags>
        <contact-notes :contact="contact"
                       @input="onNotesInput">
        </contact-notes>
        <contact-integrations :contact="contact"></contact-integrations>
        <contact-scheduled-messages></contact-scheduled-messages>
        <contact-activity-counts :summary="communicationsSummary.summaries"></contact-activity-counts>
        <contact-lines></contact-lines>
        <contact-ring-groups></contact-ring-groups>
        <contact-broadcast></contact-broadcast>

        <contact-save-bar></contact-save-bar>
      </div>
    </div>
  </div>
</template>

<script>
import ContactPhones from 'src/components/contacts/contact-phones'
import ContactInfo from 'src/components/contacts/contact-info'
import ContactNotes from 'src/components/contacts/contact-notes'
import ContactActivityCounts from 'src/components/contacts/contact-activity-counts'
import ContactLines from 'src/components/contacts/contact-lines'
import ContactRingGroups from 'src/components/contacts/contact-ring-groups'
import ContactBroadcast from 'src/components/contacts/contact-broadcast'
import ContactInformation from 'src/components/contacts/contact-information'
import ContactIntegrations from 'src/components/contacts/contact-integrations'
import ContactScheduledMessages from 'src/components/contacts/contact-scheduled-messages'
import ContactTags from 'src/components/generic-selectors/contact-tags'
import BackButton from 'components/back-button'
import { mapGetters, mapActions } from 'vuex'
import { contact as contactMixins } from 'src/plugins/mixins'

import { CALL, SMS } from 'src/constants/communication-types'
import { INBOUND, OUTBOUND } from 'src/constants/communication-direction'
import ContactSaveBar from 'components/contacts/contact-save-bar'
import _ from 'lodash'
import Profile from 'components/profile'

export default {
  name: 'contact-details',

  mixins: [contactMixins],

  components: {
    Profile,
    ContactSaveBar,
    ContactScheduledMessages,
    ContactIntegrations,
    ContactInformation,
    ContactBroadcast,
    ContactRingGroups,
    ContactLines,
    ContactActivityCounts,
    ContactNotes,
    ContactInfo,
    ContactPhones,
    ContactTags,
    BackButton
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'contactClone']),

    contactName () {
      if (this.contact && this.contact.name) {
        return _.get(this.contact, 'name', '')
      }

      if (this.contact && this.contact.first_name && this.contact.last_name) {
        return `${this.contact.first_name} ${this.contact.last_name}`
      }

      return 'No Name'
    }
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'updateChangedContactProperties']),
    onNotesInput (value) {
      this.updateChangedContactProperties({
        name: 'notes',
        value: value
      })
    }
  },

  async mounted () {
    if (this.contact) {
      this.getCommunicationsSummary(this.contact.id)
      // listens to newly communication added
      // used in communications count summary
      this.$VueEvent.listen('new_communication', communication => {
        // checks if the new comm is not from the current contact, then return
        if (communication.contact_id !== this.contactId) {
          return
        }

        this.communicationsSummary.summaries.total_count++
        let type = communication.type
        let direction = communication.direction

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
  },

  watch: {
    'contact.id': function (value) {
      this.$nextTick(() => {
        this.$refs.detailsComponentContainer.scrollTop = 0
      })
      this.getCommunicationsSummary(value)
    }
  }
}
</script>
