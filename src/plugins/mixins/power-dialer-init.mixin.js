import { mapActions, mapMutations, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import { OPERATORS } from 'src/constants/contacts-filter-operators'

export default {
  computed: {
    ...mapFields('powerDialer', [
      'activeMetrics'
    ]),

    ...mapState('powerDialer', [
      'pdViewCancelToken',
      'pdViewSource'
    ]),

    isInPowerDialerList () {
      const routeTitle = this.$route?.meta?.title
      const routeName = this.$route.name

      return routeTitle === 'Power Dialer' && routeName === routeTitle
    }
  },

  methods: {
    ...mapActions('contacts', [
      'listLoaded',
      'setCurrentListFilters',
      'resetSearch'
    ]),

    ...mapActions('powerDialer', [
      'setSelectedPDList',
      'setPDListSource'
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
        let config = {}

        if (this.isInPowerDialerList) {
          this.pdViewSource.cancel('Loading of task list operation is canceled by the user.')
          this.setPDListSource(this.pdViewCancelToken.source())
          config.cancelToken = this.pdViewSource.token
        }

        Promise.all([
          this.$axios.get(`/api/v2/power-dialer-lists/${stringId}`, config),
          this.$axios.get(`/api/v2/power-dialer-lists/${stringId}/session-metrics`, config)
        ])
          .then(([listResponse, sessionMetricsResponse]) => {
            this.listLoaded({ ...listResponse.data, id: stringId })
            this.setSelectedPDList({
              id: listResponse.data.id,
              name: listResponse.data.name,
              type: listResponse.data.type
            })

            let filters = {
              contact_lists: {
                operator: OPERATORS.IS_ANY_OF,
                value: [stringId]
              }
            }

            this.setCurrentListFilters(filters)
            this.activeMetrics = sessionMetricsResponse.data.session_metrics

            if (this.isMyQueue) {
              this.SET_MY_QUEUE_LIST(listResponse.data)
            }
          })
          .catch(error => {
            if (window.axios.isCancel(error) && error) {
              console.log('Request canceled', error.message)
              return
            }

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
