<template>
  <b-dropdown text="..."
              no-caret
              right
              variant="light"
              class="m-2 b-compact-dropdown-button text-bold dropdown-white">
    <b-dropdown-item href=""
                     :key="column.name"
                     v-for="column in availableColumns"
                     @click="toggleCallsColumn(column.name)">
      <div class="d-flex align-items-center cursor-pointer w-100">
        <input class="cursor-pointer mt-1"
               type="checkbox"
               :checked="enabledColumns.includes(column.name)"
               :value="column.name"/>
        <div class="flex-grow-1 pl-2">
          {{ column.label }}
        </div>
      </div>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { COLUMNS } from 'src/constants/wallboard/calls-columns'

export default {
  name: 'wallboard-calls-columns-selector',

  computed: {
    ...mapGetters('wallboard', {
      enabledColumns: 'getCallsEnabledColumns'
    }),

    availableColumns () {
      return COLUMNS.filter(column => column.selectable)
    }
  },

  methods: {
    ...mapMutations('wallboard', {
      toggleCallsColumn: 'TOGGLE_CALLS_COLUMN'
    })
  }
}
</script>
