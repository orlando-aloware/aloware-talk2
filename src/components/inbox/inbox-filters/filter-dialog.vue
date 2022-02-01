<template>
  <b-modal
    id="inbox-channel-filter-modal"
    size="lg"
    modal-class="confirm-dialog"
    hide-header-close
    hide-header
    hide-footer
    ref="inboxChannelFilterModal"
    v-model="isOpen"
    @hidden="onHidden"
    @show="onShow"
    @shown="onShown">

    <div class="modal-body-wrapper d-flex">
      <div class="left-column-wrapper">
        <span class="filter-type-description">{{ channelFilterName }} Filters</span>

        <div class="mt-5">
          <div class="mb-4">
            <div class="filter-items cursor-pointer text-italic"
                 v-bind:class="{ 'active' : !selectedFilter }"
                 @click="onSelectFilter(null)">
              <span>New</span>
            </div>
          </div>
          <h5 class="text-uppercase filter-group-title">Personal Filters</h5>
          <div class="saved-filters">
            <q-skeleton type="rect" v-if="isGettingFilters" />
            <p class="text-muted fs-12 empty-filter-placeholder" v-show="!isGettingFilters" v-if="personalFilters.length < 1">None</p>
            <filter-list-items v-for="item in personalFilters"
                               :key="item.id"
                               :filter="item"
                               @filterSelected="onSelectFilter"
                               @filterRename="onRenameFilter"
                               @filterDelete="(e) => onDeleteFilter(e, item)">
            </filter-list-items>
          </div>
          <h5 class="text-uppercase filter-group-title mt-4">Company Filters</h5>
          <div class="saved-filters">
            <q-skeleton type="rect" v-if="isGettingFilters" />
            <p class="text-muted fs-12 empty-filter-placeholder" v-show="!isGettingFilters" v-if="companyFilters.length < 1">None</p>
            <div class="filter-items cursor-pointer"
                 v-bind:class="{ 'active' : selectedFilter && selectedFilter.id === item.id }"
                 v-for="item in companyFilters"
                 :key="item.id"
                 @click="onSelectFilter(item)">
              <span>
                <q-tooltip anchor="top middle"
                               self="center middle">
                  {{ item.name }}
                </q-tooltip>
                {{ item.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-grow-1 right-column-wrapper">
        <div class="container d-flex justify-content-between mb-3 action-option-container">
          <div class="w-100 text-center">
            <span class="filter-name">{{ selectedFilter ? selectedFilter.name : 'Untitled' }}</span>
          </div>
          <compact-btn class="border-0"
                       @clicked="onHide">
            <i class="fa fa-times"></i>
          </compact-btn>
        </div>
        <filter-form ref="inboxChannelFilterForm"
                     :default-filter-model="defaultFilterModel"
                     :filter="filter">
        </filter-form>
        <div class="container d-flex justify-content-between mb-3 mt-3 action-option-container">
          <div></div>
          <div>
            <compact-btn class="mr-3 btn-tertiary"
                         :disabled="!filterHasChanges"
                         @clicked="onResetFilter">
              Reset
            </compact-btn>
            <compact-btn class="btn-secondary"
                         :disabled="!(filterHasChanges) || ![1,2,3,4].includes(defaultFilterModel.type)"
                         @clicked="onSaveNewFilter">
              Save as New
            </compact-btn>
            <compact-btn variant="primary"
                         class="ml-3"
                         :disabled="false"
                         @clicked="onApply">
              <q-spinner-bars v-if="isUpdatingFilter"
                              color="white"
                              class="mr-1" />
              {{ applyButtonText }}
            </compact-btn>
          </div>
        </div>
      </div>
    </div>
    <template #modal-footer="{ hide }">
      <b-button
        variant="success"
        class="custom-btn"
        size="sm"
        @click="hide()">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import FilterForm from 'components/inbox/inbox-filters/filter-form'
import { mapActions, mapState } from 'vuex'
import CompactBtn from 'components/compact-btn'
import talk2Api from 'src/plugins/api/api'
import FilterListItems from 'components/inbox/inbox-filters/filter-list-items'

let inputTimeout

export default {
  name: 'filter-dialog',

  components: { FilterListItems, CompactBtn, FilterForm },

  props: {
    value: {
      type: Object,
      default: () => {}
    },
    defaultFilterModel: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('inbox', ['channelChangedFilterFields', 'selectedFilter', 'isFilterDialogShown', 'channelClonedFilter', 'isFilterModelFormShown']),
    isOpen: {
      get () {
        return this.isFilterDialogShown
      },
      set (isOpen) {
        return isOpen
      }
    },
    channelFilterName () {
      switch (true) {
        case !this.$route.params.channel && this.$route.name === 'Inbox':
        case ['inbox'].includes(this.$route.params.channel):
          return 'Inbox'
        case ['messages'].includes(this.$route.params.channel):
          return 'Messages'
        case ['voicemails'].includes(this.$route.params.channel):
          return 'Voicemails'
        case ['mentions'].includes(this.$route.params.channel):
          return 'Mentions'
        case ['calls', 'recordings'].includes(this.$route.params.channel):
        default:
          return 'Calls & Recordings'
      }
    },
    selectedFilterHasChanges () {
      if (!this.selectedFilter || !this.selectedFilterClone) {
        return false
      }

      return JSON.stringify(this.$options.filters.sortObjectByKey(this.filter)) !== JSON.stringify(this.$options.filters.sortObjectByKey(this.selectedFilterClone.filter))
    },
    filterHasChanges () {
      let hasChanges = false

      let filterIdentifier = this.selectedFilter ? this.selectedFilter.filter : this.defaultFilterModel.filter

      for (const field of this.filterFields) {
        if (this.filter[field] !== filterIdentifier[field]) {
          hasChanges = true
          break
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

      if (this.selectedFilter && this.selectedFilter.scope === 'user' && this.filterHasChanges) {
        return 'Apply & Save'
      }

      return 'Apply'
    }
  },

  data () {
    return {
      isRenaming: false,
      isDeletingFilter: false,
      isUpdatingFilter: false,
      isGettingFilters: false,
      selectedFilterClone: null,
      personalFilters: [],
      companyFilters: [],
      filterToEdit: null,
      filter: {},
      clonedFilter: {},
      filterFields: [
        'campaigns',
        'ring_groups',
        'direction',
        'answer_status',
        'min_talk_time',
        'transfer_type',
        'callback_status',
        'tags',
        'call_dispositions',
        'first_time_only',
        'untagged_only',
        'exclude_automated_communications',
        'incoming_numbers',
        'users',
        'workflows',
        'owner_id',
        'my_contacts',
        'from_date',
        'to_date'
      ]
    }
  },

  methods: {
    ...mapActions('inbox', [
      'toggleFilterModelForm',
      'setSelectedFilter',
      'setAppliedFilter',
      'updateChannelChangedFilterFields',
      'resetChannelChangedFilterFields',
      'toggleFilterDialog',
      'setChannelClonedFilter'
    ]),
    hideModal () {
      this.$refs.inboxChannelFilterModal.hide()
    },

    onHidden () {
      this.toggleFilterDialog()
    },

    onHide () {
      this.hideModal()
    },

    onShow () {
      this.personalFilters = []
      this.companyFilters = []
      this.getFilters()
      if (this.selectedFilter) {
        this.filter = { ...this.selectedFilter.filter, ...this.filter }
        this.setChannelClonedFilter(this.selectedFilter.filter)
      } else {
        this.filter = { ...this.filter, ...this.value }
        this.setChannelClonedFilter(this.filter)
      }
    },

    onShown () {
      this.refreshTagSelector()
    },

    refreshTagSelector () {
      let _this = this
      if (this.$refs.inboxChannelFilterForm.$refs.tagSelector) {
        this.$refs.inboxChannelFilterForm.$refs.tagSelector.$refs.tagSelect.focus()
        setTimeout(function () {
          _this.$refs.inboxChannelFilterForm.$refs.tagSelector.$refs.tagSelect.blur()
          _this.$refs.inboxChannelFilterForm.$refs.tagSelector.$refs.tagSelect.hidePopup()
        }, 200)
      }
    },

    onResetFilter: function () {
      // if has selected filter, then use selected filter saved values, otherwise use channel's default filter
      let useFilter = this.selectedFilter ? this.selectedFilter.filter : this.defaultFilterModel.filter

      for (const item in useFilter) {
        this.filter[item] = useFilter[item]
      }
    },

    onApply () {
      this.resetChannelChangedFilterFields()

      for (const item in this.filter) {
        if (['first_time_only', 'exclude_automated_communications', 'untagged_only'].includes(item) && +this.filter[item] !== +this.defaultFilterModel.filter[item] && this.filterFields.includes(item)) {
          this.updateChannelChangedFilterFields({
            name: item,
            value: +this.filter[item]
          })

          continue
        }

        if (!['first_time_only', 'exclude_automated_communications', 'untagged_only'].includes(item) && JSON.stringify(this.filter[item]) !== JSON.stringify(this.defaultFilterModel.filter[item]) && this.filterFields.includes(item)) {
          this.updateChannelChangedFilterFields({
            name: item,
            value: this.filter[item]
          })
        }
      }

      if (this.selectedFilter && this.selectedFilter.scope === 'user' && this.filterHasChanges) {
        this.isUpdatingFilter = true
        this.updateFilter(this.selectedFilter, {
          filter: this.filter,
          type: this.defaultFilterModel.type,
          name: this.selectedFilter.name,
          scope: this.selectedFilter.scope }).then(res => {
          this.isUpdatingFilter = false
        })
      }

      this.setAppliedFilter(this.selectedFilter || null)

      this.$emit('applyFilter', { ...this.filter })
    },

    onSaveFilter () {
      if (!this.selectedFilter) {
        this.toggleFilterModelForm(true)
      } else {
        this.isUpdatingFilter = true
        this.updateFilter(this.selectedFilter, { ...this.filter, name: this.selectedFilter.name, scope: this.selectedFilter.scope }).then(res => {
          this.isUpdatingFilter = false
        })
      }
    },

    onSaveNewFilter () {
      this.$emit('createNewFilter', this.filter)
    },

    onSelectFilter (filterObject) {
      this.setSelectedFilter(filterObject)

      if (!filterObject) {
        this.filter = { ...this.defaultFilterModel.filter }
      } else {
        this.filter = { ...this.defaultFilterModel.filter, ...filterObject.filter }
      }

      this.applyFilter()
    },

    getFilters () {
      if (![1, 2, 3, 4].includes(this.defaultFilterModel.type)) {
        return
      }

      this.isGettingFilters = true
      return talk2Api.V2.inbox.filters.get({ type: this.defaultFilterModel.type }).then(response => {
        this.personalFilters = response.data.data.user || []
        this.companyFilters = response.data.data.company || []
        this.isGettingFilters = false
      })
    },

    updateFilter (filter, params) {
      if (!params.scope) {
        let scope = [1, '1', true].includes(filter.is_on_company) ? 'company' : 'user'
        params = { ...params, scope: scope }
      }

      return talk2Api.V2.inbox.filters.update(filter.id, params).then(res => {
        let updatedFilter = res.data.filter
        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          let filter = { ...this.selectedFilter }
          filter.filter = { ...this.filter }
          this.setSelectedFilter(filter)
        }

        if (!updatedFilter.is_on_company) {
          let index = this.personalFilters.findIndex(item => item.id === filter.id)
          if (index >= 0) {
            this.personalFilters[index] = updatedFilter
          }
        }
      })
    },

    onRenameFilter (filter) {
      this.updateFilter(filter, filter)
    },

    onDeleteFilter (filter) {
      this.isDeletingFilter = true
      return talk2Api.V2.inbox.filters.delete(filter.id).then(res => {
        this.selectedFilterClone = { ...this.selectedFilter }
        this.isDeletingFilter = false
        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          this.setSelectedFilter(null)
          this.selectedFilterClone = null
        }
        if (!filter.is_on_company) {
          this.personalFilters = this.personalFilters.filter(item => item.id !== filter.id)
        }
      })
    },

    filterCreated (filter) {
      if (filter.is_on_company) {
        this.companyFilters.push(filter)
      } else {
        this.personalFilters.push(filter)
      }
    },

    applyFilter () {
      let _this = this
      if (!this.selectedFilter) {
        return
      }

      for (const prop in this.selectedFilter.filter) {
        this.filter[prop] = this.selectedFilter.filter[prop]
      }

      this.filter = { ...this.filter, untagged_only: +this.filter.untagged_only, first_time_only: +this.filter.first_time_only, exclude_automated_communications: +this.filter.exclude_automated_communications }

      setTimeout(function () {
        _this.refreshTagSelector()
      }, 1000)
    }
  },

  watch: {
    '$route.params.channel': function () {
      this.setSelectedFilter(null)
    }
  },
  created () {
    this.setSelectedFilter(null)
  },
  beforeDestroy () {
    clearTimeout(inputTimeout)
  },
  mounted () {
    this.toggleFilterDialog()
    this.$VueEvent.listen('channel_filter_created', filter => {
      if (filter.is_on_company) {
        this.companyFilters.push(filter)
      } else {
        this.personalFilters.push(filter)
      }
    })
  }
}
</script>
