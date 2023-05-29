<template>
  <div class="broadcasts__home position-relative d-flex flex-column h-100">
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
        <search placeholder="Search name, id"
                :search="broadcastsSearchText"
                @search="val => broadcastsSearchText = val"/>
      </div>
      <div class="col-6">
        <q-btn-toggle class="custom-toggle-button mx-2 mt-2 mb-1"
                      no-caps
                      spread
                      unelevated
                      dense
                      v-model="broadcastFilter"
                      :options="broadcastFilterOptions">
          <template v-slot:one>
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
    <div class="broadcasts__home__graph">
      <communication-activity-graph base="broadcast" />
    </div>
    <q-separator/>
    <div class="broadcasts__home__table flex-grow-1">
      <datatable class="h-100"
                 ref="broadcastsTable"
                 :stickyHeaders="true"
                 :columns="broadcastsColumns"
                 :isEmpty="isBroadcastsTableEmpty"
                 :showSelectAll="false"
                 :paginated="false"
                 :total-rows="visibleBroadcasts?.length ?? 0"
                 @checked="onCheckerClicked()">
        <template slot="tbody">
          <tr v-for="(row, rowIndex) in visibleBroadcasts"
              v-bind:key="rowIndex">
            <template v-for="(col, colIndex) in broadcastsColumns">
              <td :key="`c-${colIndex}`"
                  v-if="col.name == 'checkbox'"
                  class="datatable-row__checkbox">
                <label class="custom-checkbox-container">
                  <input type="checkbox"
                         class="checker"
                         :value="row.id"
                         :checked="checked.find(item => item.id === row.id) || isAllChecked"
                         @change="onCheckerClicked(row)"/>
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
                <span v-if="getCampaign(row[col.field])">
                  {{ getCampaign(row[col.field]).name }}
                </span>
                <span class="text-warning"
                      v-else>
                  -
                </span>
              </td>
              <td :key="`c-${colIndex}`"
                  v-else-if="col.name == 'target_group'">
                <template v-if="row['tag']">
                  <i class="fa fa-circle"
                        :style="{ color: row['tag']?.color }">
                  </i>
                  <span class="tag_name">
                    {{ row['tag']?.name }}
                  </span>
                </template>
                <template v-else-if="row['list']">
                  List
                </template>
              </td>
              <td :key="`c-${colIndex}`"
                  v-else-if="col.field == 'actions'">
                <div class="context-menu">
                  <b-dropdown class="position-absolute"
                              :style="{ 'margin-top': '-0.9rem', right: '0.5rem' }"
                              :id="getContextMenuTargetElementId(row)"
                              size="sm"
                              right
                              @click="onContextMenuClicked(row)">
                    <template #button-content>
                      <ellipse-icon/>
                    </template>
                    <b-dropdown-item v-for="(item, id) in contextMenuListItems"
                            :key="id"
                            :disabled="!shouldAllowContextMenuButton(item)"
                            dense
                            clickable
                            @click="onContextMenuButtonClicked(item)">
                      <div class="d-flex align-items-center">
                        <img class="mr-2"
                            :src="`app-icons/menu/${item.icon}`" />
                        <span>{{ item.label }}</span>
                      </div>
                    </b-dropdown-item>
                  </b-dropdown>
                </div>
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
import EllipseIcon from 'components/icons/ellipse-icon.vue'
import BroadcastStatusPill from 'src/components/broadcasts/broadcast-status-pill.vue'
import CommunicationActivityGraph from 'src/components/communication-activity-graph.vue'
import * as BroadcastStatuses from 'src/constants/broadcast-statuses.js'
import { mapState } from 'vuex'

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
  },
  {
    name: '',
    label: '',
    field: 'actions',
    maxWidth: 50
  }
]

const contextMenuListItems = [
  {
    name: 'activity',
    label: 'Activity',
    icon: 'context-menu-activity.svg'
  },
  {
    name: 'rename',
    label: 'Rename',
    icon: 'context-menu-rename.svg'
  },
  {
    name: 'delete',
    label: 'Delete',
    icon: 'context-menu-delete.svg'
  }
]

export default {
  name: 'broadcasts',

  components: {
    Search,
    PlusIcon,
    Datatable,
    BroadcastStatusPill,
    CommunicationActivityGraph,
    EllipseIcon
  },

  data: () => ({
    loading: false,
    broadcastsSearchText: '',
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
    BroadcastStatuses,
    contextMenuListItems,
    contextMenuTargetId: null,
    contextMenuOpen: false
  }),

  mounted () {
    this.getBroadcasts()
  },

  computed: {
    ...mapState(['campaigns']),

    isBroadcastsTableEmpty () {
      return this.broadcastCounts[this.broadcastFilter - 1] === 0
    },

    visibleBroadcasts () {
      let filter = this.broadcastFilterOptions[this.broadcastFilter - 1]?.filter
      let text = this.broadcastsSearchText.toLowerCase()

      if (!filter && !text) {
        return this.broadcastData
      }

      return this.broadcastData
        .filter(broadcast => {
          console.log({ broadcast })
          let matchText = true
          let matchType = true

          if (text) {
            let broadcastName = broadcast.name.toLowerCase()

            console.log([(broadcast.id + ''), broadcastName, text])
            matchText = (broadcast.id + '').includes(text) || broadcastName.includes(text)
          }

          if (filter) {
            matchType = broadcast.status === filter
          }

          return matchText && matchType
        })
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
    },

    chartOptions () {
      return {
        loading: false,
        graph_can_load: true,
        aggregated_counts: [],
        graph_id: 'activity-graph',
        report_type: 'date_v_campaign', // changes to date_v_user
        chart_period: 'day',
        chart_type: 'spline',
        time: {
          useUTC: false,
          timezone: window.timezone
        },
        // force the plot to show all ticks daily
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            millisecond: '%e %b', // always use day as highest resolution.
            second: '%e %b', // always use day as highest resolution.
            minute: '%e %b', // always use day as highest resolution.
            hour: '%H:%M',
            day: '%e %b', // always use day as highest resolution.
            week: '%e %b', // always use day as highest resolution.
            month: '%b \'%y',
            year: '%Y'
          },
          // minRange: 1 * 24 * 3600000, // 1 day
          labels: {
            rotation: 45,
            // step: 1,
            style: {
              fontSize: '14px'
            }
          }
        },

        yAxis: {
          allowDecimals: false,
          offset: 20,
          title: {
            text: 'Number Of Calls & Texts',
            style: {
              'font-size': '14px',
              'color': '#090A0D'
            }
          }
        },
        legend: {
          layout: 'horizontal',
          enabled: true,
          verticalAlign: 'bottom',
          floating: false
        },

        credits: {
          enabled: false
        },

        exporting: {
          sourceWidth: 0,
          sourceHeight: 0
        },

        series: []
      }
    },

    isAdmin () {
      return true
    },

    contextMenuTarget () {
      return this.contextMenuTargetId ? '#' + this.getContextMenuTargetElementId({ id: this.contextMenuTargetId }) : true
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

    onContextMenuClicked (row) {
      this.contextMenuTargetId = row.id
    },

    onContextMenuButtonClicked (item) {
      switch (item.name) {
        case 'rename':
          return this.renameBroadcast()
        case 'delete':
          return this.deleteBroadcast()
        case 'activity':
          return this.showBroadcastActivity()
      }
    },

    getContextMenuTargetElementId (row) {
      return `context-menu-btn-${row.id}`
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
    },

    getCampaign (campaignId) {
      if (!campaignId) {
        return null
      }

      let found = this.campaigns.find(campaign => campaign.id === campaignId)

      if (!found) {
        return null
      }

      return found
    },

    deleteBroadcast () {

    },

    renameBroadcast () {

    },

    showBroadcastActivity () {

    },

    shouldAllowContextMenuButton (item) {
      if (item.name === 'rename') {
        return this.checked.length === 0
      }

      if (item.name === 'delete') {
        return this.isAdmin
      }

      return true
    },

    onContextMenuInput (val) {
      // if (!val) {
      //   this.contextMenuOpen = val
      // }
    }
  },

  watch: {
    broadcasts (broadcasts) {
      this.getBroadcasts()
    },

    contextMenuOpen (val) {
      if (!val) {
        this.contextMenuTargetId = null
      }
    },

    contextMenuTarget (val) {
      if (val !== true) {
        this.$refs['contextMenu'].show()
      }
    }
  }
}
</script>
