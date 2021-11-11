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
                v-if="hasMoreCommunications"
                @click="loadMorePreviousActivities"
                outline
                dense
                rounded
                no-caps
                class="prev-activities mx-2"
                color="primary"
                size="md"
                :isLoadingMore="sessionLoader"
                :loading="isLoadingPreviousActivities"
                :disable="isLoadingPreviousActivities">
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

import { mapGetters, mapActions } from 'vuex'
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
      let _this = this
      this.processFetchContactInfo(function (contact) {
        _this.setContact(_this.contact)
        _this.setContactClone(_this.contact)
        _this.resetChangedContactProperties([])
        _this.selectedContactChanging(false)
      })
    },
    prepareActivities () {
      this.contactId = this.contact.id
      this.setSelectedContact(this.contact)
      if (this.authenticated) {
        this.fetchContact()
      }
    },
    toggleDrawer () {
      this.drawer = !this.drawer
    },
    toggleDetails () {
      this.detailsOpen = !this.detailsOpen
    }
  },
  watch: {
    contact (val) {
      if (val?.id) {
        if (this.flagged) {
          this.prepareActivities()
        }
        // this.setContact(this.contact)
        // this.flagged = true
        // this.fetchContact()
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
