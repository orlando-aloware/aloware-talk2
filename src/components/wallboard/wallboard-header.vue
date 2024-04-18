<template>
  <div class="wallboard__header">
    <div class="wallboard__header__title bordered-bottom">
      Your Contact Center
    </div>
    <div class="wallboard__header__actions bordered-bottom">
      For {{ new Date() | fullShortDate }}

      <line-and-ring-group-selector class="ml-2 ring-group-filter"
                           clearable
                           split-by-queued
                           :force-remove-missing-values="true"
                           :generic-multiselect="false"
                           :value="filters.ringGroup"
                           @change="onFilterRingGroup">
      </line-and-ring-group-selector>

      <div class="flex-grow-1 text-right">
        <wallboard-view-mode-button class="ml-2"/>
      </div>
    </div>
  </div>
</template>

<script>
import LineAndRingGroupSelector from 'src/components/generic-selectors/line-and-ring-group-selector.vue'
import WallboardViewModeButton from 'src/components/wallboard/wallboard-view-mode-button.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'wallboard-header',

  components: {
    LineAndRingGroupSelector,
    WallboardViewModeButton
  },

  computed: {
    ...mapGetters('wallboard', {
      filters: 'getFilters'
    })
  },

  methods: {
    ...mapActions('wallboard', [
      'fetchSummary'
    ]),

    ...mapMutations('wallboard', {
      setFilter: 'SET_FILTER'
    }),

    onFilterRingGroup (value) {
      this.setFilter({
        filter: 'ringGroup',
        value
      })

      // automatically refresh summary when ring group changes
      this.fetchSummary()
    }
  }
}
</script>
