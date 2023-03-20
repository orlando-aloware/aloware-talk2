<template>
  <div class="users__table">
    <datatable custom-class="pr-3"
                :sticky-headers="true"
                :columns="columns"
                :is-empty="users.length === 0"
                :paginated="true"
                :show-pagination="true"
                :total-rows="users.length"
                :current-page="pagination.page"
                :last-page="lastPage"
                @paginated="onPaginated"
                @sort="onSort">
      <template slot="tbody">
        <tr class="datatable-row"
            :key="`${index}`"
            v-for="(user, index) in paginatedUsers">
          <template v-for="(column, colIndex) in columns">
            <!-- id -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'id'">
              {{ user.id }}
            </td>

            <!-- agent name -->
            <td class="users__table__agent-name"
                :key="`col-${colIndex}`"
                v-if="column.name === 'name'">
              <a :href="apiUrl + `/users/dialog/${user.id}`"
                  target="_blank">
                {{ user.name }}
              </a>
            </td>

            <!-- status -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'status'">
              <wallboard-agent-status :value="user.agent_status"
                                      @status-change="onStatusChanged(user, $event)"/>
            </td>

            <!-- status duration -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'status-duration'">
              <time-ago :from="convertTimeToUTC(user.last_agent_status_change)"
                        v-if="user.last_agent_status_change"/>
              <span v-else>--</span>
            </td>

            <!-- ring groups -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'ring-groups'">
              <wallboard-agent-ring-groups :ring-groups="user.ring_group_ids" />
            </td>

            <!-- last login -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'last-login'">
              {{ user.last_login | fixFullDateUTCRelative }}
            </td>

            <!-- last updated -->
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'last-updated'">
              {{ user.updated_at | fixFullDateUTCRelative }}
            </td>
          </template>
        </tr>
      </template>
    </datatable>
  </div>
</template>

<script>
import Datatable from 'src/components/datatable.vue'
import TimeAgo from 'src/components/time-ago.vue'
import WallboardAgentRingGroups from 'src/components/wallboard/wallboard-agent-ring-groups.vue'
import WallboardAgentStatus from 'src/components/wallboard/wallboard-agent-status.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'wallboard-users-table',

  components: {
    Datatable,
    TimeAgo,
    WallboardAgentRingGroups,
    WallboardAgentStatus
  },

  computed: {
    ...mapGetters('wallboard', {
      users: 'getUsers'
    }),

    columns () {
      return [
        {
          name: 'id',
          label: 'ID',
          order: 0,
          sortable: true
        },
        {
          name: 'name',
          label: 'Agents',
          order: 1,
          sortable: true
        },
        {
          name: 'status',
          label: 'Status',
          order: 2,
          sortable: true
        },
        {
          name: 'status-duration',
          label: 'Status Duration',
          order: 3,
          sortable: true
        },
        {
          name: 'ring-groups',
          label: 'Ring Groups',
          order: 4,
          sortable: true,
          minWidth: 200
        },
        {
          name: 'last-login',
          label: 'Last Login',
          order: 5,
          sortable: true
        },
        {
          name: 'last-updated',
          label: 'Last Updated',
          order: 6,
          sortable: true
        }
      ]
    },

    paginatedUsers () {
      let from = this.pagination.perPage * (this.pagination.page - 1)
      let to = from + this.pagination.perPage
      let users = this.orderedUsers

      // use reversed list if order is desc
      if (this.sort.order === 'desc') {
        users.slice().reverse()
      }

      return users.filter((user, index) => index >= from && index < to)
    },

    orderedUsers () {
      let users = this.filteredUsers

      return users.sort((a, b) => {
        let condition = null

        switch (this.sort.orderBy) {
          case 'id':
            condition = a.id > b.id
            break
          case 'name':
            condition = a.name > b.name
            break
          // FIXME: add below
          // status
          // status duration
          // ring groups
          // last login
          // last updated
        }

        return this.sort.order === 'asc'
          ? condition > 0 ? 1 : -1
          : condition > 0 ? -1 : 1
      })
    },

    filteredUsers () {
      return this.users
    },

    lastPage () {
      return Math.ceil(this.users.length / this.pagination.perPage)
    },

    apiUrl () {
      return process.env.API_URL
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
    }
  }),

  mounted () {
    this.fetchUsers()
  },

  methods: {
    ...mapActions('wallboard', [
      'fetchUsers',
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

    onStatusChanged (user, status) {
      this.setAgentStatus({
        userId: user.id,
        status
      })
    },

    convertTimeToUTC (time) {
      return window.moment.utc(time).toDate()
    }
  }
}
</script>
