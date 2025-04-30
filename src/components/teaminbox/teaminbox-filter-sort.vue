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

export default {
  name: 'TeamInboxFilterSort',
  components: {
    UnreadMailIcon,
    SortUpIcon,
    SortDownIcon
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
      this.setActiveFilters(this.filters[option])
      this.$emit('filter-change', this.filters[option])
    },
    setSortOption (option) {
      this.setActiveSort(this.sorts[option])
      this.$emit('sort-change', this.sorts[option])
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
