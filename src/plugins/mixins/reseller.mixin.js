import store from 'src/store'
import talk2Api from 'src/plugins/api/api'
import { get } from 'lodash'

export default {
  data () {
    return {
      source: null,
      loading: false
    }
  },

  methods: {
    getIntegration (integration, params = {}) {
      this.loading = true
      switch (integration) {
        case 'messenger':
          talk2Api.V1.integrations.simpsocial.messenger.get()
            .then(res => {
              this.source = res.data.source
              this.loading = false
            })
            .catch(err => {
              console.log(err)
              this.loading = false
              this.$handleErrors(err.response)
            })
          break
        case 'dms-equity':
          talk2Api.V1.integrations.simpsocial.dmsEquity.get()
            .then(res => {
              this.source = res.data.source
              this.loading = false
            })
            .catch(err => {
              console.log(err)
              this.loading = false
              this.$handleErrors(err.response)
            })
          break
        case 'digital-lead-war':
          talk2Api.V1.integrations.simpsocial.digitalLeadWar.get()
            .then(res => {
              this.source = res.data.source
              this.loading = false
            })
            .catch(err => {
              console.log(err)
              this.loading = false
              this.$handleErrors(err.response)
            })
          break
        case 'email-blast':
          talk2Api.V1.integrations.simpsocial.emailBlast.get()
            .then(res => {
              const contactId = get(params, 'contactId', null)
              this.source = this.getUrl(get(res.data, 'source', ''), contactId)
              this.loading = false
            })
            .catch(err => {
              console.log(err)
              this.loading = false
              this.$handleErrors(err.response)
            })
          break
      }
    },

    getUrl (baseUrl, contactId) {
      if (baseUrl === '') {
        return baseUrl
      }

      let url = new URL(baseUrl)

      if (contactId) {
        url.searchParams.append('contact_id', contactId.toString())
      }

      return url.href
    }
  },

  beforeRouteEnter (to, from, next) {
    store().dispatch('auth/check', { preventLogout: false, preventRedirect: true })
      .then((response) => {
        if (response.data.user.is_reseller) {
          next({ path: '/' })
          return
        }

        next()
      }).catch(() => {
        next()
      })
  }
}
