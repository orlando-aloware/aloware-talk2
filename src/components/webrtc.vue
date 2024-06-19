<template>
  <div>
    <phone :is_widget='isWidget' />
    <dialer />
  </div>
</template>

<script>
import Phone from 'components/dialer/phone'
import Dialer from 'components/dialer/dialer'
import { mapActions } from 'vuex'
import { aclMixin } from 'src/boot/mixins'

export default {
  components: { Phone, Dialer },

  mixins: [ aclMixin ],

  props: {
    carrierName: {
      required: true,
      type: String
    },

    isWidget: {
      default: false,
      type: Boolean,
      required: false
    }
  },

  data () {
    return {
      loadingDispositionStatuses: false,
      loadingCallDispositionStatuses: false,
      loadingActivityTypes: false,
      loadingTemplates: false
    }
  },

  methods: {
    initAuth () {
      this.getDispositionStatuses()
      this.getCallDispositions()
      this.getActivityTypes()
      this.getTemplates()
    },

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

    ...mapActions(['setDispositionStatuses', 'setCallDispositions', 'setActivityTypes', 'setTemplates'])
  },

  created () {
    this.initAuth()
  },

  mounted () {
    this.$VueEvent.fire('showLoadingPhone')
  }
}
</script>
