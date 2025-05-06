import { THREADED } from 'src/store/teaminbox/teaminbox.store'
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

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
    ])
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
      'setUnreadCountLoaded'
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

        const response = await talk2Api.V2.inbox.inboxes.get({
          params: {
            page: nextPage,
            per_page: perPage,
            ...(search ? { search } : {})
          },
          signal: this.abortController.signal
        })

        this.setInboxes(response.data)
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
        const response = await talk2Api.V2.inbox.inboxes.get({
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

      // Map filter keys to API parameters
      if (filters.unreadonly) {
        apiFilters.unread_only = true
      }

      // Map sort keys to API parameters
      if (sort.order) {
        apiFilters.order = sort.order
      }

      return talk2Api.V1.reports.communications.get({
        params: {
          inbox_id: inboxId,
          page: nextPage,
          per_page: 50,
          ...(this.viewMode === THREADED ? { inbox_type: 'threaded' } : { inbox_type: 'unthreaded' }),
          ...(search ? {
            search_text: search,
            search_fields: ['lead_number', 'contact.name', 'campaign.name']
          } : {}),
          ...apiFilters
        },
        headers: { 'requested-from': 'api' },
        signal: this.abortController.signal
      })
    },

    async loadInbox (inboxId) {
      const response = await talk2Api.V2.inbox.inboxes.get({
        params: {
          inbox_ids: [inboxId]
        }
      })

      this.setInboxes(response.data)
    },

    checkInboxAccess (inboxId) {
      if (this.inboxes.length === 0 && inboxId) {
        this.loadInbox(inboxId)
      }

      return this.inboxes.some(inbox => inbox.id === inboxId)
    },

    async fetchInboxesUnreadCount (inboxIds, contactIds = null) {
      let data = []

      this.setIsLoadingInboxesUnreadCount(true)
      try {
        const { data: newData } = await talk2Api.V2.inbox.inboxes.unreadCount(inboxIds, contactIds)
        data = newData

        if (data.length === 1) {
          this.setInboxesUnreadCountSingle(data[0])
        } else {
          this.setInboxesUnreadCount(data)
        }
      } catch (error) {
        console.error('[fetchInboxesUnreadCount] error', error)
      } finally {
        this.setIsLoadingInboxesUnreadCount(false)
        this.setUnreadCountLoaded(true)
      }

      return data
    },

    getInboxUnreadCount (inboxId) {
      return this.inboxesUnreadCount?.find((inbox) => inbox.ring_group_id === inboxId)?.unread_count || 0
    }
  }
}
