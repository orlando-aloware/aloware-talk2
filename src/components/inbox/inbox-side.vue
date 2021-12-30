<template>
  <div class="inbox-wrapper">
    <div class="mobile-header align-items-center justify-content-start"
         v-if="isInboxTaskOpened">
      <back-button @click="back"/>
      <span v-if="isInboxTaskOpened">{{ channelName | ucwords }}</span>
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
                            @active="newActive">
            </inbox-nav-list>
          </div>
        </div>
      </div>
      <div class="inbox-side__right border-left d-flex align-items-start flex-column"
           :class="{'inbox-side__right--opened': isInboxTaskOpened }">
        <inbox-tab v-if="!activeChannel || activeChannel.value === 'inbox'"
                   :search-text="searchText"></inbox-tab>
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

export default {
  name: 'inbox-side',

  components: {
    BackButton,
    InboxTab,
    InboxChannels,
    InboxNavList
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
    ...mapState('inbox', ['activeChannel', 'communications', 'taskCounts']),

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
    this.resetInboxVuex()
    this.closed = this.$route.name !== 'Inbox' && this.$route.name.toLowerCase().includes('Inbox') && this.$q.screen.lt.md
  },

  mounted () {
    if (this.isInboxTaskOpened && this.$q.screen.lt.md) {
      this.setShowContactsHeader(false)
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
      if (this.$route.name === 'Inbox' && this.isInboxTaskOpened) {
        this.onLoadShowTasks = false
      }

      this.$router.push('/')
      this.setShowContactsHeader(true)
    },

    ...mapActions('inbox', ['gettingTasksList', 'setActiveChannel', 'resetInboxVuex', 'setCommunications'])
  },

  watch: {
    $route (to, from) {
      if (to.name.includes('Inbox')) {
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
    }
  }
}
</script>
