<template>
  <div class="wallboard__header d-flex flex-column">
    <div class="wallboard__header__title bordered-bottom">
      Your Contact Center
    </div>
    <div class="wallboard__header__actions bordered-bottom">
      For today {{ date }}

      <ring-group-selector class="ml-2 ring-group-filter"
                           :force-remove-missing-values="true"
                           :generic-multiselect="false"
                           :value="filters.ringGroup"
                           @change="onFilterRingGroup">
      </ring-group-selector>
    </div>
  </div>
</template>

<script>
import RingGroupSelector from 'src/components/generic-selectors/ring-group-selector.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    RingGroupSelector
  },

  computed: {
    ...mapGetters('wallboard', {
      filters: 'getFilters'
    }),

    date () {
      // "28 Jan 2023" format
      return new Date().toGMTString().substr(4, 12)
    }
  },

  methods: {
    ...mapActions('wallboard', [
      'setFilter'
    ]),

    onFilterRingGroup (value) {
      this.setFilter({
        filter: 'ringGroup',
        value
      })
    }
  }
}
</script>
