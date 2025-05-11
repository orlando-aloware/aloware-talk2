<template>
  <div class="h-100 d-flex flex-column" data-testid="contact-details-wrapper">
    <div class="mobile-header align-items-center justify-content-between pr-2 flex-grow-0"
         v-if="$q.screen.lt.md">
      <div class="mobile-header-labels h-100 align-items-center justify-content-start">
        <back-button data-testid="contact-details-back-button" @click="$emit('back')"/>
        <span class="pr-1 contact-name">
          Contact Details
        </span>
      </div>
      <profile class="p-0"
               :hide-profile-info="true"/>
    </div>
    <div class="contact-details-wrapper h-100 flex-grow-1 overflow-hidden">
      <div class="details-component-container h-100"
           ref="detailsComponentContainer">
        <template v-if="!saveBarOnly">
          <contact-info data-testid="contact-details-info" :campaign-id="campaignId"/>
          <contact-sequence class="w-100"
                            data-testid="contact-details-sequence"
                            :contact="contact"
                            :is-read-only="isReadOnly"
                            v-if="contact && !contact.is_dnc && hasPermissionTo('update contact')"/>
          <contact-conversation-insights :contact="contact"
                                         data-testid="contact-conversation-insights"
                                         :is-read-only="isReadOnly"
                                         v-if="contact && shouldSeeExperimentalXproAiFeatures"/>
          <contact-aloai-enrollment-control ss="w-100"
                                            data-testid="contact-aloai-enrollment-control"
                                            :contact="contact"
                                            :is-read-only="isReadOnly"
                                            v-if="showAloAiControls"/>
          <contact-aloai-engagement-control ss="w-100"
                                            data-testid="contact-aloai-engagement-control"
                                            :contact="contact"
                                            :is-read-only="isReadOnly"
                                            v-if="false"/>
          <contact-phones data-testid="contact-details-contact-phones"
                         :is-read-only="isReadOnly"/>
          <contact-information data-testid="contact-details-contact-information"
                               :first-outbound-call="communicationsSummary.first_outbound_call"
                               :is-read-only="isReadOnly"/>
          <entity-tags data-testid="contact-details-tags"
                       entity="contact"
                       entity-type="contacts"
                       label="Tags"
                       button-text="Modify Tags"
                       :entity-object="contact"
                       :category="TagCategories.CAT_CONTACTS"
                       :is-read-only="isReadOnly"/>
          <contact-lists-card data-testid="contact-details-public-lists"
                              key="contact-public-lists-card"
                              :is-public-contact-list-card="true"
                              :contact="contact"
                              :is-read-only="isReadOnly"/>
          <contact-lists-card data-testid="contact-details-private-lists"
                              key="contact-private-lists-card"
                              :is-public-contact-list-card="false"
                              :contact="contact"
                              :is-read-only="isReadOnly"/>

          <contact-notes data-testid="contact-details-notes"
                         :contact="contact"
                         :is-read-only="isReadOnly"
                         v-if="contact"
                         @input="onNotesInput"/>
          <contact-integrations data-testid="contact-details-integrations"
                                :contact="contact"
                                :team-inbox-id="teamInboxId"
                                :is-read-only="isReadOnly"/>
          <contact-reservations v-if="contact && showGuestyReservations()"
                                data-testid="contact-details-reservations"
                                :contact="contact"/>
          <contact-reservations-messages v-if="contact && showGuestyReservations()"
                                         data-testid="contact-details-reservations-messages"
                                         :contact="contact"/>
          <contact-scheduled-messages data-testid="contact-details-scheduled-messages"/>
          <contact-activity-counts data-testid="contact-details-activity-counts" :summary="communicationsSummary.summaries"/>
          <contact-lines data-testid="contact-details-lines"
                         :is-read-only="isReadOnly"/>
          <contact-ring-groups data-testid="contact-details-ring-groups"
                              :is-read-only="isReadOnly"/>
          <contact-broadcast data-testid="contact-details-broadcast"/>
        </template>
        <contact-save-bar data-testid="contact-details-save-bar" v-if="!noSaveBar || isReadOnly"/>
      </div>
    </div>
  </div>
</template>

<script>
import ContactConversationInsights from 'components/aloai/contact-conversation-insights.vue'
import BackButton from 'components/back-button'
import ContactAloaiEngagementControl from 'components/contacts/contact-aloai-engagement-control'
import ContactAloaiEnrollmentControl from 'components/contacts/contact-aloai-enrollment-control'
import ContactReservationsMessages from 'components/contacts/contact-reservations-messages.vue'
import ContactReservations from 'components/contacts/contact-reservations.vue'
import ContactSaveBar from 'components/contacts/contact-save-bar'
import ContactSequence from 'components/contacts/contact-sequence'
import EntityTags from 'components/generic-selectors/entity-tags'
import Profile from 'components/profile'
import _ from 'lodash'
import ContactActivityCounts from 'src/components/contacts/contact-activity-counts'
import ContactBroadcast from 'src/components/contacts/contact-broadcast'
import ContactInfo from 'src/components/contacts/contact-info'
import ContactInformation from 'src/components/contacts/contact-information'
import ContactIntegrations from 'src/components/contacts/contact-integrations'
import ContactLines from 'src/components/contacts/contact-lines'
import ContactListsCard from 'src/components/contacts/contact-lists-card'
import ContactNotes from 'src/components/contacts/contact-notes'
import ContactPhones from 'src/components/contacts/contact-phones'
import ContactRingGroups from 'src/components/contacts/contact-ring-groups'
import ContactScheduledMessages from 'src/components/contacts/contact-scheduled-messages'
import { INBOUND, OUTBOUND } from 'src/constants/communication-direction'
import { CALL, SMS } from 'src/constants/communication-types'
import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'
import { aclMixin, contactMixin, contactV2AttributesMixin, userMixin, visibilityMixin, teamInboxPropsMixin } from 'src/plugins/mixins'
import { mapActions, mapGetters, mapState } from 'vuex'

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
    visibilityMixin,
    userMixin,
    teamInboxPropsMixin
  ],

  components: {
    ContactConversationInsights,
    ContactSequence,
    ContactAloaiEngagementControl,
    ContactAloaiEnrollmentControl,
    Profile,
    ContactSaveBar,
    ContactScheduledMessages,
    ContactIntegrations,
    ContactInformation,
    ContactBroadcast,
    ContactRingGroups,
    ContactLines,
    ContactActivityCounts,
    ContactListsCard,
    ContactNotes,
    ContactInfo,
    ContactPhones,
    BackButton,
    ContactReservations,
    ContactReservationsMessages,
    EntityTags
  },

  data () {
    return {
      TagCategories
    }
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'contactClone']),
    ...mapState('cache', ['currentCompany']),

    contactName () {
      if (this.contact && this.contact.name) {
        return _.get(this.contact, 'name', '')
      }

      if (this.contact && this.contact.first_name && this.contact.last_name) {
        return `${this.contact.first_name} ${this.contact.last_name}`
      }

      return 'No Name'
    },

    showAloAiControls () {
      return this.currentCompany.aloai_enabled &&
        this.contact && !this.contact.is_dnc &&
        this.hasPermissionTo('update contact')
    }
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'updateChangedContactProperties']),

    onNotesInput (value) {
      this.updateChangedContactProperties({
        name: 'notes',
        value: value
      })
    },

    showGuestyReservations () {
      return this.currentCompany.is_multi_guesty
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
