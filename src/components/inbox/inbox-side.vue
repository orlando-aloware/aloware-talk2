<template>
  <div class="inbox-side border-top-0 flex-shrink-0">
    <div class="inbox-side__left"
         :class="{'inbox-side__left--closed': closed }">
      <calls-header :isSearch="true"
                    @search="search"/>
      <div>
        <div class="inbox-side__nav">
          <inbox-nav-list :closed="closed"
                          :openCount="openCount"
                          :pendingCount="pendingCount"
                          :value.sync="active"
                          v-model="active"
                          @active="newActive">
          </inbox-nav-list>
        </div>
      </div>
    </div>
    <div class="inbox-side__right border-left d-flex align-items-start flex-column">
      <calls-header class="w-100"
                    :openCount="openCount"
                    :pendingCount="pendingCount"
                    :commCampaigns="communicationLines"
                    :commRingGroups="communicationRingGroups"
                    @sort="sortCommunications">
      </calls-header>
      <div v-if="!activeChannel || activeChannel.value === 'inbox'"
           class="w-100">
        <q-btn-toggle
          class="current-tasks border mx-2 mt-2 mb-1"
          no-caps
          dense
          spread
          unelevated
          toggle-color="grey-9"
          color="white"
          text-color="primary"
          :options="options"
          v-model="currentTask"
          @click="checkTask">
          <template v-slot:one>
            <div class="d-flex flex-row justify-content-between align-items-center w-100 px-1 options"
                 :class="[currentTask !== 'open' ? 'text-grey-20' : 'active']">
              <span class="text-left">
                Open
              </span>
              <span class="text-right">
                {{ openCount }}
              </span>
            </div>
          </template>

          <template v-slot:two>
            <div class="d-flex flex-row justify-content-between align-items-center w-100 px-1 options"
                 :class="[currentTask !== 'pending' ? 'text-grey-20' : 'active']">
              <span class="text-left">
                Pending
              </span>
              <span class="text-right">
                {{ pendingCount }}
              </span>
            </div>
          </template>

          <template v-slot:three>
            <div class="d-flex flex-row justify-content-between align-items-center w-100 px-1 options"
                 :class="[currentTask !== 'closed' ? 'text-grey-20' : 'active']">
              <span class="text-left">
                Closed
              </span>
              <span class="text-right">
                &nbsp;
              </span>
            </div>
          </template>
        </q-btn-toggle>
      </div>
      <inbox-channels v-if="activeChannel && !['inbox', 'mentions'].includes(activeChannel.value)"
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

export default {
  name: 'inbox-side',

  components: {
    InboxChannels,
    CallsHeader,
    InboxNavList
  },

  data () {
    return {
      openCount: 0,
      pendingCount: 0,
      active: 'inbox',
      closed: window.innerWidth < 992,
      currentTask: 'open',
      options: [
        {
          value: 'open',
          slot: 'one'
        },
        {
          value: 'pending',
          slot: 'two'
        },
        {
          value: 'closed',
          slot: 'three'
        }
      ],
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
    ...mapState('inbox', ['isGettingTasksList', 'activeChannel', 'communications']),

    communicationLines () {
      let campaigns = []
      let found = null
      let exists = null
      for (let communication of this.communications) {
        if (communication.campaign_id === null) {
          continue
        }
        found = null
        exists = campaigns.length && campaigns.find(campaign => campaign.id === communication.campaign_id) !== null
        if (!exists) {
          found = this.campaigns.find(campaign => campaign.id === communication.campaign_id)
        }
        if (found) {
          campaigns.push(found)
        }
      }
      return campaigns
    },

    communicationRingGroups () {
      let ringGroups = []
      let found = null
      let exists = null
      for (let communication of this.communications) {
        if (communication.ring_group_id === null) {
          continue
        }
        found = null
        exists = ringGroups.length && ringGroups.find(ringGroup => ringGroup.id === communication.campaign_id) !== null
        if (!exists) {
          found = this.ringGroups.find(ringGroup => ringGroup.id === communication.ring_group_id)
        }
        if (found) {
          ringGroups.push(found)
        }
      }
      return ringGroups
    },

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

    checkTask () {
      // @TODO: work on the task states
    },

    search (value) {
      this.searchText = value
    },

    sortCommunications (value) {
      this.sort = value
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
