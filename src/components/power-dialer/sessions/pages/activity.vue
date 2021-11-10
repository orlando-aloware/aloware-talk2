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
    // this.setContact(this.contact)
    console.log('MOunted...')
    // this.setSelectedContact(this.contact)
    if (this.authenticated) {
      this.fetchContact()
    }
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
      _this.setContact(this.contact)
      this.processFetchContactInfo(function (selectedContact) {
        console.log('selectedContact :>> ', selectedContact)
        _this.setContactClone(this.contact)
        _this.resetChangedContactProperties([])
        _this.selectedContactChanging(false)
      })
    },
    toggleDrawer () {
      console.log('Toggle drawer...')
      this.drawer = !this.drawer
    },
    toggleDetails () {
      console.log('Toggle details...')
      this.detailsOpen = !this.detailsOpen
    },
    markAllAsRead () {
      console.log('Marking all as read...')
    }
  },
  watch: {
    contact (val) {
      if (val?.id) {
        // if ()
        console.log('this.contact :>> ', this.contact)
        this.setContact(this.contact)
        console.log('...fetching contacts', val)
        this.flagged = true
        // this.fetchContact()
      }
    },
    sessionLoader (val) {
      console.log('val session loader :>> ', val)
    }
  },
  data () {
    return {
      flagged: false
    }
  }
}
</script>
