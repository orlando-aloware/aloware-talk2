<template>
  <div v-if="authenticated" class="h-100">
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
          :from-team-inbox="true"
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
import { mapFields } from 'vuex-map-fields'
import { debounce } from 'lodash'

export default {
  name: 'TeamInbox',

  mixins: [
    userMixin,
    aclMixin
  ],

  components: {
    Contact,
    TeamInboxSide
  },

  data () {
    return {
      mobileContactScreenRoutes: [
        TEAMINBOXES_MENU_COMMUNICATIONS_TITLE
      ],
      // Store the unread count for the currently selected contact
      currentContactUnreadCount: 0
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

    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapFields('settings', [
      'isTeamInboxNavListCollapsed',
      'isContactDetailsCollapsed',
      'isSidebarCollapsed'
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
      if (this.$store.state.auth.is_focused_power_dialer) {
        this.$router.replace(
          this.currentCompany?.auto_dialer_enabled ? 'power-dialer' : 'stats'
        )
      } else {
        const { id: contactId, communicationId } = this.$route.params

        if (contactId) {
          const contactRoute = !communicationId
            ? `/contacts/${contactId}`
            : `/contacts/${contactId}/communications/${communicationId}`

          this.$router.replace(contactRoute)
          return
        }

        this.$router.replace({ name: 'Inbox' })
      }
    }
    this.resizeHandler()
  },

  methods: {
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
    },

    resizeHandler: debounce(function () {
      const width = this.$q.screen.width

      if (width >= 1366) {
        this.isTeamInboxNavListCollapsed = false
        return
      }

      if (width >= 785) {
        this.isTeamInboxNavListCollapsed = true
        this.isSidebarCollapsed = true
        return
      }

      this.isTeamInboxNavListCollapsed = false
    }, 100)
  },

  watch: {
    hasCompanyTeamInboxEnabled (enabled) {
      // Handle live updates when team inbox is disabled
      if (!enabled) {
        this.$router.replace({ name: 'Inbox' })
      }
    },

    '$q.screen.width' () {
      this.resizeHandler()
    },

    // When expanding TeamInbox nav list, close ContactDetails if needed
    isTeamInboxNavListCollapsed (collapsed) {
      if (collapsed) {
        return
      }

      const width = this.$q.screen.width
      if (width < 785 || width > 1500) {
        return
      }

      if (!this.isContactDetailsCollapsed && !this.isSidebarCollapsed) {
        this.isSidebarCollapsed = true
      }
    },

    // When expanding ContactDetails, collapse sidebar if needed
    isContactDetailsCollapsed (collapsed) {
      if (collapsed) {
        return
      }

      const width = this.$q.screen.width
      if (width < 785 || width > 1500) {
        return
      }

      if (!this.isTeamInboxNavListCollapsed && !this.isSidebarCollapsed) {
        this.isSidebarCollapsed = true
      }
    },

    // When expanding sidebar, collapse ContactDetails if needed
    isSidebarCollapsed (collapsed) {
      if (collapsed) {
        return
      }

      const width = this.$q.screen.width
      if (width < 785 || width > 1500) {
        return
      }

      if (!this.isTeamInboxNavListCollapsed && !this.isContactDetailsCollapsed) {
        this.isTeamInboxNavListCollapsed = true
      }
    }
  },

  created () {
    this.$VueEvent.listen('mark_contact_communications_all_as_read_processed', this.markContactCommunicationsAllAsReadProcessed)
  },

  beforeDestroy () {
    this.$VueEvent.stop('mark_contact_communications_all_as_read_processed', this.markContactCommunicationsAllAsReadProcessed)
  },

  beforeRouteLeave (to, from, next) {
    // Clean up activeInboxId when leaving Team Inbox to non-Team Inbox routes
    // Use the isInbox meta property to properly identify Team Inbox routes
    if (!to.meta?.isInbox) {
      this.reset()
    }
    next()
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
