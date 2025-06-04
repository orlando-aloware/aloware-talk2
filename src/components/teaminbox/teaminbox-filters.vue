<template>
  <div class="teaminbox-filters">
    <div class="mb-1">
      <q-badge class="px-2 py-1 mr-1 no-select cursor-pointer"
               rounded
               data-test="teaminbox-type-filter-badge"
               :key="option.value"
               :color="communicationTypeColor(option.value)"
               v-for="option of communicationTypeOptions"
               @click="toggleCommunicationTypeFilter(option.value)">
        {{ option.label }}
      </q-badge>
    </div>
    <div>
      <q-badge class="px-2 py-1 mr-1 no-select cursor-pointer"
               rounded
               data-test="teaminbox-direction-filter-badge"
               :key="option.value"
               :color="directionColor(option.value)"
               v-for="option of directionOptions"
               @click="toggleDirectionFilter(option.value)">
        {{ option.label }}
      </q-badge>
    </div>
    <div class="d-flex justify-content-between align-items-center">
      <div class="teaminbox-filter">
        <b-dropdown variant="outline-primary" size="sm" class="filter-dropdown">
          <template #button-content>
            <span v-if="!activeFilters?.unread_only">All</span>
            <span v-else>
              <unread-mail-icon class="mr-1" /> Unread
            </span>
          </template>
          <b-dropdown-item :active="!activeFilters?.unread_only" @click="setUnreadFilter(false)">All</b-dropdown-item>
          <b-dropdown-item :active="activeFilters?.unread_only" @click="setUnreadFilter(true)">
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
  </div>
</template>

<script>
import UnreadMailIcon from '../../components/icons/inbox/unread-mail-icon.vue'
import SortUpIcon from '../../components/icons/inbox/sort-up-icon.vue'
import SortDownIcon from '../../components/icons/inbox/sort-down-icon.vue'
import { mapState, mapActions } from 'vuex'
import { navigationErrorHandler } from 'src/router/routes'
import { CALL_TYPE, SMS_TYPE } from 'src/constants/communication-types'
import { isArray } from 'lodash'

export default {
  name: 'TeamInboxFilterSort',

  components: {
    UnreadMailIcon,
    SortUpIcon,
    SortDownIcon
  },

  mounted () {
    this.initializeFiltersAndSort()
  },

  computed: {
    ...mapState('TeamInbox', ['activeFilters', 'activeSort']),

    sortOption () {
      return this.activeSort && this.activeSort.order === 'asc' ? 'Oldest' : 'Newest'
    }
  },

  data () {
    return {
      filters: {
        unread_only: false,
        types: [],
        direction: 'all'
      },
      sorts: {
        Newest: {},
        Oldest: { order: 'asc' }
      },
      communicationTypeOptions: [
        { label: 'Calls', value: CALL_TYPE },
        { label: 'Messages', value: SMS_TYPE },
        { label: 'Voicemails', value: 'rvm' }
      ],
      directionOptions: [
        { label: 'Inbound', value: 'inbound' },
        { label: 'Outbound', value: 'outbound' }
      ]
    }
  },

  methods: {
    ...mapActions('TeamInbox', ['setActiveFilters', 'setActiveSort']),

    setFilter (field, value) {
      // if (!this.validateFilter(field, value)) {
      //   return
      // }

      this.setActiveFilters({ field, value })
      this.$emit('filter-change', this.activeFilters)

      const urlValue = isArray(value) ? value.join(',') : value
      this.updateUrlParams(field, urlValue)
    },

    setUnreadFilter (unreadOnly) {
      this.setFilter('unread_only', Boolean(unreadOnly))
    },

    setSortOption (option) {
      if (!this.validateSortOption(option)) {
        return
      }

      this.setActiveSort(this.sorts[option])
      this.$emit('sort-change', this.sorts[option])
      this.updateUrlParams('sort', option)
    },

    initializeFiltersAndSort () {
      this.initializeFilters()
      this.initializeSort()
    },

    initializeFilters () {
      const unreadOnly = this.$route.query.unread_only
      if (unreadOnly) {
        this.setFilter('unread_only', Boolean(unreadOnly))
      }

      const types = this.$route.query.types
      if (types) {
        this.setFilter('types', types.split(',').filter((type) => this.communicationTypeOptions.some((option) => option.value === type)))
      }
    },

    initializeSort () {
      const urlSort = this.$route.query.sort
      this.setSortOption(urlSort || this.sortOption)
    },

    validateFilter (field, value) {
      if (field === 'types') {
        return this.communicationTypeOptions.some((option) => option.value === value)
      }

      if (field === 'direction') {
        return this.directionOptions.some((option) => option.value === value)
      }

      return true
    },

    validateSortOption (option) {
      return Object.keys(this.sorts).includes(option)
    },

    updateUrlParams (param, value) {
      const query = { ...this.$route.query }
      if (!value) {
        delete query[param]
      } else {
        query[param] = value
      }
      this.$router.replace({ query }).catch(navigationErrorHandler)
    },

    toggleCommunicationTypeFilter (type) {
      let value = this.activeFilters.types ?? []
      if (!value.includes(type)) {
        value.push(type)
      } else {
        value = value.filter((item) => item !== type)
      }
      this.setFilter('types', value)
    },

    toggleDirectionFilter (direction) {
      let value = direction
      if (this.activeFilters.direction === value) {
        value = undefined
      }
      this.setFilter('direction', value)
    },

    communicationTypeColor (communicationType) {
      if (this.activeFilters.types?.length &&
        this.activeFilters.types.includes(communicationType)) {
        return 'primary'
      }

      return 'grey'
    },

    directionColor (direction) {
      if (this.activeFilters.direction === direction) {
        return 'primary'
      }

      return 'grey'
    }
  },

  watch: {
    '$route.query.unread_only' (newValue) {
      this.setFilter('unread_only', newValue === 'true')
    },

    '$route.query.sort' (newValue) {
      this.setSortOption(newValue || this.sortOption)
    }
  }
}
</script>
