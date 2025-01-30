import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  computed: {
    ...mapState('eInbox', [
      'isLoadingInboxes',
      'inboxes'
    ])
  },

  methods: {
    ...mapActions('eInbox', [
      'setInboxes',
      'setIsLoadingInboxes'
    ]),

    async fetchInboxes (page = 1) {
      try {
        this.setIsLoadingInboxes(true)
        const firstPage = await talk2Api.V2.inbox.inboxes.get({ page })
        this.setInboxes(firstPage.data.data)
      } catch (error) {
        console.error('Error fetching inboxes:', error)
      } finally {
        this.setIsLoadingInboxes(false)
      }
    }

    /* async loadMoreInboxes () {
      if (this.isLoadingInboxes || !this.hasMorePages) return

      this.isLoadingInboxes = true
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
