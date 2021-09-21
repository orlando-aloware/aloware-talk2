<template>
  <b-card class="border-0 text-center">
    <div class="t-grouped-buttons">
      <router-link
        v-for="(filter, key) in listFilters"
        :key="key"
        :to="`${activeRoute}/${filter.id}`"
        class="link px-1">
        <div :class="`t-grouped-buttons__btn ${id === filter.id ? 'active' : ''}`">
          <div class="t-badge-name">
            {{ filter.name }}
          </div>
          <div :class="`t__badge ${id === filter.id ? 'active' : ''}`">
            99+
          </div>
        </div>
      </router-link>

    </div>
  </b-card>
</template>

<script>

import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'

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
    }
  },
  computed: {
    listFilters () {
      return DEFAULT_FILTER_LIST
    },
    test () {
      return true
    }
  },
  data () {
    return {
      valid: true
    }
  }
}
</script>
