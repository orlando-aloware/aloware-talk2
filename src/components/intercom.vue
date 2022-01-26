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
    ...mapState(['currentCompany']),
    ...mapState('auth', ['profile'])
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
      window.axios.get('/api/v1/profile/intercom-user-hash').then(response => {
        if (window.Intercom) {
          window.Intercom('boot', {
            alignment: 'right',
            app_id: process.env.INTERCOM_APP_ID,
            name: this.profile.name, // Current user name
            email: this.profile.email, // Current user email address
            user_id: this.profile.id, // Current user id
            user_hash: response.data, // Current user hash
            background_color: '#256eff',
            action_color: '#256eff'
          })
        }
      })
    }
  },

  beforeCreate () {

  },

  created () {
    if (this.profile) {
      this.setup()
    }

    // this.getStatics().then(() => {
    //   if ((this.statics && !this.statics.whitelabel) && this.currentCompany && !this.currentCompany.reseller_id && this.auth.user && this.auth.user.profile && process.env.APP_ENV === 'production') {
    //     this.setup()
    //   }
    // })
  },

  mounted () {
    if (!this.profile && window.Intercom) {
      window.Intercom('shutdown')
    }

    if (this.profile && window.Intercom) {
      this.setup()
    }
  },

  watch: {
    profile: function () {
      if (!this.profile && window.Intercom) {
        window.Intercom('shutdown')
      }

      if (this.profile && window.Intercom) {
        this.setup()
      }
    }
  }
}
</script>
