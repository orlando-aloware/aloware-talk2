import { mapActions } from 'vuex'
import { DEFAULT_LIST_ITEMS } from 'src/constants/power-dialer/default-list-items'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  methods: {
    ...mapActions('contacts', [
      'listLoaded',
      'contactsLoaded',
      'setCurrentListFilters',
      'setSelectedList',
      'resetSearch'
    ]),
    async loadList (id) {
      if (!id) {
        id = 'my-queue'
      }

      let stringId = String(id)

      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        stringId = 'my-queue'
      }

      if (!this.listItems[stringId]) {
        this.contactsLoaded({
          id: stringId,
          ...DEFAULT_LIST_ITEMS
        })
      }

      this.$axios
        .get('/api/v2/power-dialer-lists/' + stringId)
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: stringId })
          this.setSelectedList({ id: response.id, name: response.name, type: response.type })
          let filters = {
            contact_lists: {
              operator: 1,
              value: [stringId]
            }
          }

          this.setCurrentListFilters(filters)
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
