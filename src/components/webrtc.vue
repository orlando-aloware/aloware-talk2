<template>
  <div>
    <phone :is_widget='isWidget' @callCompleted="handleCallCompleted" />
    <dialer />
    <select-campaign-dialog :show="showSelectCampaignDialog"
                            :campaignId="campaignId"
                            @call="handleCall"
                            @change-campaign-id="handleChangeCampaignId" />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Dialer from 'components/dialer/dialer'
import Phone from 'components/dialer/phone'
import SelectCampaignDialog from 'components/dialer/select-campaign-dialog.vue'
import {
  aclMixin,
  agentMixin,
  broadcastMixin
} from 'src/boot/mixins'

export default {
  components: { Dialer, Phone, SelectCampaignDialog },

  mixins: [
    aclMixin,
    agentMixin,
    broadcastMixin
  ],

  props: {
    carrierName: {
      required: true,
      type: String
    },

    isWidget: {
      default: false,
      type: Boolean,
      required: false
    },

    campaignId: {
      type: Number,
      required: false
    }
  },

  data () {
    return {
      mainListeners: {},
      isMainEventsStarted: false,

      loadingDispositionStatuses: false,
      loadingCallDispositionStatuses: false,
      loadingActivityTypes: false,
      loadingTemplates: false,
      loadingCampaigns: false
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany',
      'timezones'
    ]),

    showSelectCampaignDialog () {
      return this.campaignId === null
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
      'updateUserStatus'
    ]),

    initAuth () {
      this.broadcastInit()

      this.getDispositionStatuses()
      this.getCallDispositions()
      this.getActivityTypes()
      this.getTemplates()
      this.getCampaigns()
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

    startMainEvents () {
      this.$VueEvent.listen('agent_status_updated', this.mainListeners.agentStatusUpdated)
    },

    stopMainEvents () {
      this.$VueEvent.stop('agent_status_updated', this.mainListeners.agentStatusUpdated)
    },

    unsubscribeFromPusher () {
      if (this.authenticated) {
        // just leave the channels
        this.broadcastLeave()
      }
    },

    handleChangeCampaignId (campaignId) {
      this.$emit('changeCampaignId', campaignId)
    },

    handleCall (campaignId) {
      this.$emit('handleCall')
    },

    handleCallCompleted () {
      this.$emit('callCompleted')
    }
  },

  created () {
    this.initAuth()

    this.mainListeners.agentStatusUpdated = (event) => { // Keyner
      this.updateUserStatus(event)

      if (this.currentCompany && event.company_id && event.company_id === this.currentCompany.id &&
        this.profile && event.user_id === this.profile.id && this.profile.agent_status !== event.agent_status) {
        this.setAgentStatus(event.agent_status)
        console.log('Changed agent status [event]: ', event.agent_status)
      }
    }

    if (!this.isMainEventsStarted) {
      this.isMainEventsStarted = true
      this.startMainEvents()
    }
  },

  mounted () {
    this.$VueEvent.fire('showLoadingPhone')
  },

  beforeDestroy () {
    this.stopMainEvents()
    this.unsubscribeFromPusher()
  }
}
</script>
