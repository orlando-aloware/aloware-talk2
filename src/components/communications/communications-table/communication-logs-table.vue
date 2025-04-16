<template>
  <div class="talk-table-container flex-grow-1 d-flex flex-column">
    <h3 class="title pl-3">
      {{ title }}
    </h3>
    <div class="filters pl-3 d-flex flex-column flex-sm-row gap-3">
      <div class="search flex-grow-1">
        <search-input class="w-100"
                      limit-search-characters
                      input-error-border
                      data-testid="contacts-view-search-input"
                      :search="searchQuery"
                      :disabled="isLoadingDisabled"
                      @search="onSearch"
                      @show-error="onSearchInputShowError"/>
        <div class="limit-characters-error d-flex align-items-center mt-1"
            v-if="showLimitCharactersError">
            <span class="search-error-icon mr-1">&times;</span>
            <span class="search-error-text">Search requires at least 3 characters</span>
        </div>
      </div>

      <div class="setting d-flex align-items-center flex-column flex-sm-row w-100 w-sm-auto gap-3 align-items-sm-center">
        <div class="small text-muted fs-13 my-2 my-sm-0">
          <template v-if="!isLoadingCommunicationsCount">
            {{ communicationsCountValue }} Communications
          </template>
          <q-skeleton type="text"
                      style="width: 80px"
                      v-else />
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center justify-content-center justify-content-sm-start ml-sm-4">
            <communications-filters />
          </div>

          <div class="d-flex align-items-center justify-content-center ml-2 ml-sm-4 mr-sm-2">
            <compact-btn variant="primary"
                         :compact="false"
                         @clicked="changeTableSettingsVisibility(true)">
              Table Settings
            </compact-btn>
          </div>
        </div>
      </div>
    </div>

    <div class="talk-table-container">
      <datatable custom-class="communication-logs-table talk-table table-striped pl-0"
                 sticky-headers
                 scroll-area-class="communications-management-scroll-area"
                 use-empty-slot
                 :paginated="false"
                 :columns="columns"
                 :total-rows="communicationsCountValue"
                 :current-page="paginationPage"
                 :is-loading="isFirstLoad"
                 :is-loading-more="isLoadingMore"
                 @sort="sort"
                 @reordered="onColumnsReordered"
                 @more="onScroll">
        <template #tbody>
          <tr :key="index"
              :class="{'live-call-tr': isLiveCall(row)}"
              v-for="(row, index) in communicationsData">
            <template v-for="(col, colIndex) in columns">
              <td class="text-center"
                  :key="`r-${index}-c-${colIndex}`"
                  :style="col.columnStyle"
                  v-if="col.name === 'disposition_status2'">
                <div class="d-flex align-items-center justify-center">
                  <button class="btn btn-outlined-light btn-sm mr-3 toggle-mobile-details"
                          @click="toggleMobileDetails(row, $event)">
                    <i class="fa fa-chevron-down"
                       v-if="communicationMobileDetailsOpened[row.id]"></i>
                    <i class="fa fa-chevron-right"
                       v-else></i>
                  </button>
                  <disposition :row="row"
                               :is-live-call="isLiveCall(row)"
                               @on-details="onCommunicationDetails"/>
                </div>
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'incoming_number'">
                <incoming-number :row="row"
                                 :campaign-id="row.campaign_id"
                                 @on-filter="onFilter"/>
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'body'">
                <message-body :communication="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'ring_group'">
                <ring-group :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'created_at'">
                <start-time :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'talk_time'">
                <talk-time :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'wait_time'">
                <wait-time :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'hold_time'">
                <hold-time :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'contact'">
                <contact :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'user_id'">
                <user :row="row"
                      @on-filter="onFilter"/>
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'broadcast'">
                <broadcast :value="row.broadcast_id" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'workflow'">
                <workflow :value="row.workflow_id" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'duration'">
                <duration :row="row" />
              </td>

              <td class="overflow-visible"
                  :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'attempting_users'">
                <attempting-users expand-on-hover
                                  :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'transfer_prior_user_ids'">
                <transferred prop="transfer_prior_user_ids"
                             :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'transfer_target_user_ids'">
                <transferred prop="transfer_target_user_ids"
                             :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'in_cold_transfer'">
                <span data-testid="cold-transfer-row">{{ row.in_cold_transfer ? 'Yes' : 'No' }}</span>
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'transfer_type'">
                <transfer-type :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'callback_status'">
                <callback-status :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'queue_resolution2'">
                <queue-resolution :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'creator_type'">
                <creator-type :row="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'tags'">
                <communications-tags :communication="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'notes'">
                <wallboard-calls-note ellipse
                                      :communication="row" />
              </td>

              <td :key="`r-${index}-c-${colIndex}`"
                  :data-column="col.name"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'csat_score'">
                <csat-score :row="row" />
              </td>

              <td class="actions-td"
                  :key="`r-${index}-c-${colIndex}`"
                  :style="col.columnStyle"
                  v-else-if="col.name === 'operations'">
                <div class="d-flex justify-content-center">
                  <communications-operations :row="row"
                                             @on-details="openCommunicationDetailsPage"
                                             @archived="removeCommunication"
                                             @terminated="removeCommunication" />
                </div>
              </td>
            </template>
          </tr>
        </template>

        <template #empty>
          <div class="text-center loading-spinner"
               v-if="communicationsData.length === 0 && isLoadingCommunications">
            <q-spinner-bars class=""
                            color="primary"
                            size="28px" />
          </div>
          <div class="w-100 text-center"
               v-else-if="!isLoadingCommunications && !isLoadingMore && communicationsData.length === 0">
            <h2>No communications found based on the current filters</h2>
          </div>
        </template>
      </datatable>
    </div>

    <communications-details-sidebar :communication="sidebarCommunication"
                                    v-model="showCommunicationSidebar"/>

    <communication-table-settings :is-open="showColumnHeadersModal"
                                  :available-fields="tableFields"
                                  :current-columns="columns"
                                  @update:columns="updateColumns"
                                  @update:is-open="changeTableSettingsVisibility" />
  </div>
</template>

<script>
import { aclMixin, communicationsMixin, visibilityMixin } from 'src/plugins/mixins'
import SearchInput from 'components/search-input'
import CompactBtn from 'components/compact-btn'
import CommunicationTableSettings from './communication-table-settings.vue'
import CommunicationsTags from './communications-tags.vue'
import StartTime from './start-time.vue'
import CommunicationsFilters from 'src/components/communications/communications-filters.vue'
import CommunicationsOperations from './communications-operations.vue'
import RingGroup from './ring-group.vue'
import Disposition from './disposition.vue'
import TalkTime from './talk-time.vue'
import Duration from './duration.vue'
import WaitTime from './wait-time.vue'
import HoldTime from './hold-time.vue'
import Contact from './contact.vue'
import User from './user.vue'
import Broadcast from './broadcast.vue'
import Workflow from './workflow.vue'
import IncomingNumber from './incoming-number.vue'
import MessageBody from './message-body.vue'
import AttemptingUsers from './attempting-users.vue'
import Transferred from './transferred.vue'
import TransferType from './transfer-type.vue'
import CallbackStatus from './callback-status.vue'
import QueueResolution from './queue-resolution.vue'
import CreatorType from './creator-type.vue'
import CsatScore from './csat-score.vue'
import WallboardCallsNote from 'components/wallboard/wallboard-calls-note.vue'
import CommunicationsDetailsSidebar from 'components/communications/communication-details-sidebar.vue'
import { ALL_COLUMNS, DEFAULT_COLUMNS } from './communications-table-columns'
import { mapState, mapActions } from 'vuex'
import { isLiveCall } from 'src/plugins/helpers/functions'
import * as CommunicationTypes from 'src/constants/communication-types'
import { merge } from 'lodash'
import Datatable from 'src/components/datatable.vue'
import CommunicationsMobileRowDetails from './communications-mobile-row-details.vue'
import Vue from 'vue'

export default {
  name: 'CommunicationLogsTable',

  props: {
    title: {
      type: String,
      default: 'Communication Logs'
    }
  },

  mixins: [
    aclMixin,
    communicationsMixin,
    visibilityMixin
  ],

  components: {
    SearchInput,
    CompactBtn,
    CommunicationsFilters,
    CommunicationsOperations,
    CommunicationTableSettings,
    CommunicationsTags,
    RingGroup,
    Disposition,
    StartTime,
    TalkTime,
    Duration,
    WaitTime,
    HoldTime,
    Contact,
    User,
    Broadcast,
    Workflow,
    IncomingNumber,
    MessageBody,
    AttemptingUsers,
    Transferred,
    TransferType,
    CallbackStatus,
    QueueResolution,
    CreatorType,
    CsatScore,
    WallboardCallsNote,
    CommunicationsDetailsSidebar,
    Datatable
  },

  computed: {
    ...mapState('communications', [
      'activeChannel',
      'hasMoreCommunications',
      'channelClonedFilter',
      'paginationPage'
    ]),

    isFirstLoad () {
      // return false if loading more to mantain datatable scroll position (via resetScroll())
      if (this.isLoadingMore) {
        return false
      }

      return this.isLoadingCommunications
    }
  },

  data () {
    return {
      isLoadingDisabled: false,
      tableFields: ALL_COLUMNS,
      columns: DEFAULT_COLUMNS,
      searchFields: ['lead_number', 'contact.name'],
      source: null,
      cancelToken: null,
      paginated: false,
      showColumnHeadersModal: false,
      showCommunicationSidebar: false,
      sidebarCommunication: {},
      communicationsData: [],
      communicationsCountValue: 0,
      communicationMobileDetailsOpened: {},
      showLimitCharactersError: false
    }
  },

  methods: {
    ...mapActions('communications', [
      'setSearchQuery'
    ]),

    sort (sorts) {
      // Handle sorting logic here
      this.getCommunications(this.communicationFilters)
    },

    onFilter (data) {
      this.$VueEvent.fire('filter-communications', data)
    },

    onSearch (value) {
      this.setSearchQuery(value)

      this.$nextTick(() => {
        this.getCommunications(this.communicationFilters)
      })
    },

    changeTableSettingsVisibility (value) {
      this.showColumnHeadersModal = value
      this.$emit('change-column-headers-modal', value)
    },

    updatePaginationButtons () {
      this.$nextTick(() => {
        const allButtons = this.$el.querySelectorAll('.q-pagination button')

        allButtons.forEach(button => {
          const pageNumber = button.innerText
          button.setAttribute('data-testid', 'datatable-pagination-page-' + pageNumber)
        })
      })
    },

    async onScroll () {
      if (this.isLoadingCommunications || this.isLoadingMore) {
        return
      }

      if (this.hasMoreCommunications) {
        this.loadMoreCommunications()
      }
    },

    async loadMoreCommunications () {
      if (this.hasMoreCommunications && !this.isLoadingMore && !this.isLoadingCommunications) {
        this.getCommunications(this.communicationFilters, undefined, true)
      }
    },

    updateColumns (columns) {
      this.columns = columns
      this.saveColumns(columns)
    },

    saveColumns (columns) {
      try {
        localStorage.setItem('communication-logs-columns', JSON.stringify(columns))
      } catch (error) {
        console.error('Error saving columns to localStorage:', error)
      }
    },

    getSavedColumns () {
      try {
        const savedColumns = localStorage.getItem('communication-logs-columns')
        if (!savedColumns) {
          return this.columns
        }

        // use ALL_COLUMNS as base, removing and sorting based on it
        const columns = [...ALL_COLUMNS]
        const savedColumnsNames = JSON.parse(savedColumns).map(column => column.name)

        return columns
          .filter(column => savedColumnsNames.includes(column.name))
          .sort((a, b) => savedColumnsNames.indexOf(a.name) - savedColumnsNames.indexOf(b.name))
      } catch (error) {
        return this.columns
      }
    },

    removeCommunication (communicationId) {
      const index = this.communicationsData.findIndex(communication => communication.id === communicationId)

      if (index > -1) {
        this.communicationsData.splice(index, 1)
        this.communicationsCountValue--
        this.cleanupMobileDetailRows()
        this.sortItems()
      }
    },

    onCommunicationDetails (communication) {
      this.sidebarCommunication = communication
      this.showCommunicationSidebar = true
    },

    isLiveCall,

    checkCommunicationChannels (communication) {
      if (!this.activeChannel) {
        return true
      }

      switch (communication.type) {
        case CommunicationTypes.CALL:
          return ['all', 'calls', 'voicemails'].includes(this.activeChannel.value)
        case CommunicationTypes.SMS:
          return ['all', 'messages'].includes(this.activeChannel.value)
        default:
          return true
      }
    },

    newCommunicationListener (communication) {
      const found = this.communicationsData.find(c => c.id === communication.id)

      if (!found) {
        const communicationMatchFilters = this.checkCommunicationChannels(communication) &&
          this.checkCommunicationMatchesSearch(this.searchQuery, communication) &&
          this.checkCommunicationMatchesFilters(this.channelClonedFilter, communication) &&
          this.checkCommunicationMatchesUserAccessibility(communication) &&
          this.checkCommunicationMatchesCampaign(this.channelClonedFilter.campaign_id, communication) &&
          this.checkCommunicationMatchesWorkflow(this.channelClonedFilter.workflow_id, communication) &&
          this.checkCommunicationMatchesUser(this.channelClonedFilter.user_id, communication) &&
          this.checkCommunicationMatchesRingGroup(this.channelClonedFilter.ring_group_id, communication)

        if (communicationMatchFilters) {
          // add to the top of the array
          this.communicationsData.unshift(communication)
          this.communicationsCountValue++
          this.sortItems()
        }
      }
    },

    updatedCommunicationListener (communication) {
      const index = this.communicationsData.findIndex(c => c.id === communication.id)

      if (index > -1) {
        // update it if present in the array
        this.communicationsData.splice(index, 1, communication)
        if (this.showCommunicationSidebar && this.sidebarCommunication?.id === communication.id) {
          this.sidebarCommunication = merge(this.sidebarCommunication, communication)
        }
        this.sortItems()
      } else {
        const communicationMatchFilters = this.checkCommunicationChannels(communication) &&
          this.checkCommunicationMatchesSearch(this.searchQuery, communication) &&
          this.checkCommunicationMatchesFilters(this.channelClonedFilter, communication) &&
          this.checkCommunicationMatchesUserAccessibility(communication) &&
          this.checkCommunicationMatchesCampaign(this.channelClonedFilter.campaign_id, communication) &&
          this.checkCommunicationMatchesWorkflow(this.channelClonedFilter.workflow_id, communication) &&
          this.checkCommunicationMatchesUser(this.channelClonedFilter.user_id, communication) &&
          this.checkCommunicationMatchesRingGroup(this.channelClonedFilter.ring_group_id, communication)

        if (communicationMatchFilters) {
          // add to the top of the array
          this.communicationsData.unshift(communication)
          this.communicationsCountValue++
          this.sortItems()
        }
      }
    },

    deletedCommunicationListener (communication) {
      const index = this.communicationsData.findIndex(c => c.id === communication.id)

      if (index > -1) {
        // remove it if found
        this.communicationsData.splice(index, 1)
        this.communicationsCountValue--
        this.cleanupMobileDetailRows()
        this.sortItems()
      }
    },

    openCommunicationDetailsPage (communication) {
      const route = this.$router.resolve({
        path: `/contacts/${communication.contact_id}/communications/${communication.id}`
      })
      window.open(route.href, '_blank')
    },

    onColumnsReordered (columns) {
      this.columns = columns
      this.saveColumns(columns)
    },

    toggleMobileDetails (row, event) {
      const currentRow = event.target.closest('tr')
      const tableBody = currentRow.parentElement
      const rowIndex = Array.from(tableBody.children).indexOf(currentRow)
      // Check if details row already exists
      let detailsRow = tableBody.querySelector(`tr[data-details-for="${row.id}"]`)
      if (detailsRow) {
        // If exists, remove it
        detailsRow.remove()
        this.communicationMobileDetailsOpened[row.id] = false
        return
      }

      // assign with spread operator to fix reactivity issues
      this.communicationMobileDetailsOpened = {
        ...this.communicationMobileDetailsOpened,
        [row.id]: true
      }

      // Create new details row
      detailsRow = document.createElement('tr')
      detailsRow.setAttribute('data-details-for', row.id)
      detailsRow.classList.add('mobile-details-row')
      // Create single cell that spans all columns
      const detailsCell = document.createElement('td')
      detailsCell.colSpan = this.columns.length

      // Create a div to mount the Vue component
      const mountPoint = document.createElement('div')
      detailsCell.appendChild(mountPoint)

      // Show all columns that are applied (except disposition_status2 and operations)
      const visibleColumns = this.columns.filter((c) => !['disposition_status2', 'operations'].includes(c.name))

      // Create and mount the Mobile details component
      const ComponentClass = Vue.extend(CommunicationsMobileRowDetails)
      const instance = new ComponentClass({
        propsData: {
          communication: row,
          visibleColumns
        },
        parent: this
      })

      instance.$on('on-filter', this.onFilter)
      instance.$on('on-details', this.onCommunicationDetails)

      instance.$mount(mountPoint)
      detailsRow.appendChild(detailsCell)

      // Insert after the current row
      tableBody.insertBefore(detailsRow, tableBody.children[rowIndex + 1])
    },

    cleanupMobileDetailRows () {
      if (this.isLoadingMore) {
        return
      }

      if (Object.keys(this.communicationMobileDetailsOpened).length) {
        this.communicationMobileDetailsOpened = {}
      }

      document.querySelectorAll('.mobile-details-row').forEach((e) => e.remove())
    },

    onSearchInputShowError (show) {
      this.showLimitCharactersError = show
    },

    sortItems (communications = this.communicationsData) {
      communications.sort((a, b) => {
        if (isLiveCall(a) && !isLiveCall(b)) {
          return -1
        }

        if (!isLiveCall(a) && isLiveCall(b)) {
          return 1
        }

        return b.communication_id - a.communication_id
      })
    }
  },

  created () {
    this.cancelToken = this.$axios.CancelToken
    this.source = this.cancelToken.source()
    this.columns = this.getSavedColumns()

    // live communications events listeners
    this.$VueEvent.listen('new_communication', this.newCommunicationListener)
    this.$VueEvent.listen('update_communication', this.updatedCommunicationListener)
    this.$VueEvent.listen('delete_communication', this.deletedCommunicationListener)
  },

  watch: {
    communications (newValue) {
      // copy and sort to avoid mutating the original object
      const newArr = [...newValue]
      this.sortItems(newArr)
      this.communicationsData = newArr
    },
    communicationsCount (newValue) {
      this.communicationsCountValue = newValue
    },
    isLoadingCommunications (newValue) {
      if (newValue) {
        this.cleanupMobileDetailRows()
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('new_communication', this.newCommunicationListener)
    this.$VueEvent.stop('update_communication', this.updatedCommunicationListener)
    this.$VueEvent.stop('delete_communication', this.deletedCommunicationListener)
  }
}
</script>
