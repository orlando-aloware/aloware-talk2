<template>
  <b-overlay :show="changingSelectedContact"
             :opacity="0.85"
             class="h-100"
             variant="white"
             rounded="sm"
             v-if="authenticated">
  <div class="row">
    <div class="col-12 p-1">
      <!-- <q-card flat class="p-3">
        <q-card-section class="p-0">
          <div class="text-subtitle1 text-weight-medium">Juan Dela Cruz</div>
        </q-card-section>
      </q-card> -->
      <div
        :class="`contact-activity-wrapper ${widthClass}`"
        style="height:calc(100vh - 362px);">
        <ContactActivities
          ref="contactActivities"
          :communications="filteredCommunications"
          :campaign-id="selectedCampaignId"
          @mark-all-as-read="markAllAsRead"
          :is-contact-type="false">
          <template v-slot:moreActivities>
            <q-btn outline
                   dense
                   rounded
                   no-caps
                   class="prev-activities mx-2"
                   color="primary"
                   size="md"
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

import { mapGetters, mapActions } from 'vuex'
import contactMixins from 'src/plugins/mixins/contact.mixin'
import ContactActivities from 'src/components/contacts/contact-activities'

export default {
  name: 'SessionPageActivity',
  components: {
    ContactActivities
  },
  mixins: [
    contactMixins
  ],
  mounted () {
    console.log('144 :>> ', 144)
    this.setContact(this.contact)
    this.setSelectedContact(this.contact)
    if (this.authenticated) {
      this.fetchContact()
    }
  },
  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapGetters('powerDialer', [
      'sessionLoader',
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
    ...mapActions('inbox', [
      'setContacts',
      'setSelectedContact'
    ]),
    ...mapActions('powerDialer', [
      // 'resetChangedContactProperties',
      'selectedContactChanging',
      'setContact'
      // 'setContactClone'
    ]),
    fetchContact () {
      console.log('505 :>> ', 505)
      this.selectedContactChanging(true)
      let _this = this
      if (this.contact?.id) {
        this.processFetchContactInfo(function (contact) {
          _this.setContact(contact)
          // _this.setContactClone(contact)
          // _this.resetChangedContactProperties([])
          _this.selectedContactChanging(false)
        })
      }
    },
    markAllAsRead2 () {
      console.log('900 :>> ', 900)
    }
  },
  watch: {
    contact (val) {
      console.log('val.id :>> ', val.id)
      if (val?.id) {
        this.setContact(this.contact)
      }
    }
  },
  data () {
    return {}
  }
}
</script>
