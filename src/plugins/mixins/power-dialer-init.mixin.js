import { mapActions, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'
// import { DEFAULT_LIST_ITEMS } from 'src/constants/power-dialer/default-list-items'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import { OPERATORS } from 'src/constants/contacts-filter-operators'

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
    ...mapMutations('powerDialer', [
      'SET_MY_QUEUE_LIST'
    ]),
    async loadList (id) {
      if (!id) {
        id = 'my-queue'
      }
      let route = this.$route.meta.id
      let stringId = String(id)

      if (route === 'power-dialer-queue-filter') {
        stringId = 'my-queue'
      }

      if (route) {
        this.$axios
          .get('/api/v2/power-dialer-lists/' + stringId)
          .then((response) => response.data)
          .then((response) => {
            this.listLoaded({ ...response, id: stringId })
            this.setSelectedPDList({ id: response.id, name: response.name, type: response.type })
            let filters = {
              contact_lists: {
                operator: OPERATORS.IS_ANY_OF,
                value: [stringId]
              }
            }
            this.setCurrentListFilters(filters)
            this.activeMetrics = response.session_metrics
            if (this.isMyQueue) {
              this.SET_MY_QUEUE_LIST(response)
            }
          })
          .catch((error) => {
            const { message, html } = extractErrorMessage(error)
            console.log(html)
            this.$generalNotification(message, 'error')

            // if page is not in power dialer page root (My Queue), navigate to it
            if (this.$route.name === 'Power Dialer' &&
              this.$route.meta.id !== 'power-dialer-queue-filter') {
              this.$router.replace('/power-dialer/')
            }
          })
      }
    }
  }
}
