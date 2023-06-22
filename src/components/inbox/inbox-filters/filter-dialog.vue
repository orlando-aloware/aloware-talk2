<template>
  <b-modal id="inbox-channel-filter-modal"
           ref="inboxChannelFilterModal"
           size="lg"
           modal-class="confirm-dialog"
           hide-header-close
           hide-header
           hide-footer
           v-model="isOpen"
           @hidden="onHidden"
           @show="onShow"
           @shown="onShown">
    <div class="modal-body-wrapper d-flex">
      <div class="left-column-wrapper">
        <span class="filter-type-description">{{ channelFilterName }}</span>

        <div class="mt-3">
          <div class="mb-4">
            <div class="filter-items cursor-pointer position-relative"
                 v-bind:class="{ 'active' : !selectedFilter }"
                 @click="onSelectFilter(null)">
              <span>New (Untitled)
                <span class="position-absolute check-icon"
                      v-if="!selectedFilter">
                  <check-o-icon color="#040404" />
                </span>
              </span>
            </div>
          </div>
          <h5 class="text-uppercase filter-group-title">Personal Filters</h5>
          <div class="saved-filters">
            <q-skeleton type="rect"
                        v-if="isGettingFilters" />
            <p class="text-muted fs-12 empty-filter-placeholder pl-2"
               v-show="!isGettingFilters"
               v-if="personalFilters.length < 1">
              None
            </p>
            <filter-list-items :key="item.id"
                               :filter="item"
                               v-for="item in personalFilters"
                               @filterSelected="onSelectFilter"
                               @filterRename="onRenameFilter"
                               @filterDelete="(e) => onDeleteFilter(e, item)">
            </filter-list-items>
          </div>
          <h5 class="text-uppercase filter-group-title mt-4">Company Filters</h5>
          <div class="saved-filters">
            <q-skeleton type="rect"
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
          <div class="w-100 text-left">
            <span class="filter-name">{{ selectedFilter ? selectedFilter.name : 'Untitled' }}</span>
          </div>
          <compact-btn class="border-0 pl-0 pr-0"
                       @clicked="onHide">
            <close-icon iconColor="#000000" />
          </compact-btn>
        </div>
        <filter-form ref="inboxChannelFilterForm"
                     :default-filter-model="defaultFilterModel"
                     :filter="filter">
        </filter-form>
        <div class="container d-flex justify-content-end mt-3 action-option-container">
          <div>
            <compact-btn class="mr-3 btn-tertiary"
                         :disabled="!filterHasChanges"
                         @clicked="onResetFilter">
              Reset
            </compact-btn>
            <compact-btn class="btn-secondary"
                         :disabled="isSaveAsNewDisabled"
                         @clicked="onSaveNewFilter">
              Save as New
            </compact-btn>
            <compact-btn variant="primary"
                         class="ml-3"
                         :disabled="isUpdatingFilter"
                         @clicked="onApply">
              <q-spinner-bars color="white"
                              class="mr-1"
                              v-if="isUpdatingFilter"/>
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

  computed: {
    ...mapState('inbox', [
      'channelChangedFilterFields',
      'selectedFilter',
      'isFilterDialogShown',
      'channelClonedFilter',
      'isFilterModelFormShown',
      'appliedFilter',
      'inboxShowMyContacts'
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

      if (this.$route.params.view) {
        return 'Views'
      }

      return 'Calls & Recordings Filters'
    },

    selectedFilterHasChanges () {
      if (!this.selectedFilter || !this.selectedFilterClone) {
        return false
      }

      const filterStringified = JSON.stringify(this.$options.filters.sortObjectByKey(this.filter))
      const selectedFilterStringified = JSON.stringify(this.$options.filters.sortObjectByKey(this.selectedFilterClone.filter))

      return filterStringified !== selectedFilterStringified
    },

    filterHasChanges () {
      const filterIdentifier = this.selectedFilter ? this.selectedFilter.filter : this.defaultFilterModel.filter

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

      if (this.selectedFilter && this.selectedFilter.scope === 'user' && this.filterHasChanges) {
        return 'Apply & Save'
      }

      return 'Apply'
    },

    isSaveAsNewDisabled () {
      return !this.filterHasChanges ||
        this.defaultFilterModel.type === ChannelType.CHANNEL_MENTIONS
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
        'contact_owner',
        'my_contact',
        'from_date',
        'to_date',
        'creator_type'
      ],
      inputTimeout: null,
      booleanFields: [
        'first_time_only',
        'exclude_automated_communications',
        'untagged_only',
        'my_contact'
      ],
      ChannelType
    }
  },

  created () {
    this.setSelectedFilter(null)
  },

  mounted () {
    this.toggleFilterDialog()

    this.$VueEvent.listen('channel_filter_created', filter => {
      if (filter.is_on_company) {
        this.companyFilters.push(filter)
        return
      }

      this.personalFilters.push(filter)

      this.$VueEvent.fire('personalFiltersUpdated', this.personalFilters)
    })
  },

  methods: {
    ...mapActions('inbox', [
      'toggleFilterModelForm',
      'setSelectedFilter',
      'setAppliedFilter',
      'updateChannelChangedFilterFields',
      'resetChannelChangedFilterFields',
      'toggleFilterDialog',
      'setChannelClonedFilter',
      'setInboxShowMyContacts'
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
      this.filterFields = Object.keys(this.defaultFilterModel.filter)
      this.getFilters()

      if (this.selectedFilter) {
        this.filter = { ...this.selectedFilter.filter, ...this.filter }
      } else {
        this.filter = _.pick(this.value, this.filterFields)
      }

      this.setChannelClonedFilter(this.defaultFilterModel.filter)
    },

    onShown () {
      this.refreshTagSelector()

      if (!this.appliedFilter) {
        this.setSelectedFilter(null)
        this.filter = _.pick(this.value, this.filterFields)
        this.applyFilter()
      }
    },

    refreshTagSelector () {
      if (this.$refs.inboxChannelFilterForm?.$refs.tagSelector) {
        this.$refs.inboxChannelFilterForm.$refs.tagSelector.$refs.tagSelect.focus()

        setTimeout(() => {
          this.$refs.inboxChannelFilterForm.$refs.tagSelector.$refs.tagSelect.blur()
          this.$refs.inboxChannelFilterForm.$refs.tagSelector.$refs.tagSelect.hidePopup()
        }, 200)
      }
    },

    onResetFilter: function () {
      // if there's a selected filter, then use selected filter saved values, otherwise use channel's default filter
      const useFilter = this.selectedFilter ? this.selectedFilter.filter : this.defaultFilterModel.filter

      for (const item in useFilter) {
        if (this.booleanFields.includes(item)) {
          // convert boolean to numeric
          this.filter[item] = +useFilter[item]
          continue
        }

        this.filter[item] = useFilter[item]
      }
    },

    onApply () {
      this.resetChannelChangedFilterFields()
      const myContactsFilter = _.get(this.filter, 'my_contact', null)

      if (myContactsFilter !== null && myContactsFilter !== (this.inboxShowMyContacts | 0)) {
        this.setInboxShowMyContacts(Boolean(myContactsFilter))
      }

      const props = [
        'first_time_only',
        'exclude_automated_communications',
        'untagged_only'
      ]

      for (const item in this.filter) {
        if (item === 'answer_status' && this.defaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS) {
          continue
        }

        const hasField = (this.filterFields.includes(item) && this.defaultFilterModel.filter.hasOwnProperty(item))

        if (props.includes(item) &&
          +this.filter[item] !== +this.defaultFilterModel.filter[item] &&
          hasField) {
          this.updateChannelChangedFilterFields({
            name: item,
            value: +this.filter[item]
          })

          continue
        }

        if (!this.booleanFields.includes(item) &&
          JSON.stringify(this.filter[item]) !== JSON.stringify(this.defaultFilterModel.filter[item]) &&
          hasField) {
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
        }).catch(error => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
      }

      this.setAppliedFilter(this.selectedFilter || null)

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

    onSaveFilter () {
      if (!this.selectedFilter) {
        this.toggleFilterModelForm(true)
        return
      }

      this.isUpdatingFilter = true
      this.updateFilter(this.selectedFilter, {
        ...this.filter,
        name: this.selectedFilter.name,
        scope: this.selectedFilter.scope
      }).then(() => {
        this.isUpdatingFilter = false
      }).catch(error => {
        const {
          message,
          html
        } = extractErrorMessage(error)
        console.log(html)
        this.$generalNotification(message, 'error')
      })
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
        : (this.$route.params.view ? null : this.defaultFilterModel.type)

      return talk2Api.V2.inbox.filters.get({ type: type }).then(response => {
        this.personalFilters = response.data.data.user || []
        this.companyFilters = response.data.data.company || []
        this.isGettingFilters = false
      })
    },

    updateFilter (filter, params) {
      if (!params.scope) {
        const scope = [1, '1', true].includes(filter.is_on_company) ? 'company' : 'user'
        params = { ...params, scope: scope }
      }

      if (this.defaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS) {
        params.type = ChannelType.CHANNEL_CALLS
      }

      return talk2Api.V2.inbox.filters.update(filter.id, params).then(res => {
        const updatedFilter = res.data.filter

        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          const filter = { ...this.selectedFilter }
          filter.filter = { ...this.filter }
          this.setSelectedFilter(filter)
        }

        if (!updatedFilter.is_on_company) {
          const index = this.personalFilters.findIndex(item => item.id === filter.id)

          if (index >= 0) {
            this.personalFilters[index] = updatedFilter

            this.$VueEvent.fire('personalFiltersUpdated', this.personalFilters)
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

          this.$VueEvent.fire('personalFiltersUpdated', this.personalFilters)
        }
      })
    },

    filterCreated (filter) {
      if (filter.is_on_company) {
        this.companyFilters.push(filter)
        return
      }

      this.personalFilters.push(filter)
    },

    applyFilter () {
      if (!this.selectedFilter) {
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
        my_contact: +this.filter.my_contact
      }

      setTimeout(() => {
        this.refreshTagSelector()
      }, 1000)
    },

    getFilterItemClass (item) {
      const selectedFilterClass = this.selectedFilter?.id === item.id
        ? 'active'
        : ''

      return [selectedFilterClass]
    }
  },

  watch: {
    '$route.params.channel' (route) {
      if (!route) {
        return
      }

      this.setSelectedFilter(null)
    },

    inboxShowMyContacts (newValue) {
      this.filter.my_contact = +newValue // convert boolean to numeric
    }
  },

  beforeDestroy () {
    clearTimeout(this.inputTimeout)
  }
}
</script>
