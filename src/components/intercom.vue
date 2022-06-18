<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'intercom',

  mixins: [aclMixin],

  data () {
    return {
      env: null,
      statics: null
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile', 'authenticated']),
    isProduction () {
      return process.env.APP_ENV === 'production'
    }
  },

  methods: {
    getStatics () {
      return window.axios.get('/get-statics').then(res => {
        this.statics = res.data
        return Promise.resolve(res.data)
      }).catch(err => {
        console.log(err)
        return Promise.reject(err)
      })
    },
    setup () {
      if (!this.authenticated) {
        return
      }
      window.axios.get('/api/v1/profile/intercom-user-hash').then(response => {
        if (window.Intercom) {
          window.Intercom('boot', {
            alignment: 'right',
            app_id: process.env.INTERCOM_APP_ID,
            name: this.profile.name, // Current user's name
            email: this.profile.email, // Current user email address
            user_id: this.profile.id, // Current user id
            user_hash: response.data, // Current user hash
            background_color: '#256eff',
            action_color: '#256eff',
            vertical_padding: 80
          })
        }
      })
    },
    launch () {
      if (this.profile && window.Intercom && this.isProduction) {
        this.setup()
      }
    },
    shutDown () {
      if (!this.profile && window.Intercom && this.isProduction) {
        window.Intercom('shutdown')
      }
    }
  },

  created () {
    if (this.authenticated) {
      this.getStatics().then(() => {
        if ((this.statics && !this.statics.whitelabel) && this.currentCompany && !this.currentCompany.reseller_id && this.profile && this.isProduction) {
          this.setup()
        }
      })
    }
  },

  mounted () {
    this.shutDown()
    if (this.authenticated) {
      this.launch()
    }
  },

  watch: {
    profile: function () {
      this.shutDown()
      this.launch()
    }
  },

  beforeDestroy () {
    this.shutDown()
  }
}
</script>
