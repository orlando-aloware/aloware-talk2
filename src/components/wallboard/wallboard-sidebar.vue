<template>
    <div class="wallboard__sidebar bordered-right">
      <wallboard-sidebar-item name="Overview"
                              route="/wallboard/overview"
                              icon="wallboard-overview-icon"
                              :active="isActive('/wallboard/overview')">
        <template #action>
          <span class="spinner-border spinner-border-sm"
                v-if="isLoading" />
          <span v-else
                @click.prevent="fetchAll">
            <refresh-icon />
            <q-tooltip anchor="center right"
                       self="center left">
              <span class="font-weight-bold text-sm">Refresh</span>
            </q-tooltip>
          </span>
        </template>
      </wallboard-sidebar-item>

      <span class="wallboard__sidebar__title">
        MONITOR
      </span>

      <wallboard-sidebar-item :name="item.name"
                              :route="item.route"
                              :icon="item.icon"
                              :loading="item.loading"
                              :key="item.name"
                              :active="isActive(item.route)"
                              v-for="item in items">
        <template #action>
          <b-badge class="t-badge t-badge__warning text-white p-1">
            {{ item.counter }}
          </b-badge>
        </template>
      </wallboard-sidebar-item>
    </div>
  </template>
<script>
import WallboardSidebarItem from './wallboard-sidebar-item.vue'
import RefreshIcon from 'src/components/icons/refresh-icon.vue'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'wallboard-sidebar',

  components: {
    RefreshIcon,
    WallboardSidebarItem
  },

  computed: {
    ...mapGetters('wallboard', {
      users: 'getUsers',
      queuedCalls: 'getQueuedCalls',
      liveCalls: 'getLiveCalls',
      parkedCalls: 'getParkedCalls'
    }),

    ...mapState('wallboard', [
      'isLiveCallsLoading',
      'isParkedCallsLoading',
      'isQueuedCallsLoading',
      'isSummaryLoading',
      'isUsersLoading'
    ]),

    items () {
      return [
        {
          name: 'Users',
          route: '/wallboard/users',
          icon: 'wallboard-users-icon',
          counter: this.users.length,
          loading: this.isUsersLoading
        }, {
          name: 'Queued Calls',
          route: '/wallboard/queued-calls',
          icon: 'wallboard-queued-call-icon',
          counter: this.queuedCalls.length,
          loading: this.isQueuedCallsLoading
        }, {
          name: 'Live Calls',
          route: '/wallboard/live-calls',
          icon: 'wallboard-live-call-icon',
          counter: this.liveCalls.length,
          loading: this.isLiveCallsLoading
        }, {
          name: 'Parked Calls',
          route: '/wallboard/parked-calls',
          icon: 'wallboard-parked-call-icon',
          counter: this.parkedCalls.length,
          loading: this.isParkedCallsLoading
        }
      ]
    },

    isLoading () {
      return this.isLiveCallsLoading || this.isParkedCallsLoading || this.isQueuedCallsLoading || this.isSummaryLoading || this.isUsersLoading
    }
  },

  methods: {
    ...mapActions('wallboard', [
      'fetchLiveCalls',
      'fetchParkedCalls',
      'fetchQueuedCalls',
      'fetchSummary',
      'fetchUsers'
    ]),

    fetchAll () {
      this.fetchLiveCalls()
      this.fetchParkedCalls()
      this.fetchQueuedCalls()
      this.fetchSummary()
      this.fetchUsers()
    },

    isActive (route) {
      return this.$route.path === route
    }
  }
}
</script>
