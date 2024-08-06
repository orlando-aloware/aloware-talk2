import { mapActions } from 'vuex'
import { aclMixin } from 'src/boot/mixins'

export default {
  mixins: [ aclMixin ],

  data () {
    return {
      loadingDispositionStatuses: false,
      loadingCallDispositionStatuses: false,
      loadingActivityTypes: false,
      loadingTemplates: false,
      loadingCampaigns: false,
      loadingRingGroups: false
    }
  },

  methods: {
    ...mapActions([
      'setDispositionStatuses',
      'setCallDispositions',
      'setActivityTypes',
      'setTemplates',
      'setCampaigns',
      'setCampaignsIsLoading',
      'setRingGroups',
      'setCampaignsIsLoading',
      'setUsers',
      'setUsersIsLoading'
    ]),

    getDispositionStatuses () {
      if (this.hasPermissionTo('list disposition status')) {
        this.loadingDispositionStatuses = true

        return this.$axios
          .get('/api/v1/disposition-status')
          .then((res) => {
            this.setDispositionStatuses(res.data)
            this.loadingDispositionStatuses = false

            return Promise.resolve()
          })
          .catch((err) => {
            console.log(err)
            this.loadingDispositionStatuses = false

            return Promise.reject()
          })
      }
    },

    getCallDispositions () {
      if (this.hasPermissionTo('list disposition status')) {
        this.loadingCallDispositionStatuses = true

        return this.$axios
          .get('/api/v1/call-disposition')
          .then((res) => {
            this.setCallDispositions(res.data)
            this.loadingCallDispositionStatuses = false

            return Promise.resolve()
          })
          .catch((err) => {
            console.log(err)
            this.loadingCallDispositionStatuses = false

            return Promise.reject()
          })
      }
    },

    getActivityTypes () {
      this.loadingActivityTypes = true
      return this.$axios
        .get('/api/v1/activity-types').then(res => {
          this.setActivityTypes(res.data)
          this.loadingActivityTypes = false

          return Promise.resolve()
        }).catch(err => {
          console.log(err)
          this.loadingActivityTypes = false

          return Promise.reject()
        })
    },

    getTemplates () {
      if (this.hasPermissionTo('list sms template')) {
        this.loadingTemplates = true

        return this.$axios.get('/api/v1/sms-template', {
          mode: 'no-cors'
        }).then(res => {
          this.loadingTemplates = false
          this.setTemplates(res.data)

          return Promise.resolve()
        }).catch(err => {
          console.log(err)
          this.loadingTemplates = false

          return Promise.reject()
        })
      }
    },

    getCampaigns () {
      if (this.hasPermissionTo('list campaign')) {
        this.loadingCampaigns = true

        return this.$axios
          .get('/api/v1/campaign', {
            mode: 'no-cors',
            params: {
              is_lite: true
            }
          })
          .then((res) => {
            this.setCampaigns(res.data)
            this.loadingCampaigns = false
            this.setCampaignsIsLoading(false)

            return Promise.resolve()
          })
          .catch((err) => {
            console.log(err)
            this.loadingCampaigns = false

            return Promise.reject()
          })
      }
    },

    getRingGroups () {
      if (this.hasPermissionTo('list ring group')) {
        this.loadingRingGroups = true

        return this.$axios
          .get('/api/v1/ring-group', {
            mode: 'no-cors'
          })
          .then((res) => {
            this.setRingGroups(res.data)
            this.loadingRingGroups = false

            return Promise.resolve()
          })
          .catch((err) => {
            console.log(err)
            this.loadingRingGroups = false

            return Promise.reject()
          })
      }
    },
    getUsers () {
      // This function is equal to the one on the MainLayout
      if (this.hasPermissionTo('list user')) {
        this.loadingUsers = true
        this.setUsersIsLoading(true)

        return this.$axios
          .get('/api/v2/users', {
            mode: 'no-cors'
          })
          .then((res) => {
            this.setUsers(res.data)
            this.loadingUsers = false
            this.setUsersIsLoading(false)
          })
          .catch((err) => {
            console.log(err)
            this.loadingUsers = false
          })
      }
    }
  }
}
