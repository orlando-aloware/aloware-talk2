<template>
  <div class="communication-logs-container flex-grow-1 d-flex flex-column">
    <h3 class="title pl-3">
      {{ title }}
    </h3>
    <div class="count  pl-3">
      <strong v-if="!isLoadingCommunicationsCount">{{ communicationsCount }} Communications</strong>
      <q-spinner-bars class="mr-1"
                      color="primary"
                      size="14px"
                      v-else />
    </div>
    <div class="filters  pl-3">
      <div class="search">
        <search-input class="width-260"
                      limit-search-characters
                      :search="search"
                      :disabled="isLoadingDisabled"
                      data-testid="contacts-view-search-input"
                      @search="onSearch" />
      </div>
      <div class="setting pr-3">
        <compact-btn variant="primary"
                     :compact="false"
                     @clicked="changeTableSettingsVisibility(true)">
          Table Settings
        </compact-btn>
      </div>
    </div>

    <q-table class="communication-logs-table flex-grow-1"
             row-key="index"
             virtual-scroll
             :data="communicationsData"
             :columns="columns"
             :loading="isLoadingMore || isLoading"
             :virtual-scroll-item-size="100"
             :virtual-scroll-sticky-size-start="100"
             :pagination="pagination"
             :rows-per-page-options="[0]"
             @virtual-scroll="onScroll">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td :props="props"
                :key="col.name"
                v-for="col in props.cols">
            <div v-if="col.name === 'disposition_status2'">
              <disposition :row="props.row" />
            </div>
            <div v-else-if="col.name === 'incoming_number'">
              <div v-if="props.row?.campaign_id">
                {{ getCampaignName(props.row?.campaign_id) }}
              </div>
              <div>
                {{ col.value | fixPhone('NATIONAL', true) }}
              </div>
            </div>

            <div v-else-if="col.name === 'ring_group'">
              <ring-group :row="props.row" />
            </div>

            <div v-else-if="col.name === 'created_at'">
              <start-time :row="props.row"
                          :value="col.value" />
            </div>
            <div v-else-if="col.name === 'talk_time'">
              <talk-time :row="props.row" />
            </div>

            <div v-else-if="col.name === 'wait_time'">
              <wait-time :row="props.row" />
            </div>

            <div v-else-if="col.name ==='hold_time'">
              <hold-time :row="props.row" />
            </div>

            <div v-else-if="col.name === 'contact'">
              <contact :row="props.row" />
            </div>

            <div v-else-if="col.name === 'user_id'">
              <user :value="col.value" />
            </div>

            <div v-else-if="col.name === 'teams'">
              <communications-teams :teams="col.value" />
            </div>

            <div v-else-if="col.name === 'broadcast'">
              <broadcast :value="props.row.broadcast_id" />
            </div>

            <div v-else-if="col.name === 'workflow'">
              <workflow :value="props.row.workflow_id" />
            </div>

            <div v-else-if="col.name === 'duration'">
              <duration :row="props.row" />
            </div>

            <div v-else-if="col.name === 'resolution2'">
              <resolution :row="props.row" />
            </div>

            <div v-else-if="col.name === 'lead_location'">
              <location :row="props.row" />
            </div>

            <div v-else-if="col.name === 'line'">
              <lines :value="props.row.campaign_id" />
            </div>

            <div v-else-if="col.name === 'attempting_users'">
              <attempting-users :row="props.row"/>
            </div>

            <div v-else-if="col.name === 'transfer_prior_user_ids'">
              <transferred prop="transfer_prior_user_ids"
                           :row="props.row" />
            </div>

            <div v-else-if="col.name === 'transfer_target_user_ids'">
              <transferred prop="transfer_target_user_ids"
                           :row="props.row" />
            </div>

            <div data-testid="cold-transfer-row"
                 v-else-if="col.name === 'in_cold_transfer'">
              <span>{{ props.row.in_cold_transfer ? 'Yes' : 'No' }}</span>
            </div>

            <div v-else-if="col.name === 'transfer_type'">
              <transfer-type :row="props.row" />
            </div>

            <div v-else-if="col.name === 'callback_status'">
              <callback-status :row="props.row" />
            </div>

            <div v-else-if="col.name === 'queue_resolution2'">
              <queue-resolution :row="props.row" />
            </div>

            <div data-testid="email-span"
                  class="break-word"
                  v-else-if="col.name === 'email'">
              <span>{{ props.row.contact?.email || '-' }}</span>
            </div>

            <div v-else-if="col.name === 'creator_type'">
              <creator-type :row="props.row" />
            </div>

            <template v-else-if="col.name === 'tags'">
              <communications-tags :communication="props.row"/>
            </template>

            <div v-else-if="col.name === 'notes'">
              <wallboard-calls-note :communication="props.row" />
            </div>

            <template v-else-if="col.name === 'csat_score'">
              <csat-score :row="props.row" />
            </template>

            <div v-else-if="col.name === 'operations'">
              <communications-operations :row="props.row"
                                         @archived="removeCommunication"
                                         @terminated="removeCommunication"/>
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
             v-if="!isLoadingMore && !isLoading">
          <h2> No data </h2>
        </div>
      </template>
    </q-table>

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
    WallboardCallsNote
  },

  data () {
    return {
      search: '',
      isLoadingDisabled: false,
      tableFields: [
        {
          label: '',
          name: 'disposition_status2',
          align: 'center',
          style: 'width: 105px'
        },
        {
          label: 'Number',
          name: 'incoming_number',
          align: 'left',
          style: 'width: 150px'
        },
        {
          label: 'Team',
          name: 'teams',
          align: 'left',
          style: 'width: 180px'
        },
        {
          label: 'Ring Group',
          name: 'ring_group',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Sequence',
          name: 'workflow',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Broadcast',
          name: 'broadcast',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Start Time',
          name: 'created_at',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Talk Time',
          name: 'talk_time',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Wait Time',
          name: 'wait_time',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Hold Time',
          name: 'hold_time',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Duration',
          name: 'duration',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Resolution',
          name: 'resolution2',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Contact',
          name: 'contact',
          align: 'left',
          style: 'width: 110px'
        },
        {
          label: 'Location',
          name: 'lead_location',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Lines',
          name: 'line',
          align: 'left',
          style: 'width: 100px'
        }, {
          label: 'User',
          name: 'user_id',
          align: 'left',
          style: 'width: 150px'
        },
        {
          label: 'Attempting',
          name: 'attempting_users',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Transferred From',
          name: 'transfer_prior_user_ids',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Transferred To',
          name: 'transfer_target_user_ids',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Cold Transferred?',
          name: 'in_cold_transfer',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Transfer Type',
          name: 'transfer_type',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Callback Status',
          name: 'callback_status',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Queue Resolution',
          name: 'queue_resolution2',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Email',
          name: 'email',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Creator Type',
          name: 'creator_type',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Tags',
          name: 'tags',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Notes',
          name: 'notes',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'CSAT Score',
          name: 'csat_score',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Operations',
          name: 'operations',
          align: 'center',
          style: 'width: 100px'
        }
      ],
      columns: [
        {
          name: 'disposition_status2',
          field: 'disposition_status2',
          label: '',
          align: 'center',
          style: 'width: 105px'
        },
        {
          label: 'Number',
          name: 'incoming_number',
          field: 'incoming_number',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Ring Group',
          name: 'ring_group',
          field: 'ring_group',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Start Time',
          name: 'created_at',
          field: 'created_at',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Talk Time',
          name: 'talk_time',
          field: 'talk_time',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Duration',
          name: 'duration',
          field: 'duration',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Contact',
          name: 'contact',
          field: 'lead_number',
          align: 'left',
          style: 'width: 150px'
        },
        {
          label: 'User',
          name: 'user_id',
          field: 'user_id',
          align: 'left',
          style: 'width: 100px'
        },
        {
          label: 'Operations',
          name: 'operations',
          align: 'center',
          style: 'width: 100px'
        }
      ],
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
      expandedTeams: {}
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
      this.getCommunications(this.communicationFilters)
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

      const lastIndex = this.communicationsData.length - 1
      if (!this.isLoadingMore && this.paginationPage < this.lastPage && to === lastIndex) {
        await this.loadMoreCommunications()
        ref.refresh()
      }
    },

    async loadMoreCommunications (done) {
      if (!this.isLoadingMore && this.paginationPage < this.lastPage) {
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
    }
  },

  created () {
    this.cancelToken = this.$axios.CancelToken
    this.source = this.cancelToken.source()
    this.columns = this.getSavedColumns()
  },

  mounted () {
    if (this.hasPermissionTo('list communication')) {
      this.getCommunications(this.communicationFilters)
    }
  }
}
</script>
