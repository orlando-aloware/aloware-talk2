<template>
  <div class="users__table">
    <datatable paginated
               show-pagination
               sticky-headers
               use-empty-slot
               custom-class="pr-3"
               scroll-area-class="scroll-type-2"
               :columns="columns"
               :is-empty="agents.length === 0"
               :total-rows="agents.length"
               :current-page="pagination.page"
               :last-page="lastPage"
               :start-order="sort"
               @paginated="onPaginated"
               @reordered="onColumnsReordered"
               @sort="onSort">
      <template #tbody>
        <tr class="datatable-row"
            :key="`${index}`"
            v-for="(agent, index) in paginatedAgents">
          <template v-for="(column, colIndex) in columns">
            <!-- id -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'id'">
              {{ agent.id }}
            </td>

            <!-- agent name -->
            <td class="users__table__agent-name"
                :key="`col-${colIndex}`"
                v-if="column.name === 'name'">
              <a target="_blank"
                 :href="apiUrl + `/users/dialog/${agent.id}`"
                 v-if="hasPermissionTo('list user')">
                {{ agent.name }}
              </a>
              <span v-else>
                {{ agent.name }}
              </span>
            </td>

            <!-- status -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'status'">
              <wallboard-agent-status :value="agent.agent_status"
                                      @status-change="onStatusChanged(agent, $event)"/>
            </td>

            <!-- status duration -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'status-duration'">
              <time-ago :from="convertTimeToUTC(agent.last_agent_status_change)"
                        v-if="agent.last_agent_status_change"/>
              <span v-else>--</span>
            </td>

            <!-- ring groups -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'ring-groups'">
              <wallboard-agent-ring-groups :ring-groups="agent.ring_group_ids" />
            </td>

            <!-- last login -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'last-login'">
              {{ agent.last_login | fixFullDateUTCRelative }}
            </td>

            <!-- last updated -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'last-updated'">
              {{ agent.updated_at | fixFullDateUTCRelative }}
            </td>
          </template>
        </tr>
      </template>

      <template #empty>
        <div class="empty-state"
             v-if="agents.length === 0">
          <div class="h5 px-2 text-center">
            No agents found based on the current filters
          </div>
        </div>
      </template>
    </datatable>
  </div>
</template>

<script>
import Datatable from 'src/components/datatable.vue'
import TimeAgo from 'src/components/time-ago.vue'
import WallboardAgentRingGroups from 'src/components/wallboard/wallboard-agent-ring-groups.vue'
import WallboardAgentStatus from 'src/components/wallboard/wallboard-agent-status.vue'
import * as AgentStatus from 'src/constants/agent-status'
import { COLUMNS } from 'src/constants/wallboard/agents-columns'
import { mapActions, mapGetters } from 'vuex'
import { aclMixin, classicMixin, simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'wallboard-agents-table',

  mixins: [
    aclMixin,
    classicMixin,
    simpsocialMixin
  ],

  components: {
    Datatable,
    TimeAgo,
    WallboardAgentRingGroups,
    WallboardAgentStatus
  },

  computed: {
    ...mapGetters('wallboard', {
      agents: 'getAgents'
    }),

    paginatedAgents () {
      let from = this.pagination.perPage * (this.pagination.page - 1)
      let to = from + this.pagination.perPage
      let agents = this.orderedAgents

      // use reversed list if order is desc
      if (this.sort.order === 'desc') {
        agents.slice().reverse()
      }

      return agents.filter((agent, index) => index >= from && index < to)
    },

    orderedAgents () {
      let agents = this.agents

      return agents.sort((a, b) => {
        let condition = null
        let equals = false

        // use a different rule based on order field
        switch (this.sort.orderBy) {
          case 'id':
            condition = a.id > b.id
            equals = a.id === b.id

            break
          case 'name':
            condition = a.name.toLowerCase() > b.name.toLowerCase()
            equals = a.name === b.name

            break
          case 'status':
            // use a custom order
            condition = this.customStatusOrder[a.agent_status] > this.customStatusOrder[b.agent_status]
            equals = this.customStatusOrder[a.agent_status] === this.customStatusOrder[b.agent_status]

            break
          case 'status-duration':
            condition = a.last_agent_status_change && b.last_agent_status_change
              ? a.last_agent_status_change < b.last_agent_status_change // compare values if both are present
              : !a.last_agent_status_change // use inverted logic otherwise

            equals = a.last_agent_status_change === b.last_agent_status_change

            break
          case 'last-login':
            condition = a.last_login && b.last_login
              ? a.last_login < b.last_login // compare values if both are present
              : !a.last_login // use inverted logic otherwise

            equals = a.last_login === b.last_login

            break
          case 'last-updated':
            condition = a.updated_at < b.updated_at
            equals = a.updated_at === b.updated_at

            break
        }

        // the 2nd order condition must always be id, respecting asc / desc
        if (equals) {
          return this.sort.order === 'asc'
            ? (a.id > b.id ? 1 : -1)
            : (a.id > b.id ? -1 : 1)
        }

        return this.sort.order === 'asc'
          ? condition ? 1 : -1
          : condition ? -1 : 1
      })
    },

    lastPage () {
      return Math.ceil(this.agents.length / this.pagination.perPage)
    },

    apiUrl () {
      return this.getClassicURL(this.isSimpSocial)
    },

    customStatusOrder () {
      return {
        [AgentStatus.AGENT_STATUS_ACCEPTING_CALLS]: 1,
        [AgentStatus.AGENT_STATUS_ON_CALL]: 2,
        [AgentStatus.AGENT_STATUS_RINGING]: 3,
        [AgentStatus.AGENT_STATUS_ON_WRAP_UP]: 4,
        [AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS]: 5,
        [AgentStatus.AGENT_STATUS_ON_BREAK]: 6,
        [AgentStatus.AGENT_STATUS_OFFLINE]: 7
      }
    }
  },

  data: () => ({
    pagination: {
      page: 1,
      perPage: 25
    },
    sort: {
      orderBy: 'status',
      order: 'asc'
    },
    columns: COLUMNS
  }),

  methods: {
    ...mapActions('wallboard', [
      'setAgentStatus'
    ]),

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
      this.columns = columns
    },

    onStatusChanged (agent, status) {
      this.setAgentStatus({
        userId: agent.id,
        status
      })
    },

    convertTimeToUTC (time) {
      return window.moment.utc(time).toDate()
    }
  }
}
</script>
