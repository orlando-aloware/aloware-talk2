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

        const response = await talk2Api.V2.inbox.inboxes.get({ page: nextPage })
        this.setInboxes(response.data)

        // Check for inbox ID in route after loading inboxes
        await this.handleRouteInbox()
      } catch (error) {
        console.error('Error fetching inboxes:', error)
      } finally {
        this.setIsLoadingInboxes(false)
      }
    },

    async handleRouteInbox () {
      const routeInboxId = this.$route.params.inboxId

      if (this.inboxes.length) {
        if (routeInboxId) {
          // Handle specific inbox from route
          const inbox = this.inboxes.find(inbox => inbox.id.toString() === routeInboxId.toString())
          if (inbox) {
            this.setActiveInbox(inbox.id)
            this.resetItems()
            await this.fetchItems(inbox.id)
          } else {
            // Handle case when inbox ID from route is not found
            console.warn(`Inbox with ID ${routeInboxId} not found`)
            this.$router.replace({ name: 'EInbox' })
          }
        } else {
          // No inbox ID in route, set first inbox
          const firstInbox = this.inboxes[0]
          this.setActiveInbox(firstInbox.id)
          this.resetItems()
          await this.fetchItems(firstInbox.id)
          // Update route to reflect selected inbox
          this.$router.push(`/einbox/${firstInbox.id}`)
        }
      }
    },

    async fetchItems (inboxId) {
      try {
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
  },

  // Add route watcher to handle route changes
  watch: {
    '$route.params.inboxId': {
      immediate: true,
      handler (newInboxId) {
        if (newInboxId && this.inboxes.length) {
          this.handleRouteInbox()
        }
      }
    }
  }
}
