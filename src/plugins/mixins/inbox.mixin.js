import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import * as ContactTaskStatus from 'src/constants/contact-task-status'

export default {

  computed: {
    ...mapState('inbox', ['isFetchingContacts', 'contactsCurrentPage']),
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
      lineOrRingGroupFilteredId: null
    }
  },

  methods: {
    ...mapActions('inbox', ['setContact', 'setContacts', 'setSelectedContact', 'setHasMoreContacts', 'gettingContactsList', 'setContactsCurrentPage']),
    loadContactTasks () {
      this.gettingContactsList(true)
      // always reset page when fresh loading contacts
      this.page = 1
      return this.getContactsByTaskStatus(this.currentTask).then(response => {
        this.setContacts(response.data.data)
        this.gettingContactsList(false)
        this.setContactsCurrentPage(response.data.current_page)
        this.setHasMoreContacts(response.data.next_page_url)
        this.isLoadingMore = false
        this.isLoaded = true
      })
    },
    loadMoreContactTasks () {
      this.isLoaded = false
      this.isLoadingMore = true
      return this.getContactsByTaskStatus(this.currentTask).then(response => {
        this.setContacts([...this.contacts, ...response.data.data])

        this.setContactsCurrentPage(response.data.current_page)
        this.setHasMoreContacts(response.data.next_page_url)
        this.isLoadingMore = false
        this.isLoaded = true
      })
    },
    getContactsByTaskStatus () {
      return talk2Api.V2.contacts.list(this.getParameters())
    },
    getParameters () {
      const query = { page: this.page, sort: this.sorting.sort, order: this.sorting.order }

      this.resetFilters()
      if (this.searchText && this.searchText.trim()) {
        this.filters.search.value = this.searchText
        delete this.filters.contact_task_status
      } else {
        this.filters.contact_task_status.value = [this.currentTask]
      }

      if (this.filter.campaigns.length) {
        this.filters = { ...this.filters, 'lines': { value: this.filter.campaigns, operator: 1 } }
      }

      if (this.filter.ring_groups.length) {
        this.filters = { ...this.filters, 'ring_groups': { value: this.filter.ring_groups, operator: 1 } }
      }

      if (this.filter.contact_owner.length) {
        this.filters = { ...this.filters, 'contact_owner': { value: this.filter.contact_owner, operator: 1 } }
      }

      if (this.filter.my_contact) {
        query.my_contact = this.filter.my_contact
      }

      if (this.filter.from_date && this.filter.to_date) {
        this.filters = { ...this.filters, 'last_engagement_at': { value: [this.filter.from_date, this.filter.to_date], operator: 5 } }
      }

      query.filters = this.filters
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
    }
  }
}
