<template>
    <b-overlay :show="isFetchingContacts"
               class="h-100 w-100"
               rounded="sm"
               variant="white">
      <div class="w-100 h-100 d-flex flex-column">
        <calls-header :openCount="taskCounts.open"
                      :pendingCount="taskCounts.pending"
                      :commCampaigns="[]"
                      :commRingGroups="[]"
                      @sort="sortContactTasks">
        </calls-header>
        <div class="w-100">
          <q-btn-toggle
            class="current-tasks border mx-2 mt-2 mb-1"
            no-caps
            dense
            spread
            unelevated
            toggle-color="grey-9"
            color="white"
            text-color="primary"
            :options="options"
            v-model="currentTask"
            @click="onToggleStatus">
            <template v-slot:one>
              <div class="d-flex flex-row justify-content-between align-items-center w-100 px-1 options"
                   :class="[currentTask !== ContactTaskStatusOpen ? 'text-grey-20' : 'active']">
                  <span class="text-left">
                    Open
                  </span>
                <span class="text-right">
                    {{ taskCounts.open | numberPlusFormatter(99) }}
                  </span>
              </div>
            </template>

            <template v-slot:two>
              <div class="d-flex flex-row justify-content-between align-items-center w-100 px-1 options"
                   :class="[currentTask !== ContactTaskStatusPending ? 'text-grey-20' : 'active']">
                  <span class="text-left">
                    Pending
                  </span>
                <span class="text-right">
                    {{ taskCounts.pending | numberPlusFormatter(99) }}
                  </span>
              </div>
            </template>

            <template v-slot:three>
              <div class="d-flex flex-row justify-content-between align-items-center w-100 px-1 options"
                   :class="[currentTask !== ContactTaskStatusClosed ? 'text-grey-20' : 'active']">
                  <span class="text-left">
                    Closed
                  </span>
                <span class="text-right">
                    &nbsp;
                  </span>
              </div>
            </template>
          </q-btn-toggle>
        </div>
        <div class="h-100 w-100 flex-grow-1 scroll-y"
             ref="taskListScroller"
             @scroll="handleScroll">
          <inbox-task-list :contacts="contacts"
                           :loading-contacts="isFetchingContacts"
                           @onItemSelected="onItemSelected">
          </inbox-task-list>
        </div>
      </div>
      <template #overlay>
        <div class="text-center">
          <q-spinner-bars
            color="primary"
            size="2em"
          />
        </div>
      </template>
    </b-overlay>

</template>

<script>
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import CallsHeader from 'components/inbox/calls/calls-header'
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import InboxTaskList from 'components/inbox/inbox-tasks/list'
import Vue from 'vue'

let scrollTimeout
export default {
  name: 'inbox-tab',

  components: { InboxTaskList, CallsHeader },

  props: {
    searchText: {
      type: String,
      default: ''
    }
  },

  computed: {
    ...mapState('inbox', ['taskCounts', 'contacts', 'selectedContact']),
    nextPage () {
      return this.currentPage + 1
    },
    statusText () {
      switch (this.currentTask) {
        case ContactTaskStatus.STATUS_PENDING:
          return 'pending'
        case ContactTaskStatus.STATUS_CLOSED:
          return 'closed'
        case ContactTaskStatus.STATUS_OPEN:
        default:
          return 'open'
      }
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
        contact_task_status: {
          value: [ContactTaskStatus.STATUS_OPEN],
          operator: 1
        },
        search: {
        }
      },
      sorting: {
        sort: 'last_engagement_at',
        order: 'desc'
      },
      isFetchingContacts: false,
      hasMore: false,
      isLoadingMore: false,
      isLoaded: false,
      currentPage: 0,
      page: 1,
      perPage: 20
    }
  },

  methods: {
    ...mapActions('inbox', ['setContacts', 'setSelectedContact']),
    loadContactTasks () {
      this.isFetchingContacts = true
      return this.getContactsByTaskStatus(this.currentTask).then(response => {
        this.setContacts(response.data.data)
        this.isFetchingContacts = false
        this.currentPage = response.data.current_page
        this.hasMore = response.data.next_page_url
        this.isLoadingMore = false
        this.isLoaded = true
      })
    },
    loadMoreContactTasks () {
      this.isFetchingContacts = true
      this.isLoaded = false
      this.getContactsByTaskStatus(this.currentTask).then(response => {
        this.setContacts([...this.contacts, ...response.data.data])
        this.isFetchingContacts = false

        this.currentPage = response.data.current_page
        this.hasMore = response.data.next_page_url
        this.isLoadingMore = false
        this.isLoaded = true
      })
    },
    getContactsByTaskStatus () {
      return talk2Api.V2.contacts.list(this.getParameters())
    },
    sortContactTasks (value) {
      this.sorting.order = value ? (value === 'newest' ? 'desc' : 'asc') : 'desc'
    },
    getParameters () {
      const query = { page: this.page, sort: this.sorting.sort, order: this.sorting.order }

      this.resetFilters()
      if (this.searchText && this.searchText.trim()) {
        this.filters.search.value = this.searchText
      }

      this.filters.contact_task_status.value = [this.currentTask]
      query.filters = this.filters
      return query
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
        if (this.hasMore && this.isLoaded) {
          this.page = this.nextPage
          this.loadMoreContactTasks()
        }
      }, 66)
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
    updateContacts (updatedContact) {
      let index = this.contacts.findIndex(contact => contact.id === updatedContact.id)
      if (index >= 0) {
        Vue.set(this.contacts, index, updatedContact)
        this.setContacts(this.contacts)
      }
    },
    resetList () {
      this.page = 1
      this.isLoaded = false
      this.loadContactTasks()
      if (!this.$route.params.id) {
        this.setSelectedContact({})
      }
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
        default:
          this.currentTask = ContactTaskStatus.STATUS_OPEN
      }
    },
    onToggleStatus () {
      this.$nextTick(() => {
        this.$refs.taskListScroller.scrollTop = 0
      })

      this.$router.push({
        name: 'Inbox Channel Task Status',
        params: {
          channel: 'inbox',
          status: this.statusText
        }
      }).catch(err => {
        console.log(err)
      })
    },
    onItemSelected (contact) {
      this.setSelectedContact(contact)
      if (this.currentTask !== contact.task_status) {
        this.currentTask = contact.task_status
      }
      this.$router.push({
        name: 'Inbox Contact Task',
        params: {
          id: contact.id.toString(),
          channel: 'inbox',
          status: this.$options.filters.fixTaskStatusName(contact.task_status).toLowerCase()
        }
      }).catch(err => {
        console.log(err)
      })
    }
  },

  created () {
    this.setContacts([])
    this.setStatus()

    this.loadContactTasks()

    this.$VueEvent.listen('contact_updated', (data) => {
      talk2Api.V2.contacts.get(data.id).then(response => {
        let contact = response.data
        // check data loaded
        if (this.selectedContact && parseInt(this.selectedContact.id) === parseInt(contact.id)) {
          this.setSelectedContact(contact)
          this.updateContacts(contact)
        }
      })
    })

    this.$VueEvent.listen('new_communication', communication => {
      talk2Api.V2.contacts.get(communication.contact_id).then(response => {
        let contact = response.data
        // only modify order if new contact task === current task
        if (this.currentTask === contact.task_status) {
          let foundContact = this.contacts.find(item => item.id === contact.id)
          // if contact is not in the list, then automatically add it to the top

          let contacts = [...this.contacts]
          if (!foundContact) {
            if (this.contacts.length > this.perPage) {
              contacts.pop()
            }
          } else {
            // get all contacts except the current one
            contacts = [...this.contacts.filter(item => item.id !== contact.id)]
          }

          if (this.sorting.order === 'asc') {
            contacts.push(contact)
          } else {
            contacts.unshift(contact)
          }
          this.setContacts(contacts)
        }
      })
    })

    this.$VueEvent.listen('contact_task_status_updated', (contact) => {
      if ([ContactTaskStatus.STATUS_PENDING, ContactTaskStatus.STATUS_CLOSED].includes(contact.task_status)) {
        this.loadContactTasks().then(() => {
          this.onItemSelected(this.contacts[0])
        })
      } else {
        let index = this.contacts.findIndex(item => item.id === contact.id)
        let contacts = [...this.contacts]
        contacts[index] = contact
        this.setContacts(contacts)
      }
    })
  },

  mounted () {
    if (['Inbox Channel', 'Inbox'].includes(this.$route.name)) {
      this.setSelectedContact({})
    }

    if (['Inbox Contact Task'].includes(this.$route.name) && this.selectedContact.task_status !== this.currentTask) {
      this.onItemSelected(this.selectedContact)
    }
  },

  watch: {
    'sorting.order': function () {
      this.loadContactTasks()
    },
    'searchText': function () {
      this.loadContactTasks()
    },
    '$route.params.status': function () {
      this.resetList()
    },
    '$route.name': function (value) {
      if (['Inbox'].includes(value)) {
        this.currentTask = ContactTaskStatus.STATUS_OPEN
        this.resetList()
      }
    },
    '$route.params.id': function (value) {
      if (!value) {
        this.setSelectedContact({})
      }
    }
  }
}
</script>
