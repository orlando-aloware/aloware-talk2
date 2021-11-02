<template>
    <div class="w-100 h-100 d-flex flex-column">
      <calls-header :openCount="taskCounts.open"
                    :pendingCount="taskCounts.pending"
                    :commCampaigns="[]"
                    :commRingGroups="[]"
                    :has-custom-left-content="true"
                    @sort="sortContactTasks">
        <template slot="customLeftContent">
          <div class="inbox-filter-actions-wrapper inbox-tab--filter ml-2 pr-1">
            <inbox-searcher :is-loading="isLoadingMore || isFetchingContacts"
                            :search-icon-color="isSearch ? '#256EFF' : '#62666E'"
                            @search="onSearch"
                            @closed="onSearchClosed"
                            @opened="onSearchOpened">
            </inbox-searcher>
            <div class="filter-wrapper">
              <div class="position-absolute filter-icon">
                <filter-icon>
                </filter-icon>
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
          </div>
        </template>
      </calls-header>
      <div class="w-100"
           v-if="!isSearch">
        <q-btn-toggle
          v-model="currentTask"
          @click="onToggleStatus"
          :options="options"
          class="mx-2 mt-2 mb-1 custom-toggle-button"
          no-caps
          spread
          dense
          unelevated
          :toggle-color="statusToggleColor"
          color="transparent"
          text-color="primary">
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
      <search-toggle ref="searchToggle"
                     v-if="isSearch"
                     @searching="searching"
                     @closed="onSearchClosed">
      </search-toggle>
      <div class="h-100 w-100 flex-grow-1 scroll-y task-list-scroller"
           ref="taskListScroller"
           @scroll="handleScroll">
        <inbox-task-list :contacts="contacts"
                         :loading-contacts="isFetchingContacts"
                         :search-text="searchText"
                         :is-search="isSearch"
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
import LineAndRingGroupSelector from 'components/generic-selectors/line-and-ring-group-selector'
import { inboxMixin } from 'src/plugins/mixins'
import FilterIcon from 'components/icons/filter-icon'
import InboxSearcher from 'components/inbox/inbox-searcher'
import SearchToggle from 'components/search-toggle'

let scrollTimeout
export default {
  name: 'inbox-tab',

  mixins: [inboxMixin],

  components: { SearchToggle, InboxSearcher, FilterIcon, LineAndRingGroupSelector, InboxTaskList, CallsHeader },

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
    },
    statusToggleColor () {
      return (this.$route.params.id && this.$route.params.status !== this.statusText ? 'bg-grey-80' : 'primary') + ' active'
    }
  },

  data () {
    return {
      searchText: '',
      isSearch: false
    }
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
          break
        default:
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
      console.log('contact :> ---> ', contact)
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
    },
    onSearch (value) {
      this.searchText = value
    },
    onSearchOpened () {
      this.setHasMoreContacts(null)
      this.setContacts([])
      this.isSearch = true
      this.$nextTick(function () {
        this.$refs.searchToggle.inputFocus()
      }.bind(this))
    },
    onSearchClosed () {
      this.searchText = ''
      this.setContacts([])
      this.isSearch = false

      if (this.$route.params.status === this.statusText || this.$route.name === 'Inbox') {
        this.loadContactTasks()
      }
    },

    searching (value) {
      if ((value && value.length >= 3) || value === '') {
        if (value === '') {
          this.setContacts([])
        } else {
          this.searchText = value
          this.loadContactTasks()
        }
      }
    }
  },

  mounted () {
    this.setContacts([])
    this.setStatus()

    if (['Inbox', 'Inbox Channel Task Status', 'Inbox Contact Task'].includes(this.$route.name)) {
      if (!_.isEmpty(this.$route.params) && this.$route.params.status !== this.statusText) {
        // do other possible actions
      } else {
        this.loadContactTasks()
      }
    }

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

  watch: {
    'sorting.order': function () {
      this.setContacts([])
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
    },
    '$route.params.channel': function () {
      if (this.$route.name === 'Inbox Channel') {
        this.isSearch = false
      }
    }
  }
}
</script>
