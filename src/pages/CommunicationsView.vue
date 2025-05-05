<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="inbox animate__animated animate__fadeIn position-relative">
      <communications-side ref="communications-side"
                           :class="inboxSideClasses" />

      <div class="inbox-details d-flex flex-grow-1"
           :class="{ 'mobile-contact-active' : isMobileContactActive }"
           v-if="isContactShow">
        <Contact />
      </div>
    </div>
  </div>
</template>

<script>
import CommunicationsSide from 'components/communications/communications-side.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import {
  contactMixin,
  contactV2AttributesMixin,
  communicationsMixin,
  aclMixin,
  visibilityMixin,
  userMixin
} from 'src/plugins/mixins'
import communicationsDefaultFilterModelMixin from 'src/plugins/mixins/communications-default-filter-model.mixin'
import Contact from 'pages/contacts/Contact'
import { COMMUNICATIONS_VIEWS_ROUTE_NAME, DEFAULT_COMMUNICATIONS_CHANNEL, DEFAULT_COMMUNICATIONS_ROUTE_NAME } from 'src/router/routes'

export default {
  name: 'communications',

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    communicationsMixin,
    communicationsDefaultFilterModelMixin,
    aclMixin,
    visibilityMixin,
    userMixin
  ],

  components: {
    Contact,
    CommunicationsSide
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'profile'
    ]),

    ...mapState('communications', [
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
        'inbox-side border-top-0 flex-shrink-0 h-100': this.$route.name === 'Communications Channel'
      }
    }
  },

  data () {
    return {
      contactInfoOpen: false,
      title: 'Communications',
      contactId: null,
      miniState: true,
      mobileContactScreenRoutes: [
        'Communications Contact',
        'Communications Contact Task',
        'Communications View Contact Task',
        'Communications Contact Communication'
      ]
    }
  },

  methods: {
    ...mapActions('communications', [
      'setActiveChannel',
      'setTaskCount',
      'setShowViewsList',
      'setIsInboxRefreshBtnLoading',
      'setChannelClonedFilter',
      'setInboxFilters',
      'resetChannelChangedFilterFields',
      'setSearchQuery',
      'setIsLoadingCommunications',
      'reset'
    ]),

    setChannel (routeChanged = false) {
      if (this.inboxChannelRoutes.includes(this.$route.name)) {
        let channel = null

        if (this.inboxViewsRoutes.includes(this.$route.name) && this.isLoadedPinnedViews) {
          channel = this.getPinnedViewChannel(this.$route.params.viewId)
        } else {
          // TODO: make this at route level please! :D
          const routeChannel = this.$route.params?.channel ?? DEFAULT_COMMUNICATIONS_CHANNEL // default fallback
          channel = this.navListItems.find(item => item.value === routeChannel)
        }

        this.setActiveChannel(channel)
        return
      }

      if (this.$route.name === DEFAULT_COMMUNICATIONS_ROUTE_NAME && !this.activeChannel) {
        const channel = this.navListItems.find(item => item.value === DEFAULT_COMMUNICATIONS_CHANNEL)
        this.setActiveChannel(channel)
      }

      if (routeChanged && this.$refs['communications-side']) {
        this.$refs['communications-side'].navigateToInbox()
      }
    },

    onWindowResize () {
      this.setShowViewsList(false)
    },

    loadCommunications () {
      // if filter_id is present in query string, fetch the communications later on after applying the filter
      if (this.$route.query.filter_id) {
        this.setIsLoadingCommunications(true)
        return
      }

      this.$nextTick(() => {
        this.getCommunications(this.communicationFilters)
      })
    }
  },

  created () {
    if (this.isCompanyPartOfAlowareDemoCompanies(this.profile.company_id) || this.isInboxViewsEnabledCompany) {
      this.getPinnedViews()
    }

    if (this.authenticated && this.$route.name !== COMMUNICATIONS_VIEWS_ROUTE_NAME) {
      this.setChannel()
      const filter = { ...this.channelDefaultFilterModel.filter }
      this.setChannelClonedFilter(filter)
      this.resetChannelChangedFilterFields()
      this.setInboxFilters(filter)
    }
  },
  mounted () {
    // when the user tries to access the channel directly but without a personal line
    if (this.$route.params?.channel === 'my-personal-line' && !this.profile.campaign_id) {
      this.$router.push({ name: DEFAULT_COMMUNICATIONS_ROUTE_NAME })
      return
    }

    this.$VueEvent.listen('fetchCommunications', () => {
      if (this.$route.params?.status) {
        this.currentTask = this.$options.filters.getTaskStatusIdByName(this.$route.params.status)
      }

      this.loadContactTasks(false)
      this.fetchTaskCounts()
      this.setIsInboxRefreshBtnLoading(false)
    })

    window.addEventListener('resize', this.onWindowResize)

    this.loadCommunications()
  },

  unmounted () {
    window.removeEventListener('resize', this.onWindowResize)
  },

  destroyed () {
    window.removeEventListener('resize', this.onWindowResize)
    this.reset()
  },

  watch: {

    '$route.params.channel': function (newVal) {
      this.resetCommunications()
      this.setChannel()
      const filter = { ...this.channelDefaultFilterModel.filter }
      this.setChannelClonedFilter(filter)
      this.resetChannelChangedFilterFields()
      this.setInboxFilters(filter)
      this.setSearchQuery('')

      this.$nextTick(() => {
        this.getCommunications(this.communicationFilters)
      })
    },

    isLoadedPinnedViews (value) {
      if (value && this.$route.name === COMMUNICATIONS_VIEWS_ROUTE_NAME) {
        this.setChannel()
      }

      // get counts for inbox
      this.fetchInboxTaskCounts()
    }
  }
}
</script>
