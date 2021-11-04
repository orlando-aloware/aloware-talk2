<template>
  <b-overlay :show="changingSelectedContact"
             :opacity="0.85"
             class="h-100 w-100"
             variant="white"
             rounded="sm"
             v-if="authenticated">
    <div class="mx-0 content-row contact-view-wrapper d-flex justify-content-between h-100">
      <template v-if="!isInbox">
        <contact-list-sidebar></contact-list-sidebar>
      </template>
      <div class="contact-activity-wrapper flex-grow-1"
           :class="{ 'contact-activity--closed': detailsOpen }">
        <contact-activities ref="contactActivities"
                            :class="{ 'contact-activity--closed': detailsOpen }"
                            :communications="filteredCommunications"
                            :campaignId="selectedCampaignId"
                            @markAllAsRead="markAllAsRead"
                            @toggleDrawer="toggleDrawer"
                            @toggleDetails="toggleDetails">
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
      <div class="contact-details-container"
           :class="{ 'contact-details--opened': detailsOpen }">
        <contact-details @back="toggleDetails"></contact-details>
      </div>
      <q-drawer
        overlay
        bordered
        class="contact-details-container-drawer position-relative"
        side="right"
        :breakpoint="0"
        :width="300"
        v-model="drawer">
        <compact-btn borderless
                     customClass="mt-1 contact-details-container-drawer__close d-flex justify-content-center"
                     variant="outlined-light"
                     @clicked="toggleDrawer">
          <!--i class="fa fa-times"></i-->
          <close-icon width="18px"
                      height="18px"
                      icon-color="white">
          </close-icon>
        </compact-btn>
        <contact-details v-if="drawer"></contact-details>
      </q-drawer>
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
import CompactBtn from 'src/components/compact-btn'
import { mapActions, mapGetters } from 'vuex'
import CloseIcon from 'components/icons/close-icon'

export default {
  mixins: [contactsMixins, contactMixins],

  components: {
    CloseIcon,
    ContactDetails,
    ContactActivities,
    ContactListSidebar,
    CompactBtn
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'isSidebarCollapsed', 'changingSelectedContact']),
    ...mapGetters('auth', ['authenticated']),
    isInbox () {
      return ['Inbox Contact', 'Inbox Contact Task', 'Inbox', 'Inbox Contact Mention Communication'].includes(this.$route.name)
    }
  },

  data () {
    return {
      title: 'Contact',
      totalContacts: 0,
      drawer: false,
      detailsOpen: false
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
    },
    toggleDrawer () {
      this.drawer = !this.drawer
    },
    toggleDetails () {
      this.detailsOpen = !this.detailsOpen
    },
    resizeHandler () {
      const width = document.documentElement.clientWidth
      if (width > 1084 || width < 606) {
        this.drawer = false
      }
    }
  },

  mounted () {
    if (this.authenticated) {
      this.fetchContact()
    }
  },

  created () {
    window.addEventListener('resize', this.resizeHandler)
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

    '$q.screen.lt.md': function () {
      if (this.$q.screen.lt.md) {
        this.drawer = false
      }
    },

    '$route.params.communicationId': function (value) {
      if (['Inbox Contact', 'Inbox Contact Mention Communication'].includes(this.$route.name)) {
        this.fetchContactCommunicationsUntilFound()
      }
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeHandler)
  }
}
</script>
