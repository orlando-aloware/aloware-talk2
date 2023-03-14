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
                     :total-rows="users.length">
            <!-- rows -->
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
          name: 'agents',
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
    }
  },

  mounted () {
    this.fetchUsers()
  },

  methods: {
    ...mapActions('wallboard', [
      'fetchUsers'
    ])
  }
}
</script>
