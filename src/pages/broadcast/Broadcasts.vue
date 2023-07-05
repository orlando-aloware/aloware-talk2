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
      <communication-activity-graph base="broadcast"
                                    :default-date-range="7"/>
re    </div>
    <q-separator/>
    <div class="d-flex align-items-center justify-content-end">
      <b-dropdown class="m-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown"
                  id="bulk-action-dropdown"
                  text="..."
                  variant="light"
                  no-caret
                  right
                  :disabled="bulkActionsDisabled"
                  v-b-tooltip.hover="{ placement: 'top', title: (bulkActionsDisabled ? 'Select broadcasts in order to use bulk actions' : null), customClass: 'q-tooltip q-tooltip--style no-pointer-events' }">
        <template #button-content>
          <ellipse-icon />
        </template>
        <b-dropdown-item href=""
                         :disabled="!shouldAllowContextMenuBulk('activity')"
                         @click.prevent="bulkShowActivity">
          <img class="mr-2"
               :src="'app-icons/menu/context-menu-activity.svg'"/>
          <span>
            Activity
          </span>
        </b-dropdown-item>
        <b-dropdown-item href=""
                         :disabled="!shouldAllowContextMenuBulk('pause')"
                         v-if="!shouldAllowContextMenuBulk('play') && shouldAllowContextMenuBulk('pause')"
                         @click.prevent="bulkPause">
          <img class="mr-2"
               :src="'app-icons/menu/context-menu-pause.svg'"/>
          <span>
            Pause
          </span>
        </b-dropdown-item>
        <b-dropdown-item href=""
                         :disabled="!shouldAllowContextMenuBulk('play')"
                         v-if="!shouldAllowContextMenuBulk('pause') && shouldAllowContextMenuBulk('play')"
                         @click.prevent="bulkPlay">
          <img class="mr-2"
               :src="'app-icons/menu/context-menu-play.svg'"/>
          <span>
            Resume
          </span>
        </b-dropdown-item>
        <b-dropdown-item href=""
                         :disabled="!shouldAllowContextMenuBulk('delete')"
                         @click.prevent="bulkDelete">
          <delete-red-icon />
          <span class="text-danger">
            Delete
          </span>
        </b-dropdown-item>
      </b-dropdown>
    </div>
    <div class="broadcasts__home__table flex-grow-1">
      <datatable class="h-100"
                 ref="broadcastsTable"
                 :stickyHeaders="true"
                 :columns="broadcastsColumns"
                 :isEmpty="isBroadcastsTableEmpty"
                 :showSelectAll="false"
                 :paginated="true"
                 :showPagination="true"
                 :lastPage="pagination.totalPages"
                 :currentPage="pagination.currentPage"
                 :total-rows="visibleBroadcasts?.length ?? 0"
                 :loading="loading"
                 @sort="onSortTable"
                 @reordered="onColumnsReordered"
                 @paginated="onPaginationChanged">
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
                <broadcast-status-pill :status="row[col.field]"
                                       :text="row['status_name']" />
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
                     :style="`color: ${row['tag']?.color}; font-size:36%; position: relative; top: -3px;`" />
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
                <div class="context-menu"
                     :class="[isSelectedRow(row) ? 'keep-visible' : '']">
                  <b-dropdown class="position-absolute"
                              :style="{ 'margin-top': '-0.9rem', right: '0.5rem' }"
                              :id="getContextMenuTargetElementId(row)"
                              size="sm"
                              right
                              @show="onContextMenuShow(row)"
                              @hide="onContextMenuHide(row)">
                    <template #button-content>
                      <ellipse-icon/>
                    </template>
                    <b-dropdown-item :key="id"
                                     :disabled="!shouldAllowContextMenuButton(item, row)"
                                     dense
                                     clickable
                                     v-for="(item, id) in contextMenuListItemsForSelectedRow"
                                     @click="onContextMenuButtonClicked(item, row)">
                      <div class="d-flex align-items-center">
                        <template v-if="item.name === 'delete'">
                          <delete-red-icon class="mr-2" />
                        </template>
                        <template v-else>
                          <img class="mr-2"
                              :src="`app-icons/menu/${item.icon}`" />
                        </template>
                        <span :class="[item.name === 'delete' ? 'text-danger' : '']">
                          {{ item.label }}
                        </span>
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
    <q-popup-proxy :target="contextMenuTarget ?? true"
                   no-parent-event
                   @hide="onPopupHide()"
                   v-model="popupOpen">
      <q-card>
        <q-card-section>
          <template v-if="popupAction === 'delete'">
            <span class="text-h6">Delete broadcast</span>
            <p v-if="popupActionList.length <= 1">Are you sure you want to delete this broadcast?</p>
            <p v-else>Are you sure you want to delete <span class="text-bold">{{ popupActionList.length }}</span> broadcasts?</p>
            <div class="d-flex">
              <q-btn class="px-1 flex-grow-1 broadcasts-cancel-button"
                     color="white"
                     text-color="black"
                     unelevated
                     @click="onCancelPopup">
                <span class="px-2">Cancel</span>
              </q-btn>
              <q-btn class="ml-3 flex-grow-1"
                     color="danger"
                     unelevated
                     :loading="popupLoadingAction"
                     @click="deleteBroadcast(popupActionList)">
                <span class="px-2">Delete</span>
              </q-btn>
            </div>
          </template>
          <template v-if="popupAction === 'rename'">
            <div class="text-h6">Rename broadcast</div>
            <div class="mt-2 text-muted">Name</div>
            <q-input outlined
                     v-model="popupRename"/>
            <div class="d-flex">
              <q-btn class="px-1 flex-grow-1"
                     color="white"
                     text-color="black"
                     unelevated
                     @click="onCancelPopup">
                <span class="px-2">Cancel</span>
              </q-btn>
              <q-btn class="ml-3 flex-grow-1"
                     color="primary"
                     unelevated
                     :loading="popupLoadingAction"
                     @click="renameBroadcast(popupActionList)">
                <span class="px-2">Save</span>
              </q-btn>
            </div>
          </template>
          <template v-if="['play', 'pause'].includes(popupAction)">
            <span class="text-h6">{{ popupAction === 'play' ? 'Resume' : 'Pause' }} Broadcasts</span>
            <p>{{ toggleStatusPrompt }}</p>
            <p v-if="popupAction === 'play'">Scheduled tasks such as calls or messages will GO out.</p>
            <p v-else>Scheduled tasks such as calls or messages will NOT go out.</p>
            <div class="d-flex">
              <q-btn class="px-1 flex-grow-1 broadcasts-cancel-button"
                     color="white"
                     text-color="black"
                     unelevated
                     @click="onCancelPopup">
                <span class="px-2">Cancel</span>
              </q-btn>
              <q-btn class="ml-3 flex-grow-1"
                     :color="popupAction === 'play' ? 'primary' : 'warning'"
                     unelevated
                     :loading="popupLoadingAction"
                     @click="toggleBroadcastStatus(popupActionList)">
                <span class="px-2">{{ popupAction === 'play' ? 'Resume' : 'Pause' }}</span>
              </q-btn>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </q-popup-proxy>
  </div>
</template>

<script>
import Search from 'src/components/search.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import API from 'src/plugins/api/api'
import Datatable from 'src/components/datatable.vue'
import EllipseIcon from 'components/icons/ellipse-icon.vue'
import BroadcastStatusPill from 'src/components/broadcasts/broadcast-status-pill.vue'
import CommunicationActivityGraph from 'src/components/communication-activity-graph.vue'
import DeleteRedIcon from 'components/icons/delete-red-icon'
import * as BroadcastStatuses from 'src/constants/broadcast-statuses.js'
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

const broadcastsColumns = [
  {
    name: 'checkbox',
    label: '',
    field: ''
  },
  {
    name: 'id',
    label: 'Id',
    field: 'id',
    sortable: true
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true,
    draggable: true
  },
  {
    name: 'pending_tasks',
    label: 'Pending Tasks',
    field: 'pending_tasks',
    sortable: true,
    draggable: true
  },
  {
    name: 'total_failed',
    label: 'Failed Tasks',
    field: 'total_failed',
    sortable: true,
    draggable: true
  },
  {
    name: 'total_enrolled',
    label: 'Total Tasks',
    field: 'total_enrolled',
    sortable: true,
    draggable: true
  },
  {
    name: 'engagement_rate',
    label: 'Engagement',
    field: 'engagement_rate',
    sortable: true,
    draggable: true
  },
  {
    name: 'total_unsubscribed',
    label: 'Unsubscribed',
    field: 'total_unsubscribed',
    sortable: true,
    draggable: true
  },
  {
    name: 'target_group',
    label: 'Target Group',
    field: 'target_group',
    draggable: true
  },
  {
    name: 'campaign_id',
    label: 'Line Used',
    field: 'campaign_id',
    sortable: true,
    draggable: true
  },
  {
    name: 'throttle_limit',
    label: 'Throttling',
    field: 'throttle_limit',
    sortable: true,
    draggable: true
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
    name: 'play',
    label: 'Play',
    icon: 'context-menu-play.svg'
  },
  {
    name: 'pause',
    label: 'Pause',
    icon: 'context-menu-pause.svg'
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
    EllipseIcon,
    DeleteRedIcon
  },

  mixins: [aclMixin],

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
    broadcastSort: {},
    checked: [],
    isAllChecked: false,
    BroadcastStatuses,
    contextMenuListItems,
    contextMenuTargetId: null,
    contextMenuOpen: false,
    popupOpen: false,
    popupAction: '',
    popupActionList: [],
    popupLoadingAction: false,
    popupRename: '',
    pagination: {
      perPage: 25,
      totalPages: 1,
      currentPage: 1
    }
  }),

  mounted () {
    this.getBroadcasts()
  },

  computed: {
    ...mapState(['campaigns']),

    isBroadcastsTableEmpty () {
      return this.broadcastCounts[this.broadcastFilter - 1] === 0
    },

    filteredBroadcasts () {
      let filter = this.broadcastFilterOptions[this.broadcastFilter - 1]?.filter
      let text = this.broadcastsSearchText.toLowerCase()

      if (!filter && !text) {
        return this.broadcastData
      }

      return this.broadcastData.filter(broadcast => {
        let matchText = true
        let matchType = true

        if (text) {
          let broadcastName = broadcast.name.toLowerCase()

          matchText = (broadcast.id + '').includes(text) || broadcastName.includes(text)
        }

        if (filter) {
          matchType = broadcast.status === filter
        }

        return matchText && matchType
      })
    },

    visibleBroadcasts () {
      let { perPage, currentPage } = this.pagination
      let paginationStart = perPage * (currentPage - 1)
      let paginationEnd = (perPage * currentPage)

      return this.filteredBroadcasts
        .slice(paginationStart, paginationEnd)
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
      return this.hasRole('Company Admin')
    },

    contextMenuTarget () {
      return this.contextMenuTargetId ? '#' + this.getContextMenuTargetElementId({ id: this.contextMenuTargetId }) : '#bulk-action-dropdown'
    },

    bulkActionsDisabled () {
      return this.checked.length === 0
    },

    contextMenuListItemsForSelectedRow () {
      if (!this.contextMenuTargetId) {
        return this.contextMenuListItems
      }

      let broadcast = this.broadcastData.find(item => item.id === this.contextMenuTargetId)

      return this.contextMenuListItems.filter(item => this.shouldShowContextMenuItem(item, broadcast))
    },

    toggleStatusPrompt () {
      let verb = this.popupAction === 'play' ? 'resume' : 'pause'
      let demonstrative = this.popupActionList.length === 1 ? 'this broadcast' : 'these broadcasts'
      return `Are you sure you want to ${verb} ${demonstrative}?`
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

    onSortTable (sort) {
      let { orderBy, order } = sort
      this.broadcastData = this.broadcastData.sort((a, b) => {
        if (!orderBy) {
          return 0
        }

        let aOrderBy = a[orderBy]
        let bOrderBy = b[orderBy]

        if (orderBy === 'campaign_id') {
          aOrderBy = this.getCampaign(aOrderBy)?.name
          bOrderBy = this.getCampaign(bOrderBy)?.name

          if (aOrderBy && !bOrderBy) {
            return -1
          } else if (!aOrderBy && bOrderBy) {
            return 1
          }
        }

        if (aOrderBy === bOrderBy) {
          return 0
        }

        let comparison = aOrderBy > bOrderBy ? 1 : -1

        if (typeof aOrderBy === 'string' && typeof bOrderBy === 'string') {
          comparison = aOrderBy.localeCompare(bOrderBy)
        }

        if (order !== 'asc') {
          comparison = comparison * -1
        }

        return comparison
      })
    },

    onContextMenuShow (row) {
      this.contextMenuOpen = true
      this.contextMenuTargetId = row.id
    },

    onContextMenuHide () {
      this.contextMenuOpen = false

      if (!this.popupOpen) {
        this.contextMenuTargetId = null
      }
    },

    onContextMenuButtonClicked (item, broadcast) {
      let broadcasts = [broadcast]
      this.popupActionList = broadcasts

      switch (item.name) {
        case 'rename':
          this.popupRename = broadcast.name
          this.popupOpen = true
          this.popupAction = 'rename'
          break
        case 'delete':
          this.popupOpen = true
          this.popupAction = 'delete'
          break
        case 'activity':
          this.showBroadcastActivity(broadcasts)
          break
        case 'play':
          this.popupAction = 'play'
          this.popupOpen = true
          break
        case 'pause':
          this.popupAction = 'pause'
          this.popupOpen = true
          break
      }
    },

    getContextMenuTargetElementId (row) {
      return `context-menu-btn-${row.id}`
    },

    getBroadcasts () {
      API.V1.broadcasts.get().then(res => {
        this.broadcastData = res.data
        this.calculateTotalPages()
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

    onPopupHide () {
      this.contextMenuTargetId = null
    },

    onCancelPopup () {
      this.popupLoadingAction = false
      this.popupOpen = false
      this.popupAction = ''
      this.popupActionList = []
      this.checked = []
    },

    // CONTEXT MENU ACTIONS
    async deleteBroadcast (broadcasts) {
      this.popupLoadingAction = true
      let deletedCount = 0

      for (let broadcast of broadcasts) {
        await API.V1.broadcasts.delete(broadcast.id)
          .then(res => {
            deletedCount++
          })
          .catch(err => {
            console.error('Broadcast could not be deleted', {
              broadcast,
              err
            })
          })
      }

      this.onCancelPopup()
      this.getBroadcasts()

      if (deletedCount !== broadcasts.length) {
        this.$generalNotification(`Not all broadcasts were deleted. ${deletedCount} of ${broadcasts.length} were deleted.`, 'error')
        return
      }

      this.$generalNotification('Deletion completed successfully.')
    },

    async renameBroadcast ([broadcast]) {
      this.popupLoadingAction = true

      let payload = {
        name: this.popupRename,
        id: broadcast.id,
        timezone: broadcast.timezone
      }
      await API.V1.broadcasts.update(broadcast.id, payload).then(() => {
        this.broadcastData.map(item => {
          if (broadcast.id !== item.id) {
            return
          }

          item.name = this.popupRename
        })

        this.$generalNotification('Broadcast successfully renamed!')
      }).catch(err => {
        this.$generalNotification('Failed to rename broadcast')
        console.error('Broadcast was not renamed', {
          err
        })
      }).finally(() => {
        this.popupLoadingAction = false
      })

      this.popupRename = ''
      this.onCancelPopup()
    },

    async showBroadcastActivity (broadcasts) {
      this.contextMenuOpen = false
      this.popupOpen = false

      this.$router.push({
        name: 'Inbox Channel',
        params: {
          channel: 'all-communications'
        },
        query: {
          broadcastIds: broadcasts.map(broadcast => broadcast.id)
        }
      })
    },

    async toggleBroadcastStatus (broadcasts) {
      this.popupLoadingAction = true

      for (let broadcast of broadcasts) {
        API.V1.broadcasts.toggleStatus(broadcast.id)
          .then(res => {
            this.broadcastData = this.broadcastData.map(item => {
              if (broadcast.id !== item.id) {
                return item
              }

              return res.data.broadcast
            })
          })
          .catch(err => {
            console.error('Broadcast status could not be toggled', {
              broadcast,
              err
            })
          })
          .finally(() => {
            this.onCancelPopup()
          })
      }
    },

    shouldAllowContextMenuButton (item, broadcast) {
      if (item.name === 'delete') {
        return this.isAdmin && [4].includes(broadcast.status)
      }

      return true
    },

    shouldShowContextMenuItem (item, broadcast) {
      switch (item.name) {
        case 'play':
          return this.isPlayable(broadcast)
        case 'pause':
          return this.isPausable(broadcast)
        default:
          return true
      }
    },

    isPausable (broadcast) {
      return [BroadcastStatuses.STATUS_ENROLLING, BroadcastStatuses.STATUS_NEW].includes(broadcast.status)
    },

    isPlayable (broadcast) {
      return broadcast.status === BroadcastStatuses.STATUS_PAUSED
    },

    shouldAllowContextMenuBulk (action) {
      if (action === 'delete') {
        let isAllCheckedDone = this.checked.reduce((results, item) => results && item.status === 4, true)
        return this.isAdmin && isAllCheckedDone
      }

      if (action === 'play') {
        const isAllCheckedPlayable = this.checked.reduce((results, broadcast) => results && this.isPlayable(broadcast), true)
        return isAllCheckedPlayable
      }

      if (action === 'pause') {
        const isAllCheckedPausable = this.checked.reduce((results, broadcast) => results && this.isPausable(broadcast), true)
        return isAllCheckedPausable
      }

      return true
    },

    bulkDelete () {
      this.popupActionList = this.checked
      this.popupOpen = true
      this.popupAction = 'delete'
    },

    bulkShowActivity () {
      this.showBroadcastActivity(this.checked)
    },

    bulkPause () {
      this.popupActionList = this.checked
      this.popupOpen = true
      this.popupAction = 'pause'
    },

    bulkPlay () {
      this.popupActionList = this.checked
      this.popupOpen = true
      this.popupAction = 'play'
    },

    isSelectedRow (row) {
      return this.contextMenuTargetId === row.id
    },

    onColumnsReordered (columnOrder) {
      this.broadcastsColumns = columnOrder
    },

    onPaginationChanged ({ page, per_page: perPage }) {
      this.pagination.currentPage = page
      this.pagination.perPage = perPage
      this.calculateTotalPages()
    },

    calculateTotalPages () {
      if (this.filteredBroadcasts.length === 0) {
        this.pagination.totalPages = 1
        return
      }

      this.pagination.totalPages = Math.ceil(this.filteredBroadcasts.length / this.pagination.perPage)
    }
  },

  watch: {
    broadcastData (data) {
      this.calculateTotalPages()
    },

    broadcastFilter (data) {
      this.onPaginationChanged({ page: 1, per_page: this.pagination.perPage })
    }
  }
}
</script>
