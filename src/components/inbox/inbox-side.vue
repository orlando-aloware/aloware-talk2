<template>
  <div class="inbox-wrapper border-right">
    <div class="mobile-header align-items-center justify-content-between pr-3"
         v-if="isInboxTaskOpened">
      <div class="d-flex h-100 align-items-center justify-content-center">
        <back-button @click="back"/>
        <span v-if="isInboxTaskOpened">{{ channelName | ucwords }}</span>
      </div>
      <profile class="p-0"></profile>
    </div>
    <div class="inbox-side border-top-0 flex-shrink-0 h-100">
      <div class="inbox-side__left"
           :class="{'inbox-side__left--closed': isInboxTaskOpened }">
        <div>
          <div class="inbox-side__nav">
            <inbox-nav-list :closed="closed"
                            :openCount="taskCounts.open"
                            :pendingCount="taskCounts.pending"
                            :value.sync="active"
                            v-model="active"
                            @active="newActive"
                            @toInbox="navigateToInbox">
            </inbox-nav-list>
          </div>
        </div>
      </div>
      <div class="inbox-side__right border-left d-flex align-items-start flex-column"
           :class="{'inbox-side__right--opened': isInboxTaskOpened }">
        <inbox-tab v-if="!activeChannel || activeChannel.value === 'inbox'"
                   :search-text="searchText"
                   @itemSelected="onItemSelected"/>
        <inbox-channels v-if="activeChannel && !['inbox'].includes(activeChannel.value)"
                        class="h-100 w-100 flex-grow-1 scroll-y"
                        :filter-type="activeChannel.type"
                        :answer-status="activeChannel.answerStatus"
                        :channel="activeChannel.value"
                        :search-text="searchText"
                        :sort="sort">
        </inbox-channels>
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
import Profile from 'components/profile'

export default {
  name: 'inbox-side',

  components: {
    BackButton,
    InboxTab,
    InboxChannels,
    InboxNavList,
    Profile
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
    ...mapState('inbox', ['activeChannel', 'communications', 'taskCounts', 'items']),
    ...mapState(['isMobile']),

    nextPage () {
      return this.currentPage + 1
    },

    isInboxTaskOpened () {
      return !this.$q.screen.lt.md || this.onLoadShowTasks || (this.$route.name !== 'Inbox' && this.$route.name.toLowerCase().includes('inbox') && this.$q.screen.lt.md)
    },

    channelName () {
      const path = this.$route.path.split('/')
      return _.get(path, '[2]', 'Inbox')
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
    ...mapActions('inbox', ['gettingTasksList', 'setActiveChannel', 'setCommunications']),
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
        const channel = this.items.find(item => item.value === 'inbox')
        this.setActiveChannel(channel)
      }
    },

    navigateToInbox () {
      this.onLoadShowTasks = true
    },

    onItemSelected (routeData) {
      this.$emit('itemSelected', routeData)
    }
  },

  watch: {
    $route (to, from) {
      if (to.name.includes('Inbox') && to.name !== 'Inbox') {
        this.onLoadShowTasks = true
      }
    },
    isInboxTaskOpened () {
      if (this.isInboxTaskOpened && this.$q.screen.lt.md) {
        this.setShowContactsHeader(false)
      }
    },
    '$q.screen.lt.md': function () {
      if (this.isInboxTaskOpened && this.$q.screen.lt.md) {
        this.setShowContactsHeader(false)
        return
      }
      this.setShowContactsHeader(true)
    },
    isMobile () {
      if (this.isMobile && !this.$q.screen.lt.md) {
        this.setShowContactsHeader(true)
      }
    },
    '$route.name': function (value) {
      if (value === 'Inbox') {
        const channel = this.items.find(item => item.value === 'inbox')
        this.setActiveChannel(channel)
      }
    }
  }
}
</script>
