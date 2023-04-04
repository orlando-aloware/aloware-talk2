<template>
  <div class="calls__table">
    <datatable paginated
               show-pagination
               sticky-headers
               use-empty-slot
               custom-class="pr-3"
               scroll-area-class="scroll-type-2"
               :columns="filteredColumns"
               :is-empty="filteredCalls.length === 0"
               :total-rows="filteredCalls.length"
               :current-page="pagination.page"
               :last-page="lastPage"
               @paginated="onPaginated"
               @sort="onSort">
      <template #tbody>
        <tr class="datatable-row"
            :key="`${index}`"
            v-for="(call, index) in paginatedCalls">
          <template v-for="(column, colIndex) in filteredColumns">
            <!-- icon -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'disposition'">
              <router-link :to="{ name: 'Communication', params: {contactId: call.contact_id, communicationId: call.id }}">
                  <component :is="stateToIcon(call.disposition_status2, call.type, call.direction, call.callback_status)"
                             v-if="call.disposition_status2">
                  </component>
                  <q-tooltip>
                    {{ dispositionTooltipData(call.disposition_status2, call.type, call.direction) }}
                  </q-tooltip>
              </router-link>
            </td>

            <!-- line ? -->

            <!-- incoming number -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'incoming_number'">
              <div class="row">
                <div class="col-12 mb-1">
                  <!-- FIXME: link to campaign -->
                  {{ getCampaign(call.campaign_id) }}
                </div>
                <div class="col-12">
                  {{ call.incoming_number | fixPhone }}
                </div>
              </div>
            </td>

            <!-- ring group -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'ring_group'">
              <!-- FIXME: link to RG -->
              {{ getRingGroup(call.ring_group_id) }}
            </td>

            <!-- sequence -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'workflow'">
              <!-- FIXME: link to workflow -->
              {{ getWorkflow(call.workflow_id) }}
            </td>

            <!-- start time -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'start'">
              <span class="text-greyish">
                {{ call.created_at | fixFullDateTime }}
              </span>
                <div class="d-flex align-items-center justify-content-left"
                v-if="call.call_disposition_id">
                  <i class="fa fa-bolt"
                    :style="{ color: callDispositionColor(call.call_disposition_id) }"></i>
                  <span class="ml-1">{{ callDispositionName(call.call_disposition_id) }}</span>
                </div>
            </td>

            <!-- wait time -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'wait_time'">
                <span v-if="![CommunicationTypes.SMS, CommunicationTypes.EMAIL].includes(call.type)">
                  {{ call.wait_time | fixDuration }}
                </span>
                <span v-else>
                  --
                </span>
            </td>

            <!-- talk time -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'talk_time'">
              <div class="d-flex flex-column"
                   v-if="[CommunicationTypes.CALL].includes(call.type)">
                <span v-if="call.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW && call.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW">
                  {{ call.talk_time | fixDuration }}
                </span>
                <relative-time :from-time="call.created_at"
                                v-else-if="call.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW && call.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW">
                </relative-time>
              </div>
              <div class="d-flex align-items-center justify-content-left">
                <span>{{ getVisibleStatus(call) }}</span>
              </div>
            </td>

            <!-- duration -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'duration'">
              <div class="d-flex flex-column">
                <span>
                  {{ call.duration | fixDuration }}
                </span>
                <span>
                  {{ getVisibleStatus(call) }}
                </span>
              </div>
            </td>

            <!-- contact -->
            <td class="calls__table__contact"
                :key="`col-${colIndex}`"
                v-if="column.name === 'lead_number'">
              <div class="d-flex">
                <div class="d-flex flex-column justify-center flex-grow-1">
                  <!-- contact with link -->
                  <router-link :to="{ path: `/contacts/${call.contact_id}` }"
                              v-if="call.contact">
                    {{ call.contact.name | capitalize }}
                  </router-link>

                  <!-- lead number -->
                  <div class="d-flex align-items-center">
                    <span>
                      {{ call.lead_number | fixPhone }}
                    </span>
                    <q-badge color="success"
                            class="rounded-badge bordered ml-1"
                            v-if="call.first_time_caller"/>
                  </div>

                  <!-- disposition -->
                  <div class="d-flex align-items-center">
                    <i class="material-icons"
                      :style="{ color: dispositionStatusColor(call.contact.disposition_status_id) }">
                      label
                    </i>
                    <span class="ml-1 text-grey-900">
                      {{ dispositionStatusName(call.contact.disposition_status_id) }}
                    </span>
                  </div>

                  <!-- company -->
                  <div class="d-flex align-items-center">
                    <i class="material-icons">business_center</i>
                    <span class="ml-1">{{ call.contact.company_name }}</span>
                  </div>
                </div>

                <!-- tags -->
                <div class="calls__table__contact__tags flex-grow-1 d-flex flex-column"
                     v-if="call.contact && call.contact.tags && call.contact.tags.length">
                  <div v-for="tag in getLastTags(call.contact.tags)"
                       :key="tag.id"
                       class="d-flex align-items-center text-xs">
                    <i class="fa fa-circle"
                       :style="{ color: tag.color }"></i>
                    <span class="ml-1 mb-1">{{ tag.name }}</span>
                  </div>
                  <div class="d-flex justify-center"
                       v-if="call.contact.tags.length > 3">
                    <span>...</span>
                  </div>
                </div>
              </div>
            </td>
          </template>
        </tr>
      </template>

      <template #empty>
        <div class="empty-state"
             v-if="filteredCalls.length === 0">
          <div class="h5">
            No calls found based on the current filters
          </div>
        </div>
      </template>
    </datatable>
  </div>
</template>

<script>
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import Datatable from 'src/components/datatable.vue'
import RelativeTime from 'src/components/relative-time.vue'
import { COLUMNS } from 'src/constants/wallboard/calls-columns'
import { aclMixin, callDispositionMixin, communicationInfoMixin, contactDispositionMixin } from 'src/plugins/mixins'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'wallboard-calls-table',

  mixins: [
    aclMixin,
    callDispositionMixin,
    communicationInfoMixin,
    contactDispositionMixin
  ],

  components: {
    Datatable,
    RelativeTime
  },

  props: {
    calls: {
      type: Array,
      required: true
    },

    filters: {
      agent: {
        type: String,
        default: null
      },
      ringGroup: {
        type: Number,
        default: null
      }
    }
  },

  computed: {
    ...mapGetters('wallboard', {
      enabledColumns: 'getCallsEnabledColumns'
    }),

    ...mapState([
      'campaigns',
      'ringGroups',
      'workflows'
    ]),

    filteredColumns () {
      return COLUMNS.filter(column => this.enabledColumns.includes(column.name))
    },

    paginatedCalls () {
      let from = this.pagination.perPage * (this.pagination.page - 1)
      let to = from + this.pagination.perPage
      let calls = this.orderedCalls

      // use reversed list if order is desc
      if (this.sort.order === 'desc') {
        calls.slice().reverse()
      }

      return calls.filter((call, index) => index >= from && index < to)
    },

    orderedCalls () {
      let calls = this.filteredCalls

      return calls.sort((a, b) => {
        let condition = null

        // use a different rule based on order field
        // switch (this.sort.orderBy) {
        //   case 'id':
        //     condition = a.id > b.id
        //     break
        //   case 'name':
        //     condition = a.name > b.name
        //     break
        //   case 'status':
        //     // use status names
        //     let nameA = LABELS.find(status => status.value === a.agent_status) || {}
        //     let nameB = LABELS.find(status => status.value === b.agent_status) || {}

        //     condition = nameA.label > nameB.label
        //     break
        //   case 'status-duration':
        //     condition = a.last_agent_status_change && b.last_agent_status_change
        //       ? a.last_agent_status_change < b.last_agent_status_change // compare values if both are present
        //       : !a.last_agent_status_change // use inverted logic otherwise

        //     break
        //   case 'last-login':
        //     condition = a.last_login && b.last_login
        //       ? a.last_login < b.last_login // compare values if both are present
        //       : !a.last_login // use inverted logic otherwise

        //     break
        //   case 'last-updated':
        //     condition = a.updated_at < b.updated_at

        //     break
        // }

        return this.sort.order === 'asc'
          ? condition > 0 ? 1 : -1
          : condition > 0 ? -1 : 1
      })
    },

    filteredCalls () {
      return this.calls.filter(call => {
        // agent name filter
        // const name = !this.filters.agent
        //   ? true
        //   : user.name.toUpperCase().includes(this.filters.agent.toUpperCase())

        // // ring group filter
        // const ringGroup = !this.filters.ringGroup
        //   ? true
        //   : user.ring_group_ids.includes(this.filters.ringGroup)

        // return name && ringGroup
        return true
      })
    },

    lastPage () {
      return Math.ceil(this.filteredCalls.length / this.pagination.perPage)
    }
  },

  data: () => ({
    pagination: {
      page: 1,
      perPage: 25
    },
    sort: {
      orderBy: 'id',
      order: 'asc'
    },
    CommunicationCurrentStatus,
    CommunicationDispositionStatus,
    CommunicationTypes
  }),

  methods: {
    onPaginated (pageData) {
      this.pagination = {
        page: pageData.page,
        perPage: pageData.per_page
      }
    },

    onSort (sortData) {
      this.sort = sortData
    },

    getCampaign (campaignId) {
      return this.campaigns.find(campaign => campaign.id === campaignId)?.name
    },

    getRingGroup (ringGroupId) {
      return this.ringGroups.find(rg => rg.id === ringGroupId)?.name || '--'
    },

    getWorkflow (worfkflowId) {
      return this.workflows.find(workflow => workflow.id === worfkflowId)?.name || '--'
    },

    getVisibleStatus (communication) {
      if (communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) {
        return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateCurrentStatusText(communication.current_status2)))
      }

      return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateDispositionStatusText(communication.disposition_status2)))
    },

    getLastTags (tags, count = 3) {
      if (!tags.length) {
        return []
      }

      if (tags.length < count) {
        return tags.slice().reverse()
      }

      return tags.slice(-1 * count)
    }
  }
}
</script>
