<template>
  <div class="contact-details-wrapper">
    <div class="details-component-container"
         ref="detailsComponentContainer">
      <contact-info></contact-info>
      <contact-phones></contact-phones>
      <contact-information :first-outbound-call="communicationsSummary.first_outbound_call">
      </contact-information>
      <contact-tags :contact="contact"
                    @update="onTagsUpdate">
      </contact-tags>
      <contact-notes :contact="contact"
                     @input="onNotesInput">
      </contact-notes>
      <contact-integrations :contact="contact"></contact-integrations>
      <contact-scheduled-messages></contact-scheduled-messages>
      <contact-activity-counts></contact-activity-counts>
      <contact-lines></contact-lines>
      <contact-ring-groups></contact-ring-groups>
      <contact-broadcast></contact-broadcast>

      <contact-save-bar></contact-save-bar>
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
import { mapGetters, mapActions } from 'vuex'
import { contact as contactMixins } from 'src/plugins/mixins'

import { CALL, SMS } from 'src/constants/communication-types'
import { INBOUND, OUTBOUND } from 'src/constants/communication-direction'
import ContactSaveBar from 'components/contacts/contact-save-bar'

export default {
  name: 'contact-details',

  mixins: [contactMixins],

  components: {
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
    ContactTags
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'contactClone'])
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'setContactTags', 'updateChangedContactProperties']),
    onNotesInput (value) {
      this.updateChangedContactProperties({
        name: 'notes',
        value: value
      })
    },
    onTagsUpdate (tags) {
      this.setContactTags(tags)
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
