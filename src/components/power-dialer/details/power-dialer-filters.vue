<template>
  <b-card class="border-0 text-center">
    <div class="t-grouped-buttons">

      <router-link
        class="link px-1"
        v-for="(lsFilter, key) in listFilters"
        :key="key"
        :to="currentRoute(lsFilter)">
        <div :class="`t-grouped-buttons__btn ${filter === lsFilter.id ? 'active' : ''}`">
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
import { mapGetters, mapMutations } from 'vuex'

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
    }
  },
  methods: {
    ...mapMutations('powerDialer', [
      'SET_ACTIVE_FILTER'
    ]),
    currentRoute (listFilter) {
      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        return `/power-dialer/${listFilter.id}`
      }
      return `/power-dialer/list/${this.id}/${listFilter.id}`
    },
    contactListCount (filterId) {
      return filterId === 'all' ? this.getListWithFilter() || 0 : this.listResources[this.filters[filterId]] || 0
    },
    getListWithFilter () {
      let ctr = 0
      Object.keys(this.filters).forEach(f => {
        ctr += f !== 'all' ? this.listResources[this.filters[f]] : 0
      })
      return ctr
    }
  },
  watch: {
    '$route.params.filter': function (id) {
      if (id) {
        if (this.$route.meta.title === 'Power Dialer' ||
          (
            this.$route.meta.title === 'Power Dialer Filter' ||
            this.$route.meta.title === 'Power Dialer Individual Advance'
          )
        ) {
          this.SET_ACTIVE_FILTER(this.$route.params.id)
        } else {
          if (this.$route.params.filter) {
            this.SET_ACTIVE_FILTER(this.$route.params.filter)
          } else {
            this.SET_ACTIVE_FILTER('in-queue')
          }
        }
      }
    },
    '$route.params': function (params) {
      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        this.SET_ACTIVE_FILTER(this.id)
      } else {
        if (params.filter) {
          this.SET_ACTIVE_FILTER(params.filter)
        } else {
          this.SET_ACTIVE_FILTER('in-queue')
        }
      }
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
        'all': 'total'
      }
    }
  }
}
</script>
