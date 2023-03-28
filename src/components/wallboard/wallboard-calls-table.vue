<template>
  <div class="users__table">
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
            <td :key="`col-${colIndex}`"
                v-if="column.name === 'disposition_status'">
              {{ call.id }}
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
import { COLUMNS } from 'src/constants/wallboard/calls-columns'
import Datatable from 'src/components/datatable.vue'
import { aclMixin } from 'src/plugins/mixins'
import { mapGetters } from 'vuex'

export default {
  name: 'wallboard-calls-table',

  mixins: [
    aclMixin
  ],

  components: {
    Datatable
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
    }
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
    }
  }
}
</script>
