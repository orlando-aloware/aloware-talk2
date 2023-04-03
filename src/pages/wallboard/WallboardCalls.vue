<template>
  <div class="wallboard__body">
    <div :class="['calls', `calls--${viewMode}`]">
      <b-overlay :show="isLoading"
                 rounded="sm">
        <wallboard-calls-header @agent="onFilterAgent"/>
        <wallboard-calls-table :calls="calls"
                               :filters="filters"/>
        <template #overlay>
          <q-spinner-bars color="primary"
                          size="40px"/>
        </template>
      </b-overlay>
    </div>
  </div>
</template>

<script>
import WallboardCallsHeader from 'src/components/wallboard/wallboard-calls-header.vue'
import WallboardCallsTable from 'src/components/wallboard/wallboard-calls-table.vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'WallboardCalls',

  components: {
    WallboardCallsHeader,
    WallboardCallsTable
  },

  computed: {
    ...mapState('wallboard', [
      'isLiveCallsLoading',
      'isParkedCallsLoading',
      'isQueuedCallsLoading'
    ]),

    ...mapGetters('wallboard', {
      liveCalls: 'getLiveCalls',
      parkedCalls: 'getParkedCalls',
      queuedCalls: 'getQueuedCalls',
      viewMode: 'getViewMode',
      wallboardFilters: 'getFilters'
    }),

    isLoading () {
      switch (this.$route.params.id) {
        case 'live':
          return this.isLiveCallsLoading
        case 'parked':
          return this.isParkedCallsLoading
        case 'queued':
          return this.isQueuedCallsLoading
        default:
          return false
      }
    },

    calls () {
      switch (this.$route.params.id) {
        case 'live':
          return this.liveCalls
        case 'parked':
          return this.parkedCalls
        case 'queued':
          return this.queuedCalls
        default:
          return []
      }
    }
  },

  data: () => ({
    filters: {
      agent: null,
      ringGroup: null
    }
  }),

  methods: {
    onFilterAgent (name) {
      this.filters.agent = name || null
    }
  },

  watch: {
    'wallboardFilters.ringGroup' (value) {
      this.filters.ringGroup = value
    }
  }
}
</script>
