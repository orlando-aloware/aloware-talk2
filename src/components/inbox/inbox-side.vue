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
    <div class="inbox-side__right border-left">
      <calls-header class="w-100"
                    :openCount="openCount"
                    :pendingCount="pendingCount"
                    :commCampaigns="communicationLines"
                    :commRingGroups="communicationRingGroups"/>
      <div class="w-100 d-flex"
        v-if="active === 'inbox'">
        <q-btn-toggle
          class="current-tasks border w-100 mx-2 mt-2 mb-1"
          no-caps
          dense
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
      <div class="w-100">
        <task-list :communications="communications"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import InboxNavList from 'components/inbox/inbox-nav/inbox-nav-list'
import CallsHeader from 'components/inbox/calls/calls-header'
import TaskList from 'components/icons/inbox/task-list'

export default {
  name: 'inbox-side',
  data () {
    return {
      openCount: 7,
      pendingCount: 2,
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
      communications: [
        {
          id: 1,
          type: 1,
          direction: 1,
          campaign_id: 373,
          ring_group_id: null,
          current_status2: 3,
          disposition_status2: 1,
          body: null,
          contact: {
            name: 'John Smith'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 2,
          type: 1,
          direction: 1,
          campaign_id: 11,
          ring_group_id: 32,
          current_status2: 3,
          disposition_status2: 1,
          body: null,
          contact: {
            name: 'Mark Avery'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 3,
          type: 1,
          direction: 1,
          campaign_id: 443,
          ring_group_id: null,
          current_status2: 9,
          disposition_status2: 3,
          body: null,
          contact: {
            name: 'Ashley Meyers'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 4,
          type: 2,
          direction: 1,
          campaign_id: 11,
          ring_group_id: null,
          current_status2: 9,
          disposition_status2: 4,
          body: 'Hi, where can I find an article in the knowledge base about Sequences+?',
          contact: {
            name: 'Cam Johnson'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 5,
          type: 2,
          direction: 1,
          campaign_id: 11,
          ring_group_id: null,
          current_status2: 9,
          disposition_status2: 4,
          body: 'Hi, do you know where the settings for the ring group is?',
          contact: {
            name: 'Walter Bowman'
          },
          created_at: '2021-07-21 11:06:01'
        },
        {
          id: 6,
          type: 2,
          direction: 1,
          campaign_id: 506,
          ring_group_id: null,
          current_status2: 9,
          disposition_status2: 4,
          body: 'Hi, where can I find a tutorial for sending bulk messages?',
          contact: {
            name: 'Sarah Johnson'
          },
          created_at: '2021-07-20 08:21:33'
        },
        {
          id: 7,
          type: 2,
          direction: 1,
          campaign_id: 373,
          ring_group_id: null,
          current_status2: 9,
          disposition_status2: 4,
          body: 'Hi, do you know where to create a new Line?',
          contact: {
            name: 'Tyler Smith'
          },
          created_at: '2021-07-20 07:21:33'
        }
      ]
    }
  },
  computed: {
    ...mapState(['campaigns', 'ringGroups']),
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
    newActive (active) {
      this.active = active
    }
  },
  mounted () {
    window.addEventListener('resize', this.toggleOnResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.toggleOnResize)
  },
  components: { TaskList, CallsHeader, InboxNavList }
}
</script>
