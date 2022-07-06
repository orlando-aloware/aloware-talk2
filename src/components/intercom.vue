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
      statics: null,
      app_id: process.env.INTERCOM_APP_ID
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile', 'authenticated'])
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
            app_id: this.app_id,
            name: this.profile.name, // Current user's name
            email: this.profile.email, // Current user email address
            user_id: this.profile.id, // Current user id
            user_hash: response.data, // Current user hash
            background_color: '#15163f',
            action_color: '#15163f',
            vertical_padding: 10
          })
        }
      })
    }
  },

  created () {
    this.getStatics().then(() => {
      if (!this.hasReporterAccess &&
        (this.statics && !this.statics.whitelabel) &&
        this.currentCompany &&
        !this.currentCompany.reseller_id &&
        this.profile &&
        process.env.APP_ENV !== 'local') {
        this.setup()
      }
    })
  }
}
</script>
