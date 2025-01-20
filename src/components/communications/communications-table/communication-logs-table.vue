<template>
  <div class="communication-logs-container flex-grow-1 d-flex flex-column">
    <h3 class="title pl-3">
      {{ title }}
    </h3>
    <div class="filters pl-3">
      <div class="search">
        <search-input class="width-260"
                      limit-search-characters
                      :search="search"
                      :disabled="isLoadingDisabled"
                      data-testid="contacts-view-search-input"
                      @search="onSearch"
        />
      </div>

      <div class="setting pr-3 align-items-center">
        <div class="small text-muted fs-13 text-right">
          <template v-if="!isLoadingCommunicationsCount">
            {{ communicationsCount }} Communications
          </template>
          <q-skeleton type="text"
                      style="width: 80px"
                      v-else />
        </div>

        <hr role="separator"
            aria-orientation="vertical"
            class="contacts-header-separator q-separator height-28margin-auto position-relative q-separator q-separator--vertical"
        >

        <communications-filters class="ml-2 mr-3" />

        <compact-btn
          variant="primary"
          :compact="false"
          @clicked="changeTableSettingsVisibility(true)"
        >
          Table Settings
        </compact-btn>
      </div>
    </div>

    <q-table class="communication-logs-table flex-grow-1"
             row-key="index"
             virtual-scroll
             :data="communications"
             :columns="columns"
             :loading="isLoadingMore || isLoadingCommunications"
             :virtual-scroll-item-size="100"
             :virtual-scroll-sticky-size-start="100"
             :pagination="pagination"
             :rows-per-page-options="[0]"
             @virtual-scroll="onScroll"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td :props="props"
                :key="col.name"
                v-for="col in props.cols">
            <div v-if="col.name === 'disposition_status2'">
              <disposition :row="props.row"
                           :style="col.columnStyle"
                           @on-details="onCommunicationDetails"/>
            </div>
            <div :style="col.columnStyle"
                 v-else-if="col.name === 'incoming_number'">
              <div class="ellipse"
                   v-if="props.row?.campaign_id">
                {{ getCampaignName(props.row?.campaign_id) }}
              </div>
              <div>
                {{ col.value | fixPhone('NATIONAL', true) }}
              </div>
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'ring_group'">
              <ring-group :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'created_at'">
              <start-time :row="props.row"
                          :value="col.value" />
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
              <user :value="col.value" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'teams'">
              <communications-teams :teams="col.value" />
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
                 v-else-if="col.name === 'resolution2'">
              <resolution :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'lead_location'">
              <location :row="props.row" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'line'">
              <lines :value="props.row.campaign_id" />
            </div>

            <div :style="col.columnStyle"
                 v-else-if="col.name === 'attempting_users'">
              <attempting-users :row="props.row" />
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

            <div v-else-if="col.name === 'operations'">
              <communications-operations :row="props.row"
                                         @archived="removeCommunication"
                                         @terminated="removeCommunication" />
            </div>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:loading>
        <div class="d-flex justify-center">
          <q-spinner-bars color="primary"
                          size="30px" />
        </div>
      </template>
      <template v-slot:no-data>
        <div class="w-100 text-center"
             v-if="!isLoadingMore && !isLoadingCommunications">
          <h2> No data </h2>
        </div>
      </template>
    </q-table>

    <communications-details-sidebar :communication="sidebarCommunication"
                                    v-model="showCommunicationSidebar"/>

    <div class="d-flex align-items-center justify-content-center border-top flex-grow-0 overflow-x-hidden pt-3"
         v-if="paginated">
      <q-pagination class="table-pagination communication-logs-table-pagination"
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
      <q-select class="q-select-pager communication-logs-table-per-page-select"
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
import { aclMixin, communicationsMixin } from 'src/plugins/mixins'
import SearchInput from 'components/search-input'
import CompactBtn from 'components/compact-btn'
import CommunicationTableSettings from './communication-table-settings.vue'
import CommunicationsTags from './communications-tags.vue'
import CommunicationsTeams from './communications-teams.vue'
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
import Resolution from './resolution.vue'
import Location from './location.vue'
import Lines from './lines.vue'
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
import { mapState } from 'vuex'

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
    communicationsMixin
  ],

  components: {
    SearchInput,
    CompactBtn,
    CommunicationsFilters,
    CommunicationsOperations,
    CommunicationTableSettings,
    CommunicationsTags,
    CommunicationsTeams,
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
    Resolution,
    Location,
    Lines,
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
      'hasMoreCommunications'
    ])
  },

  data () {
    return {
      search: '',
      isLoadingDisabled: false,
      tableFields: ALL_COLUMNS,
      columns: DEFAULT_COLUMNS,
      searchFields: ['lead_number', 'contact.name'],
      source: null,
      cancelToken: null,
      paginated: false,
      showColumnHeadersModal: false,
      fixedColumns: [
        'disposition_status2',
        'incoming_number',
        'ring_group',
        'created_at',
        'talk_time',
        'duration',
        'contact',
        'user_id',
        'operations'
      ],
      expandedTeams: {},
      showCommunicationSidebar: false,
      sidebarCommunication: {}
    }
  },

  methods: {
    sort (sorts) {
      // Handle sorting logic here
      this.getCommunications(this.communicationFilters)
    },

    onSearch (value) {
      this.searchQuery = value
      this.paginationPage = 1

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

    async onScroll ({ to, ref }) {
      if (this.paginated) {
        return
      }

      const lastIndex = this.communications.length - 1

      if (
        !this.isLoadingMore &&
        this.hasMoreCommunications &&
        to === lastIndex &&
        to > 0
      ) {
        await this.loadMoreCommunications()
        ref.refresh()
      }
    },

    async loadMoreCommunications (done) {
      if (!this.isLoadingMore && this.hasMoreCommunications) {
        this.paginationPage += 1
        await this.getCommunications(this.communicationFilters, undefined, true)

        if (typeof done === 'function') {
          done()
        }
      } else {
        if (typeof done === 'function') {
          done()
        }
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

        const columns = JSON.parse(savedColumns)

        const hasAllFixedColumns = this.fixedColumns.every(name =>
          columns.some(col => col.name === name)
        )

        return hasAllFixedColumns ? columns : this.columns
      } catch (error) {
        return this.columns
      }
    },

    removeCommunication (communicationId) {
      const index = this.communicationsData.findIndex(communication => communication.id === communicationId)

      if (index) {
        this.communicationsData.splice(index, 1)
      }
    },

    onCommunicationDetails (communication) {
      this.sidebarCommunication = communication
      this.showCommunicationSidebar = true
    }
  },

  created () {
    this.cancelToken = this.$axios.CancelToken
    this.source = this.cancelToken.source()
    this.columns = this.getSavedColumns()
  }
}
</script>
