import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  computed: {
    ...mapState('eInbox', [
      'isLoadingInboxes',
      'inboxes',
      'currentInboxesPage',
      'hasMoreInboxes',
      'communications',
      'communicationType',
      'isLoadingCommunications',
      'currentCommunicationsPage',
      'hasMoreCommunications',
      'isLoadingMoreCommunications'
    ])
  },

  methods: {
    ...mapActions('eInbox', [
      'setInboxes',
      'setIsLoadingInboxes',
      'setCommunications',
      'appendCommunications',
      'setIsLoadingCommunications',
      'resetCommunications',
      'setIsLoadingMoreCommunications'
    ]),

    async fetchInboxes () {
      try {
        this.setIsLoadingInboxes(true)
        const nextPage = 1

        const response = await talk2Api.V2.inbox.inboxes.get({ page: nextPage })
        this.setInboxes(response.data)
      } catch (error) {
        console.error('Error fetching inboxes:', error)
      } finally {
        this.setIsLoadingInboxes(false)
      }
    },

    async fetchCommunications (inboxId) {
      try {
        this.setIsLoadingCommunications(true)
        const nextPage = 1
        const communicationType = this.communicationType

        const response = await talk2Api.V2.inbox.communications.get({
          inboxId,
          page: nextPage,
          communicationType
        })
        console.log('response', response)
        this.setCommunications(response.data)
      } catch (error) {
        console.error('Error fetching communications:', error)
      } finally {
        this.setIsLoadingCommunications(false)
      }
    },

    async loadMoreCommunications (inboxId) {
      try {
        if (this.isLoadingMoreCommunications || !this.hasMoreCommunications) return

        this.setIsLoadingMoreCommunications(true)
        const nextPage = this.currentCommunicationsPage + 1
        const communicationType = this.communicationType

        const response = await talk2Api.V2.inbox.communications.get({
          inboxId,
          page: nextPage,
          communicationType
        })

        this.appendCommunications(response.data)
      } catch (error) {
        console.error('Error loading more communications:', error)
      } finally {
        this.setIsLoadingMoreCommunications(false)
      }
    }

    /* async loadMoreInboxes () {
      if (this.isLoadingInboxes || !this.hasMorePages) return

      this.setIsLoadingInboxes(true)
      try {
        const nextPage = this.currentPage + 1
        const response = await talk2Api.V2.inbox.inboxes.get({
          page: nextPage,
          per_page: this.perPage
        })

        const newInboxes = response.data.data

        if (newInboxes.length) {
          if (nextPage === 1) {
            this.setInboxesFirstPage(newInboxes)
          } else {
            this.setInboxesFirstPage([...this.inboxes, ...newInboxes])
          }
          this.currentPage = nextPage

          this.hasMorePages = newInboxes.length === this.perPage
        } else {
          this.hasMorePages = false
        }
      } catch (error) {
        console.error('Error loading inboxes:', error)
      } finally {
        this.isLoadingInboxes = false
      }
    }, */
  }
}
