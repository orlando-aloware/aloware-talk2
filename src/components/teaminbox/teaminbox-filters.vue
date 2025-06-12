<template>
  <div class="teaminbox-filters">
    <div class="d-flex justify-content-between align-items-center">
      <div class="teaminbox-filter flex-grow-1 overflow-hidden">
        <b-dropdown variant="outline-primary"
                    no-caret
                    no-flip
                    size="sm"
                    class="filter-dropdown mw-100"
                    toggle-class="ellipse"
                    menu-class="shadow-sm"
                    boundary="window">
          <template #button-content>
            <span>Filter by</span>
            <span class="text-sm text-grey-90">
              {{ activeFiltersPlaceholder }}
            </span>
          </template>
          <div class="filter-group">
            <h5 class="form-label text-sm text-grey mx-2 mt-2 mb-1">Channels</h5>
            <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                             :value="option.value"
                             :key="option.value"
                             v-model="activeFilters.types"
                             v-for="option in typeOptions"
                             @change="onFilterChange">
              {{ option.label }}
            </b-form-checkbox>
          </div>
          <div class="filter-group">
            <h5 class="form-label text-sm text-grey mx-2 mt-2 mb-1">Direction</h5>
            <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                             :value="option.value"
                             :key="option.value"
                             v-model="activeFilters.directions"
                             v-for="option in directionOptions"
                             @change="onFilterChange">
              {{ option.label }}
            </b-form-checkbox>
          </div>
          <div class="filter-group">
            <h5 class="form-label text-sm text-grey mx-2 mt-2 mb-1">Contact</h5>
            <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                             :value="true"
                             v-model="activeFilters.my_contact"
                             @change="onFilterChange">
              My Contacts
            </b-form-checkbox>
          </div>
          <div class="filter-group">
            <h5 class="form-label text-sm text-grey mx-2 mt-2 mb-1">Status</h5>
            <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                             :value="true"
                             v-model="activeFilters.unread_only"
                             @change="onFilterChange">
              Unread
            </b-form-checkbox>
          </div>
          <div class="filter-group">
            <h5 class="form-label text-sm text-grey mx-2 mt-2 mb-1">Task Status</h5>
            <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                             :value="option.value"
                             :key="option.value"
                             v-model="activeFilters.task_status"
                             v-for="option in taskStatusOptions"
                             @change="onFilterChange">
              {{ option.label }}
            </b-form-checkbox>
          </div>
          <div class="filter-group">
            <h5 class="form-label text-sm text-grey mx-2 mt-2 mb-1">Mentions</h5>
            <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                             :value="true"
                             v-model="activeFilters.mention"
                             @change="onFilterChange">
              Where I'm mentioned
            </b-form-checkbox>
          </div>
        </b-dropdown>
      </div>
      <div class="teaminbox-sort flex-even flex-shrink-0">
        <b-dropdown variant="outline-primary"
                    size="sm"
                    class="sort-dropdown"
                    right
                    boundary="window">
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
import SortUpIcon from '../../components/icons/inbox/sort-up-icon.vue'
import SortDownIcon from '../../components/icons/inbox/sort-down-icon.vue'
import { mapState, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import { navigationErrorHandler } from 'src/router/routes'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'TeamInboxFilterSort',

  components: {
    SortUpIcon,
    SortDownIcon
  },

  mounted () {
    this.initializeFiltersAndSort()
  },

  computed: {
    ...mapState('TeamInbox', ['activeSort']),

    ...mapFields('TeamInbox', [
      'activeFilters'
    ]),

    sortOption () {
      return this.activeSort && this.activeSort.order === 'asc' ? 'Oldest' : 'Newest'
    },

    activeFiltersPlaceholder () {
      const selectedFilters = []
      if (this.activeFilters.types.length) {
        const selectedOptions = this.typeOptions.filter((option) => this.activeFilters.types.includes(option.value))
        selectedFilters.push(...selectedOptions.map((option) => option.label))
      }
      if (this.activeFilters.directions.length) {
        const selectedOptions = this.directionOptions.filter((option) => this.activeFilters.directions.includes(option.value))
        selectedFilters.push(...selectedOptions.map((option) => option.label))
      }
      if (this.activeFilters.my_contact) {
        selectedFilters.push('My Contacts')
      }
      if (this.activeFilters.unread_only) {
        selectedFilters.push('Unread')
      }
      if (this.activeFilters.task_status.length) {
        const selectedOptions = this.taskStatusOptions.filter((option) => this.activeFilters.task_status.includes(option.value))
        selectedFilters.push(...selectedOptions.map((option) => option.label))
      }
      if (this.activeFilters.mention) {
        selectedFilters.push('Mentions')
      }

      return '/ ' + (!selectedFilters.length ? 'All' : selectedFilters.join(', '))
    }
  },

  data () {
    return {
      typeOptions: [
        { label: 'Calls', value: CommunicationTypes.CALL_TYPE },
        { label: 'Messages', value: CommunicationTypes.SMS_TYPE },
        { label: 'Voicemails', value: 'rvm' }
      ],
      directionOptions: [
        { label: 'Inbound', value: 'inbound' },
        { label: 'Outbound', value: 'outbound' }
      ],
      taskStatusOptions: [
        { label: 'Open', value: 'open' },
        { label: 'Pending', value: 'pending' },
        { label: 'Close', value: 'close' }
      ],
      sorts: {
        Newest: {},
        Oldest: { order: 'asc' }
      }
    }
  },

  methods: {
    ...mapActions('TeamInbox', ['setActiveSort']),

    onFilterChange () {
      this.$emit('filter-change', this.activeFilters)
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
      this.initializeSort()
    },

    initializeSort () {
      const urlSort = this.$route.query.sort
      this.setSortOption(urlSort || this.sortOption)
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

    toggleDirectionFilter (value) {
      if (this.activeFilters.directions.includes(value)) {
        this.activeFilters.directions = this.activeFilters.directions.filter((v) => v !== value)
      } else {
        this.activeFilters.directions.push(value)
      }
      this.onFilterChange()
    },

    toggleMyContactsFilter () {
      this.activeFilters.my_contact = !this.activeFilters.my_contact
      this.onFilterChange()
    },

    toggleUnreadFilter () {
      this.activeFilters.unread_only = !this.activeFilters.unread_only
      this.onFilterChange()
    },

    toggleTaskStatusFilter (value) {
      if (this.activeFilters.task_status.includes(value)) {
        this.activeFilters.task_status = this.activeFilters.task_status.filter((v) => v !== value)
      } else {
        this.activeFilters.task_status.push(value)
      }
      this.onFilterChange()
    },

    toggleMentionFilter () {
      this.activeFilters.mention = !this.activeFilters.mention
      this.onFilterChange()
    }
  }
}
</script>

<style scoped>
.filter-group .form-label {
  font-weight: 400;
  font-size: 14px;
  color: #222;
  margin-bottom: 0.25rem;
}

.filter-group .b-form-checkbox {
  font-weight: 500;
  font-size: 15px;
  color: #222;
}

.filter-group .b-form-group {
  margin-bottom: 2px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
