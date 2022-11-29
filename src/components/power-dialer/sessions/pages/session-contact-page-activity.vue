<template>
  <b-overlay
    :show="changingSelectedContact"
    :opacity="0.85"
    class="h-100"
    variant="white"
    rounded="sm"
    v-if="authenticated">
    <div class="row">
      <div class="col-12 p-1">

        <div
          :class="`contact-activity-wrapper ${widthClass}`"
          style="height:calc(100vh - 340px);">

          <ContactActivities
            ref="contactActivities"
            :communications="filteredCommunications"
            :campaign-id="selectedCampaignId"
            v-if="contact"
            @mark-all-as-read="markAllAsRead"
            @toggleDrawer="toggleDrawer"
            @toggleDetails="toggleDetails">

            <template v-slot:moreActivities>
              <q-btn
                class="prev-activities mx-2"
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
  mounted () {
    this.flagged = false
    this.prepareActivities()
    this.flagged = true
  },
  created () {
    window.addEventListener('resize', this.resizeHandler)
    this.setIsContactMixinUsed(true)
    this.initListeners()
    this.contactActivityListeners.contactTaskStatusUpdated = (contact) => {
      if (this.contact.id === contact.id) {
        this.setContact(this.contact)
      }
    }
    this.$VueEvent.listen('contact_task_status_updated', this.contactActivityListeners.contactTaskStatusUpdated)
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
    fetchContact () {
      this.selectedContactChanging(true)
      this.$VueEvent.fire('fetch_contact_info', (selectedContact) => {
        this.setContact(selectedContact)
        this.setContactClone(selectedContact)
        this.resetChangedContactProperties([])
        this.selectedContactChanging(false)
      })
    },
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
      if (this.authenticated) {
        this.fetchContact()
      }
    }
  },
  watch: {
    contact (newVal, oldVal) {
      if (newVal === undefined) {
        return
      }

      if (newVal?.id !== oldVal?.id) {
        if (this.flagged) {
          this.flagged = false
          this.prepareActivities()
          this.flagged = true
        }
      }
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
  beforeDestroy () {
    this.setIsContactMixinUsed(false)
    this.removeListeners()
    this.$VueEvent.stop('contact_task_status_updated', this.contactActivityListeners.contactTaskStatusUpdated)
  }
}
</script>
