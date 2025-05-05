<template>
  <div class="teaminbox-filter-sort d-flex justify-content-between align-items-center">
    <div class="teaminbox-filter">
      <b-dropdown variant="outline-primary" size="sm" class="filter-dropdown">
        <template #button-content>
          <span v-if="filterOption === 'All'">All</span>
          <span v-else-if="filterOption === 'Unread'">
            <unread-mail-icon class="mr-1" /> Unread
          </span>
        </template>
        <b-dropdown-item :active="filterOption === 'All'" @click="setFilterOption('All')">All</b-dropdown-item>
        <b-dropdown-item :active="filterOption === 'Unread'" @click="setFilterOption('Unread')">
          <unread-mail-icon class="mr-2" /> Unread
        </b-dropdown-item>
      </b-dropdown>
    </div>
    <div class="teaminbox-sort">
      <b-dropdown variant="outline-primary" size="sm" class="sort-dropdown" right>
        <template #button-content>
          <span v-if="sortOption === 'Newest'">
            <sort-up-icon class="mr-1" /> Newest
          </span>
          <span v-else-if="sortOption === 'Oldest'">
            <sort-down-icon class="mr-1" /> Oldest
          </span>
        </template>
        <b-dropdown-item :active="sortOption === 'Newest'" @click="setSortOption('Newest')">
          <sort-up-icon class="mr-2" /> Newest
        </b-dropdown-item>
        <b-dropdown-item :active="sortOption === 'Oldest'" @click="setSortOption('Oldest')">
          <sort-down-icon class="mr-2" /> Oldest
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
import UnreadMailIcon from '../../components/icons/inbox/unread-mail-icon.vue'
import SortUpIcon from '../../components/icons/inbox/sort-up-icon.vue'
import SortDownIcon from '../../components/icons/inbox/sort-down-icon.vue'
import { mapState, mapActions } from 'vuex'
import { navigationErrorHandler } from 'src/router/routes'

export default {
  name: 'TeamInboxFilterSort',

  components: {
    UnreadMailIcon,
    SortUpIcon,
    SortDownIcon
  },

  mounted () {
    this.initializeFilterAndSort()
  },

  computed: {
    ...mapState('TeamInbox', ['activeFilters', 'activeSort']),

    filterOption () {
      return this.activeFilters && this.activeFilters.unreadonly ? 'Unread' : 'All'
    },

    sortOption () {
      return this.activeSort && this.activeSort.order === 'asc' ? 'Oldest' : 'Newest'
    }
  },

  data () {
    return {
      filters: {
        All: {},
        Unread: { unreadonly: true }
      },
      sorts: {
        Newest: {},
        Oldest: { order: 'asc' }
      }
    }
  },

  methods: {
    ...mapActions('TeamInbox', ['setActiveFilters', 'setActiveSort']),

    setFilterOption (option) {
      if (!this.validateFilterOption(option)) {
        return
      }

      this.setActiveFilters({ value: this.filters[option], option })
      this.$emit('filter-change', this.filters[option])
      this.updateUrlParams('filter', option)
    },

    setSortOption (option) {
      if (!this.validateSortOption(option)) {
        return
      }

      this.setActiveSort({ value: this.sorts[option], option })
      this.$emit('sort-change', this.sorts[option])
      this.updateUrlParams('sort', option)
    },

    initializeFilterAndSort () {
      this.initializeFilter()
      this.initializeSort()
    },

    initializeFilter () {
      const urlFilter = this.$route.query.filter

      if (urlFilter) {
        this.setFilterOption(urlFilter)
        return
      }

      // If no URL parameter, check localStorage
      const storedFilter = localStorage.getItem('teaminbox_filter')
      if (storedFilter) {
        this.setFilterOption(storedFilter)
      }
    },

    initializeSort () {
      const urlSort = this.$route.query.sort

      if (urlSort) {
        this.setSortOption(urlSort)
        return
      }

      // If no URL parameter, check localStorage
      const storedSort = localStorage.getItem('teaminbox_sort')
      if (storedSort) {
        this.setSortOption(storedSort)
      }
    },

    validateFilterOption (option) {
      return Object.keys(this.filters).includes(option)
    },

    validateSortOption (option) {
      return Object.keys(this.sorts).includes(option)
    },

    updateUrlParams (param, value) {
      const query = { ...this.$route.query }
      query[param] = value
      this.$router.replace({ query }).catch(navigationErrorHandler)
    }
  },

  watch: {
    '$route.query.filter' (newValue) {
      if (!newValue) {
        // if the filter is not set in the URL, use the current filter and update the URL
        this.updateUrlParams('filter', this.filterOption)
      }
    },

    '$route.query.sort' (newValue) {
      if (!newValue) {
        // if the sort is not set in the URL, use the current sort and update the URL
        this.updateUrlParams('sort', this.sortOption)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.teaminbox-filter-sort {
  padding: 2px 16px;
  background-color: white;
}
</style>
