import { mapActions, mapState, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { isEmpty } from 'lodash'
import { RELATIONS as CONTACT_RELATIONS } from 'src/constants/contacts-list-relations'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import { DATE_OPERATORS } from 'src/constants/contacts-date-filter-operators'
import * as Filters from 'src/constants/filters'
import * as ChannelType from 'src/constants/inbox-channels'
import * as InboxTaskStatus from 'src/constants/inbox-task-status'
import { INBOUND, OUTBOUND } from 'src/constants/communication-direction'
import { userMixin } from 'src/plugins/mixins'

export default {
  mixins: [userMixin],

  computed: {
    ...mapState('inbox', [
      'isFetchingContacts',
      'contactsCurrentPage',
      'liveContacts',
      'inboxShowMyContacts',
      'inboxShowUnreads',
      'activeChannel',
      'pinnedViews',
      'contacts',
      'appliedFilter',
      'channelClonedFilter'
    ]),

    ...mapState('auth', ['profile']),

    ...mapGetters('cache', ['isContactStatusControlEnabled']),

    nextPage () {
      return this.contactsCurrentPage + 1
    },

    statusText () {
      return this.$options.filters.fixTaskStatusName(this.currentTask).toLowerCase()
    }
  },

  data () {
    const inboxRoutes = [
      'Inbox',
      'Inbox Contact Task',
      'Inbox Channel Task Status',
      'Inbox Contact Communication'
    ]
    const inboxViewsRoutes = [
      'Inbox View',
      'Inbox View Contact Task'
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
          'Inbox Channel',
          'Inbox Contact'
        ]
      ],
      inboxViewsRoutes: inboxViewsRoutes,
      defaultFilterModel: {
        name: '',
        type: ChannelType.CHANNEL_INBOX,
        filter: Filters.EXCERPT,
        scope: 'user'
      }
    }
  },

  methods: {
    ...mapActions('inbox', [
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
      'gettingTasksList',
      'setTaskCount',
      'setPinnedViews',
      'setContacts'
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

                if (!this.activeChannel || this.activeChannel.value === 'inbox' || forInbox) {
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

                if (!this.activeChannel || this.activeChannel.value === 'inbox' || forInbox) {
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
            'contact_owner': [
              { value: filter.contact_owner, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        query.my_contact = this.inboxShowMyContacts

        if (query.my_contact) {
          this.filters = {
            ...this.filters,
            'contact_owner': [
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

      if (this.isCompanyPartOfNewInboxFilters(this.profile.company_id)) {
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
    }
  },

  created () {
    this.cancelToken = window.axios.CancelToken
    this.source = this.cancelToken.source()
    this.cancelTokenPinnedViews = window.axios.CancelToken
    this.sourcePinnedViews = this.cancelTokenPinnedViews.source()
  }
}
