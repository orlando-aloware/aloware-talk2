import { Platform } from 'quasar'
import auth from './../../boot/auth'
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      auth: auth,
      statics: {
        whitelabel: false,
        logo: null,
        logo_inverse: null,
        logo_square: null,
        logo_square_inverse: null,
        host: null,
        name: null
      },
      loadingWhitelabel: true,
      loading: false,
      title: 'Sign In'
    }
  },

  activated () {
    if (Platform.is.cordova) {
      this.setKeyboardResizeMode('native')
      this.setKeyboardScroll(true)
    }

    if (!Platform.is.cordova) {
      this.init()
      this.getStatics()
      this.setTitle()
    }
  },

  deactivated () {
    if (Platform.is.cordova) {
      this.setKeyboardScroll(false)
    }
  },

  methods: {
    getStatics () {
      this.loadingWhitelabel = true
      this.$axios.get('/get-statics')
        .then(res => {
          this.statics = res.data
          this.loadingWhitelabel = false
        })
        .catch(err => {
          console.log(err)
          this.loadingWhitelabel = false
        })
    },

    init () {
      if (this.$route.query.api_token && (!localStorage.getItem('api_token') || localStorage.getItem('api_token') !== this.$route.query.api_token)) {
        // document.body.className = 'd-none'
        this.loading = true
        // show fullscreen loading
        localStorage.setItem('api_token', this.$route.query.api_token)
        auth.check()
          .then((res) => {
            localStorage.setItem('company_id', res.data.user.company.id)
            this.setCurrentCompany(res.data.user.company)
            this.resetVuex()
            this.$router.push(this.$route.query.redirect || '/').catch((err) => {
              console.log(err)
            })
          })
          .catch((err) => {
            console.log('Error: api key is not valid', err)
            // hide fullscreen loading
            this.loading = false
          })
      }
    },

    setTitle () {
      this.$axios.get('/get-statics')
        .then(res => {
          let name = res.data.name
          document.title = this.title + ' | ' + name + ' Talk'
        })
        .catch(err => {
          document.title = this.title + ' | Aloware Talk'
          console.log(err)
        })
    },

    fixAssets (asset) {
      if (asset) {
        return asset.replace('assets/images/', 'statics/').replace('/statics/', '/')
      }
    },

    ...mapActions(['setCurrentCompany', 'resetVuex', 'setKeyboardScroll', 'setKeyboardResizeMode'])
  },

  beforeRouteEnter (to, from, next) {
    if (Platform.is.cordova) {
      return next()
    }

    auth.check()
      .then(() => {
        next({ name: 'Inbox' })
      })
      .catch(() => {
        next()
      })
  }
}
