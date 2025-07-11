<template>
  <b-modal id="teaminbox-filter-modal"
           ref="teaminboxFilterModal"
           size="lg"
           modal-class="confirm-dialog"
           hide-header-close
           hide-header
           hide-footer
           data-testid="teaminbox-filter-dialog-modal"
           v-model="isOpen"
           @hidden="onHidden"
           @show="onShow"
           @shown="onShown">
    <div class="modal-body-wrapper d-flex">
      <div class="left-column-wrapper">
        <span class="filter-type-description">Team Inbox Filters</span>

        <div class="mt-2">
          <div class="left-column-wrapper-scrollable">
            <div class="mb-4">
              <div class="filter-items cursor-pointer position-relative"
                   v-bind:class="{ 'active' : !selectedFilter }"
                   data-testid="teaminbox-filter-dialog-set-new-filter"
                   @click="setToNewFilter">
                <div>
                  <span>New (Untitled)</span>
                  <span class="position-absolute check-icon"
                        v-if="!selectedFilter">
                    <check-o-icon data-testid="teaminbox-filter-dialog-check-o-icon" color="#040404"/>
                  </span>
                </div>
              </div>
            </div>
            <h5 class="text-uppercase filter-group-title" data-testid="teaminbox-filter-dialog-personal-filter-title">Personal Filters</h5>
            <div class="saved-filters">
              <q-skeleton type="rect"
                          v-if="isGettingFilters"
                          data-testid="teaminbox-filter-dialog-skeleton"/>
              <p class="text-muted fs-12 empty-filter-placeholder pl-2"
                 v-show="!isGettingFilters"
                 v-if="personalFilters.length < 1"
                 data-testid="teaminbox-filter-dialog-none-p">
                None
              </p>
              <filter-list-items :key="item.id"
                                 :filter="item"
                                 v-for="item in personalFilters"
                                 data-testid="teaminbox-filter-dialog-personal-filters"
                                 @filterSelected="onSelectFilter"
                                 @filterRename="onRenameFilter"
                                 @filterDelete="(e) => onDeleteFilter(e, item)" />
            </div>
            <h5 class="text-uppercase filter-group-title mt-4">Company Filters</h5>
            <div class="saved-filters">
              <q-skeleton type="rect"
                          data-testid="teaminbox-filter-dialog-skeleton"
                          v-if="isGettingFilters"/>
              <p class="text-muted fs-12 empty-filter-placeholder pl-2"
                 v-show="!isGettingFilters"
                 v-if="companyFilters.length < 1">
                None
              </p>

              <filter-list-items :key="item.id"
                                 :filter="item"
                                 v-for="item in companyFilters"
                                 data-testid="teaminbox-filter-dialog-company-filters"
                                 @filterSelected="onSelectFilter"
                                 @filterRename="onRenameFilter"
                                 @filterDelete="(e) => onDeleteFilter(e, item)"/>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-grow-1 right-column-wrapper w-50">
        <div class="d-flex justify-content-between mb-3 px-3">
          <div class="w-100 text-left pt-2 pb-1">
            <span class="filter-name">{{ filterFormDisplayName }}</span>
          </div>
          <compact-btn class="border-0 pl-0 pr-0"
                       data-testid="teaminbox-filter-dialog-close-compact-btn"
                       @clicked="onHide">
            <close-icon iconColor="#000000"/>
          </compact-btn>
        </div>

        <!-- Filter Form -->
        <filter-form ref="teaminboxFilterForm"
                     data-testid="teaminbox-filter-dialog-filter-form"
                     :filter="filter"
                     :default-filter="defaultFilter"
                     :reset="reset"
                     @filterChange="onFilterFormChange">
        </filter-form>

        <div class="d-flex justify-content-end mt-sm-3 px-3">
          <div>
            <compact-btn class="mr-2 btn-outline-primary"
                         :disabled="!filterHasChanges"
                         data-testid="teaminbox-filter-dialog-reset-compact-btn"
                         @clicked="resetFilter">
              Reset
            </compact-btn>
            <compact-btn class="mr-2 btn-primary"
                         :disabled="isSaveAsNewDisabled"
                         data-testid="teaminbox-filter-dialog-save-as-new-compact-btn"
                         @clicked="onSaveNewFilter">
              Save as New
            </compact-btn>
            <compact-btn variant="success"
                         :disabled="isUpdatingFilter"
                         data-testid="teaminbox-filter-dialog-apply-compact-btn"
                         @clicked="onApply">
              <q-spinner-bars color="white"
                              class="mr-1"
                              v-if="isUpdatingFilter"
                              data-testid="teaminbox-filter-dialog-spinners-bars"/>
              {{ applyButtonText }}
            </compact-btn>
          </div>
        </div>
      </div>
    </div>
    <template #modal-footer="{ hide }">
      <b-button variant="success"
                class="custom-btn"
                size="sm"
                data-testid="teaminbox-filter-dialog-close-btn"
                @click="hide()">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import CompactBtn from 'components/compact-btn'
import talk2Api from 'src/plugins/api/api'
import FilterListItems from './filter-list-items'
import CheckOIcon from 'components/icons/check-o-icon'
import CloseIcon from 'components/icons/close-icon'
import FilterForm from './filter-form.vue'
import _ from 'lodash'
import * as ChannelType from 'src/constants/inbox-channels'
import { mapFields } from 'vuex-map-fields'
import { DEFAULT_FILTERS } from 'src/store/teaminbox/teaminbox.store'
import { TeamInboxMixin } from 'src/plugins/mixins'

export default {
  name: 'teaminbox-filter-dialog',

  components: {
    CloseIcon,
    CompactBtn,
    FilterListItems,
    CheckOIcon,
    FilterForm
  },

  mixins: [TeamInboxMixin],

  data () {
    return {
      isOpen: false,
      isRenaming: false,
      isDeletingFilter: false,
      isUpdatingFilter: false,
      isGettingFilters: false,
      savedFilters: {
        user: [],
        company: []
      },
      filter: { ...DEFAULT_FILTERS },
      defaultFilter: { ...DEFAULT_FILTERS },
      clonedFilter: {},
      pendingSaveAsNewFilter: null,
      filterFields: Object.keys(DEFAULT_FILTERS),
      booleanFields: [
        'first_time_only',
        'exclude_automated_communications',
        'untagged_only',
        'my_contact',
        'has_unread',
        'has_international'
      ],
      ChannelType,
      viewName: null,
      reset: false
    }
  },

  created () {
    if (!this.appliedFilter) {
      this.selectedFilter = null
    }

    this.getFilters()
  },

  mounted () {
    this.$VueEvent.listen('teaminbox_filter_created', this.onTeamInboxFilterCreated)
  },

  computed: {
    ...mapFields('TeamInbox', ['activeFilters', 'selectedFilter']),

    filterHasChanges () {
      if (this.reset) {
        return false
      }

      let hasChanges = false
      for (const field of this.filterFields) {
        if (JSON.stringify(this.filter[field]) !== JSON.stringify(this.defaultFilter[field])) {
          hasChanges = true
        }
      }

      return hasChanges
    },
    toggleApplyButtonEnabled () {
      if (this.isUpdatingFilter) {
        return false
      }
      if (this.selectedFilter) {
        return false
      }
      return !this.filterHasChanges
    },
    applyButtonText () {
      if (this.isUpdatingFilter) {
        return 'Saving changes..'
      }

      return 'Apply'
    },
    isNonViewCreateModeUnchanged () {
      return !this.selectedFilter && !this.filterHasChanges
    },
    isSaveAsNewDisabled () {
      return this.isNonViewCreateModeUnchanged
    },
    filterFormDisplayName () {
      return this.selectedFilter ? this.selectedFilter.name : 'New (Untitled)'
    },
    personalFilters () {
      return this.savedFilters.user
    },
    companyFilters () {
      return this.savedFilters.company
    }
  },

  methods: {
    hideModal () {
      this.isOpen = false
      this.$refs.teaminboxFilterModal.hide()
    },
    showModal () {
      this.isOpen = true
      this.$refs.teaminboxFilterModal.show()
    },
    onHidden () {
      // reset selected filter to applied filter when applicable
      if (this.appliedFilter) {
        this.selectedFilter = this.appliedFilter
      }
      if (!this.appliedFilter) {
        // this.selectedFilter = null
      }
      this.resetFilter()
      // Clear any pending save-as-new filter when dialog is hidden
      this.pendingSaveAsNewFilter = null
    },
    onHide () {
      this.hideModal()
    },
    onShow () {
      if (this.selectedFilter) {
        return
      }

      // If we have a pending save-as-new filter (from canceling create dialog), restore it
      if (this.pendingSaveAsNewFilter) {
        this.filter = { ...this.pendingSaveAsNewFilter }
        this.pendingSaveAsNewFilter = null
      } else {
        this.filter = { ...this.activeFilters }
      }
    },
    onShown () {
      // Modal is shown - filter should already be properly initialized
    },
    resetFilter () {
      this.filter = { ...this.defaultFilter }
    },
    onApply () {
      this.reset = false

      this.activeFilters = { ...this.filter }
      this.$emit('applyFilter', this.filter)
      this.hideModal()
    },
    onSaveNewFilter () {
      this.reset = false
      // Store the current filter state for potential restoration
      this.pendingSaveAsNewFilter = { ...this.filter }
      this.$emit('createNewFilter', _.pick(this.filter, this.filterFields))
    },
    onSelectFilter (targetFilter) {
      this.selectedFilter = targetFilter
      if (!targetFilter) {
        this.filter = { ...this.defaultFilter }
      } else {
        let targetFilterObject = targetFilter.filter

        let fromDate = targetFilterObject.from_date
        let toDate = targetFilterObject.to_date
        // Fix relative dates if they are not custom date range
        if (targetFilterObject.from_date && targetFilterObject.date_range !== 'custom') {
          const relativeDate = this.dateRanges[targetFilterObject.date_range ?? 'Last 30 Days']
          fromDate = relativeDate[0]
          toDate = relativeDate[1]
        }

        this.filter = {
          ...this.defaultFilter,
          ..._.pick(targetFilterObject, this.filterFields),
          from_date: fromDate,
          to_date: toDate
        }
      }
    },
    getFilters () {
      this.isGettingFilters = true
      return talk2Api.V2.inbox.filters.get({ type: ChannelType.CHANNEL_TEAMINBOX })
        .then(response => {
          this.savedFilters = {
            user: response.data.data?.user ?? [],
            company: response.data.data?.company ?? []
          }
        }).finally(() => {
          this.isGettingFilters = false
        })
    },
    onRenameFilter (filter) {
      // implement rename logic locally if needed
    },
    onDeleteFilter (filter) {
      this.isDeletingFilter = true
      return talk2Api.V2.inbox.filters.delete(filter.id).then(res => {
        this.isDeletingFilter = false

        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          this.selectedFilter = null
        }

        if (filter.scope === 'user') {
          this.savedFilters = {
            user: this.savedFilters.user.filter(item => item.id !== filter.id),
            company: this.savedFilters.company
          }
          return
        }

        this.savedFilters = {
          user: this.savedFilters.user,
          company: this.savedFilters.company.filter(item => item.id !== filter.id)
        }
      })
    },
    applyFilter () {
      if (!this.selectedFilter) {
        return
      }

      for (const prop in this.selectedFilter.filter) {
        this.filter[prop] = this.selectedFilter.filter[prop]
      }
    },
    getFilterItemClass (item) {
      const selectedFilterClass = this.selectedFilter?.id === item.id
        ? 'active'
        : ''
      return [selectedFilterClass]
    },
    setToNewFilter () {
      this.resetFilter()
      this.onSelectFilter(null)
      this.appliedFilter = null
    },

    onFilterFormChange ({ value, field }) {
      if (field === 'dateRange') {
        this.filter.date_range = value.date_range
        this.filter.from_date = value.from_date
        this.filter.to_date = value.to_date
        return
      }

      this.filter[field] = value
    },

    clearSelectedFilter () {
      this.selectedFilter = null
    },

    onTeamInboxFilterCreated (filter) {
      if (filter.is_on_company) {
        this.savedFilters.company.push(filter)
        return
      }

      this.savedFilters.user.push(filter)

      this.onSelectFilter(filter)
      this.showModal()
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('teaminbox_filter_created')
  }
}
</script>

<style lang="scss" scoped>
.modal-body-wrapper {
  .left-column-wrapper {
    width: 50%;
    padding-right: 8px;
    border-right: 1px solid #e0e0e0;

    .filter-type-description {
      font-weight: 600;
      font-size: 16px;
      color: #333;
    }

    .left-column-wrapper-scrollable {
      max-height: 400px;
      overflow-y: auto;
    }

    .filter-group-title {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      margin-bottom: 10px;
    }

    .filter-items {
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }

      &.active {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .check-icon {
        right: 12px;
      }
    }

    .saved-filters {
      margin-bottom: 20px;
    }

    .empty-filter-placeholder {
      font-style: italic;
    }
  }

  .right-column-wrapper {
    padding-left: 20px;

    .filter-name {
      font-weight: 600;
      font-size: 16px;
      color: #333;
    }
  }
}
</style>
