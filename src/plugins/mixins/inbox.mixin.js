import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'

export default {

  computed: {
    ...mapState('inbox', ['isFetchingContacts', 'contactsCurrentPage']),
    ...mapState('auth', ['profile']),
    nextPage () {
      return this.contactsCurrentPage + 1
    }
  },

  data () {
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
        // contact_task_status: {
        //   value: [ContactTaskStatus.STATUS_OPEN],
        //   operator: 1
        // },

        search: {
        }
      },
      sorting: {
        sort: 'last_engagement_at',
        order: 'desc'
      },
      isLoadingMore: false,
      isLoaded: false,
      page: 1,
      perPage: 20,
      lineOrRingGroupFilter: null,
      lineOrRingGroupFilteredId: null,
      contacts: [],
      cancelController: null

    }
  },

  methods: {
    ...mapActions('inbox', [
      'setContact',
      'setLiveContacts',
      'setSelectedContact',
      'setHasMoreContacts',
      'gettingContactsList',
      'setContactsCurrentPage',
      'setOpenTaskCount',
      'setPendingTaskCount',
      'setLoadingOpenTaskCount',
      'setLoadingPendingTaskCount'
    ]),
    getNoneLiveCallContactTasks (contacts) {
      return contacts.filter(contact => (contact.last_communication &&
        ![ CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW ].includes(contact.last_communication.current_status2)) || !contact.last_communication)
    },
    getLiveCallContactTasks (contacts) {
      return contacts.filter(contact => contact.last_communication &&
        [ CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW ].includes(contact.last_communication.current_status2))
    },
    loadContactTasks (loadCount = true) {
      this.gettingContactsList(true)
      // always reset page when fresh loading contacts
      this.page = 1
      this.setContacts([])
      if ([ContactTaskStatus.STATUS_OPEN, ContactTaskStatus.STATUS_PENDING].includes(this.currentTask) && loadCount) {
        if (this.currentTask === ContactTaskStatus.STATUS_OPEN) {
          this.setLoadingOpenTaskCount(true)
        }

        if (this.currentTask === ContactTaskStatus.STATUS_PENDING) {
          this.setLoadingPendingTaskCount(true)
        }
        this.getContactsCountByTaskStatus(this.currentTask)
      }
      return this.getContactsByTaskStatus(this.currentTask).then(response => {
        if (response) {
          this.setContacts(this.getNoneLiveCallContactTasks(response.data.data))
          this.gettingContactsList(false)
          this.setContactsCurrentPage(response.data.current_page)
          this.setHasMoreContacts(response.data.next_page_url)
          this.isLoadingMore = false
          this.isLoaded = true
        }
      })
    },
    loadMoreContactTasks () {
      this.isLoaded = false
      this.isLoadingMore = true
      return this.getContactsByTaskStatus(this.currentTask).then(response => {
        this.setContacts([...this.contacts, ...this.getNoneLiveCallContactTasks(response.data.data)])

        this.setContactsCurrentPage(response.data.current_page)
        this.setHasMoreContacts(response.data.next_page_url)
        this.isLoadingMore = false
        this.isLoaded = true
      })
    },
    getContactsByTaskStatus (taskId) {
      this.cancelController.abort()
      this.cancelController = new AbortController()
      return talk2Api.V2.contacts.list(this.getParameters(taskId), this.cancelController.signal)
    },
    getContactsCountByTaskStatus (taskId) {
      return talk2Api.V2.contacts.counts(this.getParameters(taskId, true)).then(response => {
        if (response) {
          if (taskId === ContactTaskStatus.STATUS_OPEN) {
            this.setOpenTaskCount(response.data.count)
            this.setLoadingOpenTaskCount(false)
          }

          if (taskId === ContactTaskStatus.STATUS_PENDING) {
            this.setPendingTaskCount(response.data.count)
            this.setLoadingPendingTaskCount(false)
          }
        } else {
          if (taskId === ContactTaskStatus.STATUS_OPEN) {
            this.setLoadingOpenTaskCount(false)
          }

          if (taskId === ContactTaskStatus.STATUS_PENDING) {
            this.setLoadingPendingTaskCount(false)
          }
        }
      })
    },
    getParameters (taskId, count = false) {
      const query = !count ? { page: this.page, sort: this.sorting.sort, order: this.sorting.order } : {}

      this.resetFilters()
      query.filter_groups = []

      if (this.searchText && this.searchText.trim()) {
        this.filters.search.value = this.searchText
        delete this.filters.contact_task_status
      } else {
        this.filters.contact_task_status.value = [taskId]
      }

      if (this.filter && this.filter.campaigns.length) {
        this.filters = { ...this.filters, 'lines': { value: this.filter.campaigns, operator: 1 } }
      }

      if (this.filter && this.filter.ring_groups.length) {
        this.filters = { ...this.filters, 'ring_groups': { value: this.filter.ring_groups, operator: 1 } }
      }

      if (this.filter && this.filter.contact_owner.length && !this.filter.my_contact) {
        this.filters = { ...this.filters, 'contact_owner': { value: this.filter.contact_owner, operator: 1 } }
      }

      if (this.filter && this.filter.my_contact) {
        query.my_contact = this.filter.my_contact
        this.filters = { ...this.filters, 'contact_owner': { value: [this.profile.id], operator: 1 } }
      }

      if (this.filter && this.filter.from_date && this.filter.to_date) {
        this.filters = { ...this.filters, 'last_engagement_at': { value: [this.filter.from_date, this.filter.to_date], operator: 5 } }
      }

      query.filter_groups.push({ 'filters': this.filters, 'is_conjunction': true })

      if (!count) {
        query.relations = ['lastCommunication']
      }

      return query
    },
    resetFilters () {
      this.filters = {
        contact_task_status: {
          value: [ContactTaskStatus.STATUS_OPEN],
          operator: 1
        },
        search: {
        }
      }
    },
    setContacts (contacts) {
      this.contacts = contacts
    }
  },

  created () {
    this.cancelController = new AbortController()
  }
}
