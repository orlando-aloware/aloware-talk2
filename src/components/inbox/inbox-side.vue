<template>
  <div class="inbox-side border-top-0">
    <div class="inbox-side__left"
         :class="{'inbox-side__left--closed': closed }">
      <calls-header :isSearch="true"
                    @search="search"/>
      <div>
        <div class="inbox-side__nav">
          <inbox-nav-list :closed="closed"
                          :openCount="openCount"
                          :pendingCount="pendingCount"
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
                    :commRingGroups="communicationRingGroups"/>
      <div v-if="active === 'inbox'"
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
      <div class="h-100 w-100 flex-grow-1 scroll-y">
        <b-overlay :show="isGettingTasksList"
                   rounded="sm">
        <task-list :communications="communications"/>
          <template #overlay>
            <div class="text-center">
              <q-spinner-bars
                color="primary"
                size="2em"
              />
            </div>
          </template>
        </b-overlay>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import InboxNavList from 'components/inbox/inbox-nav/inbox-nav-list'
import CallsHeader from 'components/inbox/calls/calls-header'
import TaskList from 'components/icons/inbox/task-list'

import talk2Api from 'src/plugins/api/api'
export default {
  name: 'inbox-side',
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
      filters: {
        type: 'all',
        answer_status: 'all'
      },
      communications: []
    }
  },
  computed: {
    ...mapState(['campaigns', 'ringGroups']),
    ...mapState('inbox', ['isGettingTasksList']),
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
    }
  },
  methods: {
    ...mapActions('inbox', ['gettingTasksList']),
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
      // @TODO: search value from where?
    },
    getCommunications (params) {
      this.gettingTasksList(true)
      talk2Api.V1.reports.communications
        .get({ params: params })
        .then(response => {
          this.communications = response.data.data
          this.gettingTasksList(false)
        })
    },
    newActive (active) {
      this.active = active
      switch (this.active) {
        case 'calls':
          this.filters = { type: 'call', direction: 'all' }
          break
        case 'messages':
          this.filters = { type: 'sms', direction: 'all' }
          break
        case 'mentions':
          break
        case 'voicemails':
          this.filters = { type: 'call', direction: 'all', 'answer_status': 'voicemail' }
          break
        case 'recordings':
          this.filters = { type: 'call', direction: 'all', 'answer_status': 'recorded' }
          break
        case 'inbox':
        default:
          this.filters = { type: 'all', direction: 'all', 'answer_status': 'all' }
          this.communications = []
          break
      }

      // Disable inbox as of the moment
      if (this.active !== 'inbox') {
        this.getCommunications(this.filters)
      }
    }
  },
  mounted () {
    window.addEventListener('resize', this.toggleOnResize)
    // this.getCommunications(this.filters)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.toggleOnResize)
  },
  components: { TaskList, CallsHeader, InboxNavList }
}
</script>
