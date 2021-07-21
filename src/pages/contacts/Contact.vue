<template>
  <b-overlay
    :show="changingSelectedContact"
    variant="white"
    :opacity="0.85"
    rounded="sm"
  >
    <div class="row mx-0 content-row contact-view-wrapper d-flex" v-if="userAuth.authenticated">
        <contact-list-sidebar></contact-list-sidebar>
        <div :class="`pr-2 mb-3 contact-activity-wrapper ${widthClass}`">
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
        <div class="px-0 mb-3 width-300">
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
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  mixins: [contactsMixins, contactMixins],
  components: {
    ContactDetails,
    ContactActivities,
    ContactListSidebar
  },
  computed: {
    ...mapGetters('contacts', [ 'contact', 'isSidebarCollapsed', 'changingSelectedContact' ]),
    ...mapState({ userAuth: 'auth' }),
    widthClass () {
      return !this.isSidebarCollapsed ? 'w-less-600px' : 'w-less-315px'
    }
  },
  data () {
    return {
      title: 'Contact',
      totalContacts: 0
    }
  },
  methods: {
    ...mapActions('contacts', ['contactsLoaded', 'setContact', 'selectedContactChanging']),
    getContact (id) {
      this.selectedContactChanging(true)
      return this.fetchContactInfo(id).then(response => {
        this.setContact(response.data)
        this.selectedContactChanging(false)
        this.$refs.contactActivities.scrollMessages()
      })
    }
  },
  created () {
    if (this.userAuth.authenticated) {
      this.contactId = this.$route.params.id
      this.processFetchContactInfo()
    }
  },
  watch: {
    '$route.params.id': function (id) {
      if (this.$route.name === 'Contact') {
        this.getContact(id)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
  .contact-view-wrapper {
    border-top: 1px solid #dee2e6;
    overflow: hidden;
    position: relative;
    background: $grey-50;
    padding-left: 1.90rem !important;

    .contact-activity-wrapper.w-less-600px {
      width: calc(100% - 600px)
    }

    .contact-activity-wrapper.w-less-315px {
      width: calc(100% - 315px)
    }

    .prev-activities {
      .q-btn__wrapper {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
    }
  }
</style>
