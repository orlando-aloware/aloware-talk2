<template>
  <div class="inbox-wrapper border-right no-max-width" data-testid="inbox-side-wrapper">
    <div class="mobile-header align-items-center justify-content-between pr-2 flex-grow-0"
         v-if="isInboxTaskOpened">
      <div class="d-flex h-100 align-items-center justify-content-center min-w-0">
        <back-button data-testid="inbox-side-back-btn" @click="back"/>
        <span class="truncated-text"
              v-if="isInboxTaskOpened">{{ channelName | ucwords }}</span>
        <!-- <communications-toggle-filters :should-show-unreads-toggle="true"
                                       data-testid="inbox-side-my-contacts-filter"/> -->
      </div>
      <profile class="p-0"
               :hide-profile-info="true"/>
    </div>
    <div class="inbox-side border-top-0 flex-grow-0 h-100 overflow-hidden no-max-width">
      <div class="inbox-side__left"
           :class="{'inbox-side__left--closed': isInboxTaskOpened }">
        <div class="h-100">
          <div class="inbox-side__nav h-100">
            <communications-nav-list :closed="closed"
                            :openCount="inboxTaskCounts.open"
                            :pendingCount="inboxTaskCounts.pending"
                            :value.sync="active"
                            v-model="active"
                            data-testid="inbox-side-nav-list"
                            @active="newActive"
                            @toInbox="navigateToInbox">
            </communications-nav-list>
          </div>
        </div>
      </div>
      <div class="inbox-side__right border-left d-flex align-items-start flex-column"
      :class="{'inbox-side__right--opened': isInboxTaskOpened }">
        <CommunicationLogsTable class="flex-grow-1"/>
      <!-- TODO: purge this and all unused components
        Inbox Tab (Inbox/Inbox View) UI
        <inbox-tab :search-text="searchText"
                   v-if="!activeChannel || activeChannel.value === DEFAULT_COMMUNICATIONS_CHANNEL || activeChannel.value.indexOf('view') !== -1"
                   data-testid="inbox-side-inbox-tab"
                   @itemSelected="onItemSelected" />

        Channels (Communications) UI
        <inbox-channels class="h-100 w-100 flex-grow-1 scroll-y"
                        :filter-type="activeChannel?.type"
                        :answer-status="activeChannel?.answerStatus"
                        :channel="activeChannel?.value"
                        :search-text="searchText"
                        :sort="sort"
                        data-testid="inbox-side-inbox-channels"
                        v-if="activeChannel && ![DEFAULT_COMMUNICATIONS_CHANNEL].includes(activeChannel.value) && activeChannel.value.indexOf('view') === -1" />
                        -->
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import CommunicationsNavList from 'components/communications/inbox-nav/communications-nav-list'
// import InboxChannels from 'components/communications/inbox-channels'
// import InboxTab from 'components/communications/inbox-tab.vue'
import BackButton from 'components/back-button'
// import CommunicationsToggleFilters from 'components/communications/communications-toggle-filters.vue'
import Profile from 'components/profile'
import { DEFAULT_COMMUNICATIONS_CHANNEL, DEFAULT_COMMUNICATIONS_ROUTE_NAME } from 'src/router/routes'
import CommunicationLogsTable from './communications-table/communication-logs-table.vue'

export default {
  name: 'communications-side',

  components: {
    BackButton,
    // InboxTab,
    // InboxChannels,
    CommunicationsNavList,
    Profile,
    CommunicationLogsTable
    // CommunicationsToggleFilters
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
      isLoaded: true,
      onLoadShowTasks: true
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

      return !this.$q.screen.lt.md || this.onLoadShowTasks || isInboxChildRoutesMobileScreen
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
    if (this.isInboxTaskOpened && this.$q.screen.lt.md) {
      this.setShowContactsHeader(false)
    }

    if (this.isMobile && !this.$q.screen.lt.md) {
      this.setShowContactsHeader(true)
    }

    if (this.$q.screen.lt.md) {
      this.navigateToInbox()
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

      this.onLoadShowTasks = false

      if (this.$q.screen.lt.md && this.$route.name === DEFAULT_COMMUNICATIONS_ROUTE_NAME) {
        const channel = this.navListItems.find(item => item.value === DEFAULT_COMMUNICATIONS_CHANNEL)
        this.setActiveChannel(channel)
      }
    },

    navigateToInbox () {
      this.onLoadShowTasks = true
    },

    onItemSelected (routeData) {
      this.$emit('itemSelected', routeData)
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
      const redirectingToInbox = (to.name.includes(DEFAULT_COMMUNICATIONS_ROUTE_NAME) && to.name !== DEFAULT_COMMUNICATIONS_ROUTE_NAME) || from.name === 'Communications View'

      if (redirectingToInbox) {
        this.onLoadShowTasks = true
      }

      // TODO: make this as route level please!
      if (to.name === DEFAULT_COMMUNICATIONS_ROUTE_NAME) {
        const channel = this.navListItems.find(item => item.value === DEFAULT_COMMUNICATIONS_CHANNEL)
        this.setActiveChannel(channel)
      }

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
