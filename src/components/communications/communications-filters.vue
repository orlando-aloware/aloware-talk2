<template>
  <div class="filter-wrapper d-flex align-items-center"
       :class="filterWrapperClass">
    <compact-btn customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
                 borderless
                 variant="outlined-light"
                 data-testid="inbox-channels-apply-filters"
                 @clicked="onClickAppliedFilterButton">
      Filters
    </compact-btn>

    <b-badge class="ml-1 fs-12"
             variant="primary"
             data-testid="inbox-channels-filter-badge"
             v-if="hasChannelFilterChanges"
             v-b-modal:inbox-channel-filter-modal>
      {{ changedFilterFieldCount }}
    </b-badge>

    <compact-btn customClass="ml-auto s-14 _500 position-relative primary not-focusable"
                 borderless
                 variant="outlined-light"
                 data-testid="comms-channels-reset-filters-btn"
                 v-if="hasChannelFilterChanges || appliedFilter"
                 @clicked="onResetFilters">
      <i class="fa fa-times" />
    </compact-btn>

    <filter-dialog :filter-model="channelDefaultFilterModel"
                   data-testid="comms-channels-filter-dialog"
                   v-model="filter"
                   @createNewFilter="onCreateNewFilter"
                   @applyFilter="onApplyFilter"
                   @onResetFilter="resetFilters" />

    <!--
      <create-filter-dialog :filter-model="newFilterModel" data-testid="comms-channels-create-filter-dialog"/>
    -->
  </div>
</template>
<script>
import _ from 'lodash'

import { mapState, mapActions } from 'vuex'
import * as ChannelType from 'src/constants/inbox-channels'
import * as Filters from 'src/constants/filters'
import CompactBtn from 'src/components/compact-btn'
import FilterDialog from 'components/communications/communications-filters/filter-dialog'
import { DEFAULT_COMMUNICATIONS_CHANNEL } from 'src/router/routes'
import { communicationsMixin, visibilityMixin } from 'src/plugins/mixins'

export default {
  name: 'CommunicationsFilters',
  mixins: [
    communicationsMixin,
    visibilityMixin
  ],
  components: {
    CompactBtn,
    FilterDialog

  },
  props: {
    filterType: {
      type: String,
      required: false,
      default () {
        return DEFAULT_COMMUNICATIONS_CHANNEL === this.$route.params.channel && this.$route.query?.tagId
          ? 'all'
          : 'call'
      }
    },
    answerStatus: {
      type: String,
      required: false,
      default: 'all'
    }
  },
  computed: {
    ...mapState('communications', [
      /*
      'isGettingTasksList',
      'communications',
      'selectedFilter',
      'hasMoreCommunications',
      'inboxShowMyContacts',
      'inboxShowUnreads',
      'isFilterDialogForView'
      */
      'activeChannel',
      'channelChangedFilterFields',
      'appliedFilter'
    ]),
    changedFilterFieldCount () {
      const dateFieldIndex = this.channelChangedFilterFields.findIndex(item => ['from_date', 'to_date'].includes(item.property))

      if (dateFieldIndex >= 0) {
        return this.channelChangedFilterFields.length - 1
      }

      return this.channelChangedFilterFields.length
    },

    channelDefaultFilterModel () {
      let defaultFilterModel = {
        name: '',
        type: ChannelType.CHANNEL_MESSAGES,
        filter: [],
        scope: 'user'
      }

      if (this.$route.params.channel === 'voicemails') {
        defaultFilterModel.type = ChannelType.CHANNEL_VOICEMAILS
        defaultFilterModel.filter = {
          campaigns: Filters.DEFAULT_STATE.filter.campaigns,
          ring_groups: Filters.DEFAULT_STATE.filter.ring_groups,
          direction: Filters.DEFAULT_STATE.filter.direction,
          tags: Filters.DEFAULT_STATE.filter.tags,
          first_time_only: Filters.DEFAULT_STATE.filter.first_time_only,
          untagged_only: Filters.DEFAULT_STATE.filter.untagged_only,
          exclude_automated_communications: Filters.DEFAULT_STATE.filter.exclude_automated_communications,
          incoming_numbers: Filters.DEFAULT_STATE.filter.incoming_numbers,
          users: Filters.DEFAULT_STATE.filter.users,
          workflows: Filters.DEFAULT_STATE.filter.workflows,
          contact_owner: Filters.DEFAULT_STATE.filter.contact_owner,
          from_date: Filters.DEFAULT_STATE.filter.from_date,
          to_date: Filters.DEFAULT_STATE.filter.to_date,
          my_contact: Filters.DEFAULT_STATE.filter.my_contact,
          unread_only: Filters.DEFAULT_STATE.filter.unread_only,
          has_international: Filters.DEFAULT_STATE.filter.has_international
        }
        return defaultFilterModel
      }

      if (['calls', 'recordings'].includes(this.$route.params.channel)) {
        defaultFilterModel.type = ChannelType.CHANNEL_CALLS
        defaultFilterModel.filter = {
          campaigns: Filters.DEFAULT_STATE.filter.campaigns,
          ring_groups: Filters.DEFAULT_STATE.filter.ring_groups,
          direction: Filters.DEFAULT_STATE.filter.direction,
          answer_status: Filters.DEFAULT_STATE.filter.answer_status,
          min_talk_time: Filters.DEFAULT_STATE.filter.min_talk_time,
          transfer_type: Filters.DEFAULT_STATE.filter.transfer_type,
          callback_status: Filters.DEFAULT_STATE.filter.callback_status,
          tags: Filters.DEFAULT_STATE.filter.tags,
          call_dispositions: Filters.DEFAULT_STATE.filter.call_dispositions,
          first_time_only: Filters.DEFAULT_STATE.filter.first_time_only,
          untagged_only: Filters.DEFAULT_STATE.filter.untagged_only,
          exclude_automated_communications: Filters.DEFAULT_STATE.filter.exclude_automated_communications,
          incoming_numbers: Filters.DEFAULT_STATE.filter.incoming_numbers,
          users: Filters.DEFAULT_STATE.filter.users,
          workflows: Filters.DEFAULT_STATE.filter.workflows,
          contact_owner: Filters.DEFAULT_STATE.filter.contact_owner,
          from_date: Filters.DEFAULT_STATE.filter.from_date,
          to_date: Filters.DEFAULT_STATE.filter.to_date,
          my_contact: Filters.DEFAULT_STATE.filter.my_contact,
          unread_only: Filters.DEFAULT_STATE.filter.unread_only,
          has_international: Filters.DEFAULT_STATE.filter.has_international
        }

        if (['recordings'].includes(this.$route.params.channel)) {
          defaultFilterModel.type = ChannelType.CHANNEL_RECORDINGS
          defaultFilterModel.filter.answer_status = 'recorded'
        }

        return defaultFilterModel
      }

      if (this.$route.params.channel === DEFAULT_COMMUNICATIONS_CHANNEL) {
        defaultFilterModel.type = ChannelType.CHANNEL_ALL_COMMUNICATIONS
        defaultFilterModel.filter = { ...Filters.DEFAULT_STATE.filter }

        if (this.$route.query?.tagId) {
          defaultFilterModel.filter.tags = [+this.$route.query.tagId]
        }

        if (this.$route.query?.broadcastIds) {
          defaultFilterModel.filter.broadcasts = typeof this.$route.query.broadcastIds === 'string' ? [this.$route.query.broadcastIds] : this.$route.query.broadcastIds
        }

        return defaultFilterModel
      }

      if (this.activeChannel?.value === 'my-personal-line') {
        defaultFilterModel.type = ChannelType.CHANNEL_ALL_COMMUNICATIONS
        defaultFilterModel.filter = {
          ...Filters.DEFAULT_STATE.filter,
          campaigns: [this.profile.campaign_id]
        }

        return defaultFilterModel
      }

      defaultFilterModel.type = ChannelType.CHANNEL_MESSAGES
      defaultFilterModel.filter = {
        campaigns: Filters.DEFAULT_STATE.filter.campaigns,
        direction: Filters.DEFAULT_STATE.filter.direction,
        answer_status: Filters.DEFAULT_STATE.filter.answer_status,
        tags: Filters.DEFAULT_STATE.filter.tags,
        first_time_only: Filters.DEFAULT_STATE.filter.first_time_only,
        untagged_only: Filters.DEFAULT_STATE.filter.untagged_only,
        exclude_automated_communications: Filters.DEFAULT_STATE.filter.exclude_automated_communications,
        incoming_numbers: Filters.DEFAULT_STATE.filter.incoming_numbers,
        users: Filters.DEFAULT_STATE.filter.users,
        workflows: Filters.DEFAULT_STATE.filter.workflows,
        broadcasts: Filters.DEFAULT_STATE.filter.broadcasts,
        contact_owner: Filters.DEFAULT_STATE.filter.contact_owner,
        from_date: Filters.DEFAULT_STATE.filter.from_date,
        to_date: Filters.DEFAULT_STATE.filter.to_date,
        my_contact: Filters.DEFAULT_STATE.filter.my_contact,
        unread_only: Filters.DEFAULT_STATE.filter.unread_only,
        creator_type: Filters.DEFAULT_STATE.filter.creator_type,
        has_international: Filters.DEFAULT_STATE.filter.has_international
      }

      return defaultFilterModel
    },

    filterWrapperClass () {
      const highlightedClass = this.hasChannelFilterChanges || this.appliedFilter
        ? '--highlighted'
        : ''

      return [
        highlightedClass
      ]
    },

    hasChannelFilterChanges () {
      // return true
      return this.channelChangedFilterFields.length > 0
    }

  },
  data () {
    return {
      filter: null
    }
  },
  methods: {
    ...mapActions('communications', [
      /*  'gettingTasksList',
      'setCommunications',
      'setSelectedCommunication',

      'resetChannelChangedFilterFields',

      'setAppliedFilter',
      'setHasMoreCommunications',
      'toggleFilterModelForm',
      'toggleFilterDialogWithFilters',
      'setIsInboxFiltersLoaded',
      'updateChannelChangedFilterFields',
      'setInboxShowMyContacts',
      'setInboxShowUnreads',
      'setInboxFilters' */
      'setChannelClonedFilter',
      'setFilterDialogForView',
      'setIsEditingView',
      'setSelectedFilter',
      'toggleFilterDialog'
    ]),
    onClickAppliedFilterButton () {
      alert('Applied filters')

      this.setFilterDialogForView(false)
      this.setIsEditingView(false)
      this.toggleFilterDialog(true)
    },
    onApplyFilter (filter) {
      /* TODO: this might be removed, as views are a failed project */
      /*
      if (this.isFilterDialogForView) {

        this.currentTask = InboxTaskStatus.DEFAULT_STATUS

        // change actively selected channel
        this.setSelectedFilter(this.appliedFilter)
        this.loadContactTasks()
        this.fetchTaskCounts()

        const pinnedIndex = this.pinnedViews.findIndex(view => +view.filter_id === +this.appliedFilter.id)
        if (pinnedIndex >= 0) {
          this.$router.push({
            name: 'Inbox View',
            params: {
              viewId: this.appliedFilter.id,
              status: this.statusText,
              channel: 'view'
            }
          }).catch(err => {
            console.log(err)
            this.$handleErrors(err.response)
          })

          return
        }

        this.$router.push({
          name: 'Inbox Channel Task Status',
          params: {
            channel: 'inbox',
            status: InboxTaskStatus.DEFAULT_STATUS
          }
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })

        return
      }
      */
      this.filter = filter

      if (this.$route.params.channel === 'recordings') {
        this.filter.answer_status = 'recorded'
      }

      // channel cloned filter are the current filter settings populated in the filter dialog form
      // especially when there is no applied or selected filter.
      this.setChannelClonedFilter(this.filter)
      this.getCommunications(this.filter)
    },

    onCreateNewFilter (filter) {
      let filterType = this.channelDefaultFilterModel.type

      // making sure to save the filter type (inbox) when it's created from "Create View"
      // TODO:  this might be removed, as views are a failed project
      /*
      if (this.isFilterDialogForView) {
        filterType = ChannelType.CHANNEL_INBOX
        this.setFilterDialogForView(true)
      }
      */
      this.newFilterModel = { ...this.newFilterModel, filter: filter, type: filterType }
      this.toggleFilterModelForm(true)
    },

    onResetFilters () {
      alert('Reset filters')

      sessionStorage.setItem('date-selected', 'Last 30 Days')
      // TODO: reset filters
      // this.resetFilters()
      this.setSelectedFilter(null)
      // this.getCommunications(this.filter)
    },

    resetFilters () {
      this.filter = _.clone(Filters.DEFAULT_STATE.filter)
      this.filter.search_text = this.searchText
      this.filter.search_fields = this.searchFields
      this.filter.per_page = 20

      this.filter.cursor = null

      if (this.campaignId) {
        this.filter.campaign_id = this.campaignId
      }

      if (this.ringGroupId) {
        this.filter.ring_group_id = this.ringGroupId
      }

      if (this.userId) {
        this.filter.user_id = this.userId
      }

      if (this.workflowId) {
        this.filter.workflow_id = this.workflowId
      }

      this.filter.type = this.filterType
      this.filter.answer_status = this.answerStatus
      // this.mentionUserId = null

      this.filterRight = 'newest'
      this.sorting.order = 'desc'

      this.setChannelClonedFilter(this.filter)
      this.resetChannelChangedFilterFields()
      this.setCommunications([])
      this.setAppliedFilter(null)
      this.setInboxFilters(null)
    }

  }
}
</script>
<style scoped lang="scss">
.filter-wrapper {
  // display: flex;
  width: fit-content;
 &.--highlighted {
      background: rgba(37, 110, 255, 0.12);
      padding: 0 11px;
      border-radius: 6px;
      height: 29px;
    }
    .filter-icon {
      margin-top: -4px;
    }
}
</style>
