<template>
  <div class="wallboard__body">
    <div class="h-100 w-100 oveflow-hidden"
         :class="['users', `users--${viewMode}`]">
      <b-overlay class="h-100 d-flex flex-column"
                 rounded="sm"
                 :show="isAgentsLoading">
        <wallboard-agents-header class="flex-grow-0"/>
        <wallboard-agents-table class="flex-grow-1 h-100 overflow-hidden"/>
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
