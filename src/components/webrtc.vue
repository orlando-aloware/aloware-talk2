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
  broadcastMixin,
  dialerDataMixin
} from 'src/boot/mixins'

export default {
  components: { Dialer, Phone, SelectCampaignDialog },

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
    return {}
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
      'updateUserStatus'
    ]),

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

  mounted () {
    this.$VueEvent.fire('showLoadingPhone')
  }
}
</script>
