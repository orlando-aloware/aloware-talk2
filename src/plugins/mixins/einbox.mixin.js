import { THREADED } from 'src/store/einbox/einbox.store'
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  data: () => ({
    abortController: null
  }),

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
      'isLoadingMoreItems'
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
      'setIsLoadingMoreItems'
    ]),

    async fetchInboxes (search = '') {
      try {
        if (this.abortController) {
          this.abortController.abort()
        }

        this.abortController = new AbortController()

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

    async fetchItems (inboxId) {
      try {
        this.setIsLoadingItems(true)

        const response = await this.getItemsRequest(inboxId, 1)

        this.setItems(response.data)
        this.setIsLoadingItems(false)
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
      } catch (error) {
        console.error('Error loading more items:', error)
      } finally {
        this.setIsLoadingMoreItems(false)
      }
    },

    getItemsRequest (inboxId, nextPage) {
      // abort current ongoign request
      if (this.abortController) {
        this.abortController.abort()
      }

      this.abortController = new AbortController()

      if (this.viewMode === THREADED) {
        return talk2Api.V2.communications.threaded({
          params: {
            inbox_id: inboxId,
            page: nextPage,
            per_page: 100,
            inbox_type: 'threaded'
          },
          signal: this.abortController.signal
        })
      }

      return talk2Api.V1.reports.communications.get({
        params: {
          inbox_id: inboxId,
          page: nextPage,
          per_page: 100
        },
        headers: { 'requested-from': 'api' },
        signal: this.abortController.signal
      })
    }
  }
}
