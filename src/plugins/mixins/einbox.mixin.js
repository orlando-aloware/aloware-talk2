import { THREADED } from 'src/store/einbox/einbox.store'
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  computed: {
    ...mapState('Einbox', [
      'isLoadingInboxes',
      'inboxes',
      'currentInboxesPage',
      'hasMoreInboxes',
      'items',
      'viewMode',
      'isLoadingItems',
      'currentItemsPage',
      'hasMoreItems',
      'isLoadingMoreItems',
      'abortController'
    ])
  },

  methods: {
    ...mapActions('Einbox', [
      'setInboxes',
      'setIsLoadingInboxes',
      'appendInboxes',
      'setItems',
      'appendItems',
      'setIsLoadingItems',
      'resetItems',
      'setIsLoadingMoreItems',
      'setAbortController'
    ]),

    async fetchInboxes (search = '') {
      try {
        if (this.abortController) {
          this.abortController.abort()
        }

        this.setAbortController(new AbortController())

        this.setIsLoadingInboxes(true)
        const nextPage = 1
        const perPage = 100

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
        console.error('Error fetching inboxes:', error)
      } finally {
        this.setIsLoadingInboxes(false)
      }
    },

    async loadMoreInboxes () {
      try {
        if (this.isLoadingInboxes || !this.hasMoreInboxes) {
          return
        }

        this.setIsLoadingInboxes(true)

        const perPage = 100
        const nextPage = this.currentInboxesPage + 1
        const response = await talk2Api.V2.inbox.inboxes.get({ page: nextPage, perPage })

        this.appendInboxes(response.data)
      } catch (error) {
        console.error('Error loading more inboxes:', error)
      } finally {
        this.setIsLoadingInboxes(false)
      }
    },

    async fetchItems (inboxId, search = null) {
      try {
        this.setIsLoadingItems(true)

        const response = await this.getItemsRequest(inboxId, 1, search)

        this.setItems(response.data)
        this.setIsLoadingItems(false)

        this.setAbortController(null)
      } catch (error) {
        console.error('Error fetching items:', error)

        // dont cancel loading animation is requested was forced canceled
        if (error.name !== 'CanceledError') {
          this.setIsLoadingItems(false)
        }
      }
    },

    async loadMoreItems (inboxId) {
      try {
        if (this.isLoadingMoreItems || !this.hasMoreItems) return

        this.setIsLoadingMoreItems(true)

        const nextPage = this.currentItemsPage + 1
        const response = await this.getItemsRequest(inboxId, nextPage)

        this.appendItems(response.data)

        this.setAbortController(null)
      } catch (error) {
        console.error('Error loading more items:', error)
      } finally {
        this.setIsLoadingMoreItems(false)
      }
    },

    getItemsRequest (inboxId, nextPage, search = null) {
      // abort current ongoign request
      if (this.abortController) {
        this.abortController.abort()
      }

      this.setAbortController(new AbortController())

      return talk2Api.V1.reports.communications.get({
        params: {
          inbox_id: inboxId,
          page: nextPage,
          per_page: 100,
          ...(this.viewMode === THREADED ? { inbox_type: 'threaded' } : { inbox_type: 'unthreaded' }),
          ...(search ? {
            search_text: search,
            search_fields: ['lead_number', 'contact.name', 'campaign.name']
          } : {})
        },
        headers: { 'requested-from': 'api' },
        signal: this.abortController.signal
      })
    },

    checkInboxAccess (inboxId) {
      return this.inboxes.some(inbox => inbox.id === inboxId)
    }
  }
}
