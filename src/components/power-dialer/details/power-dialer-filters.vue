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
            {{ contactListCount(lsFilter.id) }}
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

export default {
  name: 'PowerDialerFilters',
  props: {
    activeRoute: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    },
    filter: {
      type: String,
      default: 'in-queue'
    }
  },
  computed: {
    ...mapGetters('powerDialer', [
      'activeFilter',
      'filteredEndpoint'
    ]),
    ...mapGetters('contacts', [
      'listItems'
    ]),
    activeFilters () {
      return POWER_DIALER_FILTERS
    },
    listFilters () {
      return DEFAULT_FILTER_LIST
    },
    currentList () {
      return this.listItems?.[this.id]?.data || []
    },
    listResources () {
      return this.listItems?.[this.id]
    },
    filterKey () {
      if (this.id === 'my-queue') {
        return this.filter
      }
      return isNaN(this.id) ? this.id : this.filter
    }
  },
  methods: {
    currentRoute (listFilter) {
      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        return `/power-dialer/${listFilter.id}`
      }
      return `/power-dialer/list/${this.id}/${listFilter.id}`
    },
    contactListCount (filterId) {
      return this.listResources?.[this.filters?.[filterId]] || 0
    },
    getListWithFilter () {
      let ctr = 0
      Object.keys(this.filters).forEach(f => {
        ctr += f !== 'all' ? this.listResources?.[this.filters?.[f]] : 0
      })
      return ctr
    }
  },
  data () {
    return {
      valid: true,
      filters: {
        'in-queue': 'total_queued',
        'called': 'total_called',
        'failed': 'total_failed',
        'scheduled': 'total_scheduled',
        'all': 'total_items'
      }
    }
  }
}
</script>
