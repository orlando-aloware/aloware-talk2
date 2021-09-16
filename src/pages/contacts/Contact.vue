<template>
  <b-overlay :show="changingSelectedContact"
             :opacity="0.85"
             class="h-100"
             variant="white"
             rounded="sm"
             v-if="authenticated">
    <div class="row mx-0 content-row contact-view-wrapper d-flex">
      <template v-if="!isInbox">
        <contact-list-sidebar></contact-list-sidebar>
      </template>
      <div :class="`contact-activity-wrapper ${widthClass}`">
        <contact-activities ref="contactActivities"
                            :communications="filteredCommunications"
                            :campaignId="selectedCampaignId"
                            @markAllAsRead="markAllAsRead">
          <template v-slot:moreActivities>
            <q-btn outline
                   dense
                   rounded
                   no-caps
                   class="prev-activities mx-2"
                   color="primary"
                   size="md"
                   :isLoadingMore="isLoadingMore"
                   :loading="isLoadingPreviousActivities"
                   :disable="isLoadingPreviousActivities"
                   v-if="hasMoreCommunications"
                   @click="loadMorePreviousActivities">
              <div class="px-2">
                Previous Activities
              </div>
            </q-btn>
          </template>
        </contact-activities>
      </div>
      <div class="px-0 width-330 pt-2">
        <contact-details></contact-details>
      </div>
    </div>
    <template #overlay>
      <div class="text-center">
        <q-spinner-bars
          color="primary"
          size="2em"
        />
        <p id="cancel-label">Fetching contact...</p>
      </div>
    </template>
  </b-overlay>
</template>

<script>
import ContactListSidebar from 'src/components/contacts/contact-list-sidebar'
import ContactActivities from 'src/components/contacts/contact-activities'
import ContactDetails from 'src/components/contacts/contact-details'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import contactMixins from 'src/plugins/mixins/contact.mixin'
import { mapActions, mapGetters } from 'vuex'

export default {
  mixins: [contactsMixins, contactMixins],

  components: {
    ContactDetails,
    ContactActivities,
    ContactListSidebar
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'isSidebarCollapsed', 'changingSelectedContact']),
    ...mapGetters('auth', ['authenticated']),

    widthClass () {
      if (this.isInbox) {
        return 'w-less-330px'
      }

      return !this.isSidebarCollapsed ? 'w-less-630px' : 'w-less-345px'
    },
    isInbox () {
      return ['Inbox Contact', 'Inbox Contact Task', 'Inbox', 'Inbox Contact Mention Communication'].includes(this.$route.name)
    }
  },

  data () {
    return {
      title: 'Contact',
      totalContacts: 0
    }
  },

  methods: {
    ...mapActions('contacts', ['resetChangedContactProperties', 'selectedContactChanging', 'setContact', 'setContactClone']),
    fetchContact () {
      this.selectedContactChanging(true)
      let _this = this
      this.processFetchContactInfo(function (selectedContact) {
        _this.setContact(selectedContact)
        _this.setContactClone(selectedContact)
        _this.resetChangedContactProperties([])
        _this.selectedContactChanging(false)
      })
    }
  },

  mounted () {
    if (this.authenticated) {
      this.contactId = this.$route.params.id
      this.fetchContact()
    }
  },

  created () {
    this.$VueEvent.listen('contact_task_status_updated', (contact) => {
      if (this.contact.id === contact.id) {
        this.setContact(contact)
      }
    })
  },

  watch: {
    '$route.params.id': function (value) {
      if (['Contact', 'Inbox Contact', 'Inbox Contact Task', 'Inbox Contact Mention Communication'].includes(this.$route.name) && this.contactId !== value) {
        this.resetSelectedContact()
        this.contactId = value
        this.fetchContact()
      } else {
        this.setContact(this.selectedContact)
        this.resetSelectedContact()
      }
    },

    '$route.params.communicationId': function (value) {
      if (['Inbox Contact', 'Inbox Contact Mention Communication'].includes(this.$route.name)) {
        this.fetchContactCommunicationsUntilFound()
      }
    }
  }
}
</script>
