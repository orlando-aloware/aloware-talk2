<template>
  <b-modal size="lg"
           modal-class="confirm-dialog"
           hide-header-close
           hide-header
           hide-footer
           data-testid="filter-dialog-modal"
           id="comms-channel-filter-modal"
           ref="commsChannelFilterModal"
           v-model="isOpen"
           @hidden="onHidden"
           @show="onShow"
           @shown="onShown">
    <div class="modal-body-wrapper"
         :class="isFilterDialogForView ? 'd-sm-flex' : 'd-flex'">
      <div class="left-column-wrapper"
           v-if="!isFilterDialogForView">
        <span class="filter-type-description">{{ channelFilterName }}</span>

        <div class="mt-2">
          <div class="left-column-wrapper-scrollable">
            <div class="mb-4">
              <div class="filter-items cursor-pointer position-relative"
                   v-bind:class="{ 'active' : !selectedFilter }"
                   data-testid="filter-dialog-set-new-filter"
                   @click="setToNewFilter">
                <div>
                  <span>New (Untitled)</span>
                  <span class="position-absolute check-icon"
                        v-if="!selectedFilter">
                    <check-o-icon data-testid="filter-dialog-check-o-icon"
                                  color="#040404" />
                  </span>
                </div>
              </div>
            </div>
            <saved-filters :filter-type="filterTypeForGetSavedFilters"
                           :current-tags="filter?.tags || []"
                           :fetch-filters="fetchSavedFilters"
                           @filters-fetched="fetchSavedFilters = false"
                           @filterSelected="(item) => onSelectFilter(item)"
            />
          </div>
        </div>
      </div>

      <div class="flex-grow-1 right-column-wrapper"
           :class="!isFilterDialogForView ? 'w-50' : ''">
        <div class="d-flex justify-content-between mb-3 px-3">
          <q-input class="view-filter-name mb-0 w-50"
                   debounce="500"
                   :label="filterFormDisplayName"
                   :dense="true"
                   clearable
                   data-testid="filter-dialog-view-name-input"
                   v-if="isEditingView && selectedFilter && (!+selectedFilter?.is_on_company || selectedFilter?.scope === 'user')"
                   ref="viewName"
                   v-model.trim="viewName"
                   @keyup.enter="renameFilter" />
          <div class="w-100 text-left pt-2 pb-1"
               v-else>
            <span class="filter-name">{{ filterFormDisplayName }}</span>
          </div>
          <compact-btn class="border-0 pl-0 pr-0"
                       data-testid="filter-dialog-close-compact-btn"
                       @clicked="onHide">
            <close-icon icon-color="#000000" />
          </compact-btn>
        </div>
        <filter-form :default-filter-model="loadedDefaultFilterModel"
                     :filter="filter"
                     :reset="reset"
                     data-testid="filter-dialog-filter-form"
                     ref="commsChannelFilterForm"
        />

        <div class="d-flex justify-content-end mt-sm-3 px-3">
          <div>
            <compact-btn class="mr-2 btn-outline-primary"
                         :disabled="!filterHasChanges"
                         data-testid="filter-dialog-reset-compact-btn"
                         @clicked="onResetFilter">
              <q-tooltip anchor="top middle"
                         self="center middle"
                         content-class="dark-tooltip"
                         :offset="[24, 24]">
                <span>After clicking the <strong>Reset</strong> button, please make sure to click <strong>Apply</strong> to confirm the changes.</span>
              </q-tooltip>
              Reset
            </compact-btn>
            <compact-btn class="btn-primary"
                         :class="isViewEditModeOrNonView ? 'mr-2' : ''"
                         :disabled="isSaveAsNewDisabled"
                         data-testid="filter-dialog-save-as-new-compact-btn"
                         @clicked="onSaveNewFilter">
              Save as New
            </compact-btn>
            <compact-btn variant="success"
                         :disabled="isUpdatingFilter"
                         data-testid="filter-dialog-apply-compact-btn"
                         v-if="isViewEditModeOrNonView"
                         @clicked="onApply">
              <q-spinner-bars color="white"
                              class="mr-1"
                              data-testid="filter-dialog-spinners-bars"
                              v-if="isUpdatingFilter" />
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
                data-testid="filter-dialog-close-btn"
                @click="hide()">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import FilterForm from 'components/communications/communications-filters/filter-form'
import { mapActions, mapState } from 'vuex'
import CompactBtn from 'components/compact-btn'
import talk2Api from 'src/plugins/api/api'
import SavedFilters from 'components/communications/communications-filters/saved-filters'
import CheckOIcon from 'components/icons/check-o-icon'
import CloseIcon from 'components/icons/close-icon'
import _ from 'lodash'
import * as ChannelType from 'src/constants/inbox-channels'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import * as Filters from 'src/constants/filters'
import { communicationsMixin } from 'src/plugins/mixins'
import { DEFAULT_COMMUNICATIONS_CHANNEL } from 'src/router/routes'

export default {
  name: 'FilterDialog',
  components: {
    CloseIcon,
    CompactBtn,
    FilterForm,
    SavedFilters,
    CheckOIcon
  },

  mixins: [
    communicationsMixin
  ],

  props: {
    value: {
      type: Object,
      default: () => {
      }
    },

    filterModel: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      isRenaming: false,
      fetchSavedFilters: false,
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
        'contact_owner',
        'my_contact',
        'from_date',
        'to_date',
        'creator_type',
        'dynamic_engagement_date_range',
        'has_unread',
        'has_international'
      ],
      inputTimeout: null,
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
    this.initializeDateRanges()

    if (!this.appliedFilter) {
      this.setSelectedFilter(null)
    }
  },

  mounted () {
    this.toggleFilterDialog()

    this.$VueEvent.listen('channel_filter_created', filter => {
      this.fetchSavedFilters = true
    })

    // this.$VueEvent.listen('my_contacts_update_filter', () => {
    //  this.filter = { ...this.appliedFilter.filter }
    //  this.filter.my_contact = +this.inboxShowMyContacts
    //  this.onApply(true)
    // })
  },

  computed: {
    ...mapState('communications', [
      'channelChangedFilterFields',
      'selectedFilter',
      'isFilterDialogShown',
      'isFilterDialogShowFilters',
      'isFilterDialogForView',
      'channelClonedFilter',
      'isFilterModelFormShown',
      'appliedFilter',
      'inboxShowMyContacts',
      'inboxShowUnreads',
      'pinnedViews',
      'isFilterDialogForView',
      'isEditingView',
      'isUpdatingFilter',
      'activeChannel',
      'personalFilters'
    ]),

    isOpen: {
      get () {
        return this.isFilterDialogShown
      },

      set (isOpen) {
        return isOpen
      }
    },

    channelFilterName () {
      if (this.$route.params.channel === 'messages') {
        return 'Messages Filters'
      }

      if (this.$route.params.channel === 'voicemails') {
        return 'Voice Messages Filters'
      }

      if (this.$route.params.channel === DEFAULT_COMMUNICATIONS_CHANNEL) {
        return 'All Comms. Filters'
      }

      return 'Calls & Recordings Filters'
    },

    filterHasChanges () {
      const filterIdentifier = this.isFilterUpdateMode ? this.selectedFilter.filter : this.loadedDefaultFilterModel.filter

      if (this.reset) {
        return false
      }

      for (const field of this.filterFields) {
        if (JSON.stringify(this.filter[field]) !== JSON.stringify(filterIdentifier[field])) {
          return true
        }
      }

      return false
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

      const userScope = (this.selectedFilter?.scope === 'user' || +!this.selectedFilter?.is_on_company)
      if (this.selectedFilter && userScope && this.filterHasChanges) {
        return 'Apply & Save'
      }

      return 'Apply'
    },

    isNonViewCreateModeUnchanged () {
      return !this.isFilterDialogForView && !this.selectedFilter && !this.filterHasChanges
    },

    isViewCreateModeUnchanged () {
      return this.isFilterDialogForView && !this.isEditingView && !this.filterHasChanges
    },

    isSaveAsNewDisabled () {
      return this.isNonViewCreateModeUnchanged ||
        this.isViewCreateModeUnchanged ||
        (!this.isFilterDialogForView && this.filterModel.type === ChannelType.CHANNEL_MENTIONS)
    },

    filterFormDisplayName () {
      const nonViewEditMode = !this.isFilterDialogForView
      const viewEditMode = (this.isFilterDialogForView && this.isEditingView)

      return (nonViewEditMode || viewEditMode) && this.selectedFilter
        ? this.selectedFilter.name
        : 'New (Untitled)'
    },

    isViewEditModeOrNonView () {
      return !this.isFilterDialogForView || (this.isFilterDialogForView && this.isEditingView)
    },

    isFilterUpdateMode () {
      return (!this.isFilterDialogForView && this.selectedFilter) || (this.isFilterDialogForView && this.isEditingView)
    },

    loadedDefaultFilterModel () {
      if (this.isFilterDialogForView) {
        return {
          name: '',
          type: ChannelType.CHANNEL_INBOX,
          filter: { ...Filters.DEFAULT_STATE.filter },
          scope: 'user'
        }
      }

      return this.filterModel
    },

    filterTypeForGetSavedFilters () {
      return this.filterModel.type === ChannelType.CHANNEL_RECORDINGS
        ? ChannelType.CHANNEL_CALLS
        : this.filterModel.type
    }
  },

  methods: {
    ...mapActions('communications', [
      'toggleFilterModelForm',
      'setSelectedFilter',
      'setAppliedFilter',
      'updateChannelChangedFilterFields',
      'resetChannelChangedFilterFields',
      'toggleFilterDialog',
      'toggleFilterDialogWithFilters',
      'setChannelClonedFilter',
      'setInboxShowMyContacts',
      'setInboxShowUnreads',
      'setPinnedViews',
      'setFilterDialogForView',
      'setIsUpdatingFilter',
      'setInboxPersonalFilters',
      'setShowViewsList'
    ]),

    ...mapActions(['setIsFirstLoad']),

    hideModal () {
      this.$refs.commsChannelFilterModal.hide()
    },

    onHidden () {
      const isForCreateView = this.isFilterModelFormShown && this.isFilterDialogForView
      this.setFilterDialogForView(isForCreateView)

      // reset selected filter to applied filter when applicable
      // selected filter can be changed in "View" edit mode
      if (!this.isFilterDialogForView && this.appliedFilter) {
        this.setSelectedFilter(this.appliedFilter)
      }

      if (!this.isFilterDialogForView && !this.appliedFilter) {
        this.setSelectedFilter(null)
      }

      this.toggleFilterDialog()
      this.toggleFilterDialogWithFilters()
    },

    onHide () {
      this.hideModal()
    },

    onShow () {
      this.setShowViewsList(false)
      this.fetchSavedFilters = true
      this.filterFields = Object.keys(this.loadedDefaultFilterModel.filter)

      // if not editing a certain view, set default group filter for elements
      if (this.isFilterDialogForView && !this.isEditingView) {
        this.filter = { ...this.loadedDefaultFilterModel.filter }
      } else if (this.selectedFilter) {
        this.filter = { ...this.selectedFilter.filter }
      } else if (this.appliedFilter) {
        this.filter = { ...this.appliedFilter.filter }
      } else if (this.isFilterDialogShowFilters) {
        // use the current filters when the filters dialog button is clicked
        // to populate the selected filters
        this.filter = { ...this.channelClonedFilter }
      } else {
        this.filter = _.pick(this.value, this.filterFields)
      }

      // fill in the value for the newly added filter in case it's not yet included
      // in the existing saved set to properly display in its respective select component
      if (!this.filter.hasOwnProperty('dynamic_engagement_date_range')) {
        this.filter.dynamic_engagement_date_range = Filters.DEFAULT_STATE.filter.dynamic_engagement_date_range
      }

      // no need to re-set the channel cloned filters
      // when we're populating the dialog with the current filters
      if (!this.isFilterDialogShowFilters) {
        this.setChannelClonedFilter(this.filter)
      }
    },

    onShown () {
      this.applyFilter()
    },

    onResetFilter () {
      // if there's a selected filter, then use selected filter saved values, otherwise use channel's default filter
      const useFilter = this.selectedFilter && (this.isFilterDialogForView && this.isEditingView) ? this.selectedFilter.filter : this.filterModel.filter

      this.reset = true
      sessionStorage.removeItem('date-selected')
      this.setIsFirstLoad(true)

      for (const item in useFilter) {
        if (this.booleanFields.includes(item)) {
          // convert boolean to numeric
          this.filter[item] = +useFilter[item]
          continue
        }

        this.filter[item] = useFilter[item]
      }
    },

    onApply (skipChangedFields = false) {
      this.reset = false
      this.resetChannelChangedFilterFields()

      // const unreadsFilter = _.get(this.filter, 'unread_only', null)

      // if (unreadsFilter !== null && unreadsFilter !== (this.inboxShowUnreads | 0)) {
      //  this.setInboxShowUnreads(Boolean(unreadsFilter))
      // }

      const booleanProps = [
        'first_time_only',
        'exclude_automated_communications',
        'untagged_only',
        'has_unread',
        'has_international'
      ]
      const excludeProps = [
        'my_contact'
      ]

      if (!skipChangedFields) {
        for (const item in this.filter) {
          if (item === 'answer_status' && this.loadedDefaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS) {
            continue
          }

          const hasField = (this.filterFields.includes(item) && this.loadedDefaultFilterModel.filter.hasOwnProperty(item))

          // for boolean fields change tracking
          if (booleanProps.includes(item) &&
            +this.filter[item] !== +this.loadedDefaultFilterModel.filter[item] &&
            hasField) {
            this.updateChannelChangedFilterFields({
              name: item,
              value: +this.filter[item]
            })

            continue
          }

          // for non-boolean fields change tracking
          const filterItem = JSON.stringify(this.filter[item])
          const loadedFilterItem = JSON.stringify(this.loadedDefaultFilterModel.filter[item])

          let toDateUpdated = false

          if (item === 'to_date') {
            if (filterItem && loadedFilterItem && filterItem === loadedFilterItem) {
              toDateUpdated = true
              this.updateChannelChangedFilterFields({
                name: item,
                value: this.filter[item]
              })
            }
          }

          if (!this.booleanFields.includes(item) && filterItem !== loadedFilterItem &&
            hasField && !excludeProps.includes(item) && !toDateUpdated) {
            this.updateChannelChangedFilterFields({
              name: item,
              value: this.filter[item]
            })
          }
        }
      }

      // save filter changes
      const userScope = (this.selectedFilter?.scope === 'user' || !+this.selectedFilter?.is_on_company)
      const hasSelectedFilterChanges = this.selectedFilter && userScope && this.filterHasChanges

      if (hasSelectedFilterChanges) {
        this.setIsUpdatingFilter(true)

        this.updateFilter(this.selectedFilter, {
          filter: this.filter,
          type: this.loadedDefaultFilterModel.type,
          name: this.selectedFilter.name
        }).then(res => {
          this.setIsUpdatingFilter(false)
        }).catch(error => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
      }

      // apply filters of selected view/filter in inbox
      if (this.selectedFilter) {
        const filter = { ...this.selectedFilter }
        filter.filter = { ...this.filter }
        this.setSelectedFilter(filter)
        this.setAppliedFilter(filter)
        this.setChannelClonedFilter(filter.filter)
      }

      // add the communication type and answer_status filters
      const communicationType = _.get(this.value, 'type', null)
      const communicationAnswerStatus = _.get(this.value, 'answer_status', null)
      const finalFilters = {
        ...this.filter
      }

      if (communicationType) {
        finalFilters.type = communicationType
      }

      if ([ChannelType.CHANNEL_RECORDINGS, ChannelType.CHANNEL_VOICEMAILS].includes(this.filterModel.type) &&
        communicationAnswerStatus) {
        finalFilters.answer_status = communicationAnswerStatus
      }

      this.$emit('applyFilter', finalFilters)
      this.hideModal()
    },

    onSaveNewFilter () {
      this.reset = false
      this.$emit('createNewFilter', _.pick(this.filter, this.filterFields))
    },

    onSelectFilter (personalFilter) {
      console.log('onSelectFilter called')
      this.setSelectedFilter(personalFilter)
      if (!personalFilter) {
        this.filter = { ...this.filterModel.filter }
      } else {
        // combine default filter values with the selected one
        let personalFilterObject = personalFilter.filter
        this.filter = {
          ...this.filterModel.filter,
          ..._.pick(personalFilterObject, this.filterFields)
        }
        this.setIsFirstLoad(false)

        const formattedDates = this.formatDates(personalFilterObject.from_date, personalFilterObject.to_date)

        personalFilterObject.from_date = formattedDates.from_date
        personalFilterObject.to_date = formattedDates.to_date

        // Loop through ranges and if view.filter.filter.from_date === range[0] and view.filter.filter.to_date === range[1]
        // set the range to the key of the range
        let inRange = false
        for (const range in this.ranges) {
          const hasDatesValues = personalFilterObject && personalFilterObject.from_date && personalFilterObject.to_date
          if (hasDatesValues && personalFilterObject.from_date === this.ranges[range][0] && personalFilterObject.to_date === this.ranges[range][1]) {
            sessionStorage.setItem('date-selected', range)
            inRange = true
            break
          }
        }

        if (!inRange) {
          sessionStorage.setItem('date-selected', 'custom')
        }
      }

      this.applyFilter()
    },

    updateFilter (filter, params) {
      if (!params.scope) {
        const scope = [1, '1', true].includes(filter.is_on_company) ? 'company' : 'user'
        params = {
          ...params,
          scope: scope
        }
      }

      if (this.loadedDefaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS) {
        params.type = ChannelType.CHANNEL_CALLS
      }

      return talk2Api.V2.inbox.filters.update(filter.id, params).then(res => {
        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          const filter = { ...this.selectedFilter }
          filter.filter = { ...this.filter }

          this.setSelectedFilter(filter)

          if (this.filterModel.filter.type === params.type) {
            this.setAppliedFilter(filter)
            this.setChannelClonedFilter(filter.filter)
          }
        }
      })
    },

    /* TODO: this could be removed when "VIEWS" code will be removed deprecation-ref=1 */
    onRenameFilter (filter) {
      this.updateFilter(filter, filter)
    },

    applyFilter () {
      const isCreateViewWithActiveFilter = (this.selectedFilter || this.appliedFilter) && this.isFilterDialogForView && !this.isEditingView

      if (!this.selectedFilter || isCreateViewWithActiveFilter) {
        return
      }

      for (const prop in this.selectedFilter.filter) {
        this.filter[prop] = this.selectedFilter.filter[prop]
      }

      this.filter = {
        ...this.filter,
        untagged_only: +this.filter.untagged_only,
        first_time_only: +this.filter.first_time_only,
        exclude_automated_communications: +this.filter.exclude_automated_communications,
        my_contact: +this.filter.my_contact,
        has_unread: +this.filter.unread_only
      }
    },

    getFilterItemClass (item) {
      const selectedFilterClass = this.selectedFilter?.id === item.id
        ? 'active'
        : ''

      return [selectedFilterClass]
    },

    /* TODO: this could be removed when "VIEWS" code will be removed deprecation-ref=1 */
    renameFilter () {
      if (_.isEmpty(this.viewName)) {
        this.viewName = null
        return false
      }

      let filter = { ...this.selectedFilter }
      filter.name = this.viewName
      this.onRenameFilter(filter)
      this.setSelectedFilter(filter)
      this.viewName = null
      this.$refs['viewName'].blur()
    },

    setToNewFilter () {
      this.onResetFilter()
      this.onSelectFilter(null)
      this.setAppliedFilter(null)
    }
  },

  watch: {
    '$route.params.channel' (route) {
      // do not reset selected filter for inbox views
      if (!route || ['view', 'inbox'].includes(route)) {
        return
      }

      this.setSelectedFilter(null)
    },

    inboxShowMyContacts (newValue) {
      this.filter.my_contact = +newValue // convert boolean to numeric
    },

    inboxShowUnreads (newValue) {
      this.filter.unread_only = +newValue // convert boolean to numeric
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('channel_filter_created')
    this.$VueEvent.stop('my_contacts_update_filter')
    clearTimeout(this.inputTimeout)
  }
}
</script>
