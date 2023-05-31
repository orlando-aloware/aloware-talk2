<template>
  <div class="wallboard__body">
    <div :class="['users', `users--${viewMode}`]">
      <b-overlay rounded="sm"
                 :show="isAgentsLoading">
        <wallboard-agents-header />
        <wallboard-agents-table />
        <template #overlay>
          <q-spinner-bars color="primary"
                          size="40px"/>
        </template>
      </b-overlay>
    </div>
  </div>
</template>

<script>
import WallboardAgentsHeader from 'src/components/wallboard/wallboard-agents-header.vue'
import WallboardAgentsTable from 'src/components/wallboard/wallboard-agents-table.vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'WallboardAgents',

  components: {
    WallboardAgentsHeader,
    WallboardAgentsTable
  },

  computed: {
    ...mapState('wallboard', [
      'isAgentsLoading'
    ]),

    ...mapGetters('wallboard', {
      viewMode: 'getViewMode',
      wallboardFilters: 'getFilters'
    })
  }
}
</script>
