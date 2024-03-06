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

            <!-- reset/close selected filter button -->
            <div class="filter-wrapper"
                 :class="[hasChannelFilterChanges || appliedFilter ? '--highlighted' : '']">
              <compact-btn v-if="hasChannelFilterChanges || appliedFilter"
                           borderless
                           customClass="pr-2 pl-0 fs-14 _500 position-relative primary not-focusable"
                           :variant="filterButtonVariant"
                           @clicked="onResetFilter">
                <i class="fa fa-times"></i>
              </compact-btn>

              <!-- applied/selected filter name -->
              <compact-btn borderless
                           customClass="pl-0 pr-0 fs-14 _500 position-relative text-grey-90 not-focusable filter-toggle-button"
                           @clicked="onClickAppliedFilterButton">
                <q-tooltip v-if="appliedFilter"
                           anchor="top middle"
                           self="center middle">
                  {{ appliedFilter.name }}
                </q-tooltip>
                <filter-icon v-if="!appliedFilter && channelChangedFilterFields.length < 1"
                             color="#62666E"
                             class="filter-icon">
                </filter-icon>
                {{ !appliedFilter ? '' : appliedFilter.name }}
                {{ !appliedFilter && channelChangedFilterFields.length ? 'Filters' : '' }}
              </compact-btn>

              <!-- applied/selected filter field changes count -->
              <b-badge v-if="hasChannelFilterChanges"
                       class="ml-1 fs-12"
                       variant="primary"
                       v-b-modal:inbox-channel-filter-modal>
                {{ changedFilterFieldCount }}
              </b-badge>
            </div>
          </div>
        </template>
      </calls-header>

      <div class="w-100"
           v-if="!isSearch">
        <q-btn-toggle class="mx-2 mt-2 mb-1 custom-toggle-button"
                      color="transparent"
                      text-color="primary"
                      no-caps
                      spread
                      dense
                      unelevated
                      :toggle-color="statusToggleColor"
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
                <span v-if="isLoadingOpenTaskCount">
                  <q-spinner-tail size="12px"
                                color="white" />
                </span>
                <span v-if="!isLoadingOpenTaskCount">
                  {{ taskCounts.open | numberPlusFormatter(99) }}
                </span>
                <b-badge v-if="hasIncomingLiveCall"
                         variant="danger"
                         class="live-call-badge d-flex justify-center align-items-center position-absolute"
                         pill></b-badge>
              </div>
              <q-tooltip anchor="bottom start"
                         self="center start"
                         :offset="[7, 18]">
                See most recent communication with contacts you have visibility over
              </q-tooltip>
            </div>
          </template>

          <template v-slot:two>
            <div class="d-flex justify-content-center w-100 options"
                 :class="[currentTask !== ContactTaskStatusPending ? 'text-grey-90' : 'active']">
              <span class="text-left task-status-name">
                Pending
              </span>
              <div class="text-center task-count ml-1">
                 <span v-if="isLoadingPendingTaskCount">
                  <q-spinner-tail size="12px"
                                  color="white" />
                </span>
                <span v-if="!isLoadingPendingTaskCount">
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

      <div class="w-100 flex-grow-1"
           v-if="liveCalls.length > 0 && !isSearch">
        <inbox-task-list key-prefix="live-call"
                         :contacts="liveCalls"
                         :loading-contacts="isFetchingContacts"
                         :search-text="searchText"
                         :is-search="isSearch"
                         @onItemSelected="onItemSelected">
        </inbox-task-list>
      </div>

      <div class="h-100 w-100 flex-grow-1 scroll-y task-list-scroller"
           ref="taskListScroller"
           @scroll="handleScroll">
        <inbox-task-list key-prefix="task"
                         :contacts="contactTasks"
                         :loading-contacts="isFetchingContacts"
                         :search-text="searchText"
                         :is-search="isSearch"
                         v-if="!taskListHasError"
                         @onItemRemoved="onItemRemoved"
                         @onItemSelected="onItemSelected">
        </inbox-task-list>
        <div v-if="taskListHasError"
             class="text-center mt-5">
          Unable to fetch contact tasks.
          <br/>
          <b-btn variant="primary"
                 class="mt-3"
                 size="sm"
                 @click="loadContactTasks(false)">Retry</b-btn>
        </div>
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

      <filter-dialog :default-filter-model="defaultFilterModel"
                     @createNewFilter="onCreateNewFilter"
                     @applyFilter="onApplyFilter"
                     @onResetFilter="onResetFilter"
                     v-model="filter" />

      <create-filter-dialog :filter-model="newFilterModel" />
    </div>
</template>

<script>
import {
  cloneDeep,
  isEmpty,
  debounce,
  get,
  clone
} from 'lodash'
import * as Filters from 'src/constants/filters'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import CallsHeader from 'components/inbox/calls/calls-header'
import { mapActions, mapState } from 'vuex'
import InboxTaskList from 'components/inbox/inbox-tasks/list'
import {
  aclMixin,
  inboxMixin,
  visibilityMixin,
  unownedContactTaskMixin,
  contactV2AttributesMixin
} from 'src/plugins/mixins'
import FilterIcon from 'components/icons/filter-icon'
import InboxSearcher from 'components/inbox/inbox-searcher'
import SearchToggle from 'components/search-toggle'
import CompactBtn from 'components/compact-btn'
import FilterDialog from 'components/inbox/inbox-filters/filter-dialog'
import CreateFilterDialog from 'components/inbox/inbox-filters/create-filter-dialog'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDirections from 'src/constants/communication-direction'
import * as ChannelType from 'src/constants/inbox-channels'
import { STATUS_OPEN } from 'src/constants/contact-task-status'

export default {
  name: 'inbox-tab',

  mixins: [
    aclMixin,
    inboxMixin,
    visibilityMixin,
    unownedContactTaskMixin,
    contactV2AttributesMixin
  ],

  components: {
    CreateFilterDialog,
    FilterDialog,
    CompactBtn,
    SearchToggle,
    InboxSearcher,
    FilterIcon,
    InboxTaskList,
    CallsHeader
  },

  computed: {
    ...mapState([
      'dialer',
      'parkedCalls',
      'isMobile'
    ]),

    ...mapState('inbox', [
      'taskCounts',
      'liveContacts',
      'selectedContact',
      'hasMoreContacts',
      'isFetchingContacts',
      'channelChangedFilterFields',
      'selectedFilter',
      'appliedFilter',
      'isLoadingOpenTaskCount',
      'isLoadingPendingTaskCount',
      'activeChannel',
      'pinnedViews',
      'contacts',
      'channelClonedFilter',
      'inboxTaskCounts',
      'isFilterDialogForView'
    ]),

    ...mapState('contacts', [
      'contact',
      'isContactMixinUsed'
    ]),

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
      if (this.isSearch) {
        return [
          ...this.contacts
        ]
      }

      return [
        ...this.incomingCalls,
        ...this.contacts.filter(item => {
          const isFilterOrUnownedContact = this.inboxShowMyContacts ? this.checkFilterAndUnownedContact(item) : null

          if (isFilterOrUnownedContact !== null) {
            return isFilterOrUnownedContact
          }

          return true
        })
      ]
    },

    hasLiveCall () {
      return this.dialer.call &&
        this.dialer.call.state === 'open'
    },

    hasIncomingLiveCall () {
      return this.incomingCalls.length > 0
    },

    incomingCalls () {
      return this.liveContacts.filter(item => {
        const found = [
          CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW
        ].includes(item.last_communication.current_status2)

        if (!found) {
          return false
        }

        const isFilterOrUnownedContact = this.inboxShowMyContacts ? this.checkFilterAndUnownedContact(item) : null

        if (isFilterOrUnownedContact !== null) {
          return isFilterOrUnownedContact
        }

        return found
      })
    },

    liveCalls () {
      return [
        // parked calls
        ...this.liveContacts.filter(item => {
          const found = [CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW].includes(item.last_communication.current_status2)

          if (!found) {
            return false
          }

          const isFilterOrUnownedContact = this.inboxShowMyContacts ? this.checkFilterAndUnownedContact(item) : null

          if (isFilterOrUnownedContact !== null) {
            return isFilterOrUnownedContact
          }

          return found
        }),
        // connected calls
        ...this.liveContacts.filter(item => {
          const found = [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(item.last_communication.current_status2)

          if (!found) {
            return false
          }

          const isFilterOrUnownedContact = this.inboxShowMyContacts ? this.checkFilterAndUnownedContact(item) : null

          if (isFilterOrUnownedContact !== null) {
            return isFilterOrUnownedContact
          }

          return found
        })
      ]
    },

    changedFilterFieldCount () {
      const dateFieldIndex = this.channelChangedFilterFields.findIndex(item => ['from_date', 'to_date'].includes(item.property))

      if (dateFieldIndex >= 0) {
        return this.channelChangedFilterFields.length - 1
      }

      return this.channelChangedFilterFields.length
    }
  },

  data () {
    return {
      searchText: '',
      isSearch: false,
      previousRoute: null,
      newFilterModel: {
        name: '',
        type: ChannelType.CHANNEL_INBOX,
        filter: [],
        scope: 'user'
      },
      filter: Filters.EXCERPT,
      scrollTimeout: null,
      CommunicationCurrentStatus,
      listeners: {}
    }
  },

  methods: {
    ...mapActions('inbox', [
      'toggleFilterDialog',
      'toggleFilterDialogWithFilters',
      'resetChannelChangedFilterFields',
      'toggleFilterModelForm',
      'setSelectedFilter',
      'setAppliedFilter',
      'setChannelClonedFilter',
      'setLoadingPendingTaskCount',
      'setLoadingOpenTaskCount',
      'setOpenTaskCount',
      'setPendingTaskCount',
      'setInboxOpenTaskCount',
      'setInboxPendingTaskCount',
      'updateChannelChangedFilterFields',
      'setInboxShowMyContacts',
      'setFilterDialogForView',
      'setIsEditingView'
    ]),

    initInboxTaskRoute () {
      // if currently in inbox routes which works with contact's
      // task status, compare if current task is in the correct
      // inbox route
      if (!this.inboxRoutes.includes(this.$route.name) ||
        (this.inboxRoutes.includes(this.$route.name) &&
          !isEmpty(this.$route.params) &&
          this.$route.params.status !== this.statusText)) {
        return
      }

      this.loadContactTasks()
        .finally(() => {
          if (this.$route.params.id) {
            const id = this.$route.params.id
            const contact = this.contactTasks.find(item => item.id.toString() === id)
            if (contact) {
              this.setSelectedContact(contact)
            }
          }
        })
    },

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
        Object.assign(this.contacts[index], updatedContact)
      }
    },

    resetList (loadCount = true, showLoading = true) {
      this.setContacts([])
      this.page = 1
      this.isLoaded = false
      this.loadContactTasks(loadCount, showLoading)

      if (!this.$route.params.id) {
        this.setSelectedContact({})
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
      if (this.statusText === this.$route.params.status) {
        return
      }

      this.$nextTick(() => {
        this.$refs.taskListScroller.scrollTop = 0
      })

      // Inbox View
      if (this.inboxViewsRoutes.includes(this.$route.name)) {
        this.$router.push({
          name: 'Inbox View',
          params: {
            viewId: this.$route.params.viewId,
            status: this.statusText,
            channel: 'view'
          }
        }).catch(err => {
          console.log(err)
        })

        return
      }

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

    async onItemRemoved (contact, callback, loadCount = true) {
      // avoid request in duplicity when task is moved to open
      const isOpen = [ContactTaskStatus.STATUS_OPEN].includes(contact.task_status)

      if (loadCount && !isOpen) {
        this.fetchTaskCounts()
      }

      const filteredContacts = this.contacts.filter(item => item.id !== contact.id)
      await this.setContacts(filteredContacts)

      if (typeof callback !== 'undefined') {
        callback()
      }
    },

    onItemSelected (contact) {
      this.setSelectedContact(contact)
      const contactId = get(contact, 'id', null)

      if (!contactId) {
        return
      }

      if (this.currentTask !== contact.task_status) {
        this.currentTask = contact.task_status
      }

      if (this.inboxViewsRoutes.includes(this.$route.name)) {
        this.$emit('itemSelected', {
          name: 'Inbox View Contact Task',
          params: {
            id: contactId.toString(),
            channel: 'view',
            viewId: this.$route.params.viewId,
            status: contact.task_status ? this.$options.filters.fixTaskStatusName(contact.task_status).toLowerCase() : 'all'
          }
        })

        return
      }

      this.$emit('itemSelected', {
        name: 'Inbox Contact Task',
        params: {
          id: contactId.toString(),
          channel: 'inbox',
          status: contact.task_status ? this.$options.filters.fixTaskStatusName(contact.task_status).toLowerCase() : 'all'
        }
      })
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

      if ([ContactTaskStatus.STATUS_OPEN, ContactTaskStatus.STATUS_PENDING].includes(this.currentTask)) {
        this.fetchTaskCounts()
      }

      if (this.$route.params.status === this.statusText || ['Inbox', 'Inbox View'].includes(this.$route.name)) {
        this.loadContactTasks()
      }
    },

    searching (value) {
      if (value === '') {
        this.setContacts([])
      }

      if (value && value.length >= 3) {
        this.searchText = value
        this.loadContactTasks()
      }
    },

    resetFilter () {
      this.filter = { ...this.defaultFilterModel.filter }
      this.setChannelClonedFilter(this.filter)
      this.resetChannelChangedFilterFields()
      this.setSelectedFilter(null)
      this.setAppliedFilter(null)
    },

    onResetFilter () {
      this.resetFilter()

      // redirect
      if (this.$route.params?.viewId) {
        this.$router.push({
          name: 'Inbox Channel Task Status',
          params: {
            channel: 'inbox',
            status: this.statusText
          }
        }).catch(err => {
          console.log(err)
        })

        return
      }

      this.loadContactTasks()
      this.fetchInboxTaskCounts()
    },

    onApplyFilter (filter) {
      this.filter = filter
      this.isLoaded = false
      this.setChannelClonedFilter(this.filter)
      this.loadContactTasks()
      this.fetchTaskCounts()

      // no redirection needed for non-view
      if (!this.isFilterDialogForView) {
        return
      }

      // if a pinned view is edited, redirect to inbox view route. otherwise, to inbox
      this.currentTask = STATUS_OPEN

      const pinnedIndex = this.pinnedViews.findIndex(view => +view.filter_id === +this.appliedFilter.id)
      if (pinnedIndex >= 0) {
        this.$router.push({
          name: 'Inbox View',
          params: {
            viewId: this.appliedFilter.id,
            status: this.statusText,
            channel: 'view'
          }
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })

        return
      }

      this.$router.push({
        name: 'Inbox Channel Task Status',
        params: {
          channel: 'inbox',
          status: 'open'
        }
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    },

    onCreateNewFilter (filter) {
      this.newFilterModel = { ...this.newFilterModel, filter: filter, type: this.defaultFilterModel.type }
      this.toggleFilterModelForm(true)
    },

    updateContact (contact) {
      if (isEmpty(this.contact) ||
        isEmpty(contact) ||
        parseInt(contact.id) !== parseInt(this.contact.id)) {
        return
      }

      const currentContact = this.$jsonClone(this.contact)
      const contactNoCommAndAudits = this.$jsonClone(contact)

      // remove communications and audits
      if ('communications_and_audits' in contactNoCommAndAudits) {
        delete contactNoCommAndAudits.communications_and_audits
      }

      Object.assign(currentContact, contactNoCommAndAudits)
      this.setSelectedContact(currentContact)
    },

    onRouteChange () {
      this.setStatus()

      if (!['Inbox Contact Task', 'Inbox View Contact Task', 'Inbox Channel Task Status'].includes(this.$route.name)) {
        return
      }

      if (this.$options.filters.fixTaskStatusName(this.currentTask).toLowerCase() !== this.$route.params.status) {
        this.currentTask = this.$options.filters.getTaskStatusIdByName(this.$route.params.status)
      }

      this.lineOrRingGroupFilter = null

      // prevent reset of filters if coming from the root
      if (!this.$route.params.id) {
        this.resetList()
        return
      }

      if (!this.isSearch && this.previousRoute.name !== 'Inbox') {
        this.loadContactTasks()
      }
    },

    onRouteNameChange () {
      this.currentTask = ContactTaskStatus.STATUS_OPEN
      this.resetList()
    },

    checkFilterAndUnownedContact (contact) {
      if (this.dialer.communication &&
        contact.last_communication &&
        contact.last_communication.id === this.dialer.communication.id &&
        (this.isNotOwned(contact.user_id) || this.isNotOwnedFilter(contact.user_id))) {
        return true
      }

      const found = contact.last_communication ? this.parkedCalls.find(comm => comm.id === contact.last_communication.id) : false

      if (found) {
        return true
      }

      if (contact.last_communication &&
        contact.last_communication.ring_group_id &&
        this.checkCommunicationRingGroupHasCurrentUser(contact.last_communication.ring_group_id) &&
        (contact.last_communication.user_id === null || contact.last_communication.user_id === this.profile.id) &&
        ![
          CommunicationCurrentStatus.CURRENT_STATUS_VOICEMAIL_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW
        ].includes(contact.last_communication.current_status2)) {
        return true
      }

      if (contact.user_id !== this.profile.id) {
        return false
      }

      return null
    },

    processNewCommunicationEvent (data, communication) {
      const contact = this.$jsonClone(data)

      // add the last_communication in contact
      // and remove the contact in the communication
      const newCommunication = this.$jsonClone(communication)
      // add the v2 contact attributes that we need
      Object.assign(contact, this.addV2ContactAttributes(contact, newCommunication, contact))

      const contacts = { data: cloneDeep(this.contacts) }
      const isInLiveContacts = this.liveContacts.find(item => item.id === contact.id)
      const isInContacts = contacts.data.find(item => item.id === contact.id)
      this.updateContact(contact)

      // check if communication is a live call
      if (communication.type === CommunicationTypes.CALL && [CommunicationDirections.INBOUND, CommunicationDirections.OUTBOUND].includes(communication.direction) &&
        [ CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW ].includes(communication.current_status2)) {
        const liveContacts = cloneDeep(this.liveContacts)

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
        const index = contacts.data.findIndex(item => item.id === contact.id)
        if (isInContacts && index !== -1) {
          Object.assign(contacts.data[index], contact)
          this.setContacts(contacts.data)

          if (contact.task_status !== this.currentTask) {
            setTimeout(() => {
              this.onItemRemoved(contact)
            }, 3000)
            return
          }
        }

        // only modify order if new contact task === current task
        // only push new non-live comms if no filter is applied
        if (this.currentTask === contact.task_status && this.channelChangedFilterFields.length < 1) {
          if (!isInLiveContacts) {
            // if contact is not in the list, then automatically add it to the top
            if (!isInContacts) {
              if (this.contacts.length > this.perPage) {
                contacts.data.pop()
              }
            } else {
              // get all contacts except the current one
              contacts.data = clone(contacts.data.filter(item => item.id !== contact.id))
            }

            if (this.sorting.order === 'asc') {
              contacts.data.push(contact)
            } else {
              contacts.data.unshift(contact)
            }
            this.setContacts(contacts.data)

            // only trigger counts request if action comes from the same user
            if (communication.user_id === this.profile.id) {
              this.fetchTaskCounts()
            }
          }
        }
      }
    },

    onClickAppliedFilterButton () {
      if (this.$route.params?.viewId) {
        this.setSelectedFilter(this.appliedFilter)
        this.setFilterDialogForView(true)
        this.setIsEditingView(true)
      } else {
        this.setFilterDialogForView(false)
        this.setIsEditingView(false)
      }

      this.toggleFilterDialog(true)
      this.toggleFilterDialogWithFilters(true)
    },

    startInboxListeners () {
      this.$VueEvent.listen('load_and_navigate_inbox_tab', this.listeners.loadAndNavigateInboxTab)
      this.$VueEvent.listen('navigate_task_tab', this.listeners.navigateTaskTab)
      this.$VueEvent.listen('contact_updated', this.listeners.contactUpdated)
      this.$VueEvent.listen('contact_updated_from_contact_mixin', this.listeners.contactUpdatedFromContactMixin)
      this.$VueEvent.listen('new_communication', this.listeners.newCommunication)
      this.$VueEvent.listen('update_communication', this.listeners.updateInboxCommunication)
      this.$VueEvent.listen('contact_task_status_updated', this.listeners.contactTaskStatusUpdated)
      this.$VueEvent.listen('contact_audit_created', this.listeners.contactAuditCreated)
      this.$VueEvent.listen('inbox_load_contacts', this.listeners.inboxLoadContacts)
      this.$VueEvent.listen('inbox_contact_updated', this.listeners.inboxContactUpdated)
    },

    stopInboxListeners () {
      this.$VueEvent.stop('load_and_navigate_inbox_tab', this.listeners.loadAndNavigateInboxTab)
      this.$VueEvent.stop('navigate_task_tab', this.listeners.navigateTaskTab)
      this.$VueEvent.stop('contact_updated', this.listeners.contactUpdated)
      this.$VueEvent.stop('contact_updated_from_contact_mixin', this.listeners.contactUpdatedFromContactMixin)
      this.$VueEvent.stop('new_communication', this.listeners.newCommunication)
      this.$VueEvent.stop('update_communication', this.listeners.updateInboxCommunication)
      this.$VueEvent.stop('contact_task_status_updated', this.listeners.contactTaskStatusUpdated)
      this.$VueEvent.stop('contact_audit_created', this.listeners.contactAuditCreated)
      this.$VueEvent.stop('inbox_load_contacts', this.listeners.inboxLoadContacts)
      this.$VueEvent.stop('inbox_contact_updated', this.listeners.inboxContactUpdated)
    }
  },

  created () {
    if (this.$route.name !== 'Inbox View' && !this.isFilterDialogForView) {
      this.resetFilter()
    }

    this.toggleFilterDialog(false)
  },

  mounted () {
    this.setContacts([])
    this.setStatus()

    if (!this.inboxViewsRoutes.includes(this.$route.name)) {
      this.initInboxTaskRoute()
    }

    if (['Inbox Channel', 'Inbox', 'Inbox View'].includes(this.$route.name)) {
      this.setSelectedContact({})
    }

    if (['Inbox Contact Task'].includes(this.$route.name) && this.selectedContact.task_status !== this.currentTask) {
      this.onItemSelected(this.selectedContact)
    }

    this.listeners.loadAndNavigateInboxTab = (lastNavigatedIndex) => {
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
    }

    this.listeners.navigateTaskTab = (contact) => {
      this.setSelectedContact(contact)

      this.$router.push({
        name: 'Inbox Contact Task',
        params: { id: JSON.stringify(contact.id) }
      })

      this.makeSelectedItemVisible()
    }

    this.listeners.contactUpdated = (data) => {
      const updatedContact = this.$jsonClone(this.selectedContact)
      const contact = this.$jsonClone(data)
      // add the v2 contact attributes that we need
      Object.assign(updatedContact, this.addV2ContactAttributes(contact))

      if (this.selectedContact &&
        parseInt(this.selectedContact.id) === parseInt(data.id) &&
        !this.isContactMixinUsed) {
        // check data loaded
        this.setSelectedContact(updatedContact)
        this.updateContacts(updatedContact)
      }

      this.setContact(updatedContact)
    }

    this.listeners.contactUpdatedFromContactMixin = (data) => {
      if (!this.isContactMixinUsed) {
        return
      }

      this.updateContacts(data)

      if (parseInt(data.id) === parseInt(this.contact.id)) {
        this.setSelectedContact(data)
      }
    }

    this.listeners.newCommunication = (communication) => {
      if (this.isSearch) {
        return
      }
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

      if ((!this.checkCommunicationMatchesFilters(this.filter, communication)) ||
        !this.checkCommunicationMatchesUserAccessibility(communication)) {
        return
      }

      // there's already a listener in contact mixin that handles the fetching
      // of contact's information so we have to prevent calling another request.
      if (!this.isContactMixinUsed) {
        this.processNewCommunicationEvent(communication.contact, communication)
      }
    }

    this.listeners.updateInboxCommunication = (communication) => {
      if (!communication.contact_id || this.isSearch) {
        return
      }

      // do not alter when contact is in live call and live comm is different from the one in the dialer
      if (this.dialer.contact &&
        this.dialer.communication &&
        communication.contact_id === this.dialer.contact.id &&
        this.dialer.communication.id !== communication.id) {
        return
      }

      if (!this.checkCommunicationMatchesFilters(this.filter, communication) ||
        !this.checkCommunicationMatchesUserAccessibility(communication)) {
        return
      }

      const newCommunication = this.$jsonClone(communication)
      // if communication is in live contacts
      const index = this.liveContacts.findIndex(item => item.id === communication.contact_id)
      let contactTaskToRemove = null

      if (index >= 0 && this.liveContacts[index].last_communication.id === communication.id) {
        const liveContacts = cloneDeep(this.liveContacts)
        // add the v2 contact attributes that we need
        Object.assign(liveContacts[index], this.addV2ContactAttributes(communication.contact, newCommunication, liveContacts[index]))

        // if type is call and completed/voicemail then remove from live calls
        if ([CommunicationDirections.INBOUND, CommunicationDirections.OUTBOUND].includes(communication.direction) &&
          communication.type === CommunicationTypes.CALL &&
          [CommunicationCurrentStatus.CURRENT_STATUS_VOICEMAIL_NEW, CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW].includes(communication.current_status2)) {
          contactTaskToRemove = liveContacts[index]
          liveContacts.splice(index, 1)

          if (communication.direction === CommunicationDirections.OUTBOUND) {
            contactTaskToRemove.task_status = ContactTaskStatus.STATUS_PENDING
          }

          const contacts = cloneDeep(this.contacts)
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
        const contacts = cloneDeep(this.contacts)
        // add the v2 contact attributes that we need
        Object.assign(contacts[contactIndex], this.addV2ContactAttributes(communication.contact, newCommunication, contacts[contactIndex]))
        this.setContacts(contacts)

        if (!isEmpty(this.contact) &&
          parseInt(contacts[contactIndex].id) === parseInt(this.contact.id)) {
          this.setSelectedContact(contacts[contactIndex])
        }
      }
    }

    this.listeners.contactTaskStatusUpdated = (contact) => {
      const sameStatus = this.currentTask === contact.task_status

      if (this.$route.name !== 'Inbox Contact Task' || this.isSearch || !this.currentTask || !contact || sameStatus) {
        return
      }

      if (this.currentTask === ContactTaskStatus.STATUS_PENDING) {
        this.setPendingTaskCount(this.taskCounts.pending - 1)
        this.setInboxPendingTaskCount(this.inboxTaskCounts.pending - 1)
        if (contact.task_status === ContactTaskStatus.STATUS_OPEN) {
          this.setOpenTaskCount(this.taskCounts.open + 1)
          this.setInboxOpenTaskCount(this.inboxTaskCounts.open + 1)
        }
      }

      if (this.currentTask === ContactTaskStatus.STATUS_OPEN) {
        this.setOpenTaskCount(this.taskCounts.open - 1)
        this.setInboxOpenTaskCount(this.inboxTaskCounts.open - 1)
        if (contact.task_status === ContactTaskStatus.STATUS_PENDING) {
          this.setPendingTaskCount(this.taskCounts.pending + 1)
          this.setInboxPendingTaskCount(this.inboxTaskCounts.pending + 1)
        }
      }

      if (this.currentTask === ContactTaskStatus.STATUS_CLOSED && contact.task_status === ContactTaskStatus.STATUS_OPEN) {
        this.setOpenTaskCount(this.taskCounts.open + 1)
        this.setInboxOpenTaskCount(this.inboxTaskCounts.open + 1)
      }

      // prevent duplicate task status count request when Contact component is active
      if (!this.isContactMixinUsed) {
        this.fetchTaskCounts()
      }

      const index = this.contacts.findIndex(item => item.id === contact.id)
      switch (true) {
        // reload if on closed tab and the contact status is set to pending
        // reload if on pending tab and the contact status is set to closed
        // reload if on open tab and the contact status is set to pending or closed
        case [ContactTaskStatus.STATUS_PENDING].includes(contact.task_status) && ['closed'].includes(this.$route.params.status):
        case [ContactTaskStatus.STATUS_CLOSED].includes(contact.task_status) && ['pending'].includes(this.$route.params.status):
        case [ContactTaskStatus.STATUS_CLOSED].includes(contact.task_status) && ['open'].includes(this.$route.params.status):
          this.onItemRemoved(contact, () => {
            this.onItemSelected(this.contacts[0])
          }, false)
          this.loadContactTasks(false, false)
          break
        case [ContactTaskStatus.STATUS_PENDING].includes(contact.task_status) && ['open'].includes(this.$route.params.status):
          // just remove contact from current list
          if (index >= 0) {
            const contacts = [...this.contacts]
            contacts.splice(index, 1)
            this.setContacts(contacts)
          }
          break
        case [ContactTaskStatus.STATUS_PENDING].includes(contact.task_status) && ['pending'].includes(this.$route.params.status):
        default:
          if (index < 0) {
            const contacts = [...this.contacts]
            if (this.sorting.order === 'desc') {
              contacts.unshift(contact)
            } else {
              contacts.push(contact)
            }
            this.setContacts(contacts)
            this.loadContactTasks(false, false)
          } else {
            const contacts = [...this.contacts]
            contacts[index] = contact
            this.setContacts(contacts)
          }
      }
    }

    this.listeners.contactAuditCreated = (data) => {
      if (data.property === 'contact_task_status') {
        // update task status on live contacts
        const index = this.liveContacts.findIndex(item => item.id === data.contact_id)
        if (index >= 0) {
          const liveContacts = cloneDeep(this.liveContacts)
          liveContacts[index].task_status = parseInt(data.to)

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

        const contactIndex = this.contacts.findIndex(item => item.id === data.contact_id)
        if (contactIndex >= 0) {
          const contacts = cloneDeep(this.contacts)
          contacts[contactIndex].task_status = parseInt(data.to)
          this.setContacts(contacts)

          if (!isEmpty(this.contact) &&
            contacts[contactIndex].id === this.contact.id) {
            this.setSelectedContact(contacts[contactIndex])
          }
        }

        console.log('contactAuditCreated data', data)
        console.log('contactAuditCreated data.from === ContactTaskStatus.STATUS_PENDING', data.from === ContactTaskStatus.STATUS_PENDING)
        console.log('contactAuditCreated data.from === ContactTaskStatus.STATUS_OPEN', data.from === ContactTaskStatus.STATUS_OPEN)

        console.log('contactAuditCreated data.to === ContactTaskStatus.STATUS_OPEN', data.to === ContactTaskStatus.STATUS_OPEN)
        console.log('contactAuditCreated data.to === ContactTaskStatus.STATUS_PENDING', data.to === ContactTaskStatus.STATUS_PENDING)

        if (data.from === ContactTaskStatus.STATUS_PENDING) {
          this.setPendingTaskCount(this.taskCounts.pending - 1)
          this.setInboxPendingTaskCount(this.inboxTaskCounts.pending - 1)
          if (data.to === ContactTaskStatus.STATUS_OPEN) {
            this.setOpenTaskCount(this.taskCounts.open + 1)
            this.setInboxOpenTaskCount(this.inboxTaskCounts.open + 1)
          }
        }
        if (data.from === ContactTaskStatus.STATUS_OPEN) {
          this.setOpenTaskCount(this.taskCounts.open - 1)
          this.setInboxOpenTaskCount(this.inboxTaskCounts.open - 1)
          if (data.to === ContactTaskStatus.STATUS_PENDING) {
            this.setPendingTaskCount(this.taskCounts.pending + 1)
            this.setInboxPendingTaskCount(this.inboxTaskCounts.pending + 1)
          }
        }
      }
    }

    this.listeners.inboxLoadContacts = debounce((showMyContacts) => {
      if (!this.isLoaded) {
        return
      }

      // only when both have it, update the saved filters
      // when my contacts is toggled
      if (this.selectedFilter && this.appliedFilter) {
        this.$VueEvent.fire('my_contacts_update_filter')
        return
      }

      this.loadContactTasks(true)
        .finally(() => {
          if (this.$route.params.id) {
            const id = this.$route.params.id
            const contact = this.contactTasks.find(item => item.id.toString() === id)
            if (contact) {
              this.setSelectedContact(contact)
            }
          }
        })
    }, 100)

    // process the event from contact.mixin
    this.listeners.inboxContactUpdated = (data) => {
      this.processNewCommunicationEvent(data.contact, data.communication)
    }

    // restart listeners
    this.stopInboxListeners()
    this.startInboxListeners()
  },

  beforeDestroy () {
    this.setSelectedContact({})
    this.stopInboxListeners()
  },

  watch: {
    $route (to, from) {
      if (this.inboxViewsRoutes.includes(from.name) && !this.inboxChannelRoutes.includes(to.name)) {
        this.resetFilter()
      }

      // load contacts if not inbox view related route
      if (this.inboxViewsRoutes.includes(from.name) && !this.inboxViewsRoutes.includes(to.name)) {
        this.loadContactTasks(false)
        this.fetchTaskCounts()
        this.setInboxShowMyContacts(false)
      }

      // load contacts for inbox
      if (this.inboxViewsRoutes.includes(to.name) && !this.inboxViewsRoutes.includes(to.name)) {
        this.fetchInboxTaskCounts()
      }

      this.previousRoute = from
    },

    'sorting.order': function () {
      this.setContacts([])
      this.loadContactTasks()
    },

    '$route.params.status': function () {
      this.setStatus()

      if (this.isSearch || (['Inbox', 'Inbox View'].includes[this.previousRoute.name] && this.currentTask === ContactTaskStatus.STATUS_OPEN)) {
        return
      }

      if (!['Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact Communication', 'Inbox View'].includes(this.$route.name)) {
        return
      }

      if (['Inbox Channel Task Status'].includes(this.$route.name)) {
        this.resetList(false, true)
        return
      }

      if (this.$options.filters.fixTaskStatusName(this.currentTask).toLowerCase() !== this.$route.params.status) {
        this.currentTask = this.$options.filters.getTaskStatusIdByName(this.$route.params.status)
      }

      this.lineOrRingGroupFilter = null

      // avoid contacts refresh if status is not expected
      if (!['open', 'pending', 'closed'].includes(this.$route.params.status)) {
        return
      }

      // prevent reset of filters if coming from the root
      if (this.$route.name !== 'Inbox View' && !this.$route.params.id) {
        this.resetList()

        return
      }

      if ((!this.isSearch && ['Inbox', 'Inbox View', 'Inbox View Contact Task'].includes(this.previousRoute.name)) || this.$route.params.id) {
        this.loadContactTasks()
      }
    },

    '$route.name': function (value) {
      if (['Inbox'].includes(value)) {
        this.searchText = ''
        this.isSearch = false
        this.currentTask = ContactTaskStatus.STATUS_OPEN
        this.resetList()
        if (this.previousRoute && this.previousRoute.params.status === 'pending') {
          this.setLoadingPendingTaskCount(true)
          this.getContactsCountByTaskStatus(ContactTaskStatus.STATUS_PENDING)
        }
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
