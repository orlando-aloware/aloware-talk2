import { mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
// import { DEFAULT_LIST_ITEMS } from 'src/constants/power-dialer/default-list-items'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  computed: {
    ...mapFields('powerDialer', [
      'activeMetrics'
    ])
  },
  methods: {
    ...mapActions('contacts', [
      'listLoaded',
      // 'contactsLoaded',
      'setCurrentListFilters',
      'resetSearch'
    ]),
    ...mapActions('powerDialer', [
      'setSelectedPDList'
    ]),
    async loadList (id) {
      console.log('Loading list...............')
      if (!id) {
        id = 'my-queue'
      }
      let stringId = String(id)

      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        stringId = 'my-queue'
      }

      if (!this.listItems[stringId]) {
        // this.contactsLoaded({
        //   id: stringId,
        //   ...DEFAULT_LIST_ITEMS
        // })
      }
      this.$axios
        .get('/api/v2/power-dialer-lists/' + stringId)
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: stringId })
          this.setSelectedPDList({ id: response.id, name: response.name, type: response.type })
          let filters = {
            contact_lists: {
              operator: 1,
              value: [stringId]
            }
          }
          this.setCurrentListFilters(filters)
          this.activeMetrics = response.session_metrics
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
          if (this.$route.name === 'Power Dialer') {
            this.$router.replace('/power-dialer/')
          }
        })
    }
  }
}
