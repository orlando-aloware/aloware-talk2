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
                   @filterSelected="(item) => onSelectSavedFilter(item)"
                   @filters-fetched="()=> fetchSavedFilters = false"
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
      'isFilterDialogForView'
    ]),

    ...mapGetters('communications', [
      'allSavedFilters'
    ]),

    ...mapGetters('auth', [
      'profile'
    ]),

    isShowActive () {
      const isMobileInboxRoutes = this.$q.screen.lt.md && this.inboxTaskAndCommRoutes.includes(this.$route.name)

      return !this.$q.screen.lt.md || isMobileInboxRoutes
    },

    communicationsChannels () {
      return this.navListItems
    },

    filterTypeForGetSavedFilters () {
      return this.channelDefaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS
        ? ChannelType.CHANNEL_CALLS
        : this.channelDefaultFilterModel.type
    },

    shouldShowViewsUnderChannels () {
      /* WAT-1105: the channels and view are being moved to communications menu
        so should not being displayed here if the feature is active */
      if (this.hasNewCommunicationsFeatureEnabled) {
        return false
      }

      return (this.isCompanyPartOfAlowareDemoCompanies(this.profile.company_id) || this.isInboxViewsEnabledCompany)
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
      // avoid redundant navigation
      if (nextActive === this.activeChannel.value) {
        return
      }

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
            sessionStorage.setItem('date-selected-comms', range)
            sessionStorage.setItem('view-selected', viewId)
            break
          }
        }

        this.currentTask = InboxTaskStatus.DEFAULT_STATUS
        this.setIsFirstLoad(false)
        this.onSelectView(view.filter)
        return
      }
      if (!this.activeChannel) {
        return
      }

      this.active = nextActive
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

    async onSelectSavedFilter (filter) {
      // Skip showing filter dialog
      let personalFilterObject = filter.filter

      this.setSelectedFilter(filter)

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
          sessionStorage.setItem('date-selected-comms', range)
          inRange = true
          break
        }
      }

      if (!inRange) {
        sessionStorage.setItem('date-selected-comms', 'custom')
      }

      // Reset any existing filter changes
      this.resetChannelChangedFilterFields()
      // reset channel cloned filter to the default filter
      this.setChannelClonedFilter(this.channelDefaultFilterModel.filter)

      // Update channel changed filter fields for each property in the filter
      const excludeProps = ['changed', 'per_page', 'cursor']
      const loadedDefaultFilterModel = this.channelDefaultFilterModel

      for (const item in personalFilterObject) {
        const hasField = loadedDefaultFilterModel.filter.hasOwnProperty(item)

        // for boolean fields change tracking
        if (this.booleanFields.includes(item) &&
          +personalFilterObject[item] !== +loadedDefaultFilterModel.filter[item] &&
          hasField) {
          this.updateChannelChangedFilterFields({
            name: item,
            value: +personalFilterObject[item]
          })

          continue
        }

        // for non-boolean fields change tracking
        const filterItem = JSON.stringify(personalFilterObject[item])
        const loadedFilterItem = JSON.stringify(loadedDefaultFilterModel.filter[item])

        let toDateUpdated = false

        // Special handling for from_date and to_date
        if (item === 'to_date') {
          if (filterItem && loadedFilterItem && filterItem === loadedFilterItem) {
            toDateUpdated = true
            this.updateChannelChangedFilterFields({
              name: item,
              value: personalFilterObject[item][item]
            })
          }
        }

        // Update other filter fields
        if (!this.booleanFields.includes(item) && filterItem !== loadedFilterItem && hasField && !excludeProps.includes(item) && !toDateUpdated) {
          this.updateChannelChangedFilterFields({
            name: item,
            value: personalFilterObject[item]
          })
        }
      }

      // Apply the filter
      this.setAppliedFilter(filter)
      this.setChannelClonedFilter(personalFilterObject)

      // Get communications with the new filter
      this.$nextTick(() => {
        this.getCommunications(personalFilterObject)
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
