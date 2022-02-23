<template>
  <b-overlay
    :show="changingSelectedContact || sessionLoader"
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
  </b-overlay>
</template>

<script>

import { mapState, mapGetters, mapActions } from 'vuex'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import contactMixins from 'src/plugins/mixins/contact.mixin'
import ContactActivities from 'src/components/contacts/contact-activities'

export default {
  name: 'SessionPageActivity',
  components: {
    ContactActivities
  },
  mixins: [
    contactsMixins,
    contactMixins
  ],
  mounted () {
    this.flagged = false
    this.prepareActivities()
    this.flagged = true
  },
  created () {
    window.addEventListener('resize', this.resizeHandler)
    this.$VueEvent.listen('contact_task_status_updated', (contact) => {
      if (this.contact.id === contact.id) {
        this.setContact(this.contact)
      }
    })
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
      // !this.isSidebarCollapsed ? 'w-less-630px' : 'w-less-345px'
    }
  },
  methods: {
    // ...mapActions('inbox', [
    //   'setContacts',
    //   'setSelectedContact'
    // ]),
    // ...mapActions('powerDialer', [
    //   // 'resetChangedContactProperties',
    //   'selectedContactChanging',
    //   'setContact'
    //   // 'setContactClone'
    // ]),
    ...mapActions('contacts', [
      'resetChangedContactProperties',
      'selectedContactChanging',
      'setContact',
      'setContactClone'
    ]),
    fetchContact () {
      this.selectedContactChanging(true)
      this.processFetchContactInfo((selectedContact) => {
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
      flagged: false
    }
  }
}
</script>
