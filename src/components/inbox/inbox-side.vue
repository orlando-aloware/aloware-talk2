<template>
  <div data-testid="inbox-side-wrapper"
       :class="['inbox-wrapper', 'border-right', { 'einbox-wrapper': isEInboxEnabled }]">
    <div class="mobile-header align-items-center justify-content-between pr-2 flex-grow-0"
         v-if="isInboxTaskOpened">
      <div class="d-flex h-100 align-items-center justify-content-center min-w-0">
        <back-button data-testid="inbox-side-back-btn"
                     @click="back" />
        <span class="truncated-text"
              v-if="isInboxTaskOpened">{{ channelName | ucwords }}</span>
        <inbox-toggle-filters :should-show-unreads-toggle="true"
                              data-testid="inbox-side-my-contacts-filter" />
      </div>
      <profile class="p-0"
               :hide-profile-info="true" />
    </div>

    <!-- TODO: separate the entire new/old inbox experience into two different wrappers
        this way we can have a better control of the new/old experience on responsive
    -->
    <div class="inbox-side border-top-0 flex-grow-0 h-100 overflow-hidden">
      <div class="inbox-side__left"
           :class="{'inbox-side__left--closed': isInboxTaskOpened }">
        <div class="h-100">
          <div class="inbox-side__nav h-100" :class="{ 'einbox-side__nav': isEInboxEnabled }">
            <einbox-nav-list data-testid="inbox-side-new-nav-list"
                                v-if="isEInboxEnabled" />

            <inbox-nav-list data-testid="inbox-side-nav-list"
                            :closed="closed"
                            :open-count="inboxTaskCounts.open"
                            :pending-count="inboxTaskCounts.pending"
                            v-else
                            v-model="active"
                            @active="newActive"
                            @toInbox="navigateToInbox" />
          </div>
        </div>
      </div>
      <div class="inbox-side__right border-left d-flex align-items-start flex-column"
           :class="{'inbox-side__right--opened': isInboxTaskOpened }">
        <!--  -->
        <einbox-tab v-if="isEInboxEnabled" />

        <template v-else>
          <!-- This is the only previous item shown in the inbox tab with the old experience -->

          <!-- this is Inbox Tab (Inbox/Inbox View) UI -->
          <inbox-tab :search-text="searchText"
                     data-testid="inbox-side-inbox-tab"
                     v-if="!activeChannel || activeChannel.value === 'inbox' || activeChannel.value.indexOf('view') !== -1"
                     @itemSelected="onItemSelected" />

          <!-- These were moved to communications logs so should be deprecated -->
          <!-- this is Channels (Communications) UI -->
          <inbox-channels class="h-100 w-100 flex-grow-1 scroll-y"
                          :filter-type="activeChannel?.type"
                          :answer-status="activeChannel?.answerStatus"
                          :channel="activeChannel?.value"
                          :search-text="searchText"
                          :sort="sort"
                          data-testid="inbox-side-inbox-channels"
                          v-if="activeChannel && !['inbox'].includes(activeChannel.value) && activeChannel.value.indexOf('view') === -1" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState, mapGetters } from 'vuex'
/* Einbox Components */
import EinboxNavList from '../einbox/einbox-nav-list.vue'
import einboxTab from '../einbox/einbox-tab.vue'

/* OLD INBOX Components */
import InboxNavList from 'components/inbox/inbox-nav/inbox-nav-list'
import InboxChannels from 'components/inbox/inbox-channels'
import InboxTab from 'components/inbox/inbox-tab'
import BackButton from 'components/back-button'
import InboxToggleFilters from 'components/inbox/inbox-toggle-filters'
import Profile from 'components/profile'

export default {
  name: 'inbox-side',

  components: {
    einboxTab,
    BackButton,
    InboxTab,
    InboxChannels,
    InboxNavList,
    EinboxNavList,
    Profile,
    InboxToggleFilters
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

    ...mapGetters('Einbox', [
      'isEInboxEnabled'
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

    ...mapActions('eInbox', [
      'setActiveInbox'
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
        /* TODO: complete the logic of the new inbox here */
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

<style lang="scss" scoped>
.einbox-wrapper {
  padding: 7px;
  background-color: #F9F9FB;

  .inbox-side {
    background-color: #F9F9FB;

    &__left, &__right {
      border-radius: 12px;
    }

    &__right {
      margin-left: 7px;
      border-left: none !important;
    }
  }
}
</style>
