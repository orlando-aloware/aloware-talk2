<template>
  <b-dropdown text="..."
              no-caret
              right
              variant="light"
              class="calls__header__columns-dropdown m-2 b-compact-dropdown-button dropdown-white">
    <div class="px-2">
      <div class="d-flex align-items-center cursor-pointer w-100 text-sm mb-1"
           :key="column.name"
           v-for="column in availableColumns"
           @click="toggleCallsColumn(column.name)">
        <input class="cursor-pointer"
               type="checkbox"
               :checked="enabledColumns.includes(column.name)"
               :value="column.name"/>
        <div class="flex-grow-1 pl-2">
          {{ column.label }}
        </div>
      </div>
    </div>
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
      return COLUMNS.filter(column => column.selectable && (!column.exclude || !column.exclude.includes(this.$route.params.id)))
    }
  },

  methods: {
    ...mapMutations('wallboard', {
      toggleCallsColumn: 'TOGGLE_CALLS_COLUMN'
    })
  }
}
</script>
