<template>
  <div class="inbox-nav-list d-flex flex-column overflow-x-auto mb-1"
       data-testid="inbox-nav-list-wrapper"
       :class="{'inbox-nav-list--closed': closed}"
       id="communications-nav-list"
  >
    <!--   -->
    <nav-item badge-value="20"
              badge-color="danger"
              data-testid="inbox-nav-list-nav-item"
              :label="item.label"
              :value="item.value"
              :icon="item.icon"
              :group="item.group"
              :is-active="isActive(item.value)"
              :closed="closed"
              :badge="true"
              :open-count="openCount"
              :pending-count="pendingCount"
              :disabled="item.disabled"
              :tooltip="item.tooltip"
              v-for="item in communicationsChannels"
              :key="item.name"
              @click="onItemClicked" />

    <hr class="nav-item-separator">

    <!-- filters -->
    <saved-filters class="px-2 left-column-wrapper "
                   :fetch-filters="fetchSavedFilters"
                   :filter-type="filterTypeForGetSavedFilters"
                   :apply-query-filter="isFirstLoad"
                   @filterSelected="(item) => onSelectSavedFilter(item)"
                   @filters-fetched="()=> fetchSavedFilters = false"
                   @filterNotFound="loadCommunications"
    />

    <div v-if="shouldShowViewsUnderChannels">
      <nav-item class="nav-list-group-title d-flex justify-content-between"
                icon=""
                value=""
                label="Saved Filters"
                data-testid="inbox-nav-list-nav-item"
                :group="true">
        <template #action-icon>
          <q-btn class="mr-3 cursor-pointer"
                 icon="edit"
                 size="xs"
                 flat
                 data-testid="inbox-nav-list-nav-item-btn"
                 id="edit-views-icon"
                 @click="onShowViewsList" />
        </template>
      </nav-item>

      <!-- list only pinned views -->
      <nav-item :icon="!+view.filter?.is_on_company ? 'view' : ''"
                :value="`view-${view.filter_id}`"
                :label="view.filter.name"
                :is-active="isActive(view, 'view')"
                data-testid="inbox-nav-list-nav-item"
                v-for="(view, index) in pinnedViews"
                :key="`${view.filter.name}-${index}`"
                @click="onItemClicked" />

      <div class="py-3 text-center text-13 text-word-wrap"
           v-if="pinnedViews.length < 1">
        <span data-testid="inbox-nav-list-no-pinned-views">No Pinned Filters</span>
      </div>

      <communications-views target="#edit-views-icon"
                            :views="allSavedFilters"
                            data-testid="inbox-nav-list-inbox-views"
                            @closed="onCloseViewsList" />
    </div>
  </div>
</template>

<script>
import NavItem from './communications-nav-item.vue'
import CommunicationsViews from 'src/components/communications/communications-views.vue'
import SavedFilters from '../communications-filters/saved-filters.vue'
import { mapActions, mapState, mapGetters } from 'vuex'
import * as ChannelType from 'src/constants/inbox-channels'
import * as Filters from 'src/constants/filters'
import { communicationsRoutesMixin, communicationsMixin, userMixin } from 'src/plugins/mixins'
import communicationsDefaultFilterModelMixin from 'src/plugins/mixins/communications-default-filter-model.mixin'
import * as InboxTaskStatus from 'src/constants/inbox-task-status'
import { COMMUNICATIONS_CHANNELS_ROUTE_NAME, COMMUNICATIONS_VIEWS_ROUTE_NAME } from 'src/router/routes'
import { cloneDeep } from 'lodash'

export default {
  name: 'communications-nav-list',

  components: {
    CommunicationsViews,
    SavedFilters,
    NavItem
  },

  mixins: [
    communicationsRoutesMixin,
    communicationsMixin,
    communicationsDefaultFilterModelMixin,
    userMixin
  ],

  props: {
    value: {
      required: false
    },

    closed: {
      type: Boolean,
      default: false
    },

    openCount: {
      required: false,
      default: 0
    },

    pendingCount: {
      required: false,
      default: 0
    }
  },

  computed: {
    ...mapState('communications', [
      'navListItems',
      'activeChannel',
      'selectedFilter',
      'appliedFilter',
      'isFilterDialogShown',
      'pinnedViews',
      'isEditingView',
      'isFilterDialogForView',
      'personalFilters',
      'companyFilters'
    ]),

    ...mapState(['isFirstLoad']),

    ...mapGetters('communications', [
      'allSavedFilters'
    ]),

    ...mapGetters('auth', [
      'profile'
    ]),

    isShowActive () {
      return !this.$q.screen.lt.md
    },

    communicationsChannels () {
      return this.navListItems
    },

    filterTypeForGetSavedFilters () {
      return this.channelDefaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS
        ? ChannelType.CHANNEL_CALLS
        : this.channelDefaultFilterModel.type
    },

    /* TODO: this could be removed when "VIEWS" code will be removed deprecation-ref=1 */
    shouldShowViewsUnderChannels () {
      return false
    }
  },

  data () {
    return {
      active: this.value,
      fetchSavedFilters: false,
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
        'not_disposed',
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
      booleanFields: [
        'not_disposed',
        'first_time_only',
        'exclude_automated_communications',
        'untagged_only',
        'has_unread',
        'my_contact',
        'unread_only',
        'has_international'
      ],
      listeners: {
        pinnedViewsEvents: null,
        openInboxViewPopup: null,
        deletedFilter: null
      }
    }
  },

  created () {
    this.initializeDateRanges()
  },

  mounted () {

  },

  methods: {
    ...mapActions('communications', [
      'setActiveChannel',
      'setSelectedFilter',
      'resetChannelChangedFilterFields',
      'toggleFilterDialogWithFilters',
      'setAppliedFilter',
      'setInbox',
      'setInboxFilters',
      'setChannelClonedFilter',
      'setFilterDialogForView',
      'setShowViewsList',
      'toggleFilterDialog',
      'updateChannelChangedFilterFields'
    ]),

    ...mapActions(['setIsFirstLoad']),

    onItemClicked (nextActive) {
      // Reset and close views
      this.onCloseViewsList()
      this.resetFilter()

      this.active = nextActive
      const isView = nextActive.indexOf('view') !== -1

      // redirect page to Inbox View
      if (isView) {
        const viewId = nextActive.split('-')[1]
        const view = this.pinnedViews.find(view => +view.filter_id === +viewId)

        // Loop through ranges and if view.filter.filter.from_date === range[0] and view.filter.filter.to_date === range[1]
        // set the range to the key of the range
        for (const range in this.ranges) {
          const hasDatesValues = view.filter.filter && view.filter.filter.from_date && view.filter.filter.to_date
          if (hasDatesValues && view.filter.filter.from_date === this.ranges[range][0] && view.filter.filter.to_date === this.ranges[range][1]) {
            sessionStorage.setItem('view-selected', viewId)
            break
          }
        }

        this.currentTask = InboxTaskStatus.DEFAULT_STATUS
        this.setIsFirstLoad(false)
        this.onSelectView(view.filter)
        return
      }

      // Always update active channel and navigate, even if it's the same channel
      const channel = this.navListItems.find(item => item.value === nextActive)
      this.setActiveChannel(channel)

      this.$router.push({
        name: COMMUNICATIONS_CHANNELS_ROUTE_NAME,
        params: {
          channel: this.active
        }
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)

        this.$nextTick(() => {
          this.getCommunications(this.communicationFilters)
        })
      })
    },

    isActive (value, type = null) {
      if (type === 'view' || this.$route.params?.viewId) {
        return this.$route.params?.viewId && this.appliedFilter?.id === value.filter_id
      }

      return this.isShowActive && this.activeChannel && this.activeChannel.value === value
    },

    onSelectSavedFilter (filter) {
      filter = cloneDeep(filter)

      // Skip showing filter dialog
      let savedFilterObject = filter.filter

      if (this.isFirstLoad) {
        // apply query properties to this filter
        this.applyQueryStringFilters(filter, this.channelDefaultFilterModel)
      }

      // if is first load, apply filter_id to query without removing other params
      if (this.isFirstLoad) {
        const query = {
          ...this.$route.query,
          filter_id: filter.id
        }
        this.$router.replace({ query }).catch(() => { })
      } else {
        this.$router.replace({ query: { filter_id: filter.id } }).catch(() => {})
      }

      this.setSelectedFilter(filter)

      const formattedDates = this.formatDates(savedFilterObject.from_date, savedFilterObject.to_date)
      savedFilterObject.from_date = formattedDates.from_date
      savedFilterObject.to_date = formattedDates.to_date

      if (savedFilterObject.date_range && !['All Time', 'custom'].includes(savedFilterObject.date_range)) {
        // if not all time or custom, set the date for the specific range
        const range = this.ranges[savedFilterObject.date_range]
        const formattedDates = this.formatDates(range[0], range[1])
        savedFilterObject.from_date = formattedDates.from_date
        savedFilterObject.to_date = formattedDates.to_date
      } else {
        const formattedDates = this.formatDates(savedFilterObject.from_date, savedFilterObject.to_date)
        savedFilterObject.from_date = formattedDates.from_date
        savedFilterObject.to_date = formattedDates.to_date

        let dateRange = !savedFilterObject.from_date && !savedFilterObject.to_date ? 'All Time' : 'custom'

        // Loop through ranges and if view.filter.filter.from_date === range[0] and view.filter.filter.to_date === range[1]
        // set the range to the key of the range
        for (const range in this.ranges) {
          const hasDatesValues = savedFilterObject && savedFilterObject.from_date && savedFilterObject.to_date
          if (hasDatesValues && savedFilterObject.from_date === this.ranges[range][0] && savedFilterObject.to_date === this.ranges[range][1]) {
            dateRange = range
            break
          }
        }

        savedFilterObject.date_range = dateRange
      }

      // Reset any existing filter changes
      this.resetChannelChangedFilterFields()
      // reset channel cloned filter to the default filter
      this.setChannelClonedFilter(this.channelDefaultFilterModel.filter)

      // Update channel changed filter fields for each property in the filter
      const loadedDefaultFilterModel = this.channelDefaultFilterModel

      for (const item in savedFilterObject) {
        const defaultModelHasField = loadedDefaultFilterModel.filter.hasOwnProperty(item)

        // for boolean fields change tracking
        if (this.booleanFields.includes(item) &&
          +savedFilterObject[item] !== +loadedDefaultFilterModel.filter[item] &&
          defaultModelHasField) {
          this.updateChannelChangedFilterFields({
            name: item,
            value: +savedFilterObject[item]
          })

          continue
        }

        // for non-boolean fields change tracking
        const filterItem = JSON.stringify(savedFilterObject[item])
        const loadedFilterItem = JSON.stringify(loadedDefaultFilterModel.filter[item])

        // Special handling for date
        if (item === 'to_date' && filterItem && loadedFilterItem && filterItem === loadedFilterItem) {
          this.updateChannelChangedFilterFields({
            name: item,
            value: savedFilterObject[item][item]
          })
        } else if (defaultModelHasField) {
          // Update other filter fields
          this.updateChannelChangedFilterFields({
            name: item,
            value: savedFilterObject[item]
          })
        }
      }

      // Apply the filter
      this.setAppliedFilter(filter)
      this.setChannelClonedFilter(savedFilterObject)

      this.setIsFirstLoad(false)

      // Get communications with the new filter
      this.$nextTick(() => {
        this.getCommunications(savedFilterObject)
      })
    },

    onSelectView (filter) {
      if (!filter || filter?.id === this.selectedFilter?.id) {
        return
      }

      // fill in the value for the newly added filter in case it's not yet included
      // in the existing saved set to properly display in its respective select component
      if (!filter.filter.hasOwnProperty('dynamic_engagement_date_range')) {
        filter.filter.dynamic_engagement_date_range = Filters.DEFAULT_STATE.filter.dynamic_engagement_date_range
      }

      this.setSelectedFilter(filter)
      this.applyFilter()
    },

    applyFilter () {
      this.resetChannelChangedFilterFields()

      this.setAppliedFilter(this.selectedFilter)
      this.$router.push({
        name: COMMUNICATIONS_VIEWS_ROUTE_NAME,
        params: {
          viewId: this.selectedFilter.id,
          status: this.statusText,
          channel: 'view'
        }
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    },

    onShowViewsList () {
      this.setShowViewsList(true)
    },

    onCloseViewsList () {
      this.setShowViewsList(false)
    },

    resetFilter () {
      this.toggleFilterDialogWithFilters(true)

      this.$VueEvent.fire('reset-communications-filters')
    },

    loadCommunications () {
      this.getCommunications(this.communicationFilters)
    }
  },

  watch: {
    value () {
      this.active = this.value
    },

    active (val) {
      // set & emit correct active channel
      if (this.value !== undefined && this.active !== this.value) {
        let activeChannel = null

        if (val.indexOf('view') !== -1) { // "e.g.. view-123"
          const viewId = val.split('-')[1]
          activeChannel = this.getPinnedViewChannel(viewId)
        } else {
          activeChannel = this.navListItems.find(item => item.value === val)
        }

        this.$emit('active', activeChannel)
        this.$emit('update:value', val)
      }
    },

    activeChannel: {
      handler (val) {
        this.fetchSavedFilters = true
        setTimeout(() => {
          this.fetchSavedFilters = false
        }, 1000)
      },
      immediate: true,
      deep: true
    },

    isFilterDialogShown (state) {
      if (state || !this.appliedFilter) {
        return
      }

      if (!this.$route.params.hasOwnProperty('viewId')) {
        return
      }

      // fix route when user is in some view
      const currentViewRouteId = this.$route.params.viewId

      // this means that the filter was changed but the route remained
      if (currentViewRouteId !== this.appliedFilter.id) {
        const channel = this.getPinnedViewChannel(this.appliedFilter.id)
        this.setActiveChannel(channel)

        this.$router.push({
          name: COMMUNICATIONS_VIEWS_ROUTE_NAME,
          params: {
            viewId: this.appliedFilter.id,
            status: this.statusText,
            channel: 'view'
          }
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
      }
    },

    filtersLoaded () {
      if (this.filtersLoaded) {
        this.$nextTick(() => {
          this.getCommunications(this.communicationFilters)
        })
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('viewPinned', this.listeners.pinnedViewsEvents)
    this.$VueEvent.stop('viewUnpinned', this.listeners.pinnedViewsEvents)
    this.$VueEvent.stop('openInboxViewPopup', this.listeners.openInboxViewPopup)
    this.$VueEvent.stop('filter_deleted', this.listeners.deletedFilter)
  }
}
</script>
