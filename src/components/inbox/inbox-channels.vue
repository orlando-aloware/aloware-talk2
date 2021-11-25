<template>
    <div class="w-100 h-100 d-flex flex-column">
      <div class="header w-100" v-if="$route.params.channel !== 'mentions'"
           :class="{ 'border-bottom-transparent': isSearch }">
        <div class="calls-header__label w-100 d-flex justify-content-between pl-0 pr-2">
          <div class="channel-filter-actions-wrapper inbox-tab--filter ml-2 pr-1">
            <inbox-searcher :is-loading="isLoadingMore || isGettingTasksList"
                            :search-icon-color="isSearch ? '#256EFF' : '#62666E'"
                            @search="onSearch"
                            @closed="onSearchClosed"
                            @opened="onSearchOpened">
            </inbox-searcher>
            <div class="filter-wrapper">
              <compact-btn v-if="hasChannelFilterChanges"
                           borderless
                           customClass="ml-2 pr-2 pl-0 fs-14 _500 position-relative primary not-focusable"
                           :variant="filterButtonVariant"
                           @clicked="resetFilters">
                <i class="fa fa-times"></i>
              </compact-btn>
              <compact-btn borderless
                           customClass="pl-0 pr-0 fs-14 _500 position-relative text-grey-90 not-focusable filter-toggle-button"
                           @clicked="toggleFilterDialog(true)">
                <q-tooltip v-if="selectedFilter"
                           anchor="top middle"
                           self="center middle">
                  {{ selectedFilter.name }}
                </q-tooltip>
                <filter-icon v-if="!selectedFilter"
                             color="#62666E"
                             class="filter-icon">
                </filter-icon> {{ !selectedFilter ? 'Filters' : selectedFilter.name }}
              </compact-btn>
              <b-badge v-if="hasChannelFilterChanges"
                       class="ml-1 fs-12"
                       variant="primary"
                       v-b-modal:inbox-channel-filter-modal>
                {{ channelChangedFilterFields.length }}
              </b-badge>
            </div>
          </div>

          <q-select class="m-0"
                    borderless
                    emit-value
                    map-options
                    v-model="filterRight"
                    :options="optionsRight"
                    :append="[{icon: 'ion-ios-arrow-down'}]"
                    @input="sortFilter">
          </q-select>
        </div>
      </div>
      <div class="header w-100" v-if="$route.params.channel === 'mentions'">
        <div class="calls-header__label w-100 d-flex justify-content-between pl-0 pr-2">
          <div class="inbox-filter-actions-wrapper inbox-tab--filter pr-1 ml-2">
            <inbox-searcher :is-loading="isLoadingMore || isGettingTasksList"
                            :search-icon-color="isSearch ? '#256EFF' : '#62666E'"
                            @search="onSearch"
                            @closed="onSearchClosed"
                            @opened="onSearchOpened">
            </inbox-searcher>
            <div class="filter-wrapper">
              <div class="position-absolute filter-icon">
                <filter-icon></filter-icon>
              </div>
              <user-selector custom-placeholder="Filter by User"
                             :clearable="true"
                             :hide-dropdown-icon="true"
                             :outlined="false"
                             :borderless="true"
                             :value="mentionUserId"
                             @change="userMentionSelected">
              </user-selector>
            </div>
          </div>

          <q-select class="m-0"
                    borderless
                    emit-value
                    map-options
                    v-model="filterRight"
                    :options="optionsRight"
                    :append="[{icon: 'ion-ios-arrow-down'}]"
                    @input="sortFilter">
          </q-select>
        </div>
      </div>
      <div class="w-100" v-if="$route.params.channel === 'mentions' && !isSearch">
        <q-btn-toggle
          class="custom-toggle-button mx-2 mt-2 mb-1"
          no-caps
          spread
          unelevated
          dense
          toggle-color="primary active"
          color="transparent"
          text-color="primary"
          :options="mentionTypeOptions"
          v-model="mentionType"
          @click="toggleMentionType">
          <template v-slot:one>
            <div class="d-flex justify-content-center align-items-center w-100 px-1 options"
                 :class="[mentionType === 'received' ? 'active' : 'text-grey-90']">
                <span class="text-left">
                  Received
                </span>
            </div>
          </template>

          <template v-slot:two>
            <div class="d-flex justify-content-center align-items-center w-100 px-1 options"
                 :class="[mentionType === 'sent' ? 'active' : 'text-grey-90']">
                <span class="text-left">
                  Sent
                </span>
            </div>
          </template>
        </q-btn-toggle>
      </div>
      <search-toggle ref="searchToggle"
                     v-if="isSearch"
                     @searching="searching"
                     @closed="onSearchClosed">
      </search-toggle>
      <div class="h-100 w-100 flex-grow-1 scroll-y task-list-scroller"
           @scroll="handleScroll">
        <task-list :communications="communications"
                   :answer-status="answerStatus"
                   :channel="channel"
                   :search-text="searchText"
                   v-if="!isGettingTasksList && $route.params.channel !== 'mentions'">
        </task-list>
        <task-mention-list :communications="communications"
                           :direction="mentionType"
                           :search-text="searchText"
                           v-if="!isGettingTasksList && $route.params.channel === 'mentions'">
        </task-mention-list>
        <div :class="[isGettingTasksList ? 'py-5' : 'py-4', 'relative']">
          <b-overlay :show="isLoadingMore || isGettingTasksList"
                     rounded="sm">
            <template #overlay>
              <q-spinner-bars color="primary"
                              size="2em"/>
            </template>
          </b-overlay>
        </div>
      </div>
      <filter-dialog :filter="filter"
                     :filter-model="filterModel"
                     @onResetFilter="resetFilters">
      </filter-dialog>
      <create-filter-dialog :filter-model="filterModel">
      </create-filter-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import { aclMixin, communicationMixin } from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import TaskList from 'components/inbox/channel-tasks/task-list'
import * as Filters from 'src/constants/filters'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDirections from 'src/constants/communication-direction'
import CompactBtn from 'components/compact-btn'
import FilterDialog from 'components/inbox/inbox-filters/filter-dialog'
import * as MentionType from 'src/constants/mention-type'
import TaskMentionList from 'components/inbox/channel-tasks/task-mention-list'
import UserSelector from 'components/generic-selectors/user-selector'
import FilterIcon from 'components/icons/filter-icon'
import InboxSearcher from 'components/inbox/inbox-searcher'
import SearchToggle from 'components/search-toggle'
import CreateFilterDialog from 'components/inbox/inbox-filters/create-filter-dialog'

let scrollTimeout
export default {
  name: 'inbox-channels',

  mixins: [ aclMixin, communicationMixin ],

  components: {
    CreateFilterDialog,
    InboxSearcher,
    FilterIcon,
    UserSelector,
    TaskMentionList,
    FilterDialog,
    CompactBtn,
    TaskList,
    SearchToggle
  },

  props: {
    filterType: {
      type: String,
      required: false,
      default: 'call'
    },

    channel: {
      type: String,
      required: false,
      default: 'calls'
    },

    answerStatus: {
      type: String,
      required: false,
      default: 'all'
    },

    sort: {
      type: String,
      default: 'newest'
    },

    campaignId: {
      required: false
    },

    ringGroupId: {
      required: false
    },

    userId: {
      required: false
    },

    workflowId: {
      required: false
    }
  },

  computed: {
    ...mapState('inbox', ['isGettingTasksList', 'activeChannel', 'communications', 'channelChangedFilterFields', 'selectedFilter', 'hasMoreCommunications']),

    nextPage () {
      return this.currentPage + 1
    },

    filterButtonVariant () {
      return 'outlined-light'
    },

    hasChannelFilterChanges () {
      return this.channelChangedFilterFields.length > 0
    },

    filterModel () {
      let filterModel = {
        name: '',
        type: 2,
        filter: [],
        scope: 'user'
      }
      switch (true) {
        case ['voicemails'].includes(this.$route.params.channel):
          filterModel.type = 3
          filterModel.filter = {
            campaigns: this.filter.campaigns,
            ring_groups: this.filter.ring_groups,
            direction: this.filter.direction,
            tags: this.filter.tags,
            first_time_only: this.filter.first_time_only,
            untagged_only: this.filter.untagged_only,
            exclude_automated_communications: this.filter.exclude_automated_communications,
            incoming_numbers: this.filter.incoming_numbers,
            users: this.filter.users,
            workflows: this.filter.workflows
          }
          break
        case ['calls'].includes(this.$route.params.channel):
          filterModel.type = 1
          filterModel.filter = {
            campaigns: this.filter.campaigns,
            ring_groups: this.filter.ring_groups,
            direction: this.filter.direction,
            answer_status: this.filter.answer_status,
            min_talk_time: this.filter.min_talk_time,
            transfer_type: this.filter.transfer_type,
            callback_status: this.filter.callback_status,
            tags: this.filter.tags,
            call_dispositions: this.filter.call_dispositions,
            first_time_only: this.filter.first_time_only,
            untagged_only: this.filter.untagged_only,
            exclude_automated_communications: this.filter.exclude_automated_communications,
            incoming_numbers: this.filter.incoming_numbers,
            users: this.filter.users,
            workflows: this.filter.workflows
          }
          break
        case ['recordings'].includes(this.$route.params.channel):
          filterModel.type = 4
          filterModel.filter = {
            campaigns: this.filter.campaigns,
            ring_groups: this.filter.ring_groups,
            direction: this.filter.direction,
            answer_status: this.filter.answer_status,
            min_talk_time: this.filter.min_talk_time,
            transfer_type: this.filter.transfer_type,
            callback_status: this.filter.callback_status,
            tags: this.filter.tags,
            call_dispositions: this.filter.call_dispositions,
            first_time_only: this.filter.first_time_only,
            untagged_only: this.filter.untagged_only,
            exclude_automated_communications: this.filter.exclude_automated_communications,
            incoming_numbers: this.filter.incoming_numbers,
            users: this.filter.users,
            workflows: this.filter.workflows
          }
          break
        case ['messages'].includes(this.$route.params.channel):
        default:
          filterModel.type = 2
          filterModel.filter = {
            campaigns: this.filter.campaigns,
            direction: this.filter.direction,
            answer_status: this.filter.answer_status,
            tags: this.filter.tags,
            first_time_only: this.filter.first_time_only,
            untagged_only: this.filter.untagged_only,
            exclude_automated_communications: this.filter.exclude_automated_communications,
            incoming_numbers: this.filter.incoming_numbers,
            users: this.filter.users,
            workflows: this.filter.workflows,
            broadcasts: this.filter.broadcasts
          }
      }

      return filterModel
    }
  },

  data () {
    return {
      filter: null,
      clonedFilter: null,
      searchFields: ['contact.name', 'contact.phone_number'],
      currentPage: 0,
      isLoadingMore: false,
      isLoaded: false,
      isScrolled: false,
      pagination: {
        type: Object,
        required: true
      },
      optionsRight: [
        {
          label: 'Oldest',
          value: 'oldest',
          disable: false
        },
        {
          label: 'Newest',
          value: 'newest',
          disable: false
        }
      ],
      filterRight: 'newest',
      mentionTypeOptions: [
        {
          value: MentionType.TYPE_RECEIVED,
          slot: 'one'
        },
        {
          value: MentionType.TYPE_SENT,
          slot: 'two'
        }
      ],
      mentionType: MentionType.TYPE_RECEIVED,
      sorting: {
        order: 'desc'
      },
      mentionUserId: null,
      scrollContainerEl: null,
      activeItemEl: null,
      searchText: '',
      isSearch: false
    }
  },

  methods: {
    ...mapActions('inbox', [
      'gettingTasksList',
      'setCommunications',
      'setSelectedCommunication',
      'setChannelClonedFilter',
      'resetChannelChangedFilterFields',
      'setSelectedFilter',
      'setHasMoreCommunications',
      'toggleFilterDialog']),

    resetFilters () {
      this.filter = _.clone(Filters.DEFAULT_STATE.filter)
      this.filter.search_text = this.searchText
      this.filter.search_fields = this.searchFields
      this.filter.per_page = 20
      this.filter.page = 1

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
      this.mentionUserId = null

      this.setChannelClonedFilter(this.filter)
      this.resetChannelChangedFilterFields()
      this.setCommunications([])
      this.setSelectedFilter(null)
    },

    checkCommunicationMatchesFilters (communication) {
      // if answer status filter is other than all
      if (this.filter.answer_status !== 'all') {
        // handle live & hold as a special case
        if (['live', 'hold', 'queued'].includes(this.filter.answer_status) &&
          communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          return false
        }
        // check the communication disposition status matches the answer status filter
        if (this.filter.answer_status === 'answered' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          return false
        }
        if (this.filter.answer_status === 'unanswered' &&
          ![CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW,
            CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW].includes(communication.disposition_status2)) {
          return false
        }
        if (this.filter.answer_status === 'missed' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          return false
        }
        if (this.filter.answer_status === 'abandoned' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          return false
        }
        if (this.filter.answer_status === 'in-progress' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          return false
        }
        if (this.filter.answer_status === 'failed' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          return false
        }
        if (this.filter.answer_status === 'deadend' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          return false
        }
      }
      // if campaign filter is selected
      if (this.filter.campaigns.length > 0) {
        // check the communication campaign matches the campaign filter
        if (this.filter.campaigns.indexOf(communication.campaign_id) < 0) {
          return false
        }
      }
      // if workflow filter is selected
      if (this.filter.workflows.length > 0) {
        // check the communication campaign matches the campaign filter
        if (this.filter.workflows.indexOf(communication.workflow_id) < 0) {
          return false
        }
      }
      // if user filter is selected
      if (this.filter.users.length > 0) {
        // check the communication user matches the user filter
        if (this.filter.users.indexOf(communication.user_id) < 0) {
          return false
        }
      }
      // if user filter is selected
      if (this.filter.users.length > 0) {
        // check the communication user matches the user filter
        if (this.filter.users.indexOf(communication.owner_id) < 0) {
          return false
        }
      }
      // if number filter is selected
      if (this.filter.incoming_numbers.length > 0) {
        // check the communication number matches the number filter
        if (this.filter.incoming_numbers.indexOf(communication.incoming_number_id) < 0) {
          return false
        }
      }
      // if ring groups filter is selected
      if (this.filter.ring_groups.length > 0) {
        // check the communication ring group matches the ring group filter
        if (this.filter.ring_groups.indexOf(communication.ring_group_id) < 0) {
          return false
        }
      }
      // if direction filter is selected
      if (this.filter.direction !== 'all') {
        // check the communication direction matches the direction filter
        if (this.filter.direction === 'inbound' && communication.direction !== CommunicationDirections.INBOUND) {
          return false
        } else if (this.filter.direction === 'outbound' && communication.direction !== CommunicationDirections.OUTBOUND) {
          return false
        }
      }
      // checks first time conversations filter is selected and matches the communication
      if (this.filter.first_time_only && !communication.first_time_caller) {
        return false
      }
      // checks date range filter matches communication start time
      if (this.filter.from_date && this.filter.to_date && !this.utcToLocalizedMoment(communication.created_at).isBetween(this.filter.from_date, this.filter.to_date)) {
        return false
      }
      // checks min talk time filter matches communication talk time
      if (this.filter.min_talk_time > communication.talk_time) {
        return false
      }
      // if type of communication filter is selected
      if (this.filter.type !== 'all') {
        // check type of communication matches the type of communication filter
        if (this.filter.type === 'call' && communication.type !== CommunicationTypes.CALL) {
          return false
        } else if (this.filter.type === 'sms' && communication.type !== CommunicationTypes.SMS) {
          return false
        }
      }
      // checks tags filter matches communication tags
      if (this.filter.tags.length > 0 && communication.tags.length <= 0) {
        return false
      }
      // checks untagged only filter matches communication tags
      if (this.filter.untagged_only && communication.tags.length > 0) {
        return false
      }
      return true
    },

    checkCommunicationMatchesRingGroup (communication) {
      // checks if communication belongs to this ring group
      if (this.ringGroupId) {
        if (communication.ring_group_id !== this.ringGroupId) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesCampaign (communication) {
      // checks if communication belongs to this campaign
      if (this.campaignId) {
        if (communication.campaign_id !== this.campaignId) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesUser (communication) {
      // checks if communication belongs to this user
      if (this.userId) {
        if (communication.user_id && communication.user_id !== this.userId) {
          return false
        }
        // check if we have tried to call this user
        if (!communication.user_id && communication.target_users && !communication.target_users.find(userId => userId === this.userId)) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesWorkflow (communication) {
      // checks if communication belongs to this workflow
      if (this.workflowId) {
        if (communication.workflow_id !== this.workflowId) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesSearch (communication) {
      // checks if communication matches search
      if (this.searchText !== '') {
        for (let searchField of this.searchFields) {
          if (communication[searchField]) {
            if (communication[searchField].toString().indexOf(this.searchText) > -1) {
              return true
            }
          }
        }

        return false
      }

      return true
    },

    getCommunications (params) {
      this.gettingTasksList(true)

      let api = talk2Api.V1.reports.communications

      if (this.$route.params.channel === 'mentions') {
        api = talk2Api.V2.mentions
        params = { ...{ direction: this.mentionType, page: params.page, per_page: params.per_page, mentioner_user_id: params.mentioner_user_id, mentioned_user_id: params.mentioned_user_id } }
      }

      if (this.$route.params.channel !== 'mentions') {
        params = { ...params, order: this.sorting.order }
      } else {
        params = { ...params, order_by: this.sorting.order }
      }

      return api.get({ params: params })
        .then(response => {
          this.gettingTasksList(false)
          this.setCommunications(response.data.data)
          this.currentPage = response.data.current_page
          this.setHasMoreCommunications(response.data.next_page_url)
          this.isLoaded = true
          this.pagination = _.clone(response.data)
          delete this.pagination.data
        })
    },

    loadMoreCommunications (params) {
      this.isLoadingMore = true
      this.isLoaded = false

      let api = talk2Api.V1.reports.communications

      if (this.$route.params.channel === 'mentions') {
        api = talk2Api.V2.mentions
        params = { ...{ direction: this.mentionType, page: params.page, per_page: params.per_page, order_by: this.sorting.order } }

        if (this.mentionType === 'sent' && this.filter.mentioned_user_id) {
          params = { ...params, ...{ mentioned_user_id: this.filter.mentioned_user_id } }
        }

        if (this.mentionType === 'received' && this.filter.mentioner_user_id) {
          params = { ...params, ...{ mentioner_user_id: this.filter.mentioner_user_id } }
        }
      }

      return api.get({ params: params })
        .then(response => {
          this.setCommunications([...this.communications, ...response.data.data])
          this.currentPage = response.data.current_page
          this.setHasMoreCommunications(response.data.next_page_url)
          this.isLoadingMore = false
          this.isLoaded = true
          this.pagination = _.clone(response.data)
          this.isScrolled = false
          delete this.pagination.data
        })
    },

    handleScroll (el) {
      if ((el.target.offsetHeight + el.target.scrollTop) >= (el.target.scrollHeight - 70)) {
        this.onTaskListBottomScroll()
      }
    },

    onTaskListBottomScroll () {
      clearTimeout(scrollTimeout)
      // Set a timeout to run after scrolling ends
      scrollTimeout = setTimeout(() => {
        // Run the callback
        if (this.hasMoreCommunications && this.isLoaded) {
          this.isScrolled = true
          this.filter.page = this.nextPage
          this.loadMoreCommunications(this.filter)
        }
      }, 66)
    },

    toggleMentionType () {
      this.$nextTick(() => {
        // this.$refs.taskListScroller.scrollTop = 0
      })

      this.$router.push({
        name: 'Inbox Channel Task Status',
        params: {
          channel: 'mentions',
          status: this.mentionType
        }
      }).catch(err => {
        console.log(err)
      })
    },

    setMentionType () {
      if (this.$route.params.channel === 'mentions') {
        switch (this.$route.params.status) {
          case 'sent':
            this.mentionType = MentionType.TYPE_SENT
            break
          case 'received':
          default:
            this.mentionType = MentionType.TYPE_RECEIVED
        }
      }
    },

    userMentionSelected (value) {
      this.resetFilters()
      this.mentionUserId = value

      if (this.mentionType === MentionType.TYPE_RECEIVED) {
        this.filter.mentioner_user_id = this.mentionUserId
      }

      if (this.mentionType === MentionType.TYPE_SENT) {
        this.filter.mentioned_user_id = this.mentionUserId
      }
    },

    sortFilter (value) {
      this.sorting.order = value ? (value === 'newest' ? 'desc' : 'asc') : 'desc'
    },

    redirectMentionsChannel (mention) {
      this.$router.push({
        name: 'Inbox Contact Mention Communication',
        params: {
          id: mention.mention_subject.contact_id,
          communicationId: mention.mention_subject_id,
          status: this.mentionType,
          channel: 'mentions'
        }
      }).catch(err => {
        console.log(err)
      })
    },

    redirectChannel (communication) {
      this.$router.push({
        name: 'Inbox Contact',
        params: {
          id: communication.contact_id.toString(),
          communicationId: communication.id,
          channel: this.channel
        }
      }).catch(err => {
        console.log(err)
      })
    },

    makeSelectedItemVisible () {
      this.scrollContainerEl = document.querySelector('.task-list-scroller')
      this.activeItemEl = document.querySelector('.task-item.active')

      if (this.activeItemEl.offsetTop > (this.scrollContainerEl.offsetHeight - 100)) {
        this.scrollContainerEl.scrollTop = this.activeItemEl.offsetTop - 757
      }
    },
    onSearch (value) {
      this.searchText = value
    },
    onSearchOpened () {
      this.filter.search_text = ''
      this.setHasMoreCommunications(null)
      this.setCommunications([])
      this.isSearch = true
      this.$nextTick(function () {
        this.$refs.searchToggle.inputFocus()
      }.bind(this))
    },
    onSearchClosed () {
      this.searchText = null
      this.filter.page = 1
      this.filter.search_text = this.searchText
      this.isSearch = false
      this.getCommunications(this.filter)
    },

    searching (value) {
      if ((value && value.length >= 3) || value === '') {
        if (value === '') {
          this.setCommunications([])
        } else {
          this.searchText = value
        }
      }
    },

    ...mapActions('inbox', ['gettingTasksList', 'setCommunications', 'setSelectedCommunication', 'setChannelClonedFilter', 'resetChannelChangedFilterFields'])
  },

  watch: {
    'activeChannel': function (value) {
      if (this.$route.name === 'Inbox Channel') {
        this.searchText = null
        this.resetFilters()
        this.isSearch = false
      }
    },
    'searchText': function (value) {
      if ((value && value.length >= 3) || value === '') {
        if (value === '') {
          this.setCommunications([])
        } else {
          this.filter.search_text = value
          this.getCommunications(this.filter)
        }
      }
    },
    'sorting.order': function () {
      this.getCommunications(this.filter)
    },
    '$route.name': function (value) {
      if (['Inbox Contact', 'Inbox Contact Mention Communication'].includes(value)) {
        // since mention has different data structure to other channels, need to set property to compare as comm id
        let identifierProp = value === 'Inbox Contact Mention Communication' ? 'mention_subject_id' : 'id'
        let communication = this.communications.find(item => item[identifierProp] === this.$route.params.communicationId)
        this.setSelectedCommunication(communication)
      }
    },
    '$route.params.status': function (value) {
      if ([MentionType.TYPE_RECEIVED, MentionType.TYPE_SENT].includes(value) && !this.$route.params.id) {
        this.resetFilters()
        this.isScrolled = false
        this.getCommunications(this.filter)
      }
    },
    filter: {
      deep: true,
      handler () {
        if (['Inbox Channel', 'Inbox Contact Mention Communication', 'Inbox Contact', 'Inbox Channel Task Status'].includes(this.$route.name) && !this.isScrolled) {
          this.getCommunications(this.filter)
        }
      }
    }
  },

  created () {
    this.resetFilters()

    this.setMentionType()

    this.$VueEvent.listen('new_communication', (data) => {
      // disable live dashboard for end clients
      if (this.hasRole('Company Reporter Access')) {
        return
      }
      // check data loaded
      if (this.pagination.current_page && this.pagination.current_page === 1) {
        // check new communication exists in the old list
        let found = this.communications.filter(communication => {
          return communication.id === data.id
        })
        if (!found.length) {
          if (this.checkCommunicationMatchesSearch(data) &&
            this.checkCommunicationMatchesFilters(data) &&
            this.checkCommunicationMatchesUserAccessibility(data) &&
            this.checkCommunicationMatchesCampaign(data) &&
            this.checkCommunicationMatchesWorkflow(data) &&
            this.checkCommunicationMatchesUser(data) &&
            this.checkCommunicationMatchesRingGroup(data)) {
            this.pagination.total += 1
            // push new data to top of array
            this.communications.unshift(data)

            if (this.communications.length > this.filter.per_page) {
              // push out last data from bottom of array
              this.communications.pop()
            }
          }
        }
      }
    })

    this.$VueEvent.listen('update_communication', (data) => {
      // disable live dashboard for end clients
      if (this.hasRole('Company Reporter Access')) {
        return
      }
      // check data loaded
      if (this.pagination.current_page) {
        // check new communication exists in the old list
        let found = this.communications.filter(communication => {
          return communication.id === data.id
        })
        if (found.length) {
          // update communication
          data = _.extend({}, found[0], data)
          if (this.checkCommunicationMatchesSearch(data) &&
            this.checkCommunicationMatchesFilters(data) &&
            this.checkCommunicationMatchesUserAccessibility(data) &&
            this.checkCommunicationMatchesCampaign(data) &&
            this.checkCommunicationMatchesWorkflow(data) &&
            this.checkCommunicationMatchesUser(data) &&
            this.checkCommunicationMatchesRingGroup(data)) {
            this.$set(this.communications, this.communications.indexOf(found[0]), data)
          } else {
            this.communications = this.communications.filter(communication => {
              return communication.id !== data.id
            })
            this.pagination.total -= 1
          }
        } else {
          // add the communication if it's not already there and if it matches the criteria
          if (this.checkCommunicationMatchesSearch(data) &&
            this.checkCommunicationMatchesFilters(data) &&
            this.checkCommunicationMatchesUserAccessibility(data) &&
            this.checkCommunicationMatchesCampaign(data) &&
            this.checkCommunicationMatchesWorkflow(data) &&
            this.checkCommunicationMatchesUser(data) &&
            this.pagination.current_page === 1 &&
            this.communications.length > 0 &&
            data.id > this.communications[0].id) {
            this.pagination.total += 1
            // push new data to top of array
            this.communications.unshift(data)

            if (this.communications.length > this.filter.per_page) {
              // push out last data from bottom of array
              this.communications.pop()
            }
          }
        }
      }
    })

    this.$VueEvent.listen('delete_communication', (data) => {
      // check data loaded
      if (this.pagination.current_page) {
        // try to find the communication
        let found = this.communications.find(communication => communication.id === data.id)
        if (found) {
          // remove it from the list
          this.communications.splice(this.communications.indexOf(found), 1)
          this.pagination.total -= 1
        }
      }
    })

    this.$VueEvent.listen('mark_contact_communications_all_as_read', (data) => {
      // get current contact's communications
      let contactCommunications = this.communications.filter(communication => communication.contact.id === data.id)

      // iterate through and update is_read value
      contactCommunications.forEach((communication) => {
        let index = this.communications.findIndex(item => item.id === communication.id)
        this.communications[index].is_read = true
      })

      // set updated communications
      this.setCommunications(this.communications)
    })
  },

  mounted () {
    let _this = this

    this.$VueEvent.listen('load_and_navigate_channel', (lastNavigatedIndex) => {
      _this.filter.page = _this.nextPage
      _this.loadMoreCommunications(this.filter).then(() => {
        let communication = this.communications[lastNavigatedIndex + 1]
        this.setSelectedCommunication(communication)

        if (this.$route.name === 'Inbox Contact') {
          this.redirectChannel(communication)
        }

        if (this.$route.name === 'Inbox Contact Mention Communication') {
          this.redirectMentionsChannel(communication)
        }

        this.makeSelectedItemVisible()
      })
    })

    this.$VueEvent.listen('navigate_channel', (communication) => {
      this.setSelectedCommunication(communication)

      if (this.$route.name === 'Inbox Contact') {
        this.redirectChannel(communication)
      }

      if (this.$route.name === 'Inbox Contact Mention Communication') {
        this.redirectMentionsChannel(communication)
      }

      this.makeSelectedItemVisible()
    })

    if (['Inbox Channel', 'Inbox Contact'].includes(this.$route.name) || ['mentions'].includes(this.$route.params.channel)) {
      if (['Inbox Contact', 'Inbox Contact Mention Communication'].includes(_this.$route.name)) {
        let communication

        if (_this.$route.name === 'Inbox Contact Mention Communication') {
          communication = _this.communications.find(item => item.mention_subject_id.toString() === _this.$route.params.communicationId.toString())
        } else {
          communication = _this.communications.find(item => item.id.toString() === _this.$route.params.communicationId.toString())
        }

        if (communication) {
          _this.setSelectedCommunication(communication)
        }
      }
    }
  }
}
</script>
