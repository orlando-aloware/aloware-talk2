import { mapActions, mapState } from 'vuex'
import store from '../../store'
import * as storage from 'src/plugins/helpers/storage'
import { get } from 'lodash'

export default {
  data () {
    return {
      loading: false,
      title: 'Sign In'
    }
  },

  activated () {
    this.init()
    this.setTitle()
  },

  computed: {
    ...mapState(['statics', 'staticsLoaded'])
  },

  methods: {
    init () {
      if (this.$route.query.api_token && (!storage.local.getItem('api_token') || storage.local.getItem('api_token') !== this.$route.query.api_token)) {
        // document.body.className = 'd-none'
        this.loading = true
        // show fullscreen loading
        storage.local.setItem('api_token', this.$route.query.api_token)
        this.check().then((res) => {
          storage.local.setItem('company_id', res.data.user.company.id)
          this.resetVuex(['all'])
          this.setCurrentCompany(res.data.user.company)
          this.$router.push(this.$route.query.redirect || '/').catch((err) => {
            console.log(err)
          })
        }).catch((err) => {
          console.log('Error: api key is not valid', err)
          // hide fullscreen loading
          this.loading = false
        })
      }
    },

    setTitle () {
      let title = get(this.statics, 'name', '')

      if (!title) {
        const statics = JSON.parse(storage.local.getItem('statics'))
        let staticName = get(statics, 'name', '')
        title = staticName ?? ''
      }

      title = title ? `${title} ` : title

      document.title = `${this.title} - ${title}Talk`
    },

    fixAssets (asset) {
      if (asset) {
        return asset.replace('assets/images/', 'statics/').replace('/statics/', '/')
      }
    },

    ...mapActions('cache', ['setCurrentCompany']),

    ...mapActions(['resetVuex']),

    ...mapActions('auth', ['check'])
  },

  watch: {
    staticsLoaded (newValue) {
      if (newValue) {
        this.setTitle()
      }
    }
  },

  beforeRouteEnter (to, from, next) {
    store().dispatch('auth/check').then(() => {
      next({ name: 'Inbox' })
    }).catch(() => {
      next()
    })
  }
}
