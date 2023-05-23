<template>
    <div class="w-100 h-100 d-flex flex-column">
      <div class="header w-100"
           :class="{ 'border-bottom-transparent': isSearch }"
           v-if="$route.params.channel !== 'mentions'">
        <div class="calls-header__label w-100 d-flex justify-content-between pl-0 pr-2">
          <div class="channel-filter-actions-wrapper inbox-tab--filter ml-2 pr-1 d-inline-flex">
            <inbox-searcher :is-loading="isLoadingMore || isGettingTasksList"
                            :search-icon-color="searchIconColor"
                            @search="onSearch"
                            @closed="onSearchClosed"
                            @opened="onSearchOpened">
            </inbox-searcher>
            <hr role="separator"
                aria-orientation="vertical"
                class="q-separator height-24 margin-auto q-separator q-separator--vertical">
            <div class="filter-wrapper"
                 :class="filterWrapperClass">
              <compact-btn customClass="pr-2 pl-0 fs-14 _500 position-relative primary not-focusable"
                           borderless
                           :variant="filterButtonVariant"
                           v-if="hasChannelFilterChanges"
                           @clicked="onResetFilters">
                <i class="fa fa-times"></i>
              </compact-btn>
              <compact-btn customClass="pl-0 pr-0 fs-14 _500 position-relative text-grey-90 not-focusable filter-toggle-button"
                           borderless
                           @clicked="toggleFilterDialog(true)">
                <q-tooltip anchor="top middle"
                           self="center middle"
                           v-if="appliedFilter">
                  {{ appliedFilter.name }}
                </q-tooltip>
                <filter-icon color="#62666E"
                             class="filter-icon"
                             v-if="!appliedFilter && channelChangedFilterFields.length < 1">
                </filter-icon> {{ appliedFilterName }}
                {{ filtersText }}
              </compact-btn>
              <b-badge class="ml-1 fs-12"
                       variant="primary"
                       v-if="hasChannelFilterChanges"
                       v-b-modal:inbox-channel-filter-modal>
                {{ changedFilterFieldCount }}
              </b-badge>
            </div>
          </div>

          <q-select class="m-0"
                    borderless
                    emit-value
                    map-options
                    :options="optionsRight"
                    :append="[{icon: 'ion-ios-arrow-down'}]"
                    v-model="filterRight"
                    @input="sortFilter">
          </q-select>
        </div>
      </div>
      <div class="header w-100"
           v-if="$route.params.channel === 'mentions'">
        <div class="calls-header__label w-100 d-flex justify-content-between pl-0 pr-2">
          <div class="mentions-filter-actions-wrapper inbox-tab--filter pr-1 d-inline-flex">
            <div class="filter-wrapper">
              <div class="position-absolute filter-icon">
                <filter-icon />
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
                    :options="optionsRight"
                    :append="[{icon: 'ion-ios-arrow-down'}]"
                    v-model="filterRight"
                    @input="sortFilter">
          </q-select>
        </div>
      </div>
      <div class="w-100"
           v-if="$route.params.channel === 'mentions' && !isSearch">
        <q-btn-toggle class="custom-toggle-button mx-2 mt-2 mb-1"
                      toggle-color="primary active"
                      color="transparent"
                      text-color="primary"
                      no-caps
                      spread
                      unelevated
                      dense
                      :options="mentionTypeOptions"
                      v-model="mentionType"
                      @click="toggleMentionType">
          <template v-slot:one>
            <div class="d-flex justify-content-center align-items-center w-100 px-1 options"
                 :class="receivedTabClass">
                <span class="text-left">
                  Received
                </span>
            </div>
          </template>

          <template v-slot:two>
            <div class="d-flex justify-content-center align-items-center w-100 px-1 options"
                 :class="sentTabClass">
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
                   v-if="!isGettingTasksList && $route.params.channel !== 'mentions' && communications.length">
        </task-list>
        <task-mention-list :communications="communications"
                           :direction="mentionType"
                           :search-text="searchText"
                           v-if="!isGettingTasksList && $route.params.channel === 'mentions' && communications.length">
        </task-mention-list>
        <div :class="spinnerClass">
          <b-overlay rounded="sm"
                     :show="isLoadingMore || isGettingTasksList">
            <template #overlay>
              <q-spinner-bars color="primary"
                              size="2em"/>
            </template>
          </b-overlay>
        </div>
        <div class="text-center mt-3"
             v-if="hasNoData">
          No data found based on the given filter criteria
        </div>
        <div class="text-center mt-3"
             v-if="communicationsListHasError">
          Unable to fetch {{ $route.params.channel !== 'mentions' ? 'communications' : 'mentions' }}.
          <br/>
          <b-btn variant="primary"
                 class="mt-3"
                 size="sm"
                 @click="getCommunications(filter)">Retry</b-btn>
        </div>
      </div>
      <filter-dialog :default-filter-model="channelDefaultFilterModel"
                     v-model="filter"
                     @createNewFilter="onCreateNewFilter"
                     @applyFilter="onApplyFilter"
                     @onResetFilter="resetFilters">
      </filter-dialog>
      <create-filter-dialog :filter-model="newFilterModel" />
    </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import {
  aclMixin,
  dateMixin,
  visibilityMixin
} from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import TaskList from 'components/inbox/channel-tasks/task-list'
import * as Filters from 'src/constants/filters'
import * as CommunicationTypes from 'src/constants/communication-types'
import CompactBtn from 'components/compact-btn'
import FilterDialog from 'components/inbox/inbox-filters/filter-dialog'
import * as MentionType from 'src/constants/mention-type'
import * as ChannelType from 'src/constants/inbox-channels'
import TaskMentionList from 'components/inbox/channel-tasks/task-mention-list'
import FilterIcon from 'components/icons/filter-icon'
import InboxSearcher from 'components/inbox/inbox-searcher'
import SearchToggle from 'components/search-toggle'
import CreateFilterDialog from 'components/inbox/inbox-filters/create-filter-dialog'
import UserSelector from 'components/generic-selectors/user-selector'

export default {
  name: 'inbox-channels',

  mixins: [
    aclMixin,
    dateMixin,
    visibilityMixin
  ],

  components: {
    UserSelector,
    CreateFilterDialog,
    InboxSearcher,
    FilterIcon,
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

  data () {
    return {
      filter: null,
      clonedFilter: null,
      previousRoute: null,
      currentPage: 0,
      isLoadingMore: false,
      isLoaded: false,
      isScrolled: false,
      communicationsListHasError: false,
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
      searchText: null,
      isSearch: false,
      newFilterModel: {
        name: '',
        type: 2,
        filter: [],
        scope: 'user'
      },
      scrollTimeout: null,
      cancelToken: null,
      source: null,
      listeners: {}
    }
  },

  computed: {
    ...mapState('inbox', [
      'isGettingTasksList',
      'activeChannel',
      'communications',
      'channelChangedFilterFields',
      'appliedFilter',
      'hasMoreCommunications',
      'inboxShowMyContacts'
    ]),

    nextPage () {
      if (this.$route.params.channel === 'mentions') {
        return this.currentPage + 1
      }

      // using cursor parameter from next_page_url
      const nextUrl = new URL(this.pagination.next_page_url)

      return nextUrl.searchParams.get('cursor')
    },

    filterButtonVariant () {
      return 'outlined-light'
    },

    hasChannelFilterChanges () {
      return this.channelChangedFilterFields.length > 0
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
          my_contact: Filters.DEFAULT_STATE.filter.my_contact
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
          my_contact: Filters.DEFAULT_STATE.filter.my_contact
        }

        if (['recordings'].includes(this.$route.params.channel)) {
          defaultFilterModel.type = ChannelType.CHANNEL_RECORDINGS
          defaultFilterModel.filter.answer_status = 'recorded'
        }

        return defaultFilterModel
      }

      if (this.$route.params.channel === 'mentions') {
        defaultFilterModel.type = ChannelType.CHANNEL_MENTIONS
        defaultFilterModel.filter = {
          users: Filters.DEFAULT_STATE.filter.users,
          contact_owner: Filters.DEFAULT_STATE.filter.contact_owner
        }

        return defaultFilterModel
      }

      if (this.$route.params.channel === 'all-communications') {
        const filteredTags = this.$route.query?.tagId
          ? [this.$route.query.tagId]
          : Filters.DEFAULT_STATE.filter.tagsFilter

        defaultFilterModel.type = ChannelType.CHANNEL_ALL_COMMUNICATIONS
        defaultFilterModel.filter = {
          campaigns: Filters.DEFAULT_STATE.filter.campaigns,
          ring_groups: Filters.DEFAULT_STATE.filter.ring_groups,
          direction: Filters.DEFAULT_STATE.filter.direction,
          answer_status: Filters.DEFAULT_STATE.filter.answer_status,
          min_talk_time: Filters.DEFAULT_STATE.filter.min_talk_time,
          transfer_type: Filters.DEFAULT_STATE.filter.transfer_type,
          callback_status: Filters.DEFAULT_STATE.filter.callback_status,
          tags: filteredTags,
          call_dispositions: Filters.DEFAULT_STATE.filter.call_dispositions,
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
          creator_type: Filters.DEFAULT_STATE.filter.creator_type
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
        creator_type: Filters.DEFAULT_STATE.filter.creator_type
      }

      return defaultFilterModel
    },

    changedFilterFieldCount () {
      const dateFieldIndex = this.channelChangedFilterFields.findIndex(item => ['from_date', 'to_date'].includes(item.property))

      if (dateFieldIndex >= 0) {
        return this.channelChangedFilterFields.length - 1
      }

      return this.channelChangedFilterFields.length
    },

    searchIconColor () {
      return this.isSearch ? '#256EFF' : '#62666E'
    },

    filterWrapperClass () {
      const highlightedClass = this.hasChannelFilterChanges || this.appliedFilter
        ? '--highlighted'
        : ''

      return [
        highlightedClass
      ]
    },

    appliedFilterName () {
      return !this.appliedFilter
        ? ''
        : this.appliedFilter.name
    },

    filtersText () {
      return !this.appliedFilter && this.channelChangedFilterFields.length
        ? 'Filters'
        : ''
    },

    receivedTabClass () {
      const tabClass = this.mentionType === 'received' ? 'active' : 'text-grey-90'

      return [tabClass]
    },

    sentTabClass () {
      const tabClass = this.mentionType === 'sent' ? 'active' : 'text-grey-90'

      return [tabClass]
    },

    spinnerClass () {
      const loadingClass = this.isGettingTasksList ? 'py-5' : 'py-4'

      return [
        loadingClass,
        'relative'
      ]
    },

    hasNoData () {
      return !this.communications.length &&
        !this.isGettingTasksList &&
        !this.isLoadingMore &&
        !this.isSearch &&
        !this.communicationsListHasError
    }
  },

  created () {
    this.cancelToken = window.axios.CancelToken
    this.source = this.cancelToken.source()

    this.resetFilters()
    this.setMentionType()

    this.listeners.newCommunication = (data) => {
      // check new communication exists in the old list
      const found = this.communications.filter(communication => {
        return communication.id === data.id
      })

      if (found.length) {
        return
      }

      if (data.type === CommunicationTypes.NOTE) {
        this.handleNewMention(data)
        return
      }

      const isCommMatchesMinReq = this.checkCommunicationChannels(data) &&
        this.checkCommunicationMatchesSearch(this.searchText, data) &&
        this.checkCommunicationMatchesFilters(this.filter, data, true) &&
        this.checkCommunicationMatchesUserAccessibility(data) &&
        this.checkCommunicationMatchesCampaign(this.campaignId, data) &&
        this.checkCommunicationMatchesWorkflow(this.workflowId, data) &&
        this.checkCommunicationMatchesUser(this.userId, data) &&
        this.checkCommunicationMatchesRingGroup(this.ringGroupId, data)

      if (!isCommMatchesMinReq) {
        return
      }

      this.pagination.total += 1

      // push new data to top of array
      this.communications.unshift(data)

      if (this.communications.length > this.filter.per_page) {
        // push out last data from bottom of array
        this.communications.pop()
      }
    }

    this.listeners.updateCommunication = (data) => {
      if (this.pagination.prev !== null) {
        return
      }

      /*
        disable live dashboard for end clients;
        check data loaded
       */
      // check new communication exists in the old list
      const found = this.communications.filter(communication => {
        return communication.id === data.id
      })

      const isCommMatchesMinReq = this.checkCommunicationChannels(data) &&
        this.checkCommunicationMatchesSearch(this.searchText, data) &&
        this.checkCommunicationMatchesFilters(this.filter, data, true) &&
        this.checkCommunicationMatchesUserAccessibility(data) &&
        this.checkCommunicationMatchesCampaign(this.campaignId, data) &&
        this.checkCommunicationMatchesWorkflow(this.workflowId, data) &&
        this.checkCommunicationMatchesUser(this.userId, data)

      if (found.length) {
        // update communication
        data = _.extend({}, found[0], data)

        if (isCommMatchesMinReq && this.checkCommunicationMatchesRingGroup(this.ringGroupId, data)) {
          this.$set(this.communications, this.communications.indexOf(found[0]), data)

          return
        }

        this.communications = this.communications.filter(communication => {
          return communication.id !== data.id
        })

        this.pagination.total -= 1

        return
      }

      // add the communication if it's not already there and if it matches the criteria
      if (isCommMatchesMinReq &&
        this.pagination.prev === null &&
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

    this.listeners.deleteCommunication = (data) => {
      // check data loaded
      if (this.pagination.prev !== null) {
        return
      }

      // try to find the communication
      const found = this.communications.find(communication => communication.id === data.id)

      if (found) {
        return
      }

      // remove it from the list
      this.communications.splice(this.communications.indexOf(found), 1)
      this.pagination.total -= 1
    }

    this.listeners.markContactCommunicationsAllAsRead = (data) => {
      const contactId = _.get(data, 'id', null)

      if (!contactId) {
        return
      }

      // get current contact's communications
      const contactCommunications = this.communications.filter(communication => _.get(communication, 'contact.id', null) === contactId)
      const index = { data: null }

      // iterate through and update is_read value
      contactCommunications.forEach((communication) => {
        index.data = this.communications.findIndex(item => item.id === communication.id)
        this.communications[index.data].is_read = true
      })

      // set updated communications
      this.setCommunications(this.communications)
    }

    this.listeners.inboxLoadCommunications = (showMyContacts) => {
      this.filter = this.filterMyContacts(this.filter, showMyContacts)

      if (this.filter.cursor !== undefined) {
        delete this.filter.cursor
      }

      if (showMyContacts) {
        this.filter.contact_owner = []
        this.updateChannelChangedFilterFields({
          name: 'contact_owner',
          value: []
        })
      }

      this.isLoaded = false
      this.getCommunications(this.filter)
    }

    this.$VueEvent.listen('new_communication', this.listeners.newCommunication)
    this.$VueEvent.listen('update_communication', this.listeners.updateCommunication)
    this.$VueEvent.listen('delete_communication', this.listeners.deleteCommunication)
    this.$VueEvent.listen('mark_contact_communications_all_as_read', this.listeners.markContactCommunicationsAllAsRead)
    this.$VueEvent.listen('inbox_load_communications', this.listeners.inboxLoadCommunications)
  },

  mounted () {
    // check for url parameter filter to preselect and load
    if (['all-communications'].includes(this.$route.params.channel) && this.$route.query?.tagId) {
      this.filter = this.channelDefaultFilterModel.filter
      this.updateChannelChangedFilterFields({
        name: 'tags',
        value: this.channelDefaultFilterModel.filter.tags
      })
      this.onApplyFilter(this.channelDefaultFilterModel.filter)
    }

    this.$VueEvent.listen('load_and_navigate_channel', (lastNavigatedIndex) => {
      if (this.$route.params.channel === 'mentions') {
        this.filter.page = this.nextPage
      } else {
        this.filter.cursor = this.nextPage
      }

      this.loadMoreCommunications(this.filter).then(() => {
        const communication = this.communications[lastNavigatedIndex + 1]
        this.setSelectedCommunication(communication)

        if (this.$route.name === 'Inbox Contact') {
          this.redirectChannel(communication)
        }

        if (this.$route.name === 'Inbox Contact Communication') {
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

      if (this.$route.name === 'Inbox Contact Communication') {
        this.redirectMentionsChannel(communication)
      }

      this.makeSelectedItemVisible()
    })

    this.$VueEvent.listen('contact_updated', (data) => {
      const communications = [...this.communications]
      const channels = [
        'calls',
        'messages',
        'mentions',
        'voicemails',
        'recordings'
      ]

      if (channels.includes(this.$route.params.channel)) {
        if (this.$route.params.channel === 'mentions') {
          communications.filter(item => item.mention_subject.contact && item.mention_subject.contact.id === data.id).forEach((value) => {
            value.mention_subject.contact = data
          })
        } else {
          communications.filter(item => item.contact && data && item.contact.id === data.id).forEach((value) => {
            value.contact = data
          })
        }

        this.setCommunications(communications)
      }
    })

    const inboxChannelRoutes = [
      'Inbox Channel',
      'Inbox Contact Communication',
      'Inbox Contact',
      'Inbox Channel Task Status', 'Inbox Contact Task'
    ]
    const generalChannelRoutes = ['Inbox Channel', 'Inbox Contact']
    const communicationsChannelRoutes = ['Inbox Contact', 'Inbox Contact Communication']

    if (inboxChannelRoutes.includes(this.$route.name) && this.$route.params.channel !== 'inbox') {
      this.getCommunications(this.filter, () => {
        const isGeneralChannelRoutesOrMentions = generalChannelRoutes.includes(this.$route.name) ||
          ['mentions'].includes(this.$route.params.channel)

        if (isGeneralChannelRoutesOrMentions && communicationsChannelRoutes.includes(this.$route.name)) {
          let communication = null

          if (this.$route.name === 'Inbox Contact Communication') {
            communication = this.communications.find(item => item.mention_subject_id.toString() === this.$route.params.communicationId.toString())
          } else {
            communication = this.communications.find(item => item.id.toString() === this.$route.params.communicationId.toString())
          }

          if (communication) {
            this.setSelectedCommunication(communication)
          }
        }
      })
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
      'setAppliedFilter',
      'setHasMoreCommunications',
      'toggleFilterModelForm',
      'toggleFilterDialog',
      'setIsInboxFiltersLoaded',
      'updateChannelChangedFilterFields'
    ]),

    onResetFilters () {
      this.resetFilters()
      this.getCommunications(this.filter)
    },

    resetFilters () {
      this.filter = _.clone(Filters.DEFAULT_STATE.filter)
      this.filter.search_text = this.searchText
      this.filter.search_fields = this.searchFields
      this.filter.per_page = 20

      if (this.$route.params.channel === 'mentions') {
        this.filter.page = 1
      } else {
        this.filter.cursor = null
      }

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
    },

    onApplyFilter (filter) {
      this.filter = filter

      if (this.$route.params.channel === 'recordings') {
        this.filter.answer_status = 'recorded'
      }

      if (this.$route.params.channel === 'mentions') {
        if (this.mentionType === MentionType.TYPE_RECEIVED) {
          this.filter.mentioner_user_id = filter.users
        }

        if (this.mentionType === MentionType.TYPE_SENT) {
          this.filter.mentioned_user_id = filter.users
        }
      }

      this.getCommunications(this.filter)
    },

    onCreateNewFilter (filter) {
      this.newFilterModel = { ...this.newFilterModel, filter: filter, type: this.channelDefaultFilterModel.type }
      this.toggleFilterModelForm(true)
    },

    checkCommunicationChannels (communication) {
      if (!this.activeChannel) {
        return true
      }

      switch (communication.type) {
        case CommunicationTypes.CALL:
          return ['calls', 'voicemails', 'recordings'].includes(this.activeChannel.value)
        case CommunicationTypes.SMS:
          return ['messages'].includes(this.activeChannel.value)
        case CommunicationTypes.NOTE:
          return ['mentions'].includes(this.activeChannel.value)
        default:
          return true
      }
    },

    getCommunications (filters, callback) {
      let params = this.$jsonClone(filters)
      let api = talk2Api.V1.reports.communications
      this.setIsInboxFiltersLoaded(true)
      this.gettingTasksList(true)
      this.communicationsListHasError = false

      // payload specific for Mentions
      if (this.$route.params.channel === 'mentions') {
        api = talk2Api.V2.mentions
        params = {
          ...{
            direction: this.mentionType,
            page: params.page || 1,
            per_page: params.per_page || 20,
            mentioner_user_id: params.mentioner_user_id,
            mentioned_user_id: params.mentioned_user_id,
            search_fields: params.search_fields,
            search_text: params.search_text
          }
        }
      }

      if (this.$route.params.channel !== 'mentions') {
        params = { ...params, order: this.sorting.order }
      } else {
        params = { ...params, order_by: this.sorting.order }
      }

      params = this.removeUnnecessaryParameters(params)
      params = this.filterMyContacts(params)

      this.source.cancel('Loading of communication operation is canceled by the user.')
      this.source = this.cancelToken.source()

      return api.get({ params: params, cancelToken: this.source.token })
        .then(response => {
          if (response) {
            this.gettingTasksList(false)
            this.setCommunications(response.data.data)
            this.currentPage = response.data.current_page
            this.setHasMoreCommunications(response.data.next_page_url)
            this.isLoaded = true
            this.pagination = _.clone(response.data)
            delete this.pagination.data

            if (typeof callback !== 'undefined') {
              callback()
            }
          }
        }).catch(thrown => {
          if (window.axios.isCancel(thrown) && thrown) {
            console.log('Request canceled', thrown.message)
            return
          }

          this.gettingTasksList(false)
          this.communicationsListHasError = true
          const channelName = this.$route.params.channel !== 'mentions'
            ? 'communications'
            : 'mentions'
          this.$generalNotification(`An exception was encountered while fetching ${channelName}.`, 'error')
        })
    },

    loadMoreCommunications (filters) {
      let params = this.$jsonClone(filters)
      this.isLoadingMore = true
      this.isLoaded = false

      if (this.inboxShowMyContacts) {
        params.my_contact = 1
      }

      let api = talk2Api.V1.reports.communications

      if (this.$route.params.channel === 'mentions') {
        api = talk2Api.V2.mentions
        params = {
          ...{
            direction: this.mentionType,
            page: params.page,
            per_page: params.per_page,
            order_by: this.sorting.order
          }
        }

        if (this.mentionType === 'sent' && this.filter.mentioned_user_id) {
          params = {
            ...params,
            ...{
              mentioned_user_id:
              this.filter.mentioned_user_id
            }
          }
        }

        if (this.mentionType === 'received' && this.filter.mentioner_user_id) {
          params = {
            ...params,
            ...{
              mentioner_user_id:
              this.filter.mentioner_user_id
            }
          }
        }
      }

      if (this.$route.params.channel !== 'mentions') {
        params = { ...params, order: this.sorting.order }
      } else {
        params = { ...params, order_by: this.sorting.order }
      }

      params = this.removeUnnecessaryParameters(params)

      return api.get({ params: params })
        .then(response => {
          this.setCommunications([...this.communications, ...response.data.data])
          this.currentPage = response.data.current_page
          this.setHasMoreCommunications(response.data.next_page_url)
          this.isLoadingMore = false
          this.isLoaded = true
          this.pagination = _.clone(response.data)
          delete this.pagination.data
          this.isScrolled = false
        })
    },

    removeUnnecessaryParameters (params) {
      // TODO check other way of doing this in inbox filter improvements
      if (this.$route.params.channel === 'messages') {
        delete params.report_type
        delete params.chart_period
        delete params.min_talk_time
        delete params.changed
      }

      const callsChannels = ['calls', 'recordings', 'voicemails']

      if (callsChannels.includes(this.$route.params.channel)) {
        delete params.report_type
        delete params.chart_period
        delete params.has_unread
        delete params.text_authorized
        delete params.changed
      }

      if (this.$route.params.channel === 'voicemails') {
        delete params.min_talk_time
      }

      return params
    },

    handleScroll (el) {
      if ((el.target.offsetHeight + el.target.scrollTop) >= (el.target.scrollHeight - 70)) {
        this.onTaskListBottomScroll()
      }
    },

    onTaskListBottomScroll () {
      clearTimeout(this.scrollTimeout)

      // Set a timeout to run after scrolling ends
      this.scrollTimeout = setTimeout(() => {
        // Run the callback
        if (this.hasMoreCommunications && this.isLoaded) {
          this.isScrolled = true

          if (this.$route.params.channel === 'mentions') {
            this.filter.page = this.nextPage
          } else {
            this.filter.cursor = this.nextPage
          }

          this.loadMoreCommunications(this.filter)
        }
      }, 66)
    },

    toggleMentionType () {
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
      if (this.$route.params.channel !== 'mentions') {
        return
      }

      switch (this.$route.params.status) {
        case 'sent':
          this.mentionType = MentionType.TYPE_SENT
          break
        case 'received':
        default:
          this.mentionType = MentionType.TYPE_RECEIVED
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

      this.getCommunications(this.filter)
    },

    sortFilter (value) {
      this.sorting.order = value ? (value === 'newest' ? 'desc' : 'asc') : 'desc'
      this.getCommunications(this.filter)
    },

    redirectMentionsChannel (mention) {
      this.$router.push({
        name: 'Inbox Contact Communication',
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
      this.searchText = value.trim()
    },

    onSearchOpened () {
      this.filter.search_text = null
      this.setHasMoreCommunications(null)
      this.setCommunications([])
      this.isSearch = true

      this.$nextTick(function () {
        this.$refs.searchToggle.inputFocus()
      }.bind(this))
    },

    onSearchClosed () {
      this.searchText = null

      if (this.$route.params.channel === 'mentions') {
        this.filter.page = 1
      } else {
        this.filter.cursor = null
      }

      this.filter.search_text = this.searchText
      this.isSearch = false
      this.getCommunications(this.filter)
    },

    searching (value) {
      value = value.trim()

      // sanity check: minimum of 3 characters required
      if (!value || value.length < 3) {
        return
      }

      if (value === '') {
        this.setCommunications([])
      }

      this.searchText = value
    },

    handleNewMention (communication) {
      const api = talk2Api.V2.mentions
      let params = this.$jsonClone(this.filter)

      params = {
        ...{
          direction:
          this.mentionType,
          page: params.page,
          per_page: params.per_page,
          mentioner_user_id: params.mentioner_user_id,
          mentioned_user_id: params.mentioned_user_id
        }
      }

      params = {
        ...params,
        order_by: this.sorting.order
      }

      api.get({ params: params })
        .then(response => {
          const mention = response.data.data.find(item => item.mention_subject_id === communication.id)

          if (mention) {
            this.pagination.total += 1
            // push new data to top of array
            this.communications.unshift(mention)

            if (this.communications.length > this.filter.per_page) {
              // push out last data from bottom of array
              this.communications.pop()
            }
          }
        })
    },

    filterMyContacts (params, showMyContacts) {
      if (showMyContacts === undefined) {
        showMyContacts = this.inboxShowMyContacts
      }

      const myContactsFilter = _.get(params, 'my_contact', null)

      if (myContactsFilter !== null && myContactsFilter !== (showMyContacts | 0)) {
        params.my_contact = (showMyContacts | 0)
      }

      return params
    }
  },

  watch: {
    $route (to, from) {
      this.previousRoute = from
      const inboxRoutes = ['Inbox Channel', 'Inbox', 'Inbox Channel Task Status']

      if (inboxRoutes.includes(this.$route.name)) {
        this.isLoaded = false
      }
    },

    activeChannel (newValue, oldValue) {
      const isDifferent = JSON.stringify(newValue) !== JSON.stringify(oldValue)

      if (isDifferent && this.$route.name === 'Inbox Channel') {
        this.searchText = null
        this.resetFilters()
        this.isSearch = false
      }
    },

    searchText (value) {
      value = value.trim()

      // sanity check: minimum of 3 character required
      if (!value || value.length < 3) {
        return
      }

      if (value === '') {
        this.setCommunications([])
        return
      }

      this.filter.search_text = value

      if (this.$route.params.channel === 'mentions') {
        this.filter.page = 1
      } else {
        this.filter.cursor = null
      }

      this.getCommunications(this.filter)
    },

    '$route.name': function (value) {
      const inboxContactRoutes = ['Inbox Contact', 'Inbox Contact Communication']
      if (inboxContactRoutes.includes(value)) {
        // since mention has different data structure to other channels, need to set property to compare as comm id
        const identifierProp = value === 'Inbox Contact Communication' ? 'mention_subject_id' : 'id'
        const communication = this.communications.find(item => item[identifierProp] === this.$route.params.communicationId)
        this.setSelectedCommunication(communication)
      }
    },

    '$route.params.status': function (value) {
      const mentionTypes = [MentionType.TYPE_RECEIVED, MentionType.TYPE_SENT]

      if (mentionTypes.includes(value) && !this.$route.params.id) {
        this.resetFilters()
        this.isScrolled = false

        if (this.$route.params.channel === 'mentions' && this.mentionUserId) {
          if (this.mentionType === MentionType.TYPE_RECEIVED) {
            this.filter.mentioner_user_id = this.mentionUserId
          }

          if (this.mentionType === MentionType.TYPE_SENT) {
            this.filter.mentioned_user_id = this.mentionUserId
          }
        }

        this.getCommunications(this.filter)
      }
    },

    '$route.params.channel': function (value) {
      const communicationChannels = [
        'mentions',
        'calls',
        'messages',
        'voicemails',
        'recordings',
        'all-communications'
      ]

      if (communicationChannels.includes(value)) {
        this.getCommunications(this.filter)
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('new_communication', this.listeners.newCommunication)
    this.$VueEvent.stop('update_communication', this.listeners.updateCommunication)
    this.$VueEvent.stop('delete_communication', this.listeners.deleteCommunication)
    this.$VueEvent.stop('mark_contact_communications_all_as_read', this.listeners.markContactCommunicationsAllAsRead)
    this.$VueEvent.stop('inbox_load_communications', this.listeners.inboxLoadCommunications)
  }
}
</script>
