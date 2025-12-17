<template>
  <b-card class="filter-chips border-0 text-center px-2 position-relative"
          no-body>
    <div class="t-grouped-buttons pl-1">

      <router-link class="link pr-1"
                   :key="key"
                   :to="currentRoute(lsFilter)"
                   v-for="(lsFilter, key) in listFilters">
        <div :class="`t-grouped-buttons__btn ${filterKey === lsFilter.id ? 'active' : ''}`">
          <div class="t-badge-name">
            {{ lsFilter.name }}
          </div>
          <div :class="`t__badge mr-0 ${id === lsFilter.id ? 'active' : ''}`">
            <span>{{ filtersCounter[lsFilter.meta] }}</span>
          </div>
        </div>
      </router-link>

    </div>
  </b-card>
</template>

<script>

import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import { POWER_DIALER_FILTERS } from 'src/constants/power-dialer/power-dialer'
import { mapGetters } from 'vuex'
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'PowerDialerFilters',

  props: {
    activeRoute: {
      type: String,
      default: ''
    },

    id: {
      type: [Number, String],
      default: ''
    },

    filter: {
      type: [Number, String],
      default: 'in-queue'
    },

    listData: {
      type: Object,
      default: null
    }
  },

  computed: {
    ...mapFields('powerDialer', [
      'powerDialerActiveList'
    ]),

    ...mapGetters('powerDialer', [
      'activeFilter',
      'filteredEndpoint'
    ]),

    hasValidData () {
      return this.listData.path !== undefined
    },

    activeFilters () {
      return POWER_DIALER_FILTERS
    },

    listFilters () {
      // Remove the skipped filter from the list of available filters
      const { SKIPPED, ...DEFAULT_FILTERS } = DEFAULT_FILTER_LIST
      return DEFAULT_FILTERS
    },

    filterKey () {
      if (this.id === 'my-queue') {
        return this.filter
      }

      return isNaN(this.id) ? this.id : this.filter
    },

    list () {
      return this.listData
    },

    listCounter () {
      return {
        in_queue: this.powerDialerActiveList?.total_queued,
        all: this.powerDialerActiveList?.total_items,
        called: this.powerDialerActiveList?.total_called,
        failed: this.powerDialerActiveList?.total_failed,
        scheduled: this.powerDialerActiveList?.total_scheduled
      }
    },

    counterAll () {
      return this.powerDialerActiveList?.total_items
    }
  },

  methods: {
    currentRoute (listFilter) {
      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        return `/power-dialer/${listFilter.id}`
      }

      return `/power-dialer/list/${this.id}/${listFilter.id}`
    }
  },

  watch: {
    powerDialerActiveList (val) {
      if (!val?.path) {
        return
      }

      this.valid = true
      this.filtersCounter = {
        in_queue: val.total_queued || 0,
        called: val.total_called || 0,
        failed: val.total_failed || 0,
        scheduled: val.total_scheduled || 0,
        all: val.total_items || 0
      }
    }
  },

  data () {
    return {
      valid: false,
      filtersCounter: {
        in_queue: 0,
        called: 0,
        failed: 0,
        scheduled: 0,
        all: 0
      }
    }
  }
}
</script>
