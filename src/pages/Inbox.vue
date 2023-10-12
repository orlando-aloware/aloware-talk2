<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <inbox-side ref="inbox-side"
                  :class="inboxSideClasses"
                  @itemSelected="onItemSelected">
      </inbox-side>
      <div class="inbox-details d-flex flex-grow-1"
           :class="{ 'mobile-contact-active' : isMobileContactActive }"
           v-if="isContactShow">
        <Contact />
      </div>
    </div>
  </div>
</template>

<script>
import InboxSide from 'components/inbox/inbox-side'
import { mapActions, mapGetters, mapState } from 'vuex'
import {
  contactMixin,
  contactV2AttributesMixin,
  inboxMixin,
  aclMixin,
  visibilityMixin,
  userMixin
} from 'src/plugins/mixins'
import Contact from 'pages/contacts/Contact'

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
    InboxSide
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated'
    ]),

    ...mapState('inbox', [
      'navListItems'
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
      mobileContactScreenRoutes: [
        'Inbox Contact',
        'Inbox Contact Task',
        'Inbox View Contact Task',
        'Inbox Contact Communication'
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

    setChannel (routeChanged = false) {
      if (this.inboxChannelRoutes.includes(this.$route.name)) {
        let channel = null

        if (this.inboxViewsRoutes.includes(this.$route.name) && this.isLoadedPinnedViews) {
          channel = this.getPinnedViewChannel(this.$route.params.viewId)
        } else {
          channel = this.navListItems.find(item => item.value === this.$route.params.channel)
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
    if (this.isCompanyPartOfAlowareDemoCompanies(this.profile.company_id) || this.isJobNimbus) {
      this.getPinnedViews()
    }

    if (this.$route.query && this.$route.query.add_contact) {
      this.$VueEvent.fire('add_contact', {
        phone_number: this.$options.filters.fixPhone(this.$route.query.add_contact)
      })
    }
  },

  mounted () {
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

        // get counts for inbox
        this.fetchInboxTaskCounts()
      }
    }
  }
}
</script>
