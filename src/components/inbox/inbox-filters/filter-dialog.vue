<template>
  <b-modal id="inbox-channel-filter-modal"
           ref="inboxChannelFilterModal"
           size="lg"
           modal-class="confirm-dialog"
           hide-header-close
           hide-header
           hide-footer
           data-testid="filter-dialog-modal"
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
                    <check-o-icon data-testid="filter-dialog-check-o-icon" color="#040404" />
                  </span>
                </div>
              </div>
            </div>
            <h5 class="text-uppercase filter-group-title" data-testid="filter-dialog-personal-filter-title">Personal Filters</h5>
            <div class="saved-filters">
              <q-skeleton type="rect"
                          v-if="isGettingFilters"
                          data-testid="filter-dialog-skeleton"/>
              <p class="text-muted fs-12 empty-filter-placeholder pl-2"
                 v-show="!isGettingFilters"
                 v-if="personalFilters.length < 1"
                 data-testid="filter-dialog-none-p">
                None
              </p>
              <filter-list-items :key="item.id"
                                 :filter="item"
                                 v-for="item in personalFilters"
                                 data-testid="filter-dialog-filter-list-items"
                                 @filterSelected="onSelectFilter"
                                 @filterRename="onRenameFilter"
                                 @filterDelete="(e) => onDeleteFilter(e, item)">
              </filter-list-items>
            </div>
            <h5 class="text-uppercase filter-group-title mt-4">Company Filters</h5>
            <div class="saved-filters">
              <q-skeleton type="rect"
                          data-testid="filter-dialog-skeleton"
                          v-if="isGettingFilters" />
              <p class="text-muted fs-12 empty-filter-placeholder pl-2"
                 v-show="!isGettingFilters"
                 v-if="companyFilters.length < 1">
                None
              </p>

              <div class="filter-items cursor-pointer"
                   :class="getFilterItemClass(item)"
                   :key="item.id"
                   v-for="item in companyFilters"
                   data-testid="filter-dialog-select-filter"
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
      </div>

      <div class="flex-grow-1 right-column-wrapper"
           :class="!isFilterDialogForView ? 'w-50' : ''">
        <div class="d-flex justify-content-between mb-3 px-3">
          <q-input class="view-filter-name mb-0 w-50"
                   ref="viewName"
                   debounce="500"
                   :label="filterFormDisplayName"
                   :dense="true"
                   clearable
                   data-testid="filter-dialog-view-name-input"
                   v-model.trim="viewName"
                   v-if="isEditingView && selectedFilter && (!+selectedFilter?.is_on_company || selectedFilter?.scope === 'user')"
                   @keyup.enter="renameFilter" />
          <div class="w-100 text-left pt-2 pb-1"
              v-else>
            <span class="filter-name">{{ filterFormDisplayName }}</span>
          </div>
          <compact-btn class="border-0 pl-0 pr-0"
                       data-testid="filter-dialog-close-compact-btn"
                       @clicked="onHide">
            <close-icon iconColor="#000000" />
          </compact-btn>
        </div>
        <filter-form ref="inboxChannelFilterForm"
                     :default-filter-model="loadedDefaultFilterModel"
                     :filter="filter"
                     data-testid="filter-dialog-filter-form">
        </filter-form>
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
                         v-if="isViewEditModeOrNonView"
                         data-testid="filter-dialog-apply-compact-btn"
                         @clicked="onApply">
              <q-spinner-bars color="white"
                              class="mr-1"
                              v-if="isUpdatingFilter"
                              data-testid="filter-dialog-spinners-bars"/>
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
import FilterForm from 'components/inbox/inbox-filters/filter-form'
import { mapActions, mapState } from 'vuex'
import CompactBtn from 'components/compact-btn'
import talk2Api from 'src/plugins/api/api'
import FilterListItems from 'components/inbox/inbox-filters/filter-list-items'
import CheckOIcon from 'components/icons/check-o-icon'
import CloseIcon from 'components/icons/close-icon'
import _ from 'lodash'
import * as ChannelType from 'src/constants/inbox-channels'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import * as Filters from 'src/constants/filters'

export default {
  name: 'filter-dialog',

  components: {
    CloseIcon,
    CompactBtn,
    FilterForm,
    FilterListItems,
    CheckOIcon
  },

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

  data () {
    return {
      isRenaming: false,
      isDeletingFilter: false,
      isUpdatingFilter: false,
      isGettingFilters: false,
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
        'contact_owner',
        'my_contact',
        'from_date',
        'to_date',
        'creator_type',
        'dynamic_engagement_date_range',
        'has_unread'
      ],
      inputTimeout: null,
      booleanFields: [
        'first_time_only',
        'exclude_automated_communications',
        'untagged_only',
        'my_contact',
        'has_unread'
      ],
      ChannelType,
      viewName: null
    }
  },

  created () {
    if (!this.appliedFilter) {
      this.setSelectedFilter(null)
    }
  },

  mounted () {
    this.toggleFilterDialog()

    this.$VueEvent.listen('channel_filter_created', filter => {
      if (filter.is_on_company) {
        this.companyFilters.push(filter)
        return
      }

      // add to personal filters of currently selected channel
      if (filter.type === this.defaultFilterModel.type) {
        this.personalFilters.push(filter)
      }

      // update inbox views popup list
      const exists = this.inboxPersonalFilters.find(item => +item.id === +filter.id)
      if (filter.type === ChannelType.CHANNEL_INBOX && !exists) {
        this.inboxPersonalFilters.push(filter)
      }
    })

    this.$VueEvent.listen('my_contacts_update_filter', () => {
      this.filter = { ...this.appliedFilter.filter }
      this.filter.my_contact = +this.inboxShowMyContacts
      this.onApply(true)
    })
  },

  computed: {
    ...mapState('inbox', [
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
      'activeChannel',
      'inboxPersonalFilters'
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
      const isInbox = !this.$route.params.channel && this.$route.name === 'Inbox'

      if (this.isFilterDialogForView || ['Inbox View', 'Inbox View Contact Task'].includes(this.$route.name)) {
        return 'Views'
      }

      if (isInbox || this.$route.params.channel === 'inbox') {
        return 'Inbox Filters'
      }

      if (this.$route.params.channel === 'messages') {
        return 'Messages Filters'
      }

      if (this.$route.params.channel === 'voicemails') {
        return 'Voice Messages Filters'
      }

      if (this.$route.params.channel === 'mentions') {
        return 'Mentions Filters'
      }

      if (this.$route.params.channel === 'all-communications') {
        return 'All Comms. Filters'
      }

      if (this.$route.params.channel === 'my-personal-line') {
        return 'My Comms. Filters'
      }

      return 'Calls & Recordings Filters'
    },

    filterHasChanges () {
      const filterIdentifier = this.isFilterUpdateMode ? this.selectedFilter.filter : this.loadedDefaultFilterModel.filter

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
        (!this.isFilterDialogForView && this.defaultFilterModel.type === ChannelType.CHANNEL_MENTIONS)
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

      return this.defaultFilterModel
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
      'toggleFilterDialogWithFilters',
      'setChannelClonedFilter',
      'setInboxShowMyContacts',
      'setInboxShowUnreads',
      'setPinnedViews',
      'setFilterDialogForView',
      'setFilterDialogForView',
      'setInboxPersonalFilters',
      'setShowViewsList'
    ]),

    ...mapActions(['setTags']),

    hideModal () {
      this.$refs.inboxChannelFilterModal.hide()
    },

    onHidden () {
      const isForCreateView = this.isFilterModelFormShown && this.isFilterDialogForView
      this.setFilterDialogForView(isForCreateView)

      // reset selected filter to applied filter when applicable
      // selected filter can be changed in "View" edit mode
      if (!this.isFilterDialogForView && this.appliedFilter) {
        this.setSelectedFilter(this.appliedFilter)
      }

      if (!this.isFilterDialogForView && !this.appliedFilter && this.channelChangedFilterFields.length) {
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
      this.personalFilters = []
      this.companyFilters = []
      this.filterFields = Object.keys(this.loadedDefaultFilterModel.filter)
      this.getFilters()

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
      const useFilter = this.selectedFilter && (this.isFilterDialogForView && this.isEditingView) ? this.selectedFilter.filter : this.defaultFilterModel.filter

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
      this.resetChannelChangedFilterFields()

      const myContactsFilter = _.get(this.filter, 'my_contact', null)

      if (myContactsFilter !== null && myContactsFilter !== (this.inboxShowMyContacts | 0)) {
        this.setInboxShowMyContacts(Boolean(myContactsFilter))
      }

      const unreadsFilter = _.get(this.filter, 'unread_only', null)

      if (unreadsFilter !== null && unreadsFilter !== (this.inboxShowUnreads | 0)) {
        this.setInboxShowUnreads(Boolean(unreadsFilter))
      }

      const booleanProps = [
        'first_time_only',
        'exclude_automated_communications',
        'untagged_only',
        'has_unread'
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
          if (!this.booleanFields.includes(item) && filterItem !== loadedFilterItem &&
            hasField && !excludeProps.includes(item)) {
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
        this.isUpdatingFilter = true

        this.updateFilter(this.selectedFilter, {
          filter: this.filter,
          type: this.loadedDefaultFilterModel.type,
          name: this.selectedFilter.name
        }).then(res => {
          this.isUpdatingFilter = false
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

      if ([ChannelType.CHANNEL_RECORDINGS, ChannelType.CHANNEL_VOICEMAILS].includes(this.defaultFilterModel.type) &&
        communicationAnswerStatus) {
        finalFilters.answer_status = communicationAnswerStatus
      }

      this.$emit('applyFilter', finalFilters)
      this.hideModal()
    },

    onSaveNewFilter () {
      this.$emit('createNewFilter', _.pick(this.filter, this.filterFields))
    },

    onSelectFilter (personalFilter) {
      this.setSelectedFilter(personalFilter)

      if (!personalFilter) {
        this.filter = { ...this.defaultFilterModel.filter }
      } else {
        // combine default filter values with the selected one
        const personalFilterObject = personalFilter.filter
        this.filter = {
          ...this.defaultFilterModel.filter,
          ..._.pick(personalFilterObject, this.filterFields)
        }
      }

      this.applyFilter()
    },

    getFilters () {
      if (this.defaultFilterModel.type === ChannelType.CHANNEL_MENTIONS) {
        return
      }

      this.isGettingFilters = true
      const type = this.defaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS
        ? ChannelType.CHANNEL_CALLS
        : (this.isFilterDialogForView ? ChannelType.CHANNEL_INBOX : this.defaultFilterModel.type)

      return talk2Api.V2.inbox.filters.get({ type: type })
        .then(response => {
          this.personalFilters = response.data.data.user || []
          this.companyFilters = response.data.data.company || []

          // Gather all tags IDs from, filter data, personal and company filters into a single list for display in select
          let tagsIds = []

          if (this.filter.tags) {
            tagsIds = [...new Set([...tagsIds, ...this.filter.tags])]
          }

          this.personalFilters.forEach(filter => {
            if (filter.filter.tags) {
              tagsIds = [...new Set([...tagsIds, ...filter.filter.tags])]
            }
          })
          this.companyFilters.forEach(filter => {
            if (filter.filter.tags) {
              tagsIds = [...new Set([...tagsIds, ...filter.filter.tags])]
            }
          })
          this.getTagsByIds(tagsIds)
        })
    },

    getTagsByIds (ids) {
      return talk2Api.V1.tags.get({ params: { tag_ids: ids } })
        .then(response => {
          this.setTags(response.data.data)
          this.isGettingFilters = false
        })
    },

    updateFilter (filter, params) {
      if (!params.scope) {
        const scope = [1, '1', true].includes(filter.is_on_company) ? 'company' : 'user'
        params = { ...params, scope: scope }
      }

      if (this.loadedDefaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS) {
        params.type = ChannelType.CHANNEL_CALLS
      }

      return talk2Api.V2.inbox.filters.update(filter.id, params).then(res => {
        const updatedFilter = res.data.filter

        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          const filter = { ...this.selectedFilter }
          filter.filter = { ...this.filter }

          this.setSelectedFilter(filter)

          if (this.defaultFilterModel.filter.type === params.type) {
            this.setAppliedFilter(filter)
            this.setChannelClonedFilter(filter.filter)
          }
        }

        if (!updatedFilter.is_on_company) {
          const personalFiltersIndex = this.personalFilters.findIndex(item => item.id === filter.id)
          const inboxPersonalFiltersIndex = this.inboxPersonalFilters.findIndex(item => item.id === filter.id)
          const pinnedViewIndex = this.pinnedViews.findIndex(view => +view.filter_id === +filter.id)

          // update personal filters based on actively selected channel
          if (personalFiltersIndex >= 0 && updatedFilter.type === this.loadedDefaultFilterModel.type) {
            this.personalFilters[personalFiltersIndex] = updatedFilter
          }

          // update inbox personal filters loaded in inbox views list
          if (inboxPersonalFiltersIndex >= 0 && updatedFilter.type === ChannelType.CHANNEL_INBOX) {
            this.inboxPersonalFilters[inboxPersonalFiltersIndex] = updatedFilter
            this.setInboxPersonalFilters([...this.inboxPersonalFilters])
          }

          // update the pinned view if it is pinned
          if (pinnedViewIndex >= 0) {
            this.pinnedViews[pinnedViewIndex].filter = updatedFilter
            this.setPinnedViews([...this.pinnedViews])
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
        this.isDeletingFilter = false

        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          this.setSelectedFilter(null)
        }

        if (!filter.is_on_company) {
          // update the personal filters of currently selected channel
          if (filter.type === this.defaultFilterModel.type) {
            this.personalFilters = this.personalFilters.filter(item => item.id !== filter.id)
          }

          // update inbox views popup list
          if (filter.type === ChannelType.CHANNEL_INBOX) {
            const inboxPersonalFilters = this.inboxPersonalFilters.filter(item => item.id !== filter.id)
            this.setInboxPersonalFilters(inboxPersonalFilters)
          }

          // update the pinned view if it is pinned
          const pinnedViewIndex = this.pinnedViews.findIndex(view => +view.filter_id === +filter.id)
          if (pinnedViewIndex >= 0) {
            this.pinnedViews.splice(pinnedViewIndex, 1)
            this.setPinnedViews(this.pinnedViews)
          }
        }
      })
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
