<template>
  <search placeholder="Search Agent"
          :search="search"
          @search="onSearch"/>
</template>

<script>
import Search from 'src/components/search.vue'
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'wallboard-agent-name',

  components: {
    Search
  },

  computed: {
    ...mapGetters('wallboard', {
      filters: 'getFilters'
    }),

    search () {
      return this.filters.agent
    }
  },

  methods: {
    ...mapMutations('wallboard', {
      setFilter: 'SET_FILTER'
    }),

    onSearch (value) {
      this.setFilter({
        filter: 'agent',
        value: value || null
      })
    }
  }
}
</script>
