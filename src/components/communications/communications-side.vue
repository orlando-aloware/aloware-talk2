<template>
  <!-- TODO: rename this component to some like communications-wrapper, as is not the side but the whole page
      the classes inbox-wrapper and inbox-side are shared with the inbox menu for now, so be careful when changing them
  -->
  <div class="inbox-wrapper border-right no-max-width"
       data-testid="inbox-side-wrapper">
    <div class="mobile-header align-items-center justify-content-between pr-2 flex-grow-0"
         v-if="isInboxTaskOpened">
      <div class="d-flex h-100 align-items-center justify-content-center min-w-0">
        <back-button data-testid="inbox-side-back-btn"
                     @click="back" />
        <span class="truncated-text"
              v-if="isInboxTaskOpened">{{ channelName | ucwords }}</span>
        <!-- <communications-toggle-filters :should-show-unreads-toggle="true"
                                       data-testid="inbox-side-my-contacts-filter"/> -->
      </div>
      <profile class="p-0"
               :hide-profile-info="true" />
    </div>
    <div class="inbox-side border-top-0 flex-grow-0 h-100 overflow-hidden no-max-width">
      <div class="inbox-side__left"
           :class="{'inbox-side__left--closed': isInboxTaskOpened }">
        <div class="h-100">
          <div class="inbox-side__nav"
               style="height: calc(100vh - 62px); overflow-y: auto;">
            <communications-nav-list data-testid="inbox-side-nav-list"
                                     :closed="closed"
                                     :open-count="inboxTaskCounts.open"
                                     :pending-count="inboxTaskCounts.pending"
                                     :value.sync="active"
                                     v-model="active"
                                     @active="newActive" />
          </div>
        </div>
      </div>
      <div class="inbox-side__right border-left d-flex align-items-start flex-column no-max-width"
           :class="{'inbox-side__right--opened': isInboxTaskOpened }">
        <communication-logs-table class="flex-grow-1"
                                  data-testid="communications-side-communications-table" />
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import CommunicationsNavList from 'components/communications/inbox-nav/communications-nav-list'
import BackButton from 'components/back-button'
import Profile from 'components/profile'
import { DEFAULT_COMMUNICATIONS_CHANNEL, DEFAULT_COMMUNICATIONS_ROUTE_NAME } from 'src/router/routes'
import CommunicationLogsTable from './communications-table/communication-logs-table.vue'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'communications-side',

  mixins: [aclMixin],

  components: {
    BackButton,
    CommunicationsNavList,
    Profile,
    CommunicationLogsTable
  },

  data () {
    return {
      DEFAULT_COMMUNICATIONS_CHANNEL,
      active: DEFAULT_COMMUNICATIONS_CHANNEL,
      closed: false,
      searchText: '',
      sort: '',
      searchFields: ['name', 'phone_number', 'email'],
      currentPage: 0,
      hasMore: false,
      isLoadingMore: false,
      isLoaded: true
    }
  },

  computed: {
    ...mapState('communications', [
      'activeChannel',
      'communications',
      'taskCounts',
      'inboxTaskCounts',
      'navListItems'
    ]),

    ...mapState(['isMobile']),

    nextPage () {
      return this.currentPage + 1
    },

    isInboxTaskOpened () {
      const isInboxChildRoutesMobileScreen = this.$route.name !== DEFAULT_COMMUNICATIONS_ROUTE_NAME &&
        this.$route.name.includes(DEFAULT_COMMUNICATIONS_ROUTE_NAME) &&
        this.$q.screen.lt.md

      return !this.$q.screen.lt.md || isInboxChildRoutesMobileScreen
    },

    channelName () {
      const path = this.$route.path.split('/')
      const name = _.get(path, '[2]', 'Communications').replace('-', ' ')

      if (this.isMobile && this.$q.screen.lt.md && name === DEFAULT_COMMUNICATIONS_CHANNEL) {
        return 'All comms'
      }

      return name
    },

    isShowPageHeader () {
      const inRoutesWithoutHeader = [
        'Communications Channel Task Status',
        'Communications Contact',
        'Communications Contact Task'
      ]

      const isShowPageHeaderMobileScreen = this.isMobile &&
        !inRoutesWithoutHeader.includes(this.$route.name) &&
        (!this.isInboxTaskOpened || !this.$q.screen.lt.md)

      return this.$q.screen.gt.sm || isShowPageHeaderMobileScreen
    }
  },

  created () {
    this.resetVuex(['communications', 'non-cache'])
    this.closed = this.$route.name !== DEFAULT_COMMUNICATIONS_ROUTE_NAME && this.$q.screen.lt.md
  },

  mounted () {
    if (!this.hasPermissionTo('access communications logs')) this.$router.replace({ path: '/' })

    if (this.isInboxTaskOpened && this.$q.screen.lt.md) {
      this.setShowContactsHeader(false)
    }

    if (this.isMobile && !this.$q.screen.lt.md) {
      this.setShowContactsHeader(true)
    }
  },

  activated () {
    this.active = DEFAULT_COMMUNICATIONS_CHANNEL
  },

  deactivated () {
    this.active = DEFAULT_COMMUNICATIONS_CHANNEL
  },

  methods: {
    ...mapActions('contacts', ['setShowContactsHeader']),

    ...mapActions('communications', [
      'gettingTasksList',
      'setActiveChannel',
      'setCommunications'
    ]),

    ...mapActions(['resetVuex']),

    toggle () {
      this.closed = !this.closed
    },

    search (value) {
      this.searchText = value
    },

    newActive (active) {
      this.setActiveChannel(active)
    },

    back () {
      this.setShowContactsHeader(true)

      if (this.$route.name !== DEFAULT_COMMUNICATIONS_ROUTE_NAME) {
        this.$router.push({
          name: DEFAULT_COMMUNICATIONS_ROUTE_NAME
        })
      }

      if (this.$q.screen.lt.md && this.$route.name === DEFAULT_COMMUNICATIONS_ROUTE_NAME) {
        const channel = this.navListItems.find(item => item.value === DEFAULT_COMMUNICATIONS_CHANNEL)
        this.setActiveChannel(channel)
      }
    },

    togglePageHeader () {
      if (this.isShowPageHeader) {
        this.setShowContactsHeader(true)
        return
      }

      this.setShowContactsHeader(false)
    }
  },

  watch: {
    $route (to, from) {
      this.togglePageHeader()
    },

    isInboxTaskOpened () {
      this.togglePageHeader()
    },

    '$q.screen.lt.md': function () {
      this.togglePageHeader()
    },

    isMobile () {
      this.togglePageHeader()
    }
  }
}
</script>
