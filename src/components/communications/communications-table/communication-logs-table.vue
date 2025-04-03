<template>
  <div class="talk-table-container flex-grow-1 d-flex flex-column">
    <h3 class="title pl-3">
      {{ title }}
    </h3>
    <div class="filters pl-3 d-flex flex-column flex-sm-row gap-3">
      <div class="search flex-grow-1">
        <search-input class="w-100"
                      limit-search-characters
                      :search="searchQuery"
                      :disabled="isLoadingDisabled"
                      data-testid="contacts-view-search-input"
                      @search="onSearch" />
      </div>

      <div class="setting d-flex align-items-center flex-column flex-sm-row w-100 w-sm-auto gap-3 align-items-sm-center">
        <div class="small text-muted fs-13 order-1 order-sm-1">
          <template v-if="!isLoadingCommunicationsCount">
            {{ communicationsCountValue }} Communications
          </template>
          <q-skeleton type="text"
                      style="width: 80px"
                      v-else />
        </div>

        <div class="d-flex align-items-center justify-content-center justify-content-sm-start gap-3 order-0 order-sm-2 ml-sm-4">
          <communications-filters />
        </div>

        <div class="d-flex align-items-center justify-content-center order-2 order-sm-3 ml-sm-4 mr-sm-2">
          <compact-btn variant="primary"
                       :compact="false"
                       @clicked="changeTableSettingsVisibility(true)">
            Table Settings
          </compact-btn>
        </div>
      </div>
    </div>

    <q-table class="talk-table flex-grow-1"
             row-key="index"
             virtual-scroll
             hide-bottom
             :data="communicationsData"
             :columns="columns"
             :loading="isLoadingMore || isLoadingCommunications"
             :virtual-scroll-item-size="80"
             :virtual-scroll-sticky-size-start="48"
             :pagination="pagination"
             :rows-per-page-options="[0]"
             @virtual-scroll="onScroll">
      <template v-slot:body="props">
        <q-tr :props="props"
              :class="{'live-call-tr': isLiveCall(props.row)}">
          <q-td :props="props"
                :key="col.name"
                v-for="col in props.cols">
            <div v-if="col.name === 'disposition_status2'">
              <disposition :row="props.row"
                           :style="col.columnStyle"
                           :is-live-call="isLiveCall(props.row)"
                           @on-details="onCommunicationDetails"/>
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'incoming_number'">
              <incoming-number :row="props.row"
                               :campaign-id="props.row.campaign_id"
                               @on-filter="onFilter"/>
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'body'">
              <message-body :style="col.columnStyle"
                            :communication="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'ring_group'">
              <ring-group :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'created_at'">
              <start-time :row="props.row" />
            </div>
            <div :style="col.columnStyle"
                 v-else-if="col.name === 'talk_time'">
              <talk-time :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'wait_time'">
              <wait-time :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'hold_time'">
              <hold-time :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'contact'">
              <contact :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'user_id'">
              <user :row="props.row"
                    @on-filter="onFilter"/>
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'broadcast'">
              <broadcast :value="props.row.broadcast_id" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'workflow'">
              <workflow :value="props.row.workflow_id" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'duration'">
              <duration :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'attempting_users'">
              <attempting-users expand-on-hover
                                :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'transfer_prior_user_ids'">
              <transferred prop="transfer_prior_user_ids"
                           :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'transfer_target_user_ids'">
              <transferred prop="transfer_target_user_ids"
                           :row="props.row" />
            </div>

            <div data-testid="cold-transfer-row"
                 :style="col.columnStyle"
                 v-else-if="col.name === 'in_cold_transfer'">
              <span>{{ props.row.in_cold_transfer ? 'Yes' : 'No' }}</span>
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'transfer_type'">
              <transfer-type :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'callback_status'">
              <callback-status :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'queue_resolution2'">
              <queue-resolution :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'creator_type'">
              <creator-type :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'tags'">
              <communications-tags :communication="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'notes'">
              <wallboard-calls-note ellipse
                                    :style="col.columnStyle"
                                    :communication="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'csat_score'">
              <csat-score :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'operations'">
              <communications-operations :row="props.row"
                                         @on-details="openCommunicationDetailsPage"
                                         @archived="removeCommunication"
                                         @terminated="removeCommunication" />
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <div class="talk-table--no-data h5"
         v-if="!communicationsData.length && !isLoadingMore && !isLoadingCommunications">
      No communications found based on the current filters
    </div>

    <communications-details-sidebar :communication="sidebarCommunication"
                                    v-model="showCommunicationSidebar"/>

    <div class="d-flex align-items-center justify-content-center border-top flex-grow-0 overflow-x-hidden pt-3"
         v-if="paginated">
      <q-pagination class="table-pagination talk-table-pagination"
                    padding="0 5px"
                    boundary-links
                    direction-links
                    dense
                    data-testid="datatable-pagination"
                    :max="lastPage"
                    :max-pages="maxPaginationPages"
                    :ellipses="false"
                    :boundary-numbers="false"
                    v-model="paginationPage"
                    @input="updatePaginationButtons" />
      <q-select class="q-select-pager talk-table-per-page-select"
                option-value="value"
                option-label="label"
                outlined
                dense
                emit-value
                data-testid="datatable-per-page-select"
                :options="perPageOptions"
                :display-value="`${perPage} per page`"
                v-model="perPage" />
    </div>

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
    CommunicationsDetailsSidebar
  },

  computed: {
    ...mapState('communications', [
      'activeChannel',
      'hasMoreCommunications',
      'channelClonedFilter'
    ])
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
      communicationsCountValue: 0
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

    async onScroll ({ index, ref }) {
      if (this.isLoadingCommunications || this.isLoadingMore) {
        return
      }

      const lastIndex = this.communicationsData.length - 1

      if (
        this.hasMoreCommunications &&
        index === lastIndex &&
        index > 0
      ) {
        await this.loadMoreCommunications()
        ref.refresh()
      }
    },

    async loadMoreCommunications () {
      if (this.hasMoreCommunications && !this.isLoadingMore && !this.isLoadingCommunications) {
        await this.getCommunications(this.communicationFilters, undefined, true)
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
        }
      }
    },

    deletedCommunicationListener (communication) {
      const index = this.communicationsData.findIndex(c => c.id === communication.id)

      if (index > -1) {
        // remove it if found
        this.communicationsData.splice(index, 1)
        this.communicationsCountValue--
      }
    },

    openCommunicationDetailsPage (communication) {
      const route = this.$router.resolve({
        path: `/contacts/${communication.contact_id}/communications/${communication.id}`
      })
      window.open(route.href, '_blank')
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
      this.communicationsData = newValue
    },
    communicationsCount (newValue) {
      this.communicationsCountValue = newValue
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('new_communication', this.newCommunicationListener)
    this.$VueEvent.stop('update_communication', this.updatedCommunicationListener)
    this.$VueEvent.stop('delete_communication', this.deletedCommunicationListener)
  }
}
</script>
