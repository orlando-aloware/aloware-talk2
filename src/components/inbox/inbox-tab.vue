<template>
    <div class="w-100 h-100 d-flex flex-column">
      <calls-header :openCount="taskCounts.open"
                    :pendingCount="taskCounts.pending"
                    :commCampaigns="[]"
                    :commRingGroups="[]"
                    :has-custom-left-content="true"
                    :is-search="isSearch"
                    @sort="sortContactTasks">
        <template slot="customLeftContent">
          <div class="channel-filter-actions-wrapper inbox-tab--filter ml-2 pr-1 d-inline-flex">
            <inbox-searcher :is-loading="isLoadingMore || isFetchingContacts"
                            :search-icon-color="isSearch ? '#256EFF' : '#62666E'"
                            @search="onSearch"
                            @closed="onSearchClosed"
                            @opened="onSearchOpened">
            </inbox-searcher>
            <hr role="separator" aria-orientation="vertical" class="q-separator height-24 margin-auto q-separator q-separator--vertical">
            <div class="filter-wrapper"
                 :class="[hasChannelFilterChanges || selectedFilter ? '--highlighted' : '']">
              <compact-btn v-if="hasChannelFilterChanges"
                           borderless
                           customClass="pr-2 pl-0 fs-14 _500 position-relative primary not-focusable"
                           :variant="filterButtonVariant"
                           @clicked="onResetFilter">
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
                <filter-icon v-if="!selectedFilter && channelChangedFilterFields.length < 1"
                             color="#62666E"
                             class="filter-icon">
                </filter-icon> {{ !selectedFilter ? '' : selectedFilter.name }}
                {{ !selectedFilter && channelChangedFilterFields.length ? 'Filters' : '' }}
              </compact-btn>
              <b-badge v-if="hasChannelFilterChanges"
                       class="ml-1 fs-12"
                       variant="primary"
                       v-b-modal:inbox-channel-filter-modal>
                {{ channelChangedFilterFields.length }}
              </b-badge>
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
                <b-badge v-if="hasIncomingLiveCall"
                         variant="danger"
                         class="live-call-badge d-flex justify-center align-items-center position-absolute"
                         pill></b-badge>
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
      <div class="w-100 flex-grow-1" v-if="liveCalls.length > 0">
        <inbox-task-list :contacts="liveCalls"
                         :loading-contacts="isFetchingContacts"
                         :search-text="searchText"
                         :is-search="isSearch"
                         @onItemSelected="onItemSelected">
        </inbox-task-list>
      </div>
      <div class="h-100 w-100 flex-grow-1 scroll-y task-list-scroller"
           ref="taskListScroller"
           @scroll="handleScroll">
        <inbox-task-list :contacts="contactTasks"
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
      <filter-dialog v-model="filter"
                     :default-filter-model="defaultFilterModel"
                     @createNewFilter="onCreateNewFilter"
                     @applyFilter="onApplyFilter"
                     @onResetFilter="onResetFilter">
      </filter-dialog>
      <create-filter-dialog :filter-model="newFilterModel">
      </create-filter-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
import * as Filters from 'src/constants/filters'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import CallsHeader from 'components/inbox/calls/calls-header'
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import InboxTaskList from 'components/inbox/inbox-tasks/list'
import Vue from 'vue'
import { inboxMixin } from 'src/plugins/mixins'
import FilterIcon from 'components/icons/filter-icon'
import InboxSearcher from 'components/inbox/inbox-searcher'
import SearchToggle from 'components/search-toggle'
import CompactBtn from 'components/compact-btn'
import FilterDialog from 'components/inbox/inbox-filters/filter-dialog'
import CreateFilterDialog from 'components/inbox/inbox-filters/create-filter-dialog'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDirections from 'src/constants/communication-direction'

export default {
  name: 'inbox-tab',

  mixins: [inboxMixin],

  components: { CreateFilterDialog, FilterDialog, CompactBtn, SearchToggle, InboxSearcher, FilterIcon, InboxTaskList, CallsHeader },

  computed: {
    ...mapState(['dialer']),
    ...mapState('inbox',
      [
        'taskCounts',
        'liveContacts',
        'selectedContact',
        'hasMoreContacts',
        'isFetchingContacts',
        'channelChangedFilterFields',
        'selectedFilter'
      ]
    ),
    ...mapState('contacts', ['contact']),
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
    },
    hasChannelFilterChanges () {
      return this.channelChangedFilterFields.length > 0
    },
    filterButtonVariant () {
      return 'outlined-light'
    },
    contactTasks () {
      return [...this.incomingCalls, ...this.contacts]
    },
    hasLiveCall () {
      return this.dialer.call &&
        this.dialer.call.state === 'open'
    },
    hasIncomingLiveCall () {
      const i = this.liveContacts.findIndex(item => [CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW].includes(item.last_communication.current_status2))
      return i >= 0
    },
    incomingCalls () {
      return this.liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW].includes(item.last_communication.current_status2))
    },
    liveCalls () {
      return [
        // parked calls
        ...this.liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW].includes(item.last_communication.current_status2)),
        // connected calls
        ...this.liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(item.last_communication.current_status2))
      ]
    }
  },

  data () {
    return {
      searchText: '',
      isSearch: false,
      previousRoute: null,
      newFilterModel: {
        name: '',
        type: 5,
        filter: [],
        scope: 'user'
      },
      defaultFilterModel: {
        name: '',
        type: 5,
        filter: {
          campaigns: Filters.DEFAULT_STATE.filter.campaigns,
          ring_groups: Filters.DEFAULT_STATE.filter.ring_groups,
          from_date: Filters.DEFAULT_STATE.filter.from_date,
          to_date: Filters.DEFAULT_STATE.filter.to_date,
          contact_owner: Filters.DEFAULT_STATE.filter.contact_owner,
          my_contact: Filters.DEFAULT_STATE.filter.my_contact
        },
        scope: 'user'
      },
      filter: {
        campaigns: Filters.DEFAULT_STATE.filter.campaigns,
        ring_groups: Filters.DEFAULT_STATE.filter.ring_groups,
        from_date: Filters.DEFAULT_STATE.filter.from_date,
        to_date: Filters.DEFAULT_STATE.filter.to_date,
        contact_owner: Filters.DEFAULT_STATE.filter.contact_owner,
        my_contact: Filters.DEFAULT_STATE.filter.my_contact
      },
      scrollTimeout: null,
      CommunicationCurrentStatus
    }
  },

  methods: {
    ...mapActions('inbox', ['toggleFilterDialog', 'resetChannelChangedFilterFields', 'toggleFilterModelForm', 'setChannelClonedFilter']),
    sortContactTasks (value) {
      this.sorting.order = value ? (value === 'newest' ? 'desc' : 'asc') : 'desc'
    },
    handleScroll (el) {
      if ((el.target.offsetHeight + el.target.scrollTop) >= (el.target.scrollHeight - 70) && el.target.scrollTop > 0) {
        this.onTaskListBottomScroll()
      }
    },
    onTaskListBottomScroll () {
      clearTimeout(this.scrollTimeout)
      // Set a timeout to run after scrolling ends
      this.scrollTimeout = setTimeout(() => {
        // Run the callback
        if (this.hasMoreContacts && this.isLoaded) {
          this.page = this.nextPage
          this.loadMoreContactTasks()
        }
      }, 66)
    },
    updateContacts (updatedContact) {
      const index = this.contacts.findIndex(contact => contact.id === updatedContact.id)
      if (index >= 0) {
        Vue.set(this.contacts, index, updatedContact)
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
    getStatusName (taskStatusId) {
      switch (taskStatusId) {
        case ContactTaskStatus.STATUS_PENDING:
          return 'Pending'
        case ContactTaskStatus.STATUS_CLOSED:
          return 'Closed'
        case ContactTaskStatus.STATUS_NEW:
          return 'New'
        case ContactTaskStatus.STATUS_OPEN:
        default:
          return 'Open'
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

        this.$emit('itemSelected', {
          name: 'Inbox Contact Task',
          params: {
            id: contactId.toString(),
            channel: 'inbox',
            status: contact.task_status ? this.$options.filters.fixTaskStatusName(contact.task_status).toLowerCase() : 'all'
          }
        })
      }
    },
    onFilterItemSelected (item) {
      this.resetFilters()
      this.lineOrRingGroupFilter = item
    },
    makeSelectedItemVisible () {
      const container = document.querySelector('.task-list-scroller')
      const target = document.querySelector('.contact-task-item.active')

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
    },
    resetFilter () {
      this.filter = { ...this.defaultFilterModel.filter }
      this.setChannelClonedFilter(this.filter)
      this.resetChannelChangedFilterFields()
    },
    onResetFilter () {
      this.resetFilter()
      this.loadContactTasks()
    },
    onApplyFilter (filter) {
      this.filter = filter
      this.loadContactTasks()
    },
    onCreateNewFilter (filter) {
      this.newFilterModel = { ...this.newFilterModel, filter: filter, type: this.defaultFilterModel.type }
      this.toggleFilterModelForm(true)
    },
    updateContact (contact) {
      if (_.isEmpty(this.contact)) {
        return
      }

      if (_.isEmpty(contact)) {
        return
      }

      const currentContact = JSON.parse(JSON.stringify(this.contact))
      const key = { data: null }
      for (key.data in contact) {
        if (key.data === 'communications_and_audits') {
          continue
        }

        if (typeof currentContact[key.data] !== 'undefined') {
          currentContact[key.data] = contact[key.data]
        }
      }

      if (currentContact.id === this.contact.id) {
        this.setContact(currentContact)
      }
    },
    onRouteChange () {
      this.setStatus()
      if (['Inbox Contact Task', 'Inbox Channel Task Status'].includes(this.$route.name)) {
        if (this.$options.filters.fixTaskStatusName(this.currentTask).toLowerCase() !== this.$route.params.status) {
          this.currentTask = this.$options.filters.getTaskStatusIdByName(this.$route.params.status)
        }

        this.lineOrRingGroupFilter = null
        // prevent reset of filters if coming from the root
        if (!this.$route.params.id) {
          this.resetList()
        } else {
          if (!this.isSearch && this.previousRoute.name !== 'Inbox') {
            this.loadContactTasks()
          }
        }
      }
    },
    onRouteNameChange () {
      console.log(this.$route.name)
      this.currentTask = ContactTaskStatus.STATUS_OPEN
      this.resetList()
    }
  },

  created () {
    this.resetFilter()
    this.toggleFilterDialog(false)
  },

  mounted () {
    const _this = this
    this.setLiveContacts([])
    this.setContacts([])
    this.setStatus()

    if (['Inbox', 'Inbox Channel Task Status', 'Inbox Contact Task', 'Inbox Contact Communication'].includes(this.$route.name)) {
      if (!_.isEmpty(this.$route.params) && this.$route.params.status !== this.statusText) {
        // do other possible actions
      } else {
        this.loadContactTasks().finally(function () {
          if (_this.$route.params.id) {
            const id = _this.$route.params.id
            const contact = _this.contactTasks.find(item => item.id.toString() === id)
            if (contact) {
              _this.setSelectedContact(contact)
            }
          }
        })
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
        const contact = this.contacts[lastNavigatedIndex + 1]
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
      // only fetch the latest contact data when updated contact is also the selected contact
      // this is to avoid swarm of api request when numbers of contacts get updated
      if (this.selectedContact && parseInt(this.selectedContact.id) === parseInt(data.id)) {
        talk2Api.V2.contacts.get(data.id).then(response => {
          const contact = response.data
          // check data loaded
          this.setSelectedContact(contact)
          // this.setContact(contact)
          this.updateContacts(contact)
        })
      }
    })

    this.$VueEvent.listen('new_communication', communication => {
      // Do not alter live contacts if it's in active mode
      const isActiveInLiveContactsIndex = this.liveContacts.findIndex(item => item.id === communication.contact_id &&
        [
          CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW
        ].includes(item.last_communication.current_status2))

      if (isActiveInLiveContactsIndex >= 0) {
        return
      }

      // TODO issue is selected contact is overridden by contact from new comms
      setTimeout(() => {
        talk2Api.V2.contacts.get(communication.contact_id).then(response => {
          const contact = response.data
          const contacts = { data: _.cloneDeep(this.contacts) }
          const isInLiveContacts = this.liveContacts.find(item => item.id === contact.id)
          const isInContacts = this.contacts.find(item => item.id === contact.id)
          this.updateContact(contact)

          // check if communication is a live call
          if (communication.type === CommunicationTypes.CALL && communication.direction === CommunicationDirections.INBOUND &&
            [ CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW ].includes(communication.current_status2)) {
            const liveContacts = _.cloneDeep(this.liveContacts)

            if (!isInLiveContacts) {
              liveContacts.push(contact)
            }

            if (isInContacts) {
              const index = contacts.data.findIndex(item => item.id === contact.id)
              contacts.data.splice(index, 1)
              this.setContacts(contacts.data)
            }

            this.setLiveContacts(
              [
                // connected calls
                ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(item.last_communication.current_status2)),
                // parked calls
                ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW].includes(item.last_communication.current_status2)),
                // incoming calls
                ...liveContacts.filter(item => [
                  CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW
                ].includes(item.last_communication.current_status2))
              ]
            )
          } else {
            // only modify order if new contact task === current task
            if (this.currentTask === contact.task_status) {
              if (!isInLiveContacts) {
                // if contact is not in the list, then automatically add it to the top
                if (!isInContacts) {
                  if (this.contacts.length > this.perPage) {
                    contacts.data.pop()
                  }
                } else {
                  // get all contacts except the current one
                  contacts.data = _.clone(contacts.data.filter(item => item.id !== contact.id))
                }

                if (this.sorting.order === 'asc') {
                  contacts.data.push(contact)
                } else {
                  contacts.data.unshift(contact)
                }
                this.setContacts(contacts.data)
              }
            }
          }
        })
      }, 1000)
    })

    this.$VueEvent.listen('update_communication', communication => {
      if (!communication.contact_id) {
        return
      }

      // if communication is in live contacts
      const index = this.liveContacts.findIndex(item => item.id === communication.contact_id)
      if (index >= 0) {
        const liveContacts = _.cloneDeep(this.liveContacts)
        liveContacts[index].last_communication = communication
        // if type is call and completed/voicemail then remove from live calls
        if (communication.direction === CommunicationDirections.INBOUND &&
          communication.type === CommunicationTypes.CALL &&
          [CommunicationCurrentStatus.CURRENT_STATUS_VOICEMAIL_NEW, CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW].includes(communication.current_status2)) {
          const contactTaskToRemove = liveContacts[index]
          liveContacts.splice(index, 1)

          // we then add to contact tasks
          const contacts = _.cloneDeep(this.contacts)
          if (this.sorting.order === 'asc') {
            contacts.push(contactTaskToRemove)
          } else {
            contacts.unshift(contactTaskToRemove)
          }
          this.setContacts(contacts)
        }
        this.setLiveContacts(
          [
            // connected calls
            ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(item.last_communication.current_status2)),
            // parked calls
            ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW].includes(item.last_communication.current_status2)),
            // incoming calls
            ...liveContacts.filter(item => [
              CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW
            ].includes(item.last_communication.current_status2))
          ]
        )
      }

      const contactIndex = this.contacts.findIndex(item => item.id === communication.contact_id)
      if (contactIndex >= 0) {
        const contacts = _.cloneDeep(this.contacts)
        contacts[contactIndex].last_communication = communication
        this.setContacts(contacts)
        if (contacts[contactIndex].id === this.contact.id) {
          this.setContact(contacts[contactIndex])
        }
      }
    })

    this.$VueEvent.listen('contact_task_status_updated', (contact) => {
      if (this.$route.name !== 'Inbox Contact Task' || this.isSearch) {
        return
      }

      const index = this.contacts.findIndex(item => item.id === contact.id)
      switch (true) {
        // reload if on closed tab and the contact status is set to pending
        // reload if on pending tab and the contact status is set to closed
        // reload if on open tab and the contact status is set to pending or closed
        case [ContactTaskStatus.STATUS_PENDING].includes(contact.task_status) && ['closed'].includes(this.$route.params.status):
        case [ContactTaskStatus.STATUS_CLOSED].includes(contact.task_status) && ['pending'].includes(this.$route.params.status):
        case [ContactTaskStatus.STATUS_PENDING, ContactTaskStatus.STATUS_CLOSED].includes(contact.task_status) && ['open'].includes(this.$route.params.status):
          this.onItemSelected(this.contacts[index + 1] || this.contacts[0])
          this.loadContactTasks()
          break
        case [ContactTaskStatus.STATUS_PENDING].includes(contact.task_status) && ['pending'].includes(this.$route.params.status):
        default:
          const contacts = [...this.contacts]
          contacts[index] = contact
          this.setContacts(contacts)
      }
    })

    // this.$VueEvent.listen('inbox_route_change', () => {
    //   this.onRouteChange()
    // })
    //
    // this.$VueEvent.listen('inbox_route_name_change', () => {
    //   this.onRouteNameChange()
    // })
  },

  beforeDestroy () {
    this.setSelectedContact({})
  },

  watch: {
    $route (to, from) {
      this.previousRoute = from
    },
    'sorting.order': function () {
      this.setContacts([])
      this.loadContactTasks()
    },
    '$route.params.status': function () {
      this.setStatus()
      if (['Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact Communication'].includes(this.$route.name)) {
        if (this.$options.filters.fixTaskStatusName(this.currentTask).toLowerCase() !== this.$route.params.status) {
          this.currentTask = this.$options.filters.getTaskStatusIdByName(this.$route.params.status)
        }

        this.lineOrRingGroupFilter = null
        // prevent reset of filters if coming from the root
        if (!this.$route.params.id) {
          this.resetList()
        } else {
          if (!this.isSearch && this.previousRoute.name !== 'Inbox') {
            this.loadContactTasks()
          }
        }
      }
    },
    '$route.name': function (value) {
      if (['Inbox'].includes(value)) {
        this.currentTask = ContactTaskStatus.STATUS_OPEN
        this.resetList()
      }
    },
    '$route.params.id': function (value) {
      if (['Inbox Contact Communication', 'Inbox Contact Task'].includes(this.$route.name) && value && this.contactTasks && this.contactTasks.length) {
        const contact = this.contactTasks.find(item => item.id.toString() === value)
        if (contact) {
          this.setSelectedContact(contact)
        }
      }

      if (['Inbox Contact Communication', 'Inbox Contact Task'].includes(this.$route.name) && !value) {
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
