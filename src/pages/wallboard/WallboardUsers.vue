<template>
  <div class="wallboard__body">
    <div class="users">
      <b-overlay
        :show="isUsersLoading"
        rounded="sm">
        <div :class="['users__table', `users__table--${viewMode}`]">
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
                  <td :key="`col-${colIndex}`"
                      v-if="column.name === 'name'">
                    {{ user.name }}
                  </td>

                  <!-- status -->
                  <td :key="`col-${colIndex}`"
                      v-if="column.name === 'status'">
                    status
                  </td>

                  <!-- status duration -->
                  <td :key="`col-${colIndex}`"
                      v-if="column.name === 'status-duration'">
                    status-duration
                  </td>

                  <!-- ring groups -->
                  <td :key="`col-${colIndex}`"
                      v-if="column.name === 'ring-groups'">
                    ring groups
                  </td>

                  <!-- last login -->
                  <td :key="`col-${colIndex}`"
                      v-if="column.name === 'last-login'">
                    last login
                  </td>

                  <!-- last updated -->
                  <td :key="`col-${colIndex}`"
                      v-if="column.name === 'last-updated'">
                    last updated
                  </td>
                </template>
              </tr>
            </template>
          </datatable>
        </div>
        <template #overlay>
          <q-spinner-bars color="primary"
                          size="40px"/>
        </template>
      </b-overlay>
    </div>
  </div>
</template>

<script>
import Datatable from 'src/components/datatable.vue'
import { aclMixin } from 'src/plugins/mixins'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'WallboardUsers',

  mixins: [
    aclMixin
  ],

  components: {
    Datatable
  },

  computed: {
    ...mapState('wallboard', [
      'isUsersLoading'
    ]),

    ...mapGetters('wallboard', {
      viewMode: 'getViewMode',
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
          sortable: true
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
      'fetchUsers'
    ]),

    onPaginated (pageData) {
      this.pagination = {
        page: pageData.page,
        perPage: pageData.per_page
      }
    },

    onSort (sortData) {
      this.sort = sortData
    }
  }
}
</script>
