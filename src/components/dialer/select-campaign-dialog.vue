<template>
  <q-dialog content-class="select-campaign-dialog"
            position="bottom"
            persistent
            v-model="visible">
    <q-card class="card">
      <div class="label">Select a Line</div>
      <div class="d-flex">
        <line-selector class="line-selector"
                       specificClass="inline-select"
                       label="Select a Line"
                       placeholder="Select a Line"
                       rounded
                       behavior="menu"
                       :generic-multiselect="false"
                       v-model="campaignId"
                       @change="changeCampaignId">
        </line-selector>

        <div>
          <q-btn color="primary"
                rounded
                :disabled="!campaignId || isAgentOnCall"
                @click="onCallClick">
            Call
          </q-btn>
          <q-tooltip v-if="isAgentOnCall">
            There is a call in progress on another device.
          </q-tooltip>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import * as AgentStatus from 'src/constants/agent-status'
import LineSelector from 'components/generic-selectors/line-selector'

export default {
  name: 'SelectCampaignDialog',

  components: {
    LineSelector
  },

  props: {
    show: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      visible: false,
      position: 'top',
      campaignId: null
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),

    isAgentOnCall () {
      return this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL
    }
  },

  watch: {
    show (val) {
      if (!this.isAgentOnCall) {
        this.visible = val
      }

      this.campaignId = null
    }
  },

  mounted () {
    this.visible = this.show
  },

  methods: {
    open () {
      this.show = true
    },

    changeCampaignId (campaignId) {
      this.campaignId = campaignId
    },

    onCallClick () {
      this.$emit('change-campaign-id', this.campaignId)

      this.$emit('call', this.campaignId)
      this.visible = false
    }
  }
}
</script>
