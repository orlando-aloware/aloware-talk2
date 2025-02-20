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
      'setIsLoadingMoreItems',
      'setActiveInbox'
    ]),

    async fetchInboxes () {
      try {
        this.setIsLoadingInboxes(true)
        const nextPage = 1
        const perPage = 100

        const response = await talk2Api.V2.inbox.inboxes.get({ page: nextPage, perPage })
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
        if (this.isLoadingItems) {
          return
        }

        this.setIsLoadingItems(true)

        const response = await this.getItemsRequest(inboxId, 1)

        this.setItems(response.data)
      } catch (error) {
        console.error('Error fetching contacts:', error)
      } finally {
        this.setIsLoadingItems(false)
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
      // get the request based on the view mode (threaded or unthreaded)
      if (this.viewMode === THREADED) {
        return talk2Api.V2.communications.threaded({
          inboxId,
          page: nextPage,
          perPage: 100
        })
      }

      return talk2Api.V1.reports.communications.get({
        params: {
          inbox_id: inboxId,
          page: nextPage,
          per_page: 100
        },
        headers: { 'requested-from': 'api' }
      })
    }
  }
}
