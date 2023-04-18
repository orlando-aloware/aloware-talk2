<template>
  <div class="wallboard__header">
    <div class="wallboard__header__title bordered-bottom">
      Your Contact Center
    </div>
    <div class="wallboard__header__actions bordered-bottom">
      For today {{ new Date() | fullShortDate }}

      <ring-group-selector clearable
                           class="ml-2 ring-group-filter"
                           :force-remove-missing-values="true"
                           :generic-multiselect="false"
                           :value="filters.ringGroup"
                           @change="onFilterRingGroup">
      </ring-group-selector>

      <div class="flex-grow-1 text-right">
        <wallboard-view-mode-button class="ml-2"/>
      </div>
    </div>
  </div>
</template>

<script>
import RingGroupSelector from 'src/components/generic-selectors/ring-group-selector.vue'
import WallboardViewModeButton from 'src/components/wallboard/wallboard-view-mode-button.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'wallboard-header',

  components: {
    RingGroupSelector,
    WallboardViewModeButton
  },

  computed: {
    ...mapGetters('wallboard', {
      filters: 'getFilters'
    })
  },

  methods: {
    ...mapActions('wallboard', [
      'setFilter',
      'fetchSummary'
    ]),

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
