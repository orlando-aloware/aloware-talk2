import talk2Api from 'src/plugins/api/api'
import moment from 'moment'
import { mapActions, mapState, mapGetters } from 'vuex'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import _, { isEmpty } from 'lodash'
import { RELATIONS as CONTACT_RELATIONS } from 'src/constants/contacts-list-relations'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import { DATE_OPERATORS } from 'src/constants/contacts-date-filter-operators'

import * as Filters from 'src/constants/filters'
import * as ChannelType from 'src/constants/inbox-channels'
import * as InboxTaskStatus from 'src/constants/inbox-task-status'

import * as MentionType from 'src/constants/mention-type'

import { INBOUND, OUTBOUND } from 'src/constants/communication-direction'
import { userMixin } from 'src/plugins/mixins'
import { DEFAULT_COMMUNICATIONS_CHANNEL } from 'src/router/routes'

export default {
  mixins: [userMixin],

  computed: {
    ...mapState('communications', [
      'isFetchingContacts',
      'contactsCurrentPage',
      'liveContacts',
      'inboxShowMyContacts',
      'inboxShowUnreads',
      'activeChannel',
      'pinnedViews',
      'contacts',
      'appliedFilter',
      'channelClonedFilter',
      'isLoadingCommunications',
      'isLoadingCommunicationsCount',
      'isGettingTasksList',
      'communications',
      'channelChangedFilterFields',
      'selectedFilter',
      'isFilterDialogForView'
    ]),

    ...mapState('auth', ['profile']),

    ...mapState(['currentTimezone', 'campaigns']),

    ...mapGetters('cache', ['isContactStatusControlEnabled']),

    ...mapGetters('communications', [
      'communicationsCount',
      'inboxFilters'
    ]),

    communicationFilters () {
      return {
        ...this.inboxFilters,
        search_text: this.searchQuery
      }
    },

    nextPage () {
      return this.contactsCurrentPage + 1
    },

    statusText () {
      return this.$options.filters.fixTaskStatusName(this.currentTask).toLowerCase()
    },

    lastPage () {
      if (!this.communicationsCount) {
        return 1
      }
      return Math.ceil(this.communicationsCount / this.perPage)
    }
  },

  data () {
    const inboxRoutes = [
      'Communications',
      'Communications Contact Task',
      'Communications Channel Task Status',
      'Communications Contact Communication'
    ]
    const inboxViewsRoutes = [
      'Communications View',
      'Communications View Contact Task'
    ]

    return {
      currentTask: InboxTaskStatus.DEFAULT_STATUS,
      options: [
        {
          value: InboxTaskStatus.STATUS_ALL,
          slot: 'one'
        },
        {
          value: ContactTaskStatus.STATUS_OPEN,
          slot: 'two'
        },
        {
          value: ContactTaskStatus.STATUS_PENDING,
          slot: 'three'
        },
        {
          value: ContactTaskStatus.STATUS_CLOSED,
          slot: 'four'
        }
      ],
      ContactTaskStatusNew: ContactTaskStatus.STATUS_NEW,
      ContactTaskStatusOpen: ContactTaskStatus.STATUS_OPEN,
      ContactTaskStatusPending: ContactTaskStatus.STATUS_PENDING,
      ContactTaskStatusClosed: ContactTaskStatus.STATUS_CLOSED,
      ContactTaskStatusAll: InboxTaskStatus.STATUS_ALL,
      filters: {
        search: []
      },
      sorting: {
        sort: 'last_engagement_at',
        order: 'desc'
      },
      isLoadingMore: false,
      isLoaded: false,
      taskListHasError: false,
      page: 1,
      perPage: 20,
      lineOrRingGroupFilter: null,
      lineOrRingGroupFilteredId: null,
      cancelToken: null,
      source: null,
      cancelTokenPinnedViews: null,
      sourcePinnedViews: null,
      paginationPage: 1,

      perPageOptions: [
        { value: 25, label: '25 Per Page' },
        { value: 50, label: '50 Per Page' },
        { value: 100, label: '100 Per Page' }
      ],
      maxPaginationPages: 5,
      nextCursor: null,
      countSource: null,
      pagination: {
        rowsPerPage: 0,
        rowsNumber: this.communicationsCount
      },
      fixedColumns: [
        'disposition_status2',
        'incoming_number',
        'ring_group',
        'created_at',
        'talk_time',
        'duration',
        'contact',
        'user_id',
        'operations'
      ],
      searchQuery: '',
      mentionType: MentionType.TYPE_RECEIVED,

      communicationInProgressStatuses: [
        CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW
      ],
      isLoadedPinnedViews: false,
      inboxRoutes: [
        ...inboxRoutes,
        ...inboxViewsRoutes
      ],
      inboxChannelRoutes: [
        ...inboxRoutes,
        ...inboxViewsRoutes,
        ...[
          'Communications Channel',
          'Communications Contact'
        ]
      ],
      inboxViewsRoutes: inboxViewsRoutes,
      defaultFilterModel: {
        name: '',
        type: ChannelType.CHANNEL_INBOX,
        filter: Filters.EXCERPT,
        scope: 'user'
      },
      ranges: {}
    }
  },

  methods: {
    ...mapActions('communications', [
      'setLiveContacts',
      'setSelectedContact',
      'setHasMoreContacts',
      'gettingContactsList',
      'setContactsCurrentPage',
      'setInboxTaskCount',
      'setOpenTaskCount',
      'setPendingTaskCount',
      'setInboxOpenTaskCount',
      'setInboxPendingTaskCount',
      'setLoadingOpenTaskCount',
      'setLoadingPendingTaskCount',
      'setIsInboxFiltersLoaded',
      'setIsLoadingCommunications',
      'setIsLoadingCommunicationsCount',
      'gettingTasksList',
      'setTaskCount',
      'setPinnedViews',
      'setContacts',
      'setCommunications',
      'appendCommunications',
      'setCommunicationsCount',
      'setHasMoreCommunications'
    ]),

    getNoneLiveCallContactTasks (contacts) {
      if (this.liveContacts.length >= 0) {
        // get all live contacts id
        const ids = this.liveContacts.map(item => item.id)

        // sift contacts that are not in live calls
        // we are getting some duplicate records from the api so we implemented reduce and remove those dupes
        return contacts.filter(item => !ids.includes(item.id)).reduce((acc, current) => {
          const x = acc.find(item => item.id === current.id)

          if (!x) {
            return acc.concat([current])
          }

          return acc
        }, [])
      }

      return contacts.filter(contact => (contact.last_communication &&
        !this.communicationInProgressStatuses.includes(contact.last_communication.current_status2)) ||
        !contact.last_communication)
    },

    getLiveCallContactTasks (contacts) {
      return contacts.filter(contact => contact.last_communication &&
        this.communicationInProgressStatuses.includes(contact.last_communication.current_status2))
    },

    loadContactTasks (loadCount = true, showLoading = true) {
      this.setIsInboxFiltersLoaded(this.isLoaded)
      this.gettingTasksList(false)
      this.taskListHasError = false

      if (showLoading) {
        this.gettingContactsList(true)
        this.setContacts([])
      }

      // always reset page when fresh loading contacts
      this.page = 1

      if (loadCount) {
        this.fetchTaskCounts()
      }

      return this.getContactsByTaskStatus(this.currentTask)
        .then(response => {
          this.taskListHasError = false

          if (!response) {
            return
          }

          // only empty contacts after the request is done since we are now showing the animation
          if (!showLoading) {
            this.setContacts([])
          }

          this.setContacts(this.getNoneLiveCallContactTasks(response.data.data))
          this.gettingContactsList(false)
          this.setContactsCurrentPage(response.data.current_page)
          this.setHasMoreContacts(response.data.next_page_url)

          const isSinglePage = response.data.current_page === 1 && !response.data.next_page_url
          // set the task count as the length of the list of contacts if it is the first and only page
          if (this.currentTask === ContactTaskStatus.STATUS_OPEN && isSinglePage) {
            this.setOpenTaskCount(response.data.data.length)
            this.setInboxOpenTaskCount(response.data.data.length)
          }
          // set the task count as the length of the list of contacts if it is the first and only page
          if (this.currentTask === ContactTaskStatus.STATUS_PENDING && isSinglePage) {
            this.setPendingTaskCount(response.data.data.length)
            this.setInboxPendingTaskCount(response.data.data.length)
          }
          this.isLoadingMore = false
          this.isLoaded = true
          this.setIsInboxFiltersLoaded(this.isLoaded)
        })
        .catch((thrown) => {
          if (window.axios.isCancel(thrown) && thrown) {
            console.log(thrown.message)
          } else {
            this.taskListHasError = true

            if (showLoading) {
              this.gettingContactsList(false)
            }

            this.$generalNotification(`An exception was encountered while fetching contact tasks.`, 'error')
          }

          this.isLoaded = true
          this.setIsInboxFiltersLoaded(this.isLoaded)
        })
    },

    loadMoreContactTasks () {
      this.isLoaded = false
      this.isLoadingMore = true

      return this.getContactsByTaskStatus(this.currentTask)
        .then(response => {
          this.setContacts([...this.contacts, ...this.getNoneLiveCallContactTasks(response.data.data)])
          this.setContactsCurrentPage(response.data.current_page)
          this.setHasMoreContacts(response.data.next_page_url)

          this.isLoadingMore = false
          this.isLoaded = true
        })
        .catch(() => {
          this.isLoaded = true
          this.setIsInboxFiltersLoaded(this.isLoaded)
        })
    },

    getContactsByTaskStatus (taskId) {
      this.source.cancel('Loading of contact task operation is canceled by the user.')
      this.source = this.cancelToken.source()

      return talk2Api.V2.contacts.list(this.getParameters(taskId), this.source.token)
    },

    getContactsCountByTaskStatus (taskId, forInbox = false, params = null) {
      params = forInbox && !isEmpty(params) ? params : this.getParameters(taskId, true)

      return talk2Api.V2.contacts.counts(params)
        .then(response => {
          switch (taskId) {
            case ContactTaskStatus.STATUS_OPEN:
              if (response) {
                if (!forInbox) {
                  this.setOpenTaskCount(+response.data.count)
                }

                if (!this.activeChannel || this.activeChannel.value === DEFAULT_COMMUNICATIONS_CHANNEL || forInbox) {
                  this.setInboxOpenTaskCount(+response.data.count)
                }
              }

              this.setLoadingOpenTaskCount(false)
              break

            case ContactTaskStatus.STATUS_PENDING:
              if (response) {
                if (!forInbox) {
                  this.setPendingTaskCount(+response.data.count)
                }

                if (!this.activeChannel || this.activeChannel.value === DEFAULT_COMMUNICATIONS_CHANNEL || forInbox) {
                  this.setInboxPendingTaskCount(+response.data.count)
                }
              }

              this.setLoadingPendingTaskCount(false)
              break
          }
        })
    },

    getParameters (taskId, count = false, filters = null) {
      const query = !count ? { page: this.page, sort: this.sorting.sort, order: this.sorting.order } : {}
      let relations = []

      this.reInitFilters(taskId)
      query.filter_groups = []

      if (this.searchText && this.searchText.trim() && this.searchText.length >= 3) {
        this.filters.search = [{
          value: this.searchText
        }]

        delete this.filters.contact_task_status
      } else {
        this.filters.contact_task_status[0].value = taskId === InboxTaskStatus.STATUS_ALL
          ? InboxTaskStatus.STATUS_ALL_IDS
          : [taskId]
      }

      const filter = filters ?? this.appliedFilter?.filter ?? this.channelClonedFilter ?? null

      // Using new communication filters for beta companies
      // @TODO: There are a lot of code duplication here,
      // but this will be removed once the old filters are removed
      if (this.isCompanyPartOfNewInboxFilters(this.profile.company_id)) {
        // add the line filter if there is
        if (filter && !isEmpty(filter?.campaigns)) {
          this.filters.communication_lines = [
            { value: filter.campaigns, operator: OPERATORS.IS_ANY_OF }
          ]
        }

        if (filter && filter?.ring_groups && filter.ring_groups.length) {
          this.filters = {
            ...this.filters,
            'communication_ring_groups': [
              { value: filter.ring_groups, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.users && filter.users.length) {
          this.filters = {
            ...this.filters,
            'communication_users': [
              { value: filter.users, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.contact_owner && filter.contact_owner.length && !this.inboxShowMyContacts) {
          this.filters = {
            ...this.filters,
            'inbox_contact_owner': [
              { value: filter.contact_owner, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        query.my_contact = this.inboxShowMyContacts

        if (query.my_contact) {
          this.filters = {
            ...this.filters,
            'inbox_contact_owner': [
              { value: [this.profile.id], operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.from_date && filter?.to_date && filter.from_date && filter.to_date) {
          this.filters = {
            ...this.filters,
            'communication_created_at': [
              { value: [filter.from_date, filter.to_date], operator: DATE_OPERATORS.IS_BETWEEN }
            ]
          }
        }

        if (filter && !isEmpty(filter.tags)) {
          this.filters = {
            ...this.filters,
            'communication_tags': [
              { value: filter.tags, operator: OPERATORS.IS_ANY_OF }
            ]
          }
          relations.push('tags')
        }

        // New filters from all communications
        if (filter && !isEmpty(filter.direction) && filter.direction !== 'all') {
          this.filters = {
            ...this.filters,
            'direction': [
              { value: [filter.direction === 'inbound' ? INBOUND : OUTBOUND], operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && !isEmpty(filter.answer_status) && filter.answer_status !== 'all') {
          this.filters = {
            ...this.filters,
            'answer_status': [
              { value: [filter.answer_status], operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        const otherFiltersList = [
          'callback_status',
          'broadcasts',
          'call_dispositions',
          'callback_status',
          'incoming_numbers',
          'creator_type',
          'workflows',
          'transfer_type',
          'min_talk_time',
          'untagged_only',
          'exclude_automated_communications',
          'not_disposed',
          'first_time_only'
        ]

        otherFiltersList.forEach(key => {
          if (filter && (!isEmpty(filter[key]) || filter[key] > 0)) {
            this.filters = {
              ...this.filters,
              [key]: [
                {
                  value: Array.isArray(filter[key]) ? filter[key] : [filter[key]],
                  operator: OPERATORS.IS_ANY_OF
                }
              ]
            }
          }
        })
      } else {
        // Using old filters for non-beta companies
        if (filter && !isEmpty(filter?.campaigns)) {
          this.filters.lines = [
            { value: filter.campaigns, operator: OPERATORS.IS_ANY_OF }
          ]
        }

        if (filter && filter?.ring_groups && filter.ring_groups.length) {
          this.filters = {
            ...this.filters,
            'ring_groups': [
              { value: filter.ring_groups, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.users && filter.users.length) {
          this.filters = {
            ...this.filters,
            'users': [
              { value: filter.users, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.contact_owner && filter.contact_owner.length && !this.inboxShowMyContacts) {
          this.filters = {
            ...this.filters,
            'inbox_contact_owner': [
              { value: filter.contact_owner, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        query.my_contact = this.inboxShowMyContacts

        if (query.my_contact) {
          this.filters = {
            ...this.filters,
            'inbox_contact_owner': [
              { value: [this.profile.id], operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.from_date && filter?.to_date && filter.from_date && filter.to_date) {
          this.filters = {
            ...this.filters,
            'last_engagement_at': [
              { value: [filter.from_date, filter.to_date], operator: DATE_OPERATORS.IS_BETWEEN }
            ]
          }
        }

        if (filter && !isEmpty(filter.tags)) {
          this.filters = {
            ...this.filters,
            'tags': [
              { value: filter.tags, operator: OPERATORS.IS_ANY_OF }
            ]
          }
          relations.push('tags')
        }
      }

      // apply only if filter is not "All Time"
      if (filter && filter.dynamic_engagement_date_range > 0) {
        this.filters = {
          ...this.filters,
          'dynamic_engagement_date_range': [
            { value: filter.dynamic_engagement_date_range, operator: 1 }
          ]
        }
      }

      query.has_unread = this.inboxShowUnreads

      if ((filter && !!+filter.has_unread) || (query.has_unread && this.inboxShowUnreads)) {
        this.filters = {
          ...this.filters,
          'is_unanswered_contact': [
            { value: 1, operator: 1 }
          ]
        }
      }

      query.filter_groups.push({ 'filters': this.filters, 'is_conjunction': true })

      if (!count) {
        relations.push('lastCommunication')
      }

      if (!isEmpty(relations)) {
        query.relations = relations.filter(relation => CONTACT_RELATIONS.includes(relation))
      }

      query.timezone = window.timezone

      return query
    },

    // Method to set date filters
    setDateFilter (filter, defaultReportPeriod) {
      switch (defaultReportPeriod) {
        case 'month':
          filter.from_date = window.moment().subtract(30, 'day').format('YYYY-MM-DD')
          break
        case 'week':
          filter.from_date = window.moment().subtract(7, 'day').format('YYYY-MM-DD')
          break
        case 'day':
          filter.from_date = window.moment().format('YYYY-MM-DD')
          break
      }
      filter.to_date = window.moment().format('YYYY-MM-DD')
    },

    reInitFilters (taskId) {
      this.filters = {
        contact_task_status: [
          {
            value: taskId === InboxTaskStatus.STATUS_ALL ? InboxTaskStatus.STATUS_ALL_IDS : [taskId],
            operator: OPERATORS.IS_ANY_OF
          }
        ],
        search: []
      }
    },

    setContact (updatedContact) {
      const index = this.contacts.findIndex(item => parseInt(item.id) === parseInt(updatedContact.id))

      if (index > -1) {
        Object.assign(this.contacts[index], updatedContact)
      }
    },

    fetchTaskCounts () {
      this.setLoadingPendingTaskCount(true)
      this.getContactsCountByTaskStatus(ContactTaskStatus.STATUS_PENDING)
      this.setLoadingOpenTaskCount(true)
      this.getContactsCountByTaskStatus(ContactTaskStatus.STATUS_OPEN)
    },

    fetchInboxTaskCounts () {
      const paramsPending = this.getParameters(ContactTaskStatus.STATUS_PENDING, true, { ...this.defaultFilterModel.filter })
      const paramsOpen = this.getParameters(ContactTaskStatus.STATUS_OPEN, true, { ...this.defaultFilterModel.filter })

      this.getContactsCountByTaskStatus(ContactTaskStatus.STATUS_PENDING, true, paramsPending)
      this.getContactsCountByTaskStatus(ContactTaskStatus.STATUS_OPEN, true, paramsOpen)
    },

    getPinnedViews () {
      this.sourcePinnedViews.cancel('Loading of pinned views is canceled.')
      this.sourcePinnedViews = this.cancelTokenPinnedViews.source()

      this.$axios
        .get('/api/v2/filters/pinned', {
          cancelToken: this.sourcePinnedViews.token
        })
        .then(res => {
          const views = [...res.data.data].filter(view => view?.filter)
          this.setPinnedViews(views)
          this.isLoadedPinnedViews = true
        })
        .catch(err => {
          console.log(err)
        })
    },

    getPinnedViewChannel (viewId) {
      const view = this.pinnedViews.find(view => +view.filter_id === +viewId)

      return view && !isEmpty(view)
        ? {
          label: view.filter.name,
          value: `view-${view.filter_id}`,
          icon: '',
          disabled: false,
          filters: view.filter.filter
        }
        : {}
    },

    setStatus () {
      switch (this.$route.params.status) {
        case 'pending':
          this.currentTask = ContactTaskStatus.STATUS_PENDING
          break
        case 'closed':
          this.currentTask = ContactTaskStatus.STATUS_CLOSED
          break
        case 'open':
          this.currentTask = ContactTaskStatus.STATUS_OPEN
          break
        case 'all':
          this.currentTask = InboxTaskStatus.STATUS_ALL
          break
      }
    },

    pinView (viewId) {
      this.$axios
        .post(`/api/v2/filters/${viewId}/pin`)
        .then(res => {
          this.$VueEvent.fire('viewPinned')
        })
        .catch(err => {
          console.log(err)
        })
    },

    unpinView (viewId) {
      this.$axios
        .delete(`/api/v2/filters/${viewId}/unpin`)
        .then(res => {
          this.$VueEvent.fire('viewUnpinned')
        })
        .catch(err => {
          console.log(err)
        })
    },

    getContactStatusOptions () {
      if (!this.isContactStatusControlEnabled) {
        return []
      }

      return [
        {
          value: ContactTaskStatus.STATUS_OPEN,
          label: 'Open'
        },
        {
          value: ContactTaskStatus.STATUS_PENDING,
          label: 'Pending'
        },
        {
          value: ContactTaskStatus.STATUS_CLOSED,
          label: 'Closed'
        }
      ]
    },

    initializeDateRanges () {
      const timezone = this.currentTimezone
      const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

      this.ranges = {
        'Today': [moment().tz(timezone).startOf('day').format(DATE_FORMAT), moment().tz(timezone).endOf('day').format(DATE_FORMAT)],
        'Yesterday': [moment().tz(timezone).subtract(1, 'days').startOf('day').format(DATE_FORMAT), moment().tz(timezone).subtract(1, 'days').endOf('day').format(DATE_FORMAT)],
        'Last 7 Days': [moment().tz(timezone).subtract(7, 'days').startOf('day').format(DATE_FORMAT), moment().tz(timezone).endOf('day').format(DATE_FORMAT)],
        'Last 30 Days': [moment().tz(timezone).subtract(30, 'days').startOf('day').format(DATE_FORMAT), moment().tz(timezone).endOf('day').format(DATE_FORMAT)],
        'This Month So Far': [moment().tz(timezone).startOf('month').format(DATE_FORMAT), moment().tz(timezone).endOf('day').format(DATE_FORMAT)],
        'Last Month': [moment().tz(timezone).subtract(1, 'months').startOf('month').format(DATE_FORMAT), moment().tz(timezone).subtract(1, 'months').endOf('month').format(DATE_FORMAT)],
        'All Time': [null, null]
      }
    },

    formatDates (fromDate, toDate) {
      // Regular expression to check if they already have time (hour)
      const hasTimeRegex = /\d{2}:\d{2}:\d{2}$/

      // If fromDate has no time, add ' 00:00:00'
      if (fromDate && !hasTimeRegex.test(fromDate)) {
        fromDate += ' 00:00:00'
      }

      // If toDate has no time, add ' 23:59:59'
      if (toDate && !hasTimeRegex.test(toDate)) {
        toDate += ' 23:59:59'
      }

      return { from_date: fromDate, to_date: toDate }
    },

    resetCommunications () {
      this.setCommunications([])
      this.setCommunicationsCount(0)
      this.paginationPage = 1
      this.setHasMoreCommunications(null)
    },

    getCommunicationType () {
      switch (this.activeChannel.value) {
        case DEFAULT_COMMUNICATIONS_CHANNEL:
        case 'my-personal-line':
          return 'all'
        case 'calls':
        case 'voicemails':
        case 'recordings':
          return 'call'
        case 'messages':
          return 'sms'
        default:
          return this.activeChannel
      }
    },

    getCommunications (filters, callback, isLoadMore = false) {
      this.setIsLoadingCommunications(true)

      if (!isLoadMore) {
        this.paginationPage = 1
        this.setCommunications([])
      } else {
        this.isLoadingMore = true
      }

      // let params = this.$jsonClone(filters)
      console.log('active channel in the mixin', this.activeChannel)
      console.log('communication type', this.getCommunicationType())
      let params = {
        from_date: '',
        to_date: '',
        page: 1,
        per_page: 25,
        order: 'desc',
        date_field: 'last_engagement_at',
        type: this.getCommunicationType(),
        direction: 'all',
        report_type: 'date_v_campaign',
        chart_period: 'day',
        answer_status: 'all',
        export_type: 'json',
        min_talk_time: 0,
        first_time_only: 0,
        untagged_only: 0,
        exclude_automated_communications: 0,
        has_untagged_call: 0,
        not_disposed: 0,
        is_blocked: 0,
        dnc_option: 1,
        has_unread: 0,
        is_new_lead: 0,
        has_scheduled_messages: 0,
        no_scheduled_messages: 0,
        enrolled_in_sequence: 0,
        not_enrolled_in_sequence: 0,
        unassigned_leads: 0,
        should_follow_the_sun: 0,
        not_contacted: 0,
        not_responded: 0,
        responded: 0,
        text_authorized: 0,
        has_appointments: 0,
        has_reminders: 0,
        contact_country: '',
        changed: true,
        states_limit: { us: [], ca: [] },
        initial_line_only: 0,
        search_text: '',
        search_fields: ['lead_number', 'contact.name'],
        has_international: 0,
        ...this.$jsonClone(filters)
      }

      let api = talk2Api.V1.reports.communications
      this.setIsInboxFiltersLoaded(true)
      this.gettingTasksList(true)
      this.communicationsListHasError = false

      // payload specific for Mentions
      if (this.$route.params.channel === 'mentions') {
        api = talk2Api.V2.mentions
        params = {
          ...params,
          direction: this.mentionType,
          page: params.page || 1,
          per_page: params.per_page || 20,
          mentioner_user_id: params.mentioner_user_id,
          mentioned_user_id: params.mentioned_user_id,
          search_fields: params.search_fields,
          search_text: params.search_text
        }
      }

      if (this.$route.params.channel !== 'mentions') {
        params = { ...params, order: this.sorting.order }
      } else {
        params = { ...params, order_by: this.sorting.order }
      }

      params.page = this.paginationPage
      params.per_page = this.perPage
      params = this.removeUnnecessaryParameters(params)

      this.source = this.cancelToken.source()

      if (this.paginationPage === 1) {
        this.getCommunicationsCount(params)
      }

      console.log('params for query', params)

      return api.get({
        params: params,
        cancelToken: this.source.token,
        headers: { 'requested-from': 'api' }
      })
        .then(response => {
          if (response) {
            // this.gettingTasksList(false)
            const data = response.data.data
            console.log('data fetched', data)
            if (isLoadMore && data.length > 0) {
              this.appendCommunications(data)
            } else {
              if (data.length > 0) {
                this.setCommunications(data)
              }
            }

            // this.nextCursor = response.data.next_cursor
            this.currentPage = response.data.current_page

            this.setHasMoreCommunications(response.data.next_page_url)
            this.isLoaded = true
            this.pagination = _.clone(response.data)
            this.pagination.rowsNumber = this.communicationsCount
            delete this.pagination.data
            this.paginationPage = this.pagination.current_page

            if (typeof callback !== 'undefined') {
              callback()
            }
          }
        })
        .catch(thrown => {
          if (window.axios.isCancel(thrown) && thrown) {
            console.log('Request canceled', thrown.message)
            return
          }

          // this.gettingTasksList(false)
          this.communicationsListHasError = true
          const channelName = this.$route.params.channel !== 'mentions'
            ? 'communications'
            : 'mentions'
          this.$generalNotification(`An exception was encountered while fetching ${channelName}.`, 'error')
        })
        .finally(() => {
          this.setIsLoadingCommunications(false)
          this.isLoadingMore = false
        })
    },

    getCommunicationsCount (params) {
      if (this.countSource) {
        this.countSource.cancel('Fetching communications count operation is canceled by the user.')
      }

      this.countSource = this.cancelToken.source()
      this.setIsLoadingCommunicationsCount(true)

      return talk2Api.V1.reports.communications.getCount({
        params: this.$jsonClone(params),
        cancelToken: this.countSource.token
      })
        .then(response => {
          this.setCommunicationsCount(response.data)
        })
        .catch(thrown => {
          console.error('Error fetching communications count:', thrown)
        })
        .finally(() => {
          this.setIsLoadingCommunicationsCount(false)
        })
    },

    removeUnnecessaryParameters (params) {
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

    getCampaignName (campaignId) {
      return this.campaigns.find(campaign => campaign.id === campaignId)?.name
    }
  },

  created () {
    this.cancelToken = window.axios.CancelToken
    this.source = this.cancelToken.source()
    this.cancelTokenPinnedViews = window.axios.CancelToken
    this.sourcePinnedViews = this.cancelTokenPinnedViews.source()
  }
}
