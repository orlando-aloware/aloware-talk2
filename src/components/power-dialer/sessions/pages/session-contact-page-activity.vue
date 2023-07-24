<template>
  <b-overlay class="h-100"
             variant="white"
             rounded="sm"
             :show="changingSelectedContact"
             :opacity="0.85"
             v-if="authenticated">
    <div class="row">
      <div class="col-12 p-1">

        <div :class="`contact-activity-wrapper ${widthClass}`"
             style="height:calc(100vh - 340px);">

          <ContactActivities ref="contactActivities"
                             :communications="filteredCommunications"
                             :campaign-id="selectedCampaignId"
                             v-if="contact"
                             @mark-all-as-read="markAllAsRead"
                             @toggleDrawer="toggleDrawer"
                             @toggleDetails="toggleDetails">

            <template v-slot:moreActivities>
              <q-btn class="prev-activities mx-2"
                     color="primary"
                     size="md"
                     outline
                     dense
                     rounded
                     no-caps
                     :isLoadingMore="sessionLoader"
                     :loading="isLoadingPreviousActivities"
                     :disable="isLoadingPreviousActivities"
                     v-if="hasMoreCommunications"
                     @click="loadMorePreviousActivities">
                <div class="px-2">
                  Previous Activities
                </div>
              </q-btn>
            </template>

          </ContactActivities>

        </div>
      </div>
    </div>
    <template #overlay>
      <div class="text-center">
        <q-spinner-bars color="primary"
                        size="2em" />
        <div>Fetching contact activity information...</div>
      </div>
    </template>
  </b-overlay>
</template>

<script>

import { mapState, mapGetters, mapActions } from 'vuex'
import {
  contactMixin,
  contactV2AttributesMixin,
  aclMixin,
  visibilityMixin
} from 'src/plugins/mixins'
import ContactActivities from 'src/components/contacts/contact-activities'

export default {
  name: 'SessionContactPageActivity',

  components: {
    ContactActivities
  },

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    aclMixin,
    visibilityMixin
  ],

  props: {
    panel: {
      required: true
    }
  },

  created () {
    this.setIsContactMixinUsed(true)
    this.initListeners()

    // listener for clearing contact change
    this.contactActivityListeners.contactTaskStatusUpdated = (contact) => {
      if (this.contact.id === contact.id) {
        this.setContact(this.contact)
      }
    }

    // listener for updating the contact from
    // session contact page component's getContactData
    this.contactActivityListeners.updateContact = (data) => {
      // update the contact
      this.sessionContactActivityContactUpdate(data)
      // fetch contact info (other contact info because we
      // already fetched the contact)
      this.processFetchContactInfo(null, false)
    }

    // listener for updating the contact from contact mixin fetchContactInfo
    this.contactActivityListeners.updateContactFromFetch = (data) => {
      // update the contact
      this.sessionContactActivityContactUpdate(data)
    }

    // listener for updating contact task status
    this.contactActivityListeners.clearContactChangeFromFetch = () => {
      this.selectedContactChanging(false)
    }

    this.$VueEvent.listen('contact_activity_update_contact', this.contactActivityListeners.updateContact)
    this.$VueEvent.listen('contact_activity_update_contact_from_fetch', this.contactActivityListeners.updateContactFromFetch)
    this.$VueEvent.listen('contact_task_status_updated', this.contactActivityListeners.contactTaskStatusUpdated)
    this.$VueEvent.listen('contact_activity_clear_change_from_fetch', this.contactActivityListeners.clearContactChangeFromFetch)
  },

  mounted () {
    this.contactId = this.contact.id
    this.setSelectedContact(this.contact)
    this.selectedContactChanging(true)
    // initial fetch after mounting
    this.processFetchContactInfo()
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated'
    ]),

    ...mapGetters('powerDialer', [
      'sessionLoader'
    ]),

    ...mapGetters('contacts', [
      'contact',
      'isSidebarCollapsed',
      'changingSelectedContact'
    ]),

    ...mapState([
      'contactDetailsDrawer',
      'campaignsIsLoading',
      'usersIsLoading',
      'tagsFullyLoaded',
      'campaigns',
      'users',
      'tags'
    ]),

    isInbox () {
      return ['Inbox Contact', 'Inbox Contact Task', 'Inbox', 'Inbox Contact Mention Communication'].includes(this.$route.name)
    },

    widthClass () {
      if (this.isInbox) {
        return 'w-less-330px'
      }

      return 'w-less-500px'
    }
  },

  methods: {
    ...mapActions('contacts', [
      'resetChangedContactProperties',
      'selectedContactChanging',
      'setContact',
      'setContactClone'
    ]),

    ...mapActions(['setContactDetailsDrawer']),

    toggleDrawer () {
      this.drawer = !this.drawer
      this.setContactDetailsDrawer(this.drawer)
    },

    toggleDetails () {
      this.detailsOpen = !this.detailsOpen
    },

    toggleContactListSidebar (isOpen) {
      this.contactListSidebarOpen = isOpen
      if (typeof this.$refs.contactListSidebar !== 'undefined' && isOpen) {
        this.$refs.contactListSidebar.onSidebarToggle()
      }
    },

    prepareActivities () {
      this.contactId = this.contact.id
      this.setSelectedContact(this.contact)
    },

    sessionContactActivityContactUpdate (data) {
      this.contactId = data.id
      this.setSelectedContact(data)
      this.setContact(data)
      this.setContactClone(data)
      this.resetChangedContactProperties([])
    }
  },

  data () {
    return {
      flagged: false,
      isLoading: false,
      drawer: false,
      detailsOpen: false,
      contactListSidebarOpen: false,
      contactActivityListeners: {}
    }
  },

  watch: {
    'contact.id': function () {
      this.selectedContactChanging(true)
    }
  },

  beforeDestroy () {
    this.setIsContactMixinUsed(false)
    this.removeListeners()
    this.$VueEvent.stop('contact_activity_update_contact', this.contactActivityListeners.updateContact)
    this.$VueEvent.stop('contact_activity_update_contact_from_fetch', this.contactActivityListeners.updateContactFromFetch)
    this.$VueEvent.stop('contact_task_status_updated', this.contactActivityListeners.contactTaskStatusUpdated)
    this.$VueEvent.stop('contact_activity_clear_change_from_fetch', this.contactActivityListeners.clearContactChangeFromFetch)
  }
}
</script>
