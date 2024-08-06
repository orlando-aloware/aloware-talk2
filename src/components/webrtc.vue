<template>
  <div>
    <phone :is_widget='isWidget'
           @callCompleted="handleCallCompleted" />

    <dialer />

    <div
      class="p-3"
      v-if="dialer.parkedCall"
    >
      <parked-call />
    </div>

    <select-campaign-dialog
      v-else
      :show="showSelectCampaignDialog"
      :campaignId="campaignId"
      @call="handleCall"
      @change-campaign-id="handleChangeCampaignId"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import Dialer from 'components/dialer/dialer'
import Phone from 'components/dialer/phone'
import SelectCampaignDialog from 'components/dialer/select-campaign-dialog.vue'
import {
  aclMixin,
  agentMixin,
  broadcastMixin,
  dialerDataMixin
} from 'src/boot/mixins'
import ParkedCall from 'components/dialer/parked-call.vue'

export default {
  components: { ParkedCall, Dialer, Phone, SelectCampaignDialog },

  mixins: [
    aclMixin,
    agentMixin,
    broadcastMixin,
    dialerDataMixin
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
      isMainEventsStarted: false
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany',
      'timezones'
    ]),

    ...mapState(['dialer']),

    ...mapGetters('auth', ['profile']),

    showSelectCampaignDialog () {
      const isCallInProgress = ['CALL_CONNECTED', 'WRAP_UP', 'MAKING_CALL']
      return this.campaignId === null && !isCallInProgress.includes(this.dialer.currentStatus)
    }
  },

  methods: {
    ...mapActions([
      'updateUserStatus'
    ]),

    ...mapActions('auth', ['setAgentStatus']),

    initAuth () {
      this.broadcastInit()

      this.getDispositionStatuses()
      this.getCallDispositions()
      this.getActivityTypes()
      this.getTemplates()
      this.getCampaigns()
    },

    startMainEvents () {
      this.$VueEvent.listen('agent_status_updated', this.mainListeners.agentStatusUpdated)
    },

    stopMainEvents () {
      this.$VueEvent.stop('agent_status_updated', this.mainListeners.agentStatusUpdated)
    },

    unsubscribeFromPusher () {
      if (this.authenticated) {
        this.broadcastLeave()
      }
    },

    handleChangeCampaignId (campaignId) {
      this.$emit('changeCampaignId', campaignId)
    },

    handleCall (campaignId) {
      this.$emit('handleCall', true)
    },

    handleCallCompleted () {
      this.$emit('callCompleted')
    }
  },

  created () {
    this.initAuth()

    this.mainListeners.agentStatusUpdated = (event) => {
      this.updateUserStatus(event)

      if (
        this.currentCompany?.id === event.company_id &&
        this.profile?.id === event.user_id &&
        this.profile.agent_status !== event.agent_status
      ) {
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
