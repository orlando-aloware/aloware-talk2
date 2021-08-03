<template>
  <b-overlay :show="changingSelectedContact"
             :opacity="0.85"
             class="h-100"
             variant="white"
             rounded="sm">
    <div class="row mx-0 content-row contact-view-wrapper d-flex">
      <contact-list-sidebar></contact-list-sidebar>
      <div :class="`contact-activity-wrapper ${widthClass}`">
        <contact-activities ref="contactActivities"
                            :communications="filteredCommunications"
                            :campaignId="selectedCampaignId">
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
      <contact-save-bar v-if="!changingSelectedContact"></contact-save-bar>
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
import ContactSaveBar from 'components/contacts/contact-save-bar'

export default {
  mixins: [contactsMixins, contactMixins],

  components: {
    ContactSaveBar,
    ContactDetails,
    ContactActivities,
    ContactListSidebar
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'isSidebarCollapsed', 'changingSelectedContact']),
    ...mapGetters('auth', ['authenticated']),

    widthClass () {
      return !this.isSidebarCollapsed ? 'w-less-630px' : 'w-less-345px'
    }
  },

  data () {
    return {
      title: 'Contact',
      totalContacts: 0
    }
  },
  methods: {
    ...mapActions('contacts', ['resetChangedContactProperties'])
  },

  mounted () {
    if (this.authenticated) {
      this.contactId = this.$route.params.id
      this.processFetchContactInfo()
    }
  },

  watch: {
    '$route.params.id': function () {
      if (this.$route.name === 'Contact' && this.contactId !== this.$route.params.id) {
        this.resetSelectedContact()
        this.contactId = this.$route.params.id
        this.resetChangedContactProperties()
        this.processFetchContactInfo()
      } else {
        this.resetSelectedContact()
      }
    }
  }
}
</script>
