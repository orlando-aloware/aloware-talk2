<template>
  <div class="inbox-side border-top-0 flex-shrink-0">
    <div class="inbox-side__left"
         :class="{'inbox-side__left--closed': closed }">
      <calls-header :isSearch="true"
                    @search="search"/>
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
    <div class="inbox-side__right border-left d-flex align-items-start flex-column">
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
</template>

<script>
import { mapActions, mapState } from 'vuex'
import InboxNavList from 'components/inbox/inbox-nav/inbox-nav-list'
import CallsHeader from 'components/inbox/calls/calls-header'
import InboxChannels from 'components/inbox/inbox-channels'
import InboxTab from 'components/inbox/inbox-tab'

export default {
  name: 'inbox-side',

  components: {
    InboxTab,
    InboxChannels,
    CallsHeader,
    InboxNavList
  },

  data () {
    return {
      active: 'inbox',
      closed: window.innerWidth < 992,
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
    ...mapState(['campaigns', 'ringGroups']),
    ...mapState('inbox', ['isGettingTasksList', 'activeChannel', 'communications', 'taskCounts']),

    nextPage () {
      return this.currentPage + 1
    }
  },

  created () {
    this.resetInboxVuex()
  },

  mounted () {
    window.addEventListener('resize', this.toggleOnResize)
  },

  activated () {
    this.active = 'inbox'
  },

  deactivated () {
    this.active = 'inbox'
  },

  methods: {
    toggle () {
      this.closed = !this.closed
    },

    toggleOnResize () {
      this.closed = window.innerWidth < 992
    },

    search (value) {
      this.searchText = value
    },

    newActive (active) {
      this.setActiveChannel(active)
    },

    ...mapActions('inbox', ['gettingTasksList', 'setActiveChannel', 'resetInboxVuex', 'setCommunications'])
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.toggleOnResize)
  }
}
</script>
