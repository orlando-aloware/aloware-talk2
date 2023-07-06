import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { isEmpty } from 'lodash'
import { RELATIONS as CONTACT_RELATIONS } from 'src/constants/contacts-list-relations'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import { DATE_OPERATORS } from 'src/constants/contacts-date-filter-operators'

export default {
  computed: {
    ...mapState('inbox', [
      'isFetchingContacts',
      'contactsCurrentPage',
      'liveContacts',
      'inboxShowMyContacts',
      'activeChannel',
      'pinnedViews',
      'contacts',
      'appliedFilter'
    ]),

    ...mapState('auth', ['profile']),

    nextPage () {
      return this.contactsCurrentPage + 1
    }
  },

  data () {
    const inboxRoutes = [
      'Inbox',
      'Inbox Contact Task',
      'Inbox Channel Task Status',
      'Inbox Contact Communication',
      'Inbox View'
    ]

    return {
      currentTask: ContactTaskStatus.STATUS_OPEN,
      options: [
        {
          value: ContactTaskStatus.STATUS_OPEN,
          slot: 'one'
        },
        {
          value: ContactTaskStatus.STATUS_PENDING,
          slot: 'two'
        },
        {
          value: ContactTaskStatus.STATUS_CLOSED,
          slot: 'three'
        }
      ],
      ContactTaskStatusNew: ContactTaskStatus.STATUS_NEW,
      ContactTaskStatusOpen: ContactTaskStatus.STATUS_OPEN,
      ContactTaskStatusPending: ContactTaskStatus.STATUS_PENDING,
      ContactTaskStatusClosed: ContactTaskStatus.STATUS_CLOSED,
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
      inboxRoutes: inboxRoutes,
      inboxChannelRoutes: [
        ...inboxRoutes,
        ...[
          'Inbox Channel',
          'Inbox Contact'
        ]
      ]
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

      if ([ContactTaskStatus.STATUS_OPEN, ContactTaskStatus.STATUS_PENDING].includes(this.currentTask) || loadCount) {
        // if (this.currentTask === ContactTaskStatus.STATUS_OPEN && showLoading) {
        //   this.setLoadingOpenTaskCount(true)
        // }
        //
        // if (this.currentTask === ContactTaskStatus.STATUS_PENDING && showLoading) {
        //   this.setLoadingPendingTaskCount(true)
        // }
        //
        // this.getContactsCountByTaskStatus(this.currentTask)
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

    getContactsCountByTaskStatus (taskId) {
      const params = this.getParameters(taskId, true)

      return talk2Api.V2.contacts.counts(params)
        .then(response => {
          switch (taskId) {
            case ContactTaskStatus.STATUS_OPEN:
              if (response) {
                this.setOpenTaskCount(+response.data.count)

                if (!this.activeChannel || this.activeChannel.value === 'inbox') {
                  this.setInboxOpenTaskCount(+response.data.count)
                }
              }

              this.setLoadingOpenTaskCount(false)
              break

            case ContactTaskStatus.STATUS_PENDING:
              if (response) {
                this.setPendingTaskCount(+response.data.count)

                if (!this.activeChannel || this.activeChannel.value === 'inbox') {
                  this.setInboxPendingTaskCount(+response.data.count)
                }
              }

              this.setLoadingPendingTaskCount(false)
              break
          }
        })
    },

    getParameters (taskId, count = false) {
      const query = !count ? { page: this.page, sort: this.sorting.sort, order: this.sorting.order } : {}
      let relations = []

      this.resetFilters()
      query.filter_groups = []

      if (this.searchText && this.searchText.trim() && this.searchText.length >= 3) {
        this.filters.search = [{
          value: this.searchText
        }]

        delete this.filters.contact_task_status
      } else {
        this.filters.contact_task_status[0].value = [taskId]
      }

      const filter = this.appliedFilter?.filter ?? null

      if (filter && filter?.campaigns && filter.campaigns.length) {
        this.filters = {
          ...this.filters,
          'lines': [
            { value: filter.campaigns, operator: OPERATORS.IS_ANY_OF }
          ]
        }
      }

      if (filter && filter?.ring_groups && filter.ring_groups.length) {
        this.filters = {
          ...this.filters,
          'ring_groups': [
            { value: filter.ring_groups, operator: OPERATORS.IS_ANY_OF }
          ]
        }
      }

      if (filter && filter?.contact_owner && filter.contact_owner.length && !filter.my_contact) {
        this.filters = {
          ...this.filters,
          'contact_owner': [
            { value: filter.contact_owner, operator: OPERATORS.IS_ANY_OF }
          ]
        }
      }

      if (filter && filter?.my_contact && filter.my_contact) {
        query.my_contact = filter.my_contact
      }

      if ((filter && filter?.my_contact && filter.my_contact) || this.inboxShowMyContacts) {
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

      query.filter_groups.push({ 'filters': this.filters, 'is_conjunction': true })

      if (!count) {
        relations.push('lastCommunication')
      }

      if (!isEmpty(relations)) {
        query.relations = relations.filter(relation => CONTACT_RELATIONS.includes(relation))
      }

      query.timezone = window.timezone
      query.inbox = true

      return query
    },

    resetFilters () {
      this.filters = {
        contact_task_status: [
          {
            value: [ContactTaskStatus.STATUS_OPEN],
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

      // return talk2Api.V2.contacts.inboxCounts({ cancelToken: this.sourceTasksCounts.token })
      //   .then(res => {
      //     this.setLoadingOpenTaskCount(false)
      //     this.setLoadingPendingTaskCount(false)
      //
      //     this.setTaskCount({
      //       new: res.data.new,
      //       open: res.data.open,
      //       pending: res.data.pending,
      //       closed: res.data.closed
      //     })
      //   })
    },

    getPinnedViews () {
      this.sourcePinnedViews.cancel('Loading of pinned views is canceled.')
      this.sourcePinnedViews = this.cancelTokenPinnedViews.source()

      this.$axios
        .get('/api/v2/filters/pinned', {
          cancelToken: this.sourcePinnedViews.token
        })
        .then(res => {
          this.setPinnedViews([...res.data.data])
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
    }
  },

  created () {
    this.cancelToken = window.axios.CancelToken
    this.source = this.cancelToken.source()
    this.cancelTokenPinnedViews = window.axios.CancelToken
    this.sourcePinnedViews = this.cancelTokenPinnedViews.source()
  }
}
