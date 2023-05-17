<template>
  <div class="broadcasts__home position-relative">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>
    <div class="row align-items-center justify-content-between px-3 my-2 w-100">
      <div class="col-3">
        <search placeholder="Search name, id"/>
      </div>
      <div class="col-6">
        <q-btn-toggle class="custom-toggle-button mx-2 mt-2 mb-1"
                      no-caps
                      spread
                      unelevated
                      dense
                      v-model="broadcastFilter"
                      :options="broadcastFilterOptions">
          <template v-slot:one class="test">
            <div class="d-flex justify-content-center w-100 px-1 options"
                :class="[broadcastFilter === 1 ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  New
                </span>
                <div class="text-center broadcast-count ml-1"
                      v-if="broadcastCounts[0] > 0">
                  <span>
                    {{ broadcastCounts[0] | numberPlusFormatter(99) }}
                  </span>
                </div>
            </div>
          </template>
          <template v-slot:two>
            <div class="d-flex justify-content-center w-100 px-1 options"
                :class="[broadcastFilter === 2 ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  Enrolling
                </span>
                <div class="text-center broadcast-count ml-1"
                      v-if="broadcastCounts[1] > 0">
                  <span>
                    {{ broadcastCounts[1] | numberPlusFormatter(99) }}
                  </span>
                </div>
            </div>
          </template>
          <template v-slot:three>
            <div class="d-flex justify-content-center w-100 px-1 options"
                :class="[broadcastFilter === 3 ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  Sent
                </span>
                <div class="text-center broadcast-count ml-1"
                     v-if="broadcastCounts[2] > 0">
                  <span>
                    {{ broadcastCounts[2] | numberPlusFormatter(99) }}
                  </span>
                </div>
            </div>
          </template>
          <template v-slot:four>
            <div class="d-flex justify-content-center w-100 px-1 options"
                :class="[broadcastFilter === 4 ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  Paused
                </span>
                <div class="text-center broadcast-count ml-1"
                     v-if="broadcastCounts[3] > 0">
                  <span>
                    {{ broadcastCounts[3] | numberPlusFormatter(99) }}
                  </span>
                </div>
            </div>
          </template>
          <template v-slot:five>
            <div class="d-flex justify-content-center w-100 px-1 options"
                :class="[broadcastFilter === 5 ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  All
                </span>
                <div class="text-center broadcast-count ml-1"
                      v-if="broadcastCounts[4] > 0">
                  <span>
                    {{ broadcastCounts[4] | numberPlusFormatter(99) }}
                  </span>
                </div>
            </div>
          </template>
        </q-btn-toggle>
      </div>
      <div class="col-2 d-flex justify-content-end">
        <q-btn class="px-4 border-half-rounded stats-page-btn"
              :to="{ path: '/broadcasts/new' }"
              color="primary"
              padding="0rem"
              unelevated
              no-caps
              dense>
            <plus-icon class="mr-1"
                      color="white"/>
          New Bulk Message
        </q-btn>
      </div>
    </div>
    <q-separator/>
    <div>
      Chart goes here
    </div>
    <q-separator/>
    <div class="px-2 broadcasts__home__table">
      <datatable ref="broadcastsTable"
                 :stickyHeaders="true"
                 :columns="broadcastsColumns"
                 :isEmpty="isBroadcastsTableEmpty"
                 :paginated="false"
                 :total-rows="visibleBroadcasts?.length ?? 0"
                 @checked="onCheckerClicked()">
        <template slot="tbody">
          <tr v-for="(row, rowIndex) in visibleBroadcasts"
              v-bind:key="rowIndex">
            <template v-for="(col, colIndex) in broadcastsColumns">
              <td :key="`c-${colIndex}`"
                  v-if="col.name == 'checkbox'"
                  class="text-left pull-left datatable-row__checkbox">
                  <label class="custom-checkbox-container">
                  <input
                    type="checkbox"
                    class="checker"
                    :value="row.id"
                    :checked="checked.find(item => item.id === row.id) || isAllChecked"
                    @change="onCheckerClicked(row)" />
                  <span class="checkmark"></span>
                </label>
              </td>
              <td :key="`c-${colIndex}`"
                  v-else-if="col.name == 'status'">
                <broadcast-status-pill :status="row[col.field]" />
              </td>
              <td :key="`c-${colIndex}`"
                  v-else-if="col.name == 'throttle_limit'">
                  {{ getThrottling(row[col.field]) }}
              </td>
              <td :key="`c-${colIndex}`"
                  v-else-if="col.name == 'campaign_id'">
                {{ row[col.field] }}
              </td>
              <td :key="`c-${colIndex}`"
                  v-else>
                {{ row[col.field] }}
              </td>
            </template>
          </tr>
        </template>
      </datatable>
    </div>
  </div>
</template>

<script>
import Search from 'src/components/search.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import talk2Api from 'src/plugins/api/api'
import Datatable from 'src/components/datatable.vue'
import BroadcastStatusPill from 'src/components/broadcasts/broadcast-status-pill.vue'
import * as BroadcastStatuses from 'src/constants/broadcast-statuses.js'

const broadcastsColumns = [
  {
    name: 'checkbox',
    label: '',
    field: ''
  },
  {
    name: 'id',
    label: 'Id',
    field: 'id'
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status'
  },
  {
    name: 'pending_tasks',
    label: 'Pending Tasks',
    field: 'pending_tasks'
  },
  {
    name: 'total_failed',
    label: 'Failed Tasks',
    field: 'total_failed'
  },
  {
    name: 'total_enrolled',
    label: 'Total Tasks',
    field: 'total_enrolled'
  },
  {
    name: 'engagement_rate',
    label: 'Engagement',
    field: 'engagement_rate'
  },
  {
    name: 'total_unsubscribed',
    label: 'Unsubscribed',
    field: 'total_unsubscribed'
  },
  {
    name: 'target_group',
    label: 'Target Group',
    field: 'target_group'
  },
  {
    name: 'campaign_id',
    label: 'Line Used',
    field: 'campaign_id'
  },
  {
    name: 'throttle_limit',
    label: 'Throttling',
    field: 'throttle_limit'
  }
]

export default {
  name: 'broadcasts',

  components: {
    Search,
    PlusIcon,
    Datatable,
    BroadcastStatusPill
  },

  data: () => ({
    loading: false,
    broadcastFilter: 5,
    broadcastFilterOptions: [
      {
        value: 1,
        slot: 'one',
        filter: BroadcastStatuses.STATUS_NEW
      },
      {
        value: 2,
        slot: 'two',
        filter: BroadcastStatuses.STATUS_ENROLLING
      },
      {
        value: 3,
        slot: 'three',
        filter: BroadcastStatuses.STATUS_DONE
      },
      {
        value: 4,
        slot: 'four',
        filter: BroadcastStatuses.STATUS_PAUSED
      },
      {
        value: 5,
        slot: 'five',
        filter: null
      }
    ],
    broadcastData: [],
    broadcastsColumns,
    checked: [],
    isAllChecked: false,
    BroadcastStatuses
  }),

  mounted () {
    this.getBroadcasts()
  },

  computed: {
    isBroadcastsTableEmpty () {
      return this.broadcastCounts[this.broadcastFilter - 1] === 0
    },

    visibleBroadcasts () {
      let filter = this.broadcastFilterOptions[this.broadcastFilter - 1]?.filter

      if (!filter) {
        return this.broadcastData
      }

      return this.broadcastData.filter(broadcast => broadcast.status === filter)
    },

    broadcastCounts () {
      return [
        this.getCount(BroadcastStatuses.STATUS_NEW),
        this.getCount(BroadcastStatuses.STATUS_ENROLLING),
        this.getCount(BroadcastStatuses.STATUS_DONE),
        this.getCount(BroadcastStatuses.STATUS_PAUSED),
        this.broadcastData.length
      ]
    },

    statusToggleColor () {
      return 'active'
    }
  },

  methods: {
    onCheckerClicked (row) {
      if (!row) {
        this.isAllChecked = !this.isAllChecked
        return
      }

      let foundItem = this.checked.find(item => item.id === row.id)

      if (foundItem) {
        this.checked = this.checked.filter(item => item.id !== row.id)
        return
      }

      this.checked.push(row)
    },

    getBroadcasts () {
      talk2Api.V1.broadcasts.get().then(res => {
        this.broadcastData = res.data
      })
    },

    getCount (filter) {
      return this.broadcastData.filter(broadcast => broadcast.status === filter).length
    },

    getThrottling (messagePerMinute) {
      return (messagePerMinute * 60) + ' per hour'
    }
  },

  watch: {
    broadcasts (broadcasts) {
      this.getBroadcasts()
    }
  }
}
</script>
