<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <inbox-side ref="inbox-side"
                  :class="inboxSideClasses"
                  @itemSelected="onItemSelected" />

      <div class="inbox-details d-flex flex-grow-1"
           :class="{ 'mobile-contact-active' : isMobileContactActive }"
           v-if="isContactShow">
        <Contact />
      </div>
      <team-inbox-info-modal
        title="📬 The Old Inbox Is Being Retired — Meet Your New Team Inbox"
        body="We're phasing out the legacy inbox to give you a faster, smarter way to manage calls and messages.<br/><br/>The new <strong>Team Inbox</strong> is now live — designed for better ownership, team collaboration, and real-time visibility."
        cta-text="Open Team Inbox"
        cookie-name="team-inbox-announcement"
        :max-shows="maxShows"
        v-if="hasCompanyTeamInboxEnabled"
        :destination-route="{ name: 'Team Inboxes' }"
        :should-show-in-first-visit="true" />
    </div>
  </div>
</template>

<script>
import InboxSide from 'components/inbox/inbox-side'
import { mapActions, mapGetters, mapState } from 'vuex'
import {
  aclMixin,
  contactMixin,
  contactV2AttributesMixin,
  inboxMixin,
  userMixin,
  visibilityMixin
} from 'src/plugins/mixins'
import Contact from 'pages/contacts/Contact'
import TeamInboxInfoModal from 'components/team-inbox-info-modal'
import { TEAMINBOXES_MENU_COMMUNICATIONS_TITLE, TEAMINBOXES_MENU_TITLE } from 'src/router/routes'

export default {
  name: 'inbox',

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    inboxMixin,
    aclMixin,
    visibilityMixin,
    userMixin
  ],

  components: {
    Contact,
    InboxSide,
    TeamInboxInfoModal
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'profile'
    ]),

    ...mapState('inbox', [
      'navListItems'
    ]),

    ...mapState('cache', [
      'currentCompany'
    ]),

    isMobileContactActive () {
      return this.mobileContactScreenRoutes.includes(this.$route.name)
    },

    isContactShow () {
      return this.mobileContactScreenRoutes.includes(this.$route.name)
    },

    inboxSideClasses () {
      return {
        'mobile-contact-active': this.isMobileContactActive,
        'inbox-side border-top-0 flex-shrink-0 h-100': this.$route.name === 'Inbox Channel'
      }
    }
  },

  data () {
    return {
      contactInfoOpen: false,
      title: 'Inbox',
      contactId: null,
      miniState: true,
      maxShows: 3,
      mobileContactScreenRoutes: [
        'Inbox Contact',
        'Inbox Contact Task',
        'Inbox View Contact Task',
        'Inbox Contact Communication',
        TEAMINBOXES_MENU_COMMUNICATIONS_TITLE
      ]
    }
  },

  methods: {
    ...mapActions('inbox', [
      'setActiveChannel',
      'setTaskCount',
      'setShowViewsList',
      'setIsInboxRefreshBtnLoading'
    ]),

    ...mapActions('cache', ['setCurrentCompany']),

    setChannel (routeChanged = false) {
      if (this.inboxChannelRoutes.includes(this.$route.name)) {
        let channel = null

        if (this.inboxViewsRoutes.includes(this.$route.name) && this.isLoadedPinnedViews) {
          channel = this.getPinnedViewChannel(this.$route.params.viewId)
        } else {
          const routeChannel = this.$route.params?.channel ?? 'inbox' // default fallback
          channel = this.navListItems.find(item => item.value === routeChannel)
        }

        this.setActiveChannel(channel)
        return
      }

      if (this.$route.name === 'Inbox' && !this.activeChannel) {
        const channel = this.navListItems.find(item => item.value === 'inbox')
        this.setActiveChannel(channel)
      }

      if (routeChanged && this.$refs['inbox-side']) {
        this.$refs['inbox-side'].navigateToInbox()
      }
    },

    onItemSelected (routeData) {
      this.contactId = routeData.params.id
      this.$router.push(routeData)
    },

    onWindowResize () {
      this.setShowViewsList(false)
    }
  },

  created () {
    if (this.isCompanyPartOfAlowareDemoCompanies(this.profile.company_id) || this.isInboxViewsEnabledCompany) {
      this.getPinnedViews()
    }

    // CtC extension call to web app
    if (this.$route.query.add_contact) {
      const data = {
        phone_number: this.$options.filters.fixPhone(this.$route.query.add_contact)
      }

      if (this.$route.query.first_name) {
        data.first_name = this.$route.query.first_name
      }

      if (this.$route.query.last_name) {
        data.last_name = this.$route.query.last_name
      }

      if (this.$route.query.is_company) {
        data.is_company = this.$route.query.is_company
      }

      this.$VueEvent.fire('add_contact', data)
    }
  },

  async mounted () {
    if (this.$store.state.auth.is_focused_power_dialer) {
      this.$router.replace(
        this.currentCompany?.auto_dialer_enabled ? 'power-dialer' : 'stats'
      )
    }

    if (!this.hasCompanyLegacyInboxEnabled && !this.hasCompanyTeamInboxEnabled) {
      await this.$axios.get('/api/v1/company/' + this.profile.company_id)
        .then((res) => {
          this.setCurrentCompany(res.data)
        })
    }

    if (!this.hasCompanyLegacyInboxEnabled) {
      const { id: contactId, communicationId, channel } = this.$route.params

      if (contactId) {
        const routeChannel = channel === 'mentions' ? 'mentions' : 'communications'

        const contactRoute = !communicationId
          ? `/contacts/${contactId}`
          : `/contacts/${contactId}/${routeChannel}/${communicationId}`

        this.$router.replace(contactRoute)
        return
      }

      // If no option is enabled, redirect to a safe route
      if (!this.hasCompanyTeamInboxEnabled) {
        this.$router.replace({ name: 'Communications' })
        return
      }

      this.$router.replace({ name: TEAMINBOXES_MENU_TITLE })
      return
    }

    // when the user tries to access the channel directly but without a personal line
    if (this.$route.params?.channel === 'my-personal-line' && !this.profile.campaign_id) {
      this.$router.push({ name: 'Inbox' })
      return
    }

    if (this.authenticated && this.$route.name !== 'Inbox View') {
      this.setChannel()
      this.fetchTaskCounts()
    }

    this.$VueEvent.listen('fetchInbox', () => {
      if (this.$route.params?.status) {
        this.currentTask = this.$options.filters.getTaskStatusIdByName(this.$route.params.status)
      }

      this.loadContactTasks(false)
      this.fetchTaskCounts()
      this.setIsInboxRefreshBtnLoading(false)
    })

    window.addEventListener('resize', this.onWindowResize)
  },

  unmounted () {
    window.removeEventListener('resize', this.onWindowResize)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.onWindowResize)
  },

  watch: {
    '$route.name': function (value) {
      const isNotInboxRouteName = !value.includes('Inbox')
      this.setChannel(isNotInboxRouteName)
    },

    isLoadedPinnedViews (value) {
      if (value && this.$route.name === 'Inbox View') {
        this.setChannel()
      }

      // get counts for inbox
      this.fetchInboxTaskCounts()
    },

    hasCompanyLegacyInboxEnabled (enabled) {
      if (!enabled) {
        // Handle live updates when legacy inbox is disabled
        this.$router.replace({ name: TEAMINBOXES_MENU_TITLE })
      }
    }
  }
}
</script>
