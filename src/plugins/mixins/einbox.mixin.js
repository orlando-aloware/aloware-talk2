import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  computed: {
    ...mapState('Einbox', [
      'isLoadingInboxes',
      'inboxes',
      'currentInboxesPage',
      'hasMoreInboxes',
      'contacts',
      'communicationType',
      'isLoadingContacts',
      'currentContactsPage',
      'hasMoreContacts',
      'isLoadingMoreContacts'
    ])
  },

  methods: {
    ...mapActions('Einbox', [
      'setInboxes',
      'setIsLoadingInboxes',
      'setContacts',
      'appendContacts',
      'setIsLoadingContacts',
      'resetContacts',
      'setIsLoadingMoreContacts',
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
            this.resetContacts()
            await this.fetchContacts(inbox.id)
          } else {
            // Handle case when inbox ID from route is not found
            console.warn(`Inbox with ID ${routeInboxId} not found`)
            this.$router.replace({ name: 'EInbox' })
          }
        } else {
          // No inbox ID in route, set first inbox
          const firstInbox = this.inboxes[0]
          this.setActiveInbox(firstInbox.id)
          this.resetContacts()
          await this.fetchContacts(firstInbox.id)
          // Update route to reflect selected inbox
          this.$router.push(`/einbox/${firstInbox.id}`)
        }
      }
    },

    async fetchContacts (inboxId) {
      try {
        this.setIsLoadingContacts(true)
        const nextPage = 1
        const communicationType = this.communicationType

        const response = await talk2Api.V2.inbox.contacts.get({
          inboxId,
          page: nextPage,
          communicationType
        })

        this.setContacts(response.data)
      } catch (error) {
        console.error('Error fetching contacts:', error)
      } finally {
        this.setIsLoadingContacts(false)
      }
    },

    async loadMoreContacts (inboxId) {
      try {
        if (this.isLoadingMoreContacts || !this.hasMoreContacts) return

        this.setIsLoadingMoreContacts(true)
        const nextPage = this.currentContactsPage + 1
        const communicationType = this.communicationType

        const response = await talk2Api.V2.inbox.contacts.get({
          inboxId,
          page: nextPage,
          communicationType
        })

        this.appendContacts(response.data)
      } catch (error) {
        console.error('Error loading more contacts:', error)
      } finally {
        this.setIsLoadingMoreContacts(false)
      }
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
