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

export default {
  name: 'TeamInboxFilterSort',
  components: {
    UnreadMailIcon,
    SortUpIcon,
    SortDownIcon
  },
  data () {
    return {
      filterOption: 'All',
      sortOption: 'Newest',
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
    setFilterOption (option) {
      this.filterOption = option
      this.$emit('filter-change', this.filters[option])
    },
    setSortOption (option) {
      this.sortOption = option
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
