<template>
  <div class="calls__table">
    <datatable paginated
               show-pagination
               sticky-headers
               use-empty-slot
               custom-class="pr-3"
               scroll-area-class="scroll-type-2"
               :columns="filteredColumns"
               :is-empty="calls.length === 0"
               :total-rows="calls.length"
               :current-page="pagination.page"
               :last-page="lastPage"
               @paginated="onPaginated"
               @reordered="onColumnsReordered"
               @sort="onSort">
      <template #tbody>
        <template v-for="(call, index) in paginatedCalls">
          <tr class="datatable-row"
              :key="`${index}`">
            <template v-for="(column, colIndex) in filteredColumns">
              <!-- colapse button-->
              <td :class="['calls__table__collapse pl-3', { 'calls__table__collapse--collapsed': expandedItem === index }]"
                  :key="`col-${colIndex}`"
                  v-if="column.name === 'details'">
                <span class="cursor-pointer"
                      @click="setExpandedItem(index)">
                  <i class="material-icons">arrow_forward_ios</i>
                  <q-tooltip>
                    {{ expandedItem !== index ? 'See details' : 'Hide details' }}
                  </q-tooltip>
                </span>
              </td>

              <!-- icon -->
              <td class="pl-3"
                  :key="`col-${colIndex}`"
                  v-if="column.name === 'disposition'">
                <router-link :to="{ name: 'Communication', params: { contactId: call.contact_id, communicationId: call.id }}">
                    <component :is="stateToIcon(call.disposition_status2, call.type, call.direction, call.callback_status)"
                               v-if="call.disposition_status2">
                    </component>
                    <q-tooltip>
                      {{ dispositionTooltipData(call.disposition_status2, call.type, call.direction, call.callback_status) }}
                    </q-tooltip>
                </router-link>
              </td>

              <!-- incoming number -->
              <td :key="`col-${colIndex}`"
                  v-if="column.name === 'incoming_number'">
                <div class="d-flex flex-column">
                  <div class="mb-1">
                    <a :href="getCampaignURL(call.campaign_id)"
                       target="_blank"
                       v-if="hasRole('Company Admin') && getCampaign(call.campaign_id)">
                      {{ getCampaign(call.campaign_id) }}
                    </a>
                    <span v-else>
                      {{ getCampaign(call.campaign_id) || '--' }}
                    </span>
                  </div>
                  <div>
                    {{ call.incoming_number | fixPhone }}
                  </div>
                </div>
              </td>

              <!-- ring group -->
              <td :key="`col-${colIndex}`"
                  v-if="column.name === 'ring_group'">
                <a :href="getRingGroupURL(call.ring_group_id)"
                   target="_blank"
                   v-if="hasRole('Company Admin') && getRingGroup(call.ring_group_id)">
                  {{ getRingGroup(call.ring_group_id) }}
                </a>
                <span v-else>
                  {{ getRingGroup(call.ring_group_id) || '--' }}
                </span>
              </td>

              <!-- workflow -->
              <td :key="`col-${colIndex}`"
                  v-if="column.name === 'workflow'">
                <a :href="getWorkflowURL(call.workflow_id)"
                   target="_blank"
                   v-if="hasRole('Company Admin') && getWorkflow(call.workflow_id)">
                  {{ getWorkflow(call.workflow_id) }}
                </a>
                <span v-else>
                  {{ getWorkflow(call.workflow_id) || '--' }}
                </span>
              </td>

              <!-- start time -->
              <td :key="`col-${colIndex}`"
                  v-if="column.name === 'start'">
                <span>
                  {{ call.created_at | fixFullDateTime }}
                </span>
                <div class="d-flex align-items-center justify-content-left"
                     v-if="call.call_disposition_id">
                  <i class="fa fa-bolt"
                     :style="{ color: callDispositionColor(call.call_disposition_id) }"/>
                  <span class="ml-1">{{ callDispositionName(call.call_disposition_id) }}</span>
                </div>
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

              <!-- contact -->
              <td class="calls__table__contact"
                  :key="`col-${colIndex}`"
                  v-if="column.name === 'lead_number'">
                <div class="d-flex">
                  <div class="d-flex flex-column justify-center flex-grow-1">
                    <!-- contact with link -->
                    <router-link :to="{ path: `/contacts/${call.contact_id}` }"
                                 class="mb-1"
                                 v-if="call.contact">
                      {{ call.contact.name | capitalize }}
                    </router-link>

                    <!-- lead number -->
                    <div class="d-flex align-items-center mb-1">
                      <span>
                        {{ call.lead_number | fixPhone }}
                      </span>
                      <q-badge color="success"
                               class="rounded-badge bordered ml-1"
                               v-if="call.first_time_caller">
                        <q-tooltip>First time caller</q-tooltip>
                      </q-badge>
                    </div>

                    <!-- disposition -->
                    <div class="d-flex align-items-center mb-1">
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
                      <span class="ml-1">
                        {{ call.contact.company_name }}
                      </span>
                    </div>
                  </div>

                  <!-- tags -->
                  <div class="calls__table__contact__tags flex-grow-1 d-flex flex-column ml-1"
                       v-if="call.contact && call.contact.tags && call.contact.tags.length">
                    <div class="d-flex align-items-center mb-1"
                         :key="tag.id"
                         v-for="tag in getLastTags(call.contact.tags)">
                      <i class="fa fa-circle"
                         :style="{ color: tag.color }"/>
                      <span class="ml-1">{{ tag.name }}</span>
                    </div>
                    <div class="d-flex justify-center"
                         v-if="call.contact.tags.length > 3">
                      <span>...</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- location -->
              <td :key="`col-${colIndex}`"
                  v-if="column.name === 'lead_location'">
                <span v-if="call.state">
                  {{ getLocation(call) }}
                </span>
                <span v-else>--</span>
              </td>

              <!-- attempting -->
              <td :key="`col-${colIndex}`"
                  v-if="column.name === 'attempting_users'">
                <span v-if="call.attempting_users && call.attempting_users.length > 0">
                  <ul class="list list-unstyled inset mb-0">
                    <div v-if="!showMoreList.includes(call.id)">
                      <li class="pb-1"
                          :key="attemptingUser"
                          v-for="attemptingUser in getAttemptingUsers(call, 3)">
                        <a :href="getUserActivityURL(attemptingUser)"
                           target="_blank"
                           v-if="hasRole('Company Admin')">
                          <span :class="getAttemptingClass(attemptingUser, call.disposition_status2, call.user_id)"
                                :title="getUserName(getUser(attemptingUser))">
                            {{ getUserName(getUser(attemptingUser)) }}
                          </span>
                        </a>
                        <span v-else>
                          {{ getUserName(getUser(attemptingUser)) }}
                        </span>
                      </li>
                    </div>
                    <div v-else>
                      <li class="pb-1"
                          :key="attemptingUser"
                          v-for="attemptingUser in getAttemptingUsers(call)">
                        <a :href="getUserActivityURL(attemptingUser)"
                           target="_blank"
                           v-if="hasRole('Company Admin')">
                            <span :class="getAttemptingClass(attemptingUser, call.disposition_status2, call.user_id)"
                                  :title="getUserName(getUser(attemptingUser))">
                            {{ getUserName(getUser(attemptingUser)) }}
                          </span>
                        </a>
                        <span v-else>
                          {{ getUserName(getUser(attemptingUser)) }}
                        </span>
                      </li>
                    </div>
                    <a class="d-flex btn align-items-center justify-content-center text-muted text-sm"
                       v-if="call.attempting_users.length > 3"
                       @click="showMore(call)">
                      {{ !showMoreList.includes(call.id) ? 'more ...' : 'less'}}
                    </a>
                  </ul>
                </span>
                <span v-else>
                  -
                </span>
              </td>

              <!-- user -->
              <td class="calls__table__user"
                  :key="`col-${colIndex}`"
                  v-if="column.name === 'user'">
                <router-link :to="{ name: 'Communication', params: {contactId: call.contact_id, communicationId: call.id }}"
                             v-if="call.rejected_by_app !== 0">
                  <q-icon class="status-icon d-inline-block text-danger"
                          :state="call.rejected_by_app"
                          :name="rejectionToIcon(call.rejected_by_app)">
                    <q-tooltip>
                      {{ rejectionTooltipData(call.rejected_by_app, call.type) }}
                    </q-tooltip>
                  </q-icon>
                </router-link>
                <div v-else-if="call.user_id && getUser(call.user_id)">
                  <a :href="getUserURL(call.user_id)"
                      target="_blank"
                      v-if="hasRole('Company Admin')">{{ getUserName(getUser(call.user_id)) }}</a>
                  <span v-else>{{ getUserName(getUser(call.user_id)) }}</span>
                </div>
                <div v-else>
                  <span>--</span>
                </div>
              </td>

              <!-- callback status -->
              <td :key="`col-${colIndex}`"
                  v-if="column.name === 'callback_status'">
                <span>
                  {{ call.callback_status | translateCallbackStatusText }}
                </span>
              </td>

              <!-- tags -->
              <td class="calls__table__tags"
                  :key="`col-${colIndex}`"
                  v-if="column.name === 'tags'">
                <communication-tags :communication="call"
                                    :height="300" />
              </td>

              <!-- notes -->
              <td class="calls__table__notes"
                  :key="`col-${colIndex}`"
                  v-if="column.name === 'notes'">
                <wallboard-calls-note :communication="call" />
              </td>

              <!-- operations -->
              <td :key="`col-${colIndex}`"
                  v-if="column.name === 'operations'">
                <!-- unpark -->
                <unpark-communication-button class="ml-2"
                                             :communication="call"
                                             v-if="isParkedCall(call)" />

                <!-- go to messages -->
                <router-link :to="{ path: `/contacts/${call.contact_id}` }"
                              v-if="call.contact && call.type === CommunicationTypes.SMS && hasPermissionTo('send sms')">
                  <button class="btn btn-sm btn-primary">
                    <i class="material-icons">reply</i>
                    <q-tooltip>Reply</q-tooltip>
                  </button>
                </router-link>

                <!-- go to comm info -->
                <router-link :to="{ name: 'Communication', params: {contactId: call.contact_id, communicationId: call.id }}">
                  <information-circle-icon class="ml-2"
                                           height="24"
                                           width="24" />
                  <q-tooltip>More Details</q-tooltip>
                </router-link>

                <!-- terminate -->
                <terminate-communication-button class="ml-2"
                                                :communication="call" />

                <!-- barge -->
                <barge-communication-button class="ml-2"
                                            :communication="call" />

                <!-- whisper -->
                <whisper-communication-button class="ml-2"
                                              :communication="call" />
              </td>
            </template>
          </tr>

          <!-- collapsed data -->
          <tr :key="`collapse-${index}`">
            <td class="p-0"
                :colspan="filteredColumns.length">
              <transition name="vertical-collapse"
                          mode="out-in">
                <div class="d-flex p-2"
                     v-if="expandedItem === index">
                  <div class="flex-grow-1 d-flex flex-column justify-content-center"
                       v-if="call.contact">
                    <span>
                      {{ call.contact.name | capitalize }}
                    </span>
                    <span>
                      {{ call.lead_number | fixPhone }}
                    </span>
                    <span v-if="call.state">
                      {{ call.city || '' }}{{ (call.city && call.state) ? ', ' : '' }}{{ call.state }}
                    </span>
                  </div>
                  <div class="flex-grow-1"
                       v-if="call.type === CommunicationTypes.CALL">
                    <target-users-tree :communication="call"/>
                  </div>
                </div>
              </transition>
            </td>
          </tr>
        </template>
      </template>

      <template #empty>
        <div class="empty-state"
             v-if="calls.length === 0">
          <div class="h5">
            No {{ $route.params.id }} calls found based on the current filters
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
import BargeCommunicationButton from 'src/components/communication/barge-communication-button.vue'
import CommunicationTags from 'src/components/generic-selectors/communication-tags.vue'
import Datatable from 'src/components/datatable.vue'
import InformationCircleIcon from 'src/components/icons/information-circle-icon.vue'
import RelativeTime from 'src/components/relative-time.vue'
import TargetUsersTree from 'src/components/target-users-tree.vue'
import TerminateCommunicationButton from 'src/components/communication/terminate-communication-button.vue'
import UnparkCommunicationButton from 'src/components/communication/unpark-communication-button.vue'
import WallboardCallsNote from 'src/components/wallboard/wallboard-calls-note.vue'
import WhisperCommunicationButton from 'src/components/communication/whisper-communication-button.vue'
import { COLUMNS } from 'src/constants/wallboard/calls-columns'
import { isParkedCall } from 'src/plugins/helpers/functions'
import {
  aclMixin,
  callDispositionMixin,
  classicMixin,
  communicationInfoMixin,
  contactDispositionMixin,
  userMixin
} from 'src/plugins/mixins'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'wallboard-calls-table',

  mixins: [
    aclMixin,
    callDispositionMixin,
    classicMixin,
    communicationInfoMixin,
    contactDispositionMixin,
    userMixin
  ],

  components: {
    BargeCommunicationButton,
    CommunicationTags,
    Datatable,
    InformationCircleIcon,
    RelativeTime,
    TargetUsersTree,
    TerminateCommunicationButton,
    UnparkCommunicationButton,
    WallboardCallsNote,
    WhisperCommunicationButton
  },

  props: {
    calls: {
      type: Array,
      required: true
    }
  },

  computed: {
    ...mapGetters('wallboard', {
      enabledColumns: 'getCallsEnabledColumns'
    }),

    ...mapGetters('auth', [
      'profile'
    ]),

    ...mapState([
      'campaigns',
      'ringGroups',
      'workflows'
    ]),

    filteredColumns () {
      return this.columns.filter(column => (!column.exclude || !column.exclude.includes(this.$route.params.id)) && this.enabledColumns.includes(column.name))
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
      let calls = this.calls

      return calls.sort((a, b) => {
        let condition = null

        // use a different rule based on order field
        switch (this.sort.orderBy) {
          case 'incoming_number':
            condition = a.incoming_number > b.incoming_number
            break
          case 'ring_group':
            const ringGroupA = this.getRingGroup(a.ring_group_id)
            const ringGroupB = this.getRingGroup(b.ring_group_id)

            condition = ringGroupA > ringGroupB
            break
          case 'workflow':
            const workflowA = this.getWorkflow(a.workflow_id)
            const workflowB = this.getWorkflow(b.workflow_id)

            condition = workflowA > workflowB
            break
          case 'start':
            condition = a.created_at < b.created_at
            break
          case 'talk_time':
            condition = a.talk_time > b.talk_time
            break
          case 'lead_number':
            condition = (a.contact?.name || a.lead_number) > (b.contact?.name || b.lead_number)
            break
          case 'lead_location':
            condition = (a.city + a.state) > (b.city + b.state)
            break
          case 'user':
            condition = this.getUserName(this.getUser(a.user_id)) > this.getUserName(this.getUser(b.user_id))
            break
        }

        return this.sort.order === 'asc'
          ? condition > 0 ? 1 : -1
          : condition > 0 ? -1 : 1
      })
    },

    lastPage () {
      return Math.ceil(this.calls.length / this.pagination.perPage)
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
    columns: COLUMNS,
    expandedItem: null,
    showMoreList: [],
    CommunicationCurrentStatus,
    CommunicationDispositionStatus,
    CommunicationTypes
  }),

  methods: {
    isParkedCall,

    onPaginated (pageData) {
      this.pagination = {
        page: pageData.page,
        perPage: pageData.per_page
      }
    },

    onSort (sortData) {
      this.sort = sortData
    },

    onColumnsReordered (columns) {
      this.filteredColumns.forEach((oldColumn, index) => {
        // find the index of this column in the new order
        const newColumn = columns[index]

        // if they are equal means that this column wasnt changed
        if (oldColumn.name === newColumn.name) {
          return
        }

        // find the newColumn index in the all columns container
        const newIndex = this.columns.findIndex(col => col.name === newColumn.name)

        // move the column to the new place
        this.columns.splice(newIndex, 1, oldColumn)
      })
    },

    getCampaign (campaignId) {
      return this.campaigns.find(campaign => campaign.id === campaignId)?.name || null
    },

    getRingGroup (ringGroupId) {
      return this.ringGroups.find(rg => rg.id === ringGroupId)?.name || null
    },

    getWorkflow (worfkflowId) {
      return this.workflows.find(workflow => workflow.id === worfkflowId)?.name || null
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
    },

    getLocation (communication) {
      return communication.city + ((communication.city && communication.state) ? ', ' : '') + communication.state
    },

    setExpandedItem (index) {
      // logic to collapse only one row
      this.expandedItem = this.expandedItem === index ? null : index
    },

    showMore (comm) {
      if (this.showMoreList.includes(comm.id)) {
        let index = this.showMoreList.indexOf(comm.id)

        if (index > -1) {
          this.showMoreList.splice(index, 1)
        }

        return
      }

      this.showMoreList.push(comm.id)
    },

    getAttemptingUsers (communication, size = null) {
      const users = size
        ? communication.attempting_users.slice(0, size)
        : communication.attempting_users

      return users.filter(user => this.getUser(user)?.id)
    }
  }
}
</script>
