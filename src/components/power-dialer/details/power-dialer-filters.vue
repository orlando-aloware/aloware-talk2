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
import { mapGetters, mapActions, mapMutations } from 'vuex'
// import { isEmpty } from 'lodash'

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
  async mounted () {
    this.list = await this.getList(this.filteredEndpoint)
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
    getAll () {
      return this.list?.total
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getList'
    ]),
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
      return this.getListWithFilter(filterId)
    },
    getListWithFilter (filter) {
      if (filter === 'all') {
        return this.getAll
      }
      return this.list?.data?.filter(list => list.task_status === this.activeFilters[filter]).length
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
    },
    'filteredEndpoint': {
      async handler (data) {
        this.list = await this.getList(data)
      },
      deep: true
    }
  },
  data () {
    return {
      valid: true,
      list: null
    }
  }
}
</script>
