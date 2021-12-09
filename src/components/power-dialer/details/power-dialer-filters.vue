<template>
  <b-card class="border-0 text-center">
    <div class="t-grouped-buttons">
      <router-link
        v-for="(lsFilter, key) in listFilters"
        :key="key"
        :to="currentRoute(lsFilter)"
        class="link px-1">
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
      'activeFilter'
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
      return this.listItems[this.id].data
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
      return `/power-dialer/list/${this.id}/${listFilter.id}` // this.$route
    },
    contactListCount (filterId) {
      let filter = this.activeFilters[filterId]
      let collection = this.currentList.filter(ls => ls?.task_status === filter)
      return collection.length
    }
  },
  watch: {
    '$route.params.filter': function (id) {
      if (id) {
        if (this.$route.meta.title === 'Power Dialer' || (this.$route.meta.title === 'Power Dialer Filter' || this.$route.meta.title === 'Power Dialer Individual Advance')) {
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
      valid: true
    }
  }
}
</script>
