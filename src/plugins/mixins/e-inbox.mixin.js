import { mapActions, mapState, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  computed: {
    ...mapState('eInbox', [
      'inboxes'
    ]),

    ...mapGetters('eInbox', [
      'getInboxesFirstPage'
    ])
  },

  methods: {
    ...mapActions('eInbox', [
      'setInboxesFirstPage'
    ]),

    async fetchInboxes (page = 1) {
      if (page !== 1) {
        this.inboxes = await talk2Api.V2.inbox.inboxes.get({ page }).then(res => res.data.data)
      }

      const inboxes = this.getInboxesFirstPage

      if (inboxes.length) {
        this.inboxes = inboxes
      }

      const firstPage = await talk2Api.V2.inbox.inboxes.get({ page })
      this.setInboxesFirstPage(firstPage.data.data)

      this.inboxes = this.getInboxesFirstPage
    }
  }
}
