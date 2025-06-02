<template>
  <div class="filter-wrapper d-flex align-items-center"
       :class="filterWrapperClass">
    <compact-btn custom-class="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable filter-toggle-button d-flex align-items-center"
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
             v-b-modal:comms-channel-filter-modal>
      {{ changedFilterFieldCount }}
    </b-badge>

    <compact-btn custom-class="ml-auto s-14 _500 position-relative primary not-focusable"
                 borderless
                 variant="outlined-light"
                 data-testid="comms-channels-reset-filters-btn"
                 v-if="hasChannelFilterChanges || appliedFilter"
                 @clicked="onResetFilters">
      <i class="fa fa-times" />
    </compact-btn>

    <filter-dialog data-testid="comms-channels-filter-dialog"
                   :filter-model="channelDefaultFilterModel"
                   v-model="filter"
                   @applyFilter="onApplyFilter"
                   @createNewFilter="onCreateNewFilter"
                   @onResetFilter="onResetFilters" />

    <create-filter-dialog :filter-model="newFilterModel"
                          :disable-filter-type="!isAdmin"
                          data-testid="comms-channels-create-filter-dialog"
                          @created="afterCreatedNewFilter" />
  </div>
</template>
<script>
import { cloneDeep } from 'lodash'

import { mapState, mapActions } from 'vuex'
import CompactBtn from 'src/components/compact-btn'
import FilterDialog from 'components/communications/communications-filters/filter-dialog'
import CreateFilterDialog from 'components/communications/communications-filters/create-filter-dialog'

import { CALLS_CHANNEL, DEFAULT_COMMUNICATIONS_CHANNEL } from 'src/router/routes'
import { aclMixin, communicationsMixin } from 'src/plugins/mixins'
import communicationsDefaultFilterModelMixin from 'src/plugins/mixins/communications-default-filter-model.mixin'

export default {
  name: 'CommunicationsFilters',
  mixins: [
    aclMixin,
    communicationsMixin,
    communicationsDefaultFilterModelMixin
  //  visibilityMixin
  ],
  components: {
    CompactBtn,
    FilterDialog,
    CreateFilterDialog
  },
  props: {

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
    filterType () {
      if (this.activeChannel?.type) {
        return this.activeChannel?.type
      }
      return DEFAULT_COMMUNICATIONS_CHANNEL === this.$route.params.channel
        ? 'all'
        : 'call'
    },
    answerStatus () {
      if (this.activeChannel?.answerStatus) {
        return this.activeChannel?.answerStatus
      }
      return 'all'
    },
    channel () {
      if (this.activeChannel?.value) {
        return this.activeChannel?.value
      }
      return CALLS_CHANNEL
    },
    changedFilterFieldCount () {
      const dateFieldIndex = this.channelChangedFilterFields.findIndex(item => ['from_date', 'to_date'].includes(item.property))

      if (dateFieldIndex >= 0) {
        return this.channelChangedFilterFields.length - 1
      }

      return this.channelChangedFilterFields.length
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
      return this.changedFilterFieldCount > 0
    }

  },
  data () {
    return {
      filter: null,
      newFilterModel: {
        name: '',
        type: 2,
        filter: [],
        scope: 'user'
      }
    }
  },
  mounted () {
    const filterModel = cloneDeep(this.channelDefaultFilterModel)

    this.applyQueryStringFilters(filterModel, this.channelDefaultFilterModel)

    this.filter = filterModel.filter

    this.$VueEvent.listen('filter-communications', data => {
      // ex: data = { type: 'users', value: 1 }
      const current = typeof this.channelClonedFilter[data.type] === 'object' ? JSON.stringify(this.channelClonedFilter[data.type]) : this.channelClonedFilter[data.type]
      const attempt = typeof data.value === 'object' ? JSON.stringify(data.value) : data.value

      // do nothing when the same filter is being applied
      if (current === attempt) {
        return
      }

      this.updateChannelChangedFilterFields({
        name: data.type,
        value: data.value
      })

      // update current filters
      this.filter = {
        ...this.filter,
        [data.type]: data.value
      }

      // update query string
      this.updateQueryString()

      // refresh data
      this.setChannelClonedFilter(this.filter)
      this.$nextTick(() => {
        this.getCommunications(this.communicationFilters)
      })
    })

    this.$VueEvent.listen('reset-communications-filters', () => {
      this.onResetFilters()
    })
  },
  methods: {
    ...mapActions(['setIsFirstLoad']),
    ...mapActions('communications', [
      /*  'gettingTasksList',

      'setSelectedCommunication',

      'setHasMoreCommunications',

      'toggleFilterDialogWithFilters',
      'setIsInboxFiltersLoaded',
      'updateChannelChangedFilterFields',
      'setInboxShowMyContacts',
      'setInboxShowUnreads',
       */
      'resetChannelChangedFilterFields',
      'setAppliedFilter',
      'setChannelClonedFilter',
      'setCommunications',
      'setInboxFilters',
      'setFilterDialogForView',
      'setIsEditingView',
      'setSelectedFilter',
      'toggleFilterDialog',
      'toggleFilterModelForm',
      'updateChannelChangedFilterFields'
    ]),
    onClickAppliedFilterButton () {
      this.setFilterDialogForView(false)
      this.setIsEditingView(false)
      this.toggleFilterDialog(true)
    },
    onApplyFilter (filter) {
    /* TODO: this could be removed when "VIEWS" code will be removed deprecation-ref=1 */

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

      // channel cloned filter are the current filter settings populated in the filter dialog form
      // especially when there is no applied or selected filter.
      this.setChannelClonedFilter(this.filter)
      this.updateQueryString()

      this.$nextTick(() => {
        this.getCommunications(this.communicationFilters)
      })
    },

    onCreateNewFilter (filter) {
      let filterType = this.channelDefaultFilterModel.type

      // making sure to save the filter type (inbox) when it's created from "Create View"
      /* TODO: this could be removed when "VIEWS" code will be removed deprecation-ref=1 */
      /*
      if (this.isFilterDialogForView) {
        filterType = ChannelType.CHANNEL_INBOX
        this.setFilterDialogForView(true)
      }
      */
      this.newFilterModel = { ...this.newFilterModel, filter: filter, type: filterType }
      this.toggleFilterModelForm(true)
    },

    afterCreatedNewFilter (filter) {
      this.setSelectedFilter(filter)
    },

    onResetFilters (destroy = false) {
      this.filter = { ...this.channelDefaultFilterModel.filter }

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
      this.setSelectedFilter(null)
      this.setCommunications([])
      this.setIsFirstLoad(true)
      this.setAppliedFilter(null)
      this.resetQueryStringFilters()

      if (destroy) {
        return
      }

      this.$nextTick(() => {
        this.getCommunications(this.communicationFilters)
      })
    },

    isFilterPropertyArray (property) {
      return this.channelDefaultFilterModel?.filter && Array.isArray(this.channelDefaultFilterModel.filter[property])
    },

    updateQueryString () {
      const keptParams = {
        ...(this.$route.query.filter_id && { filter_id: this.$route.query.filter_id })
      }

      const queryParams = new URLSearchParams(keptParams)

      this.channelChangedFilterFields.forEach((filter) => {
        let { property, value } = filter

        if (this.isFilterPropertyArray(property)) {
          value = value.join(',')
        }

        queryParams.set(property, value)
      })

      // update query string
      this.$router.replace({ query: Object.fromEntries(queryParams) }).catch(() => {})
    },

    resetQueryStringFilters () {
      this.$router.replace({ query: null }).catch(() => {})
    }
  },

  watch: {
    filter: {
      handler (newVal) {
        this.setInboxFilters(newVal)
      },
      deep: true,
      immediate: true
    },

    channelDefaultFilterModel: {
      handler (newVal) {
        this.filter = this.filter = { ...newVal.filter }
      },
      deep: true,
      immediate: true
    }
  },

  beforeDestroy () {
    this.onResetFilters(true)
    this.$VueEvent.stop('filter-communications')
    this.$VueEvent.stop('reset-communications-filters')
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
