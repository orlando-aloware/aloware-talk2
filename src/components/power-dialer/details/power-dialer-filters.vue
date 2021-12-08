<template>
  <b-card class="border-0 text-center">
    <div class="t-grouped-buttons">
      <router-link
        v-for="(lsFilter, key) in listFilters"
        :key="key"
        :to="`/power-dialer/list/${id}/${lsFilter.id}`"
        class="link px-1">
        <div :class="`t-grouped-buttons__btn ${filter === lsFilter.id ? 'active' : ''}`">
          <div class="t-badge-name">
            {{ lsFilter.name }}
          </div>
          <div :class="`t__badge ${id === lsFilter.id ? 'active' : ''}`">
            99+
          </div>
        </div>
      </router-link>

    </div>
  </b-card>
</template>

<script>

import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
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
    listFilters () {
      return DEFAULT_FILTER_LIST
    },
    currentRoute () {
      return this.$route
    }
  },
  methods: {
    ...mapMutations('powerDialer', [
      'SET_ACTIVE_FILTER'
    ])
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
      // this.SET_ACTIVE_FILTER(this.$route.params.id)
    }
  },
  data () {
    return {
      valid: true
    }
  }
}
</script>
