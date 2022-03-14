<template>
  <b-card class="filter-chips border-0 text-center px-2" no-body>
    <div v-if="hasValidData" class="t-grouped-buttons">

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
            <span v-if="lsFilter.id === 'in-queue'">{{ list.total_queued }}</span>
            <span v-else-if="lsFilter.id === 'called'">{{ list.total_called }}</span>
            <span v-else-if="lsFilter.id === 'failed'">{{ list.total_failed }}</span>
            <span v-else-if="lsFilter.id === 'scheduled'">{{ list.total_scheduled }}</span>
            <span v-else>{{ list.total_items }}</span>
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
import { isEmpty } from 'lodash'

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
    },
    listData: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapGetters('powerDialer', [
      'activeFilter',
      'filteredEndpoint'
    ]),
    hasValidData () {
      return !isEmpty(this.listData)
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
    totalInQueue () {
      return this.list.total_queued
    },
    totalCalled () {
      return this.list?.total_called || 0
    },
    totalFailed () {
      return this.list?.total_failed || 0
    },
    totalScheduled () {
      return this.list?.total_scheduled || 0
    },
    totalItems () {
      return this.list?.total_items || 0
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
  data () {
    return {
      valid: true
    }
  }
}
</script>
