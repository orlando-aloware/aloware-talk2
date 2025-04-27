<template>
  <div class="teaminbox-filter-sort d-flex justify-content-between align-items-center">
    <div class="teaminbox-filter">
      <b-dropdown :text="filterOption" variant="outline-primary" size="sm" class="filter-dropdown">
        <b-dropdown-item :active="filterOption === 'All'" @click="setFilterOption('All')">All</b-dropdown-item>
        <b-dropdown-item :active="filterOption === 'Unread'" @click="setFilterOption('Unread')">Unread</b-dropdown-item>
      </b-dropdown>
    </div>
    <div class="teaminbox-sort">
      <b-dropdown :text="sortOption" variant="outline-primary" size="sm" class="sort-dropdown" right>
        <b-dropdown-item :active="sortOption === 'Newest'" @click="setSortOption('Newest')">Newest</b-dropdown-item>
        <b-dropdown-item :active="sortOption === 'Oldest'" @click="setSortOption('Oldest')">Oldest</b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeamInboxFilterSort',
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
