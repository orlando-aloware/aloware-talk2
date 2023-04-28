<template>
  <div class="wallboard__body">
    <div :class="['users', `users--${viewMode}`]">
      <b-overlay :show="isUsersLoading"
                 rounded="sm">
        <wallboard-users-header />
        <wallboard-users-table />
        <template #overlay>
          <q-spinner-bars color="primary"
                          size="40px"/>
        </template>
      </b-overlay>
    </div>
  </div>
</template>

<script>
import WallboardUsersHeader from 'src/components/wallboard/wallboard-users-header.vue'
import WallboardUsersTable from 'src/components/wallboard/wallboard-users-table.vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'WallboardUsers',

  components: {
    WallboardUsersHeader,
    WallboardUsersTable
  },

  computed: {
    ...mapState('wallboard', [
      'isUsersLoading'
    ]),

    ...mapGetters('wallboard', {
      viewMode: 'getViewMode',
      wallboardFilters: 'getFilters'
    })
  }
}
</script>
