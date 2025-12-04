import { SEARCH_FIELDS, THREADED, ALL_INBOXES_ID } from 'src/store/teaminbox/teaminbox.store'
import { mapActions, mapState } from 'vuex'
import talk2TeamInboxApi from 'src/plugins/api/teamInboxApi'
import { debounce } from 'lodash'

export default {
  computed: {
    ...mapState('TeamInbox', [
      'isLoadingInboxes',
      'inboxes',
      'inboxesUnreadCount',
      'isLoadingInboxesUnreadCount',
      'currentInboxesPage',
      'hasMoreInboxes',
      'items',
      'viewMode',
      'isLoadingItems',
      'currentItemsPage',
      'hasMoreItems',
      'isLoadingMoreItems',
      'abortController',
      'unreadCountLoaded'
    ]),

    ...mapState(['currentTimezone']),

    dateRanges () {
      const timezone = this.currentTimezone
      const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

      return {
        'Today': [this.$moment.tz(timezone).startOf('day').format(DATE_FORMAT), this.$moment.tz(timezone).endOf('day').format(DATE_FORMAT)],
        'Yesterday': [this.$moment.tz(timezone).subtract(1, 'days').startOf('day').format(DATE_FORMAT), this.$moment.tz(timezone).subtract(1, 'days').endOf('day').format(DATE_FORMAT)],
        'Last 7 Days': [this.$moment.tz(timezone).subtract(7, 'days').startOf('day').format(DATE_FORMAT), this.$moment.tz(timezone).endOf('day').format(DATE_FORMAT)],
        'Last 30 Days': [this.$moment.tz(timezone).subtract(30, 'days').startOf('day').format(DATE_FORMAT), this.$moment.tz(timezone).endOf('day').format(DATE_FORMAT)],
        'This Month So Far': [this.$moment.tz(timezone).startOf('month').format(DATE_FORMAT), this.$moment.tz(timezone).endOf('day').format(DATE_FORMAT)],
        'Last Month': [this.$moment.tz(timezone).subtract(1, 'months').startOf('month').format(DATE_FORMAT), this.$moment.tz(timezone).subtract(1, 'months').endOf('month').format(DATE_FORMAT)],
        'All Time': [null, null]
      }
    },

    isAllInboxesRoute () {
      return this.$route.params.inboxId === ALL_INBOXES_ID
    }
  },

  methods: {
    ...mapActions('TeamInbox', [
      'setInboxes',
      'setIsLoadingInboxes',
      'setInboxesUnreadCount',
      'setInboxesUnreadCountSingle',
      'setIsLoadingInboxesUnreadCount',
      'appendInboxes',
      'setItems',
      'appendItems',
      'setIsLoadingItems',
      'resetItems',
      'setIsLoadingMoreItems',
      'setAbortController',
      'setShowRefreshInboxesButton',
      'setShowRefreshCommunicationsButton',
      'setUnreadCountLoaded',
      'setContactsLastUsedLines',
      'setHasAnyInboxes'
    ]),

    async fetchInboxes (search = '') {
      try {
        if (this.abortController) {
          this.abortController.abort()
        }

        this.setShowRefreshCommunicationsButton(false)
        this.setAbortController(new AbortController())

        this.setIsLoadingInboxes(true)
        const nextPage = 1
        const perPage = 50

        const response = await talk2TeamInboxApi.inboxes.get({
          params: {
            page: nextPage,
            per_page: perPage,
            ...(search ? { search } : {})
          },
          signal: this.abortController.signal
        })

        this.setInboxes(response.data)

        // On initial load (no search), set the flag if user has any inboxes
        if (!search && response.data.data && response.data.data.length > 0) {
          this.setHasAnyInboxes(true)
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          this.$generalNotification('Error while fetching inboxes, please try again', 'error')
          this.setShowRefreshInboxesButton(true)
        }
      } finally {
        this.setIsLoadingInboxes(false)
      }
    },

    async loadMoreInboxes (search = '') {
      try {
        if (this.isLoadingInboxes || !this.hasMoreInboxes) {
          return
        }

        if (this.abortController) {
          this.abortController.abort()
        }

        this.setIsLoadingInboxes(true)
        this.setAbortController(new AbortController())

        const perPage = 50
        const nextPage = this.currentInboxesPage + 1
        const response = await talk2TeamInboxApi.inboxes.get({
          params: {
            page: nextPage,
            per_page: perPage,
            ...(search ? { search } : {})
          },
          signal: this.abortController.signal
        })

        this.appendInboxes(response.data)
      } catch (error) {
        console.error('Error loading more inboxes:', error)
      } finally {
        this.setIsLoadingInboxes(false)
      }
    },

    async fetchItems (inboxId, search = null, filters = {}, sort = {}) {
      try {
        this.setIsLoadingItems(true)
        this.setShowRefreshCommunicationsButton(false)

        const response = await this.getItemsRequest(inboxId, 1, search, filters, sort)

        if (inboxId === ALL_INBOXES_ID) {
          // For the All Inboxes, we need to set the last used line for each contact / communication of the list,
          // as they can be part of different inboxes
          response.data.data.forEach(item => {
            this.setContactsLastUsedLines({
              inboxId: item.ring_group_id,
              data: [{
                contact_id: item.contact_id,
                last_line_used: item.last_line_used
              }]
            })
          })
        } else {
          // For the regular inbox, we can set the last used line for the whole list,
          // as they are all part of the same inbox
          this.setContactsLastUsedLines({
            inboxId,
            data: response.data.data
          })
        }

        this.setItems(response.data)
        this.setIsLoadingItems(false)

        // Store the fact that this is the initial load in case we need to auto-load more
        this.$store.dispatch('TeamInbox/setIsInitialLoad', true)

        this.setAbortController(null)
      } catch (error) {
        // dont perform the actions below if request was forced canceled
        if (error.name !== 'CanceledError') {
          this.setIsLoadingItems(false)
          this.$generalNotification('Error while fetching items, please try again', 'error')
          this.setShowRefreshCommunicationsButton(true)
        }
      }
    },

    async loadMoreItems (inboxId) {
      try {
        if (this.isLoadingMoreItems || !this.hasMoreItems) return

        this.setIsLoadingMoreItems(true)

        const nextPage = this.currentItemsPage + 1
        // Get current filter state from Vuex
        const filters = this.$store.state.TeamInbox.activeFilters || {}
        const sort = this.$store.state.TeamInbox.activeSort || {}
        const search = this.$store.state.TeamInbox.currentSearch

        const response = await this.getItemsRequest(inboxId, nextPage, search, filters, sort)

        this.appendItems(response.data)

        this.setAbortController(null)
      } catch (error) {
        console.error('Error loading more items:', error)
      } finally {
        this.setIsLoadingMoreItems(false)
      }
    },

    getItemsRequest (inboxId, nextPage, search = null, filters = {}, sort = {}) {
      // abort current ongoign request
      if (this.abortController) {
        this.abortController.abort()
      }

      this.setAbortController(new AbortController())

      // Transform filters to API parameters
      const apiFilters = {}

      const applyFromAndToDates = ['Yesterday', 'Last Month', 'custom'].includes(filters.date_range)

      if (filters.from_date) {
        if (applyFromAndToDates) {
          apiFilters.from_date = filters.from_date
        } else {
          const dateRange = this.dateRanges[filters.date_range] ?? this.dateRanges['Last 30 Days']
          apiFilters.from_date = dateRange[0]
        }
      }

      if (filters.to_date && applyFromAndToDates) {
        apiFilters.to_date = filters.to_date
      }

      // Map filter keys to API parameters
      if (filters.unread_only) {
        apiFilters.unread_only = true
      }

      if (filters.channels?.length) {
        apiFilters.types = filters.channels.filter(channel => channel !== 'mentions')

        if (filters.channels.includes('mentions')) {
          apiFilters.has_mention = true
        }
      }

      if (filters.directions) {
        apiFilters.directions = filters.directions
      }

      if (filters.my_contact) {
        apiFilters.my_contact = true
      }

      if (filters.task_status?.length) {
        apiFilters.task_status = filters.task_status
      }

      if (filters.campaigns) {
        apiFilters.campaigns = filters.campaigns
      }

      // Map sort keys to API parameters
      if (sort.order) {
        apiFilters.order = sort.order
      }

      const params = {
        inbox_ids: inboxId !== ALL_INBOXES_ID ? [inboxId] : [],
        page: nextPage,
        per_page: 50,
        inbox_type: this.viewMode === THREADED ? 'threaded' : 'unthreaded',
        ...(search ? {
          search_text: search,
          search_fields: SEARCH_FIELDS
        } : {}),
        ...apiFilters
      }

      if (inboxId === ALL_INBOXES_ID) {
        params.all_inboxes = true

        // apply Inboxes filter if any
        if (filters.inboxes?.length) {
          params.inbox_ids = filters.inboxes
        } else {
          // if no filtered Inboxes, send all Inboxes
          params.inbox_ids = this.inboxes.map(inbox => inbox.id)
        }
      }

      const config = {
        headers: { 'requested-from': 'api' },
        signal: this.abortController.signal
      }

      return talk2TeamInboxApi.reports.communications(params, config)
    },

    async checkInboxAccess (inboxId) {
      // "All" inbox is always accessible if user has any inboxes
      if (inboxId === ALL_INBOXES_ID) {
        return this.inboxes.length > 0
      }

      const response = await talk2TeamInboxApi.inboxes.get({
        params: {
          inbox_ids: [inboxId]
        }
      })

      const inboxes = response?.data?.data || []
      if (typeof inboxes !== 'object' || inboxes.length === 0) {
        return false
      }

      const hasAccess = inboxes.some(inbox => inbox.id === inboxId)

      return hasAccess
    },

    fetchInboxesUnreadCount: debounce(async function (inboxIds, contactIds = null) {
      let data = []

      this.setIsLoadingInboxesUnreadCount(true)

      const filters = this.$store.state.TeamInbox.activeFilters || {}

      try {
        const { data: newData } = await talk2TeamInboxApi.inboxes.unreadCount(inboxIds, contactIds, filters)
        data = newData

        inboxIds.forEach((inboxId) => {
          const unreadCount = {
            ring_group_id: inboxId,
            unread_count: (data ?? []).find((item) => item.ring_group_id === inboxId)?.unread_count ?? 0
          }
          this.setInboxesUnreadCountSingle(unreadCount)
        })
      } catch (error) {
        console.error('[fetchInboxesUnreadCount] error', error)
      } finally {
        this.setIsLoadingInboxesUnreadCount(false)
        this.setUnreadCountLoaded(true)
      }

      return data
    }, 2000),

    getInboxUnreadCount (inboxId) {
      // For "all" inbox, sum up all unread counts
      if (inboxId === ALL_INBOXES_ID) {
        return this.inboxesUnreadCount?.reduce((total, inbox) => total + (inbox.unread_count || 0), 0) || 0
      }
      return this.inboxesUnreadCount?.find((inbox) => inbox.ring_group_id === inboxId)?.unread_count || 0
    },

    /**
     * Check if current user has access to a specific ring group (Team Inbox)
     * @param {Number} ringGroupId - The ring group ID to check
     * @returns {Boolean} true if user has access, false otherwise
     */
    userHasAccessToRingGroup (ringGroupId) {
      if (!ringGroupId) {
        return false
      }

      // Check in the inboxes list (already fetched Team Inboxes)
      // The inboxes array contains ONLY the Team Inboxes the current user has access to
      return this.inboxes.some(inbox => inbox.id === ringGroupId)
    }
  }
}
