<template>
    <b-overlay :show="isFetchingContacts"
               class="h-100 w-100"
               rounded="sm"
               variant="white">
      <div class="w-100 h-100 d-flex flex-column">
        <calls-header :openCount="openTaskCount"
                      :pendingCount="pendingTaskCount"
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
            v-model="currentTask">
            <template v-slot:one>
              <div class="d-flex flex-row justify-content-between align-items-center w-100 px-1 options"
                   :class="[currentTask !== ContactTaskStatusOpen ? 'text-grey-20' : 'active']">
                  <span class="text-left">
                    Open
                  </span>
                <span class="text-right">
                    {{ openTaskCount | numberPlusFormatter(99) }}
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
                    {{ pendingTaskCount | numberPlusFormatter(99) }}
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
        <div class="h-100 w-100 flex-grow-1 scroll-y" @scroll="handleScroll">
          <inbox-task-list :contacts="contacts"></inbox-task-list>
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
import { mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import InboxTaskList from 'components/inbox/inbox-tasks/list'
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
    ...mapState('inbox', ['openTaskCount', 'pendingTaskCount']),
    nextPage () {
      return this.currentPage + 1
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
      contacts: [],
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
      isLoaded: true,
      currentPage: 0,
      page: 1
    }
  },

  methods: {
    loadContactTasks () {
      this.isFetchingContacts = true
      this.getContactsByTaskStatus(this.currentTask).then(response => {
        this.contacts = response.data.data
        this.isFetchingContacts = false

        this.currentPage = response.data.current_page
        this.hasMore = response.data.next_page_url
        this.isLoadingMore = false
        this.isLoaded = true
      })
    },
    loadMoreContactTasks () {
      this.isFetchingContacts = true
      this.getContactsByTaskStatus(this.currentTask).then(response => {
        this.contacts = [...this.contacts, ...response.data.data]
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
    }
  },
  created () {
    this.loadContactTasks()
  },
  watch: {
    currentTask () {
      this.loadContactTasks()
    },
    'sorting.order': function () {
      this.loadContactTasks()
    },
    'searchText': function (value) {
      this.loadContactTasks()
    }
  }
}
</script>
