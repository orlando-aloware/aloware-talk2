<template>
  <div class="inbox-wrapper border-right" data-testid="inbox-side-wrapper">
    <div class="mobile-header align-items-center justify-content-between pr-2 flex-grow-0"
         v-if="isInboxTaskOpened">
      <div class="d-flex h-100 align-items-center justify-content-center min-w-0">
        <back-button data-testid="inbox-side-back-btn" @click="back"/>
        <span class="truncated-text"
              v-if="isInboxTaskOpened">{{ channelName | ucwords }}</span>
        <inbox-my-contacts-filter data-testid="inbox-side-my-contacts-filter"/>
      </div>
      <profile class="p-0"
               :hide-profile-info="true"/>
    </div>
    <div class="inbox-side border-top-0 flex-grow-0 h-100 overflow-hidden">
      <div class="inbox-side__left"
           :class="{'inbox-side__left--closed': isInboxTaskOpened }">
        <div class="h-100">
          <div class="inbox-side__nav h-100">
            <inbox-nav-list :closed="closed"
                            :openCount="inboxTaskCounts.open"
                            :pendingCount="inboxTaskCounts.pending"
                            :value.sync="active"
                            v-model="active"
                            data-testid="inbox-side-nav-list"
                            @active="newActive"
                            @toInbox="navigateToInbox">
            </inbox-nav-list>
          </div>
        </div>
      </div>
      <div class="inbox-side__right border-left d-flex align-items-start flex-column"
           :class="{'inbox-side__right--opened': isInboxTaskOpened }">
        <!-- Inbox Tab (Inbox/Inbox View) UI -->
        <inbox-tab :search-text="searchText"
                   v-if="!activeChannel || activeChannel.value === 'inbox' || activeChannel.value.indexOf('view') !== -1"
                   data-testid="inbox-side-inbox-tab"
                   @itemSelected="onItemSelected" />

        <!-- Channels (Communications) UI -->
        <inbox-channels class="h-100 w-100 flex-grow-1 scroll-y"
                        :filter-type="activeChannel?.type"
                        :answer-status="activeChannel?.answerStatus"
                        :channel="activeChannel?.value"
                        :search-text="searchText"
                        :sort="sort"
                        data-testid="inbox-side-inbox-channels"
                        v-if="activeChannel && !['inbox'].includes(activeChannel.value) && activeChannel.value.indexOf('view') === -1" />
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import InboxNavList from 'components/inbox/inbox-nav/inbox-nav-list'
import InboxChannels from 'components/inbox/inbox-channels'
import InboxTab from 'components/inbox/inbox-tab'
import BackButton from 'components/back-button'
import InboxMyContactsFilter from 'components/inbox/inbox-my-contacts-filter'
import Profile from 'components/profile'

export default {
  name: 'inbox-side',

  components: {
    BackButton,
    InboxTab,
    InboxChannels,
    InboxNavList,
    Profile,
    InboxMyContactsFilter
  },

  data () {
    return {
      active: 'inbox',
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
    ...mapState('inbox', [
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
      const isInboxChildRoutesMobileScreen = this.$route.name !== 'Inbox' &&
        this.$route.name.toLowerCase().includes('inbox') &&
        this.$q.screen.lt.md

      return !this.$q.screen.lt.md || this.onLoadShowTasks || isInboxChildRoutesMobileScreen
    },

    channelName () {
      const path = this.$route.path.split('/')
      const name = _.get(path, '[2]', 'Inbox').replace('-', ' ')

      if (this.isMobile && this.$q.screen.lt.md && name === 'all communications') {
        return 'All comms'
      }

      return name
    },

    isShowPageHeader () {
      const inRoutesWithoutHeader = [
        'Inbox Channel Task Status',
        'Inbox Contact',
        'Inbox Contact Task'
      ]

      const isShowPageHeaderMobileScreen = this.isMobile &&
        !inRoutesWithoutHeader.includes(this.$route.name) &&
        (!this.isInboxTaskOpened || !this.$q.screen.lt.md)

      return this.$q.screen.gt.sm || isShowPageHeaderMobileScreen
    }
  },

  created () {
    this.resetVuex(['inbox', 'non-cache'])
    this.closed = this.$route.name !== 'Inbox' && this.$route.name.toLowerCase().includes('Inbox') && this.$q.screen.lt.md
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
    this.active = 'inbox'
  },

  deactivated () {
    this.active = 'inbox'
  },

  methods: {
    ...mapActions('contacts', ['setShowContactsHeader']),

    ...mapActions('inbox', [
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

      if (this.$route.name !== 'Inbox') {
        this.$router.push({
          name: 'Inbox'
        })
      }

      this.onLoadShowTasks = false

      if (this.$q.screen.lt.md && this.$route.name === 'Inbox') {
        const channel = this.navListItems.find(item => item.value === 'inbox')
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
      const redirectingToInbox = (to.name.includes('Inbox') && to.name !== 'Inbox') || from.name === 'Inbox View'

      if (redirectingToInbox) {
        this.onLoadShowTasks = true
      }

      if (to.name === 'Inbox') {
        const channel = this.navListItems.find(item => item.value === 'inbox')
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
