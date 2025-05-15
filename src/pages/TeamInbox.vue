<template>
  <div v-if="authenticated" class="h-100">
    <teaminbox-tutorial-video />

    <div class="teaminbox animate__animated animate__fadeIn position-relative">
      <TeamInboxSide
        :class="inboxSideClasses"
        @itemSelected="onItemSelected"
        @contact-selected="onContactSelected"
      />

      <div
        v-if="isContactShow"
        :class="['d-flex', 'flex-grow-1', { 'mobile-contact-active' : isMobileContactActive }]"
      >
        <Contact
          :team-inbox-id="activeInboxId"
          :team-inbox-unread-count="contactInboxUnreadCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Contact from 'pages/contacts/Contact'
import TeamInboxSide from 'components/teaminbox/teaminbox-side'
import { aclMixin, userMixin } from 'src/plugins/mixins'
import { mapActions, mapGetters, mapState } from 'vuex'
import { TEAMINBOXES_MENU_COMMUNICATIONS_TITLE } from 'src/router/routes'
import { getTeamInboxCampaigns } from 'src/plugins/helpers/campaigns'
import teaminboxTutorialVideo from 'components/teaminbox/teaminbox-tutorial-video.vue'

export default {
  name: 'TeamInbox',

  mixins: [
    userMixin,
    aclMixin
  ],

  components: {
    teaminboxTutorialVideo,
    Contact,
    TeamInboxSide
  },

  data () {
    return {
      mobileContactScreenRoutes: [
        TEAMINBOXES_MENU_COMMUNICATIONS_TITLE
      ],
      // Store the unread count for the currently selected contact
      currentContactUnreadCount: 0,
      loadingTeamInboxCampaigns: false
    }
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'profile'
    ]),

    ...mapState('TeamInbox', [
      'activeInboxId',
      'activeInbox',
      'inboxesUnreadCount',
      'items'
    ]),

    ...mapState([
      'teamInboxCampaigns'
    ]),

    isMobileContactActive () {
      return this.mobileContactScreenRoutes.includes(this.$route.name)
    },

    isContactShow () {
      return this.mobileContactScreenRoutes.includes(this.$route.name)
    },

    inboxSideClasses () {
      return {
        'mobile-contact-active': this.isMobileContactActive
      }
    },

    contactInboxUnreadCount () {
      // Return the stored unread count that was propagated up from the teaminbox-tab component
      return this.currentContactUnreadCount
    }
  },

  mounted () {
    // block direct access from non demo companies
    if (!this.hasCompanyTeamInboxEnabled) {
      this.$router.push({ name: 'Inbox' })
    }
    // Load team inbox campaigns
    getTeamInboxCampaigns(this)
  },

  methods: {
    ...mapActions([
      'setTeamInboxCampaigns',
      'setCampaignsIsLoading'
    ]),

    ...mapActions('TeamInbox', [
      'reset'
    ]),

    onItemSelected (routeData) {
      this.$router.push(routeData)
    },

    onContactSelected (data) {
      // Store the unread count for the selected contact
      if (data && data.contactId) {
        this.currentContactUnreadCount = data.unreadCount || 0
      }
    },

    markContactCommunicationsAllAsReadProcessed (contact) {
      // Only valid for team inbox, which are waiting for the backend to process the event
      this.$VueEvent.fire('mark_contact_communications_all_as_read', contact)
      this.$VueEvent.fire('contact_updated', contact)
    }
  },

  created () {
    this.$VueEvent.listen('mark_contact_communications_all_as_read_processed', this.markContactCommunicationsAllAsReadProcessed)
  },

  beforeDestroy () {
    this.$VueEvent.stop('mark_contact_communications_all_as_read_processed', this.markContactCommunicationsAllAsReadProcessed)
  },

  destroyed () {
    this.reset()
  }
}
</script>

<style scoped>
.teaminbox {
  height: 100%;
  width: 100%;
  display: flex;
  background-color: #F9F9FB;
}
</style>
