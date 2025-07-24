<template>
  <div class="teaminbox-filters">
    <div class="selected-date-placeholder text-sm text-grey-90"
         v-if="activeFilters.from_date">
      {{ selectedDateRangePlaceholder }}
    </div>
    <div class="d-flex justify-content-between align-items-center">
      <div class="teaminbox-filter flex-grow-1 overflow-hidden">
        <b-dropdown ref="filtersDropdown"
                    variant="outline-primary"
                    no-caret
                    no-flip
                    size="sm"
                    class="filter-dropdown mw-100"
                    toggle-class="mw-100"
                    menu-class="shadow-sm"
                    boundary="window"
                    @show="onShow">
          <template #button-content>
            <div id="teaminbox-filters-placeholder" class="d-flex align-items-center">
              <i class="fa fa-chevron-down fs-8 mr-1"></i>
              <div class="overflow-hidden ellipse">
                <span>Filter by</span>
                <span class="text-sm text-grey-90">
                  {{ activeFiltersPlaceholder }}
                </span>
              </div>
            </div>

            <b-tooltip custom-class="talk-table__tooltip teaminbox-tooltip"
                       placement="bottomleft"
                       target="teaminbox-filters-placeholder"
                       boundary="window"
                       :offset="activeFiltersText !== 'All' ? 20 : 10"
                       v-if="activeFiltersTooltip && !isMobile">
              {{ activeFiltersTooltip }}
            </b-tooltip>
          </template>
          <div class="filter-options-container">
            <div class="filter-group no-select">
              <h5 class="form-label text-sm text-grey mx-2 my-1">Status</h5>
              <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                               :value="true"
                               v-model="selectedFilters.unread_only">
                Unread
              </b-form-checkbox>
            </div>
            <div class="filter-group no-select">
              <h5 class="form-label text-sm text-grey mx-2 my-1">Contact</h5>
              <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                               :value="true"
                               v-model="selectedFilters.my_contact">
                My Contacts
              </b-form-checkbox>
            </div>
            <div class="filter-group no-select">
              <h5 class="form-label text-sm text-grey mx-2 my-1">Channels</h5>
              <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                               :value="option.value"
                               :key="option.value"
                               v-model="selectedFilters.channels"
                               v-for="option in channelOptions">
                {{ option.label }}
              </b-form-checkbox>
            </div>
            <div class="filter-group no-select">
              <h5 class="form-label text-sm text-grey mx-2 my-1">Direction</h5>
              <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                               :value="option.value"
                               :key="option.value"
                               v-model="selectedFilters.directions"
                               v-for="option in directionOptions">
                {{ option.label }}
              </b-form-checkbox>
            </div>
            <div class="filter-group no-select" v-if="isContactStatusControlEnabled">
              <h5 class="form-label text-sm text-grey mx-2 my-1">Contact Task Status</h5>
              <b-form-checkbox class="team-inbox-filter-checkbox-control text-sm"
                              :value="option.value"
                              :key="option.value"
                              v-model="selectedFilters.task_status"
                              v-for="option in taskStatusOptions">
                {{ option.label }}
              </b-form-checkbox>
            </div>
          </div>
          <div class="d-flex justify-between mt-1 pr-1">
            <b-link href="#"
                    class="custom-link text-decoration-none d-block p-1 px-2"
                    data-testid="teaminbox-clear-filters-btn"
                    :disabled="isResetFiltersDisabled"
                    @click="resetFilters">
              Clear All
            </b-link>
            <compact-btn variant="success"
                         data-testid="teaminbox-apply-filters-btn"
                         :disabled="!hasFilterChanges"
                         @clicked="onApply">
              Apply
            </compact-btn>
          </div>
        </b-dropdown>
      </div>
      <div class="teaminbox-sort flex-shrink-0">
        <b-dropdown variant="outline-primary"
                    no-caret
                    size="sm"
                    class="sort-dropdown"
                    right
                    boundary="window">
          <template #button-content>
            <span v-if="sortOption === 'Newest'" class="d-flex align-items-center">
              <sort-up-icon class="mr-1" /> Newest <i class="fa fa-chevron-down fs-8 ml-1"></i>
            </span>
            <span v-else-if="sortOption === 'Oldest'" class="d-flex align-items-center">
              <sort-down-icon class="mr-1" /> Oldest <i class="fa fa-chevron-down fs-8 ml-1"></i>
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
import { mapState, mapActions, mapGetters } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import { navigationErrorHandler } from 'src/router/routes'
import * as CommunicationTypes from 'src/constants/communication-types'
import { DEFAULT_FILTERS } from 'src/store/teaminbox/teaminbox.store'
import { isEqual } from 'lodash'
import moment from 'moment'
import CompactBtn from 'components/compact-btn'

export default {
  name: 'TeamInboxDropdownFilters',

  components: {
    SortUpIcon,
    SortDownIcon,
    CompactBtn
  },

  mounted () {
    this.selectedFilters = { ...this.activeFilters }
    this.initializeSort()
  },

  computed: {
    ...mapState(['isMobile']),
    ...mapGetters('cache', ['isContactStatusControlEnabled']),
    ...mapState('TeamInbox', ['activeSort']),
    ...mapFields('TeamInbox', ['activeFilters']),

    sortOption () {
      return this.activeSort && this.activeSort.order === 'asc' ? 'Oldest' : 'Newest'
    },

    selectedDateRangePlaceholder () {
      const { from_date: fromDate, to_date: toDate, date_range: dateRange } = this.activeFilters

      if (!fromDate && !toDate) {
        return ''
      }

      if (dateRange !== 'custom') {
        return `Results from ${dateRange.toLowerCase()}`
      }

      const range = `${moment(fromDate).format('MM/DD/YYYY')} to ${moment(toDate).format('MM/DD/YYYY')}`
      return `Results from ${range}`
    },

    activeFiltersText () {
      const filters = []
      if (this.activeFilters.channels?.length) {
        const selectedOptions = this.channelOptions.filter((option) => this.activeFilters.channels.includes(option.value))
        filters.push(...selectedOptions.map((option) => option.label))
      }
      if (this.activeFilters.mention) {
        filters.push('Mentions')
      }
      if (this.activeFilters.directions.length) {
        const selectedOptions = this.directionOptions.filter((option) => this.activeFilters.directions.includes(option.value))
        filters.push(...selectedOptions.map((option) => option.label))
      }
      if (this.activeFilters.my_contact) {
        filters.push('My Contacts')
      }
      if (this.activeFilters.unread_only) {
        filters.push('Unread')
      }
      if (this.activeFilters.task_status.length) {
        const selectedOptions = this.taskStatusOptions.filter((option) => this.activeFilters.task_status.includes(option.value))
        filters.push(...selectedOptions.map((option) => option.label))
      }

      return !filters.length ? 'All' : filters.join(', ')
    },

    activeFiltersPlaceholder () {
      return '/ ' + this.activeFiltersText
    },

    activeFiltersTooltip () {
      return 'Filter by ' + this.activeFiltersText
    },

    isResetFiltersDisabled () {
      if (this.activeFilters.date_range !== 'Last 30 Days') {
        return false
      }

      for (const key of this.dropdownFilterFields) {
        if (!isEqual(this.selectedFilters[key], DEFAULT_FILTERS[key])) {
          return false
        }
      }

      return true
    },

    hasFilterChanges () {
      for (const key of this.dropdownFilterFields) {
        if (!isEqual(this.selectedFilters[key], this.activeFilters[key])) {
          return true
        }
      }

      return false
    }
  },

  data () {
    return {
      isOpen: false,
      channelOptions: [
        { label: 'Calls', value: CommunicationTypes.CALL_TYPE },
        { label: 'Messages', value: CommunicationTypes.SMS_TYPE },
        { label: 'Mentions', value: 'mentions' }
      ],
      directionOptions: [
        { label: 'Inbound', value: 'inbound' },
        { label: 'Outbound', value: 'outbound' }
      ],
      taskStatusOptions: [
        { label: 'Open', value: 'open' },
        { label: 'Pending', value: 'pending' },
        { label: 'Closed', value: 'closed' }
      ],
      sorts: {
        Newest: {},
        Oldest: { order: 'asc' }
      },
      selectedFilters: {},
      dropdownFilterFields: ['channels', 'directions', 'my_contact', 'unread_only', 'task_status']
    }
  },

  methods: {
    ...mapActions('TeamInbox', ['setActiveSort']),

    onFilterChange () {
      this.$emit('filter-change', this.activeFilters)
    },

    onApply () {
      delete this.selectedFilters.date_range
      delete this.selectedFilters.from_date
      delete this.selectedFilters.to_date

      this.activeFilters = {
        ...this.activeFilters,
        ...this.selectedFilters
      }

      this.$refs.filtersDropdown.visible = false
      this.onFilterChange()
    },

    setSortOption (option) {
      if (!this.validateSortOption(option)) {
        return
      }
      this.setActiveSort(this.sorts[option])
      this.$emit('sort-change', this.sorts[option])
      this.updateUrlParams('sort', option)
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

    resetFilters () {
      this.$refs.filtersDropdown.visible = false

      this.activeFilters = { ...DEFAULT_FILTERS }
      this.selectedFilters = { ...DEFAULT_FILTERS }

      this.onFilterChange()
    },

    onShow () {
      this.selectedFilters = { ...this.activeFilters }
    }
  }
}
</script>

<style scoped>
@media screen and (max-width: 784px) {
  .filter-options-container {
    max-height: 240px;
    overflow-y: auto;
  }
}
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

.selected-date-placeholder {
  padding: 1px 12px 0 12px;
}
</style>
