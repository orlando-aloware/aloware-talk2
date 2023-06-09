<template>
  <div class="h-100">
    <div class="mobile-header align-items-center justify-content-between pr-3"
         v-if="$q.screen.lt.md">
      <div class="mobile-header-labels h-100 align-items-center justify-content-start">
        <back-button @click="$emit('back')"/>
        <span class="pr-1 contact-name">
          Contact Details
        </span>
      </div>
      <profile class="p-0"
               :hide-profile-info="true"/>
    </div>
    <div class="contact-details-wrapper">
      <div class="details-component-container pb-5"
           ref="detailsComponentContainer">
        <template v-if="!saveBarOnly">
          <contact-info :campaign-id="campaignId"/>
          <contact-sequence v-if="contact && !contact.is_dnc && hasPermissionTo('update contact')"
                            :contact="contact"/>
          <contact-aloha-bot v-if="contact && !contact.is_dnc && hasPermissionTo('update contact')"
                            :contact="contact"/>
          <contact-phones/>
          <contact-information :first-outbound-call="communicationsSummary.first_outbound_call"/>
          <contact-tags :contact="contact"/>
          <contact-notes v-if="contact"
                         :contact="contact"
                         @input="onNotesInput"/>
          <contact-integrations :contact="contact"/>
          <contact-scheduled-messages/>
          <contact-activity-counts :summary="communicationsSummary.summaries"/>
          <contact-lines/>
          <contact-ring-groups/>
          <contact-broadcast class="mb-5"/>
          <div class="pb-5"/>
        </template>
        <contact-save-bar v-if="!noSaveBar"/>
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
import { CALL, SMS } from 'src/constants/communication-types'
import { INBOUND, OUTBOUND } from 'src/constants/communication-direction'
import ContactSaveBar from 'components/contacts/contact-save-bar'
import _ from 'lodash'
import Profile from 'components/profile'
import ContactSequence from 'components/contacts/contact-sequence'
import ContactAlohaBot from 'components/contacts/contact-aloha-bot'
import {
  aclMixin,
  contactMixin,
  contactV2AttributesMixin,
  visibilityMixin
} from 'src/plugins/mixins'

export default {
  name: 'contact-details',

  props: {
    campaignId: {
      required: true
    },

    saveBarOnly: {
      type: Boolean,
      required: false,
      default: false
    },

    noSaveBar: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    aclMixin,
    visibilityMixin
  ],

  components: {
    ContactSequence,
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
    BackButton,
    ContactAlohaBot
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
  },

  watch: {
    'contact.id': _.debounce(function (value) {
      this.$nextTick(() => {
        this.$refs.detailsComponentContainer.scrollTop = 0
      })
    }, 500)
  }
}
</script>
