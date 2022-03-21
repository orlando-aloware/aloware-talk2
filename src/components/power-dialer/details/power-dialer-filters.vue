<template>
  <b-card class="filter-chips border-0 text-center px-2" no-body>
    <div class="t-grouped-buttons">

      <router-link
        class="link px-1"
        v-for="(lsFilter, key) in listFilters"
        :key="key"
        :to="currentRoute(lsFilter)">
        <div :class="`t-grouped-buttons__btn ${filterKey === lsFilter.id ? 'active' : ''}`">
          <div class="t-badge-name">
            {{ lsFilter.name }}
          </div>
          <div :class="`t__badge ${id === lsFilter.id ? 'active' : ''}`">
            <!-- <span>{{ filtersCounter[lsFilter.meta] }}=</span> -->
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
// import { isEmpty } from 'lodash'

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
      'listDetails'
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
      return DEFAULT_FILTER_LIST
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
        in_queue: this.listDetails?.total_queued,
        all: this.listDetails?.total_items,
        called: this.listDetails?.total_called,
        failed: this.listDetails?.total_failed,
        scheduled: this.listDetails?.total_scheduled
      }
    },
    counterAll () {
      return this.listDetails?.total_items
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
    listDetails (val) {
      if (val?.path) {
        this.valid = true
        this.filtersCounter = {
          in_queue: val.total_queued || 0,
          called: val.total_called || 0,
          failed: val.total_failed || 0,
          scheduled: val.total_scheduled || 0,
          all: val.total_items || 0
        }
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
