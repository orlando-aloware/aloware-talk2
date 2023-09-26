<template>
  <div class="broadcasts__home position-relative d-flex flex-column h-100">
    <b-overlay class="broadcasts__home__loading-overlay"
               rounded="sm"
               :style="`margin-top: ${notificationHeight}px`"
               :show="true"
               v-show="loading || isBroadcastsLoading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>
    <div class="row align-items-center justify-content-between px-3 my-2 w-100">
      <div class="col-3">
        <search placeholder="Search name"
                :search="broadcastsSearchText"
                @search="val => broadcastsSearchText = val"/>
      </div>
      <div class="col-6">
        <q-btn-toggle class="custom-toggle-button mx-2 mt-2 mb-1"
                      no-caps
                      spread
                      unelevated
                      dense
                      :options="broadcastFilterOptions"
                      v-model="broadcastFilter">
          <template v-slot:one>
            <div class="d-flex justify-content-center w-100 px-1 options"
                 :class="[broadcastFilter === 'new' ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  New
                </span>
            </div>
          </template>
          <template v-slot:two>
            <div class="d-flex justify-content-center w-100 px-1 options"
                 :class="[broadcastFilter === 'enrolling' ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  Enrolling
                </span>
            </div>
          </template>
          <template v-slot:three>
            <div class="d-flex justify-content-center w-100 px-1 options"
                 :class="[broadcastFilter === 'sent' ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  Sent
                </span>
            </div>
          </template>
          <template v-slot:four>
            <div class="d-flex justify-content-center w-100 px-1 options"
                 :class="[broadcastFilter === 'paused' ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  Paused
                </span>
            </div>
          </template>
          <template v-slot:five>
            <div class="d-flex justify-content-center w-100 px-1 options"
                 :class="[broadcastFilter === 'stopped' ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  Stopped
                </span>
            </div>
          </template>
          <template v-slot:six>
            <div class="d-flex justify-content-center w-100 px-1 options"
                 :class="[broadcastFilter === 'all' ? 'text-white' : 'text-grey-90']">
                <span class="text-left broadcast-filter-name">
                  All
                </span>
                <div class="text-center broadcast-count ml-1"
                     v-if="broadcastsCount > 0">
                  <span>
                    {{ broadcastsCount | numberPlusFormatter(99) }}
                  </span>
                </div>
            </div>
          </template>
        </q-btn-toggle>
      </div>
      <div class="col-2 d-flex justify-content-end">
        <compact-btn class="mr-2"
                     variant="primary"
                     v-if="hasPermissionTo(['create broadcast message', 'create broadcast rvm', 'update broadcast'])"
                     @clicked="$router.push({ path: '/broadcasts/new' })">
          <plus-icon class="mr-1"
                     color="white"/>
          New Bulk Message
        </compact-btn>
      </div>
    </div>
    <q-separator/>
    <div class="broadcasts__home__graph">
      <communication-activity-graph base="broadcast"
                                    :default-date-range="7"/>
    </div>
    <q-separator/>
    <div class="d-flex align-items-center justify-content-end">
      <b-dropdown class="m-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown"
                  id="bulk-action-dropdown"
                  text="..."
                  variant="light"
                  no-caret
                  right
                  :disabled="bulkActionsDisabled"
                  v-b-tooltip.hover="bulkActionsTooltipProps">
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
                 use-empty-slot
                 :sticky-headers="true"
                 :columns="broadcastsColumns"
                 :is-empty="isBroadcastsTableEmpty"
                 :show-select-all="false"
                 :paginated="true"
                 :show-pagination="true"
                 :last-page="pagination.totalPages"
                 :current-page="pagination.currentPage"
                 :total-rows="broadcastsCount"
                 :loading="loading"
                 :is-scrollable="false"
                 @sort="onSortTable"
                 @reordered="onColumnsReordered"
                 @paginated="onPaginationChanged">
        <template slot="tbody">
          <tr :key="rowIndex"
              v-for="(row, rowIndex) in broadcasts">
            <template v-for="(col, colIndex) in broadcastsColumns">
              <td class="datatable-row__checkbox"
                  :key="`c-${colIndex}`"
                  v-if="col.name == 'checkbox'">
                <label class="custom-checkbox-container">
                  <input type="checkbox"
                         class="checker"
                         :value="row.id"
                         :checked="checked.find(item => item.id === row.id) || isAllChecked"
                         @change="onCheckerClicked(row)"/>
                  <span class="checkmark"/>
                </label>
              </td>
              <td :key="`c-${colIndex}`"
                  class="sorted-column"
                  v-else-if="col.name == 'status'">
                <broadcast-status-pill :status="row[col.field]"
                                       :text="row['status_name']" />
              </td>
              <td :key="`c-${colIndex}`"
                  class="sorted-column"
                  v-else-if="col.name === 'scheduled_time'">
                <relative-time humanized
                               :from-time="row[col.field]" />
              </td>
              <td :key="`c-${colIndex}`"
                   class="sorted-column"
                  v-else-if="col.name == 'throttle_limit'">
                  {{ getThrottling(row[col.field]) }}
              </td>
              <td :key="`c-${colIndex}`"
                  class="sorted-column"
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
                  class="sorted-column"
                  v-else-if="col.name === 'engagement_rate'">
                {{ getEngagement(row[col.field]) }}
              </td>
              <td :key="`c-${colIndex}`"
                  class="sorted-column"
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
                              size="sm"
                              right
                              :style="{ 'margin-top': '-0.9rem', right: '0.5rem' }"
                              :id="getContextMenuTargetElementId(row)"
                              @show="onContextMenuShow(row)"
                              @hide="onContextMenuHide(row)">
                    <template #button-content>
                      <ellipse-icon/>
                    </template>
                    <b-dropdown-item dense
                                     clickable
                                     :key="id"
                                     :disabled="!shouldAllowContextMenuButton(item, row)"
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
                  :class="col.draggable ? 'sorted-column' : ''"
                  v-else>
                {{ row[col.field] }}
              </td>
            </template>
          </tr>
        </template>
        <template #empty>
          <div class="broadcasts__home__table--empty"
               v-if="isBroadcastsTableEmpty && !loading">
            <div class="h5 px-2 text-center">No data</div>
          </div>
        </template>
      </datatable>
    </div>
    <q-popup-proxy no-parent-event
                   :target="contextMenuTarget ?? true"
                   v-model="popupOpen"
                   @hide="onPopupHide()">
      <q-card>
        <q-card-section>
          <i class="fa-sharp fa-solid fa-xmark fa-xl position-absolute"
             style="right: 15px; top: 25px; cursor: pointer"
             @click="onCancelPopup"/>
          <template v-if="popupAction === 'delete'">
            <span class="text-h6">
              Delete broadcast
            </span>
            <p v-if="popupActionList.length <= 1">
              Are you sure you want to delete this broadcast?
            </p>
            <p v-else>
              Are you sure you want to delete <span class="text-bold">{{ popupActionList.length }}</span> broadcasts?
            </p>
            <div class="d-flex">
              <compact-btn custom-class="btn-block align-center p-3"
                           variant="danger"
                           :disabled="popupLoadingAction"
                           @clicked="onDeleteBroadcast(popupActionList)">
                <span class="w-100">Delete</span>
              </compact-btn>
            </div>
          </template>
          <template v-if="popupAction === 'rename'">
            <div class="broadcast-proxy-modal-title">
              Rename broadcast
            </div>
            <div class="mt-2 text-muted">
              Name
            </div>
            <q-input outlined
                     v-model="popupRename"/>
            <div class="d-flex">
              <compact-btn custom-class="btn-block align-center p-3 mt-3"
                           variant="primary"
                           :disabled="popupLoadingAction"
                           @clicked="renameBroadcast(popupActionList)">
                <span class="w-100">Save</span>
              </compact-btn>
            </div>
          </template>
          <template v-if="['play', 'pause'].includes(popupAction)">
            <span class="text-h6">
              {{ popupAction === 'play' ? 'Resume' : 'Pause' }} Broadcasts
            </span>
            <p>
              {{ toggleStatusPrompt }}
            </p>
            <p v-if="popupAction === 'play'">
              Scheduled tasks such as calls or messages will GO out.
            </p>
            <p v-else>
              Scheduled tasks such as calls or messages will NOT go out.
            </p>
            <div class="d-flex">
              <compact-btn custom-class="btn-block align-center p-3"
                           :variant="popupAction === 'play' ? 'primary' : 'warning'"
                           :disabled="popupLoadingAction"
                           @clicked="toggleBroadcastStatus(popupActionList)">
                <span class="w-100">{{ popupAction === 'play' ? 'Resume' : 'Pause' }}</span>
              </compact-btn>
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
import CompactBtn from 'components/compact-btn.vue'
import RelativeTime from 'src/components/relative-time.vue'
import * as BroadcastStatuses from 'src/constants/broadcast-statuses.js'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
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
    name: 'scheduled_time',
    label: 'Scheduled Time',
    field: 'run_at',
    sortable: false,
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
    DeleteRedIcon,
    CompactBtn,
    RelativeTime
  },

  mixins: [
    aclMixin
  ],

  data: () => ({
    loading: false,
    broadcastsSearchText: '',
    broadcastFilter: 'all',
    broadcastFilterOptions: [
      {
        slot: 'one',
        value: BroadcastStatuses.STATUS_NEW
      },
      {
        slot: 'two',
        value: BroadcastStatuses.STATUS_ENROLLING
      },
      {
        slot: 'three',
        value: BroadcastStatuses.STATUS_DONE
      },
      {
        slot: 'four',
        value: BroadcastStatuses.STATUS_PAUSED
      },
      {
        slot: 'five',
        value: BroadcastStatuses.STATUS_STOPPED
      },
      {
        slot: 'six',
        value: 'all'
      }
    ],
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
    },
    sort: null,
    notificationHeight: 0
  }),

  async mounted () {
    await this.getBroadcasts()

    this.calculateTotalPages()

    this.$VueEvent.listen('broadcasts_created', (broadcast) => {
      this.ADD_BROADCAST(broadcast)
    })

    this.$VueEvent.listen('broadcasts_updated', (broadcast) => {
      this.UPDATE_BROADCAST(broadcast)
    })

    this.$VueEvent.listen('broadcasts_deleted', (broadcast) => {
      this.DELETE_BROADCAST(broadcast)
    })

    // set notification height if it exists
    setTimeout(() => { this.checkNotification() }, 2000)
  },

  computed: {
    ...mapState(['campaigns']),
    ...mapState('broadcast', [
      'isBroadcastsLoading'
    ]),
    ...mapGetters('broadcast', {
      broadcasts: 'getBroadcasts',
      broadcastsCount: 'getBroadcastsCount'
    }),

    isBroadcastsTableEmpty () {
      return this.broadcasts.length === 0
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

      const broadcast = this.broadcasts.find(item => item.id === this.contextMenuTargetId)

      if (!broadcast) {
        return []
      }

      return this.contextMenuListItems.filter(item => this.shouldShowContextMenuItem(item, broadcast))
    },

    toggleStatusPrompt () {
      const verb = this.popupAction === 'play' ? 'resume' : 'pause'
      const demonstrative = this.popupActionList.length === 1 ? 'this broadcast' : 'these broadcasts'

      return `Are you sure you want to ${verb} ${demonstrative}?`
    },

    bulkActionsTooltipProps () {
      return {
        placement: 'top',
        title: (this.bulkActionsDisabled ? 'Select broadcasts in order to use bulk actions' : null),
        customClass: 'q-tooltip q-tooltip--style no-pointer-events'
      }
    }
  },

  methods: {
    ...mapActions('broadcast', [
      'deleteBroadcast',
      'fetchBroadcasts'
    ]),

    ...mapMutations('broadcast', [
      'ADD_BROADCAST',
      'DELETE_BROADCAST',
      'SET_SEARCH',
      'SET_STATUS',
      'UPDATE_BROADCAST'
    ]),

    onCheckerClicked (row) {
      if (!row) {
        this.isAllChecked = !this.isAllChecked
        return
      }

      const foundItem = this.checked.find(item => item.id === row.id)

      if (foundItem) {
        this.checked = this.checked.filter(item => item.id !== row.id)
        return
      }

      this.checked.push(row)
    },

    onSortTable (sort) {
      this.sort = sort

      this.getBroadcasts()
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
      const broadcasts = [broadcast]
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

    getThrottling (messagePerMinute) {
      return (messagePerMinute * 60) + ' per hour'
    },

    getCampaign (campaignId) {
      if (!campaignId) {
        return null
      }

      const found = this.campaigns.find(campaign => campaign.id === campaignId)

      if (!found) {
        return null
      }

      return found
    },

    getEngagement (engagement) {
      return engagement > 0 ? engagement + '%' : '-'
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
    async onDeleteBroadcast (broadcasts) {
      this.popupLoadingAction = true
      let deletedCount = 0

      for (let broadcast of broadcasts) {
        await this.deleteBroadcast(broadcast.id)
          .then(res => {
            deletedCount++

            this.DELETE_BROADCAST(broadcast)
          })
          .catch(err => {
            console.error('Broadcast could not be deleted', {
              broadcast,
              err
            })
          })
      }

      this.onCancelPopup()

      if (deletedCount !== broadcasts.length) {
        this.$generalNotification(`Not all broadcasts were deleted. ${deletedCount} of ${broadcasts.length} were deleted.`, 'error')
        return
      }

      this.$generalNotification('Deletion completed successfully.')
    },

    async renameBroadcast ([broadcast]) {
      this.popupLoadingAction = true

      const payload = {
        name: this.popupRename,
        id: broadcast.id,
        timezone: broadcast.timezone
      }
      await API.V1.broadcasts.update(broadcast.id, payload).then(() => {
        this.broadcasts.map(item => {
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

      for (const broadcast of broadcasts) {
        API.V1.broadcasts.toggleStatus(broadcast.id)
          .then(res => {
            this.broadcasts = this.broadcasts.map(item => {
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
        const isAllCheckedDone = this.checked.reduce((results, item) => results && item.status === 4, true)
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

      this.getBroadcasts()
    },

    calculateTotalPages () {
      if (this.broadcasts?.length === 0) {
        this.pagination.totalPages = 1
        return
      }

      this.pagination.totalPages = Math.ceil(this.broadcastsCount / this.pagination.perPage)
    },

    getBroadcasts () {
      return this.fetchBroadcasts({
        page: this.pagination.currentPage,
        perPage: this.pagination.perPage,
        order: this.sort?.order,
        orderBy: this.sort?.orderBy
      })
    },

    checkNotification () {
      const notification = document.querySelector('#notification-container')

      if (notification) {
        this.notificationHeight = notification.getBoundingClientRect().height
      }
    }
  },

  watch: {
    broadcasts () {
      this.calculateTotalPages()
    },

    broadcastFilter (data) {
      this.SET_STATUS(data)
      this.getBroadcasts()
    },

    broadcastsSearchText (search) {
      this.SET_SEARCH(search)
      this.getBroadcasts()
    }
  }
}
</script>
