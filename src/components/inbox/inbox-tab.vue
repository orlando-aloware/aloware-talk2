<template>
    <div class="w-100 h-100 d-flex flex-column">
      <calls-header :openCount="taskCounts.open"
                    :pendingCount="taskCounts.pending"
                    :commCampaigns="[]"
                    :commRingGroups="[]"
                    :has-custom-left-content="true"
                    @sort="sortContactTasks">
        <template slot="customLeftContent">
          <div class="mention-filter-actions-wrapper ml-2 pr-4">
            <div class="position-absolute search-icon">
              <search-icon color="#95989E"
                           width="14"
                           height="14">
              </search-icon>
            </div>
            <line-and-ring-group-selector custom-placeholder="Filter"
                                          v-model="lineOrRingGroupFilter"
                                          :clearable="true"
                                          :hide-dropdown-icon="true"
                                          :outlined="false"
                                          :borderless="true"
                                          @change="onFilterItemSelected">
            </line-and-ring-group-selector>
          </div>
        </template>
      </calls-header>
      <div class="w-100">
        <q-btn-toggle
          class="mx-2 mt-2 mb-1 custom-toggle-button"
          no-caps
          spread
          dense
          unelevated
          toggle-color="primary active"
          color="transparent"
          text-color="primary"
          :options="options"
          v-model="currentTask"
          @click="onToggleStatus">
          <template v-slot:one>
            <div class="d-flex justify-content-center w-100 options"
                 :class="[currentTask !== ContactTaskStatusOpen ? 'text-grey-90' : 'active']">
              <span class="text-left task-status-name">
                Open
              </span>
              <div class="text-center task-count ml-1">
                  <span>
                    {{ taskCounts.open | numberPlusFormatter(99) }}
                  </span>
              </div>
            </div>
          </template>

          <template v-slot:two>
            <div class="d-flex justify-content-center w-100 options"
                 :class="[currentTask !== ContactTaskStatusPending ? 'text-grey-90' : 'active']">
              <span class="text-left task-status-name">
                Pending
              </span>
              <div class="text-center task-count ml-1">
                <span>
                  {{ taskCounts.pending | numberPlusFormatter(99) }}
                </span>
              </div>
            </div>
          </template>

          <template v-slot:three>
            <div class="w-100 options"
                 :class="[currentTask !== ContactTaskStatusClosed ? 'text-grey-90' : 'active']">
                <span class="text-center task-status-name">
                  Closed
                </span>
            </div>
          </template>
        </q-btn-toggle>
      </div>
        <div class="h-100 w-100 flex-grow-1 scroll-y task-list-scroller"
             ref="taskListScroller"
             @scroll="handleScroll">
          <inbox-task-list :contacts="contacts"
                           :loading-contacts="isFetchingContacts"
                           @onItemSelected="onItemSelected">
          </inbox-task-list>
          <div :class="[isFetchingContacts ? 'py-5' : 'py-4', 'relative']">
            <b-overlay :show="isLoadingMore || isFetchingContacts"
                       rounded="sm"
                       variant="white">
              <template #overlay>
                <div class="text-center">
                  <q-spinner-bars
                    color="primary"
                    size="2em"
                  />
                </div>
              </template>
            </b-overlay>
          </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import CallsHeader from 'components/inbox/calls/calls-header'
import { mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import InboxTaskList from 'components/inbox/inbox-tasks/list'
import Vue from 'vue'
import SearchIcon from 'components/icons/search-icon'
import LineAndRingGroupSelector from 'components/generic-selectors/line-and-ring-group-selector'
import { inboxMixin } from 'src/plugins/mixins'

let scrollTimeout
export default {
  name: 'inbox-tab',

  mixins: [inboxMixin],

  components: { LineAndRingGroupSelector, SearchIcon, InboxTaskList, CallsHeader },

  props: {
    searchText: {
      type: String,
      default: ''
    }
  },

  computed: {
    ...mapState('inbox', ['taskCounts', 'contacts', 'selectedContact', 'hasMoreContacts', 'isFetchingContacts']),
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
    return {}
  },

  methods: {
    sortContactTasks (value) {
      this.sorting.order = value ? (value === 'newest' ? 'desc' : 'asc') : 'desc'
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
        if (this.hasMoreContacts && this.isLoaded) {
          this.page = this.nextPage
          this.loadMoreContactTasks()
        }
      }, 66)
    },

    updateContacts (updatedContact) {
      let index = this.contacts.findIndex(contact => contact.id === updatedContact.id)
      if (index >= 0) {
        Vue.set(this.contacts, index, updatedContact)
        this.setContacts(this.contacts)
      }
    },
    resetList () {
      this.setContacts([])
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
      const contactId = _.get(contact, 'id', null)
      if (contactId) {
        if (this.currentTask !== contact.task_status) {
          this.currentTask = contact.task_status
        }

        this.$router.push({
          name: 'Inbox Contact Task',
          params: {
            id: contactId.toString(),
            channel: 'inbox',
            status: this.$options.filters.fixTaskStatusName(contact.task_status).toLowerCase()
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
    onFilterItemSelected (item) {
      this.resetFilters()
      this.lineOrRingGroupFilter = item
    },
    makeSelectedItemVisible () {
      let container = document.querySelector('.task-list-scroller')
      let target = document.querySelector('.contact-task-item.active')

      if (target.offsetTop > (container.offsetHeight - 100)) {
        container.scrollTop = target.offsetTop - 757
      }
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

    this.$VueEvent.listen('update_communication', communication => {
      if (!communication.contact_id) {
        return
      }

      this.setContact(communication)
    })

    this.$VueEvent.listen('contact_task_status_updated', (contact) => {
      let index = this.contacts.findIndex(item => item.id === contact.id)
      if ([ContactTaskStatus.STATUS_PENDING, ContactTaskStatus.STATUS_CLOSED].includes(contact.task_status)) {
        this.onItemSelected(this.contacts[index + 1] || this.contacts[0])
        this.loadContactTasks()
      } else {
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

    this.$VueEvent.listen('load_and_navigate_inbox_tab', (lastNavigatedIndex) => {
      this.page = this.nextPage
      this.loadMoreContactTasks().then(() => {
        let contact = this.contacts[lastNavigatedIndex + 1]
        this.setSelectedContact(contact)

        this.$router.push({
          name: 'Inbox Contact Task',
          params: { id: JSON.stringify(contact.id) }
        })

        this.makeSelectedItemVisible()
      })
    })

    this.$VueEvent.listen('navigate_task_tab', (contact) => {
      this.setSelectedContact(contact)

      this.$router.push({
        name: 'Inbox Contact Task',
        params: { id: JSON.stringify(contact.id) }
      })

      this.makeSelectedItemVisible()
    })
  },

  watch: {
    'sorting.order': function () {
      this.setContacts([])
      this.loadContactTasks()
    },
    'searchText': function () {
      this.loadContactTasks()
    },
    'lineOrRingGroupFilter': function () {
      this.loadContactTasks()
    },
    '$route.params.status': function () {
      this.setStatus()
      if (this.$route.name === 'Inbox Channel Task Status') {
        this.lineOrRingGroupFilter = null
        this.resetList()
      }
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
