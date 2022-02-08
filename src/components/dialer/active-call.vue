<template>
  <q-item :class="[ profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP ? 'wrap-up' : '' ]"
          class="mr-3 pl-2 pr-2 active-call cursor-pointer no-select"
          v-if="dialer && profile && ['MAKING_CALL', 'CALL_CONNECTED', 'HANGING_UP_CALL', 'CALL_DISCONNECTED', 'WRAP_UP'].includes(dialer.currentStatus)"
          clickable
          v-ripple
          @click="togglePhone">
    <q-item-section>
      <q-item-label class="_600">
        <span v-if="dialer.contact">{{ dialer.contact.name | truncate(15) }}</span>
        <span v-else-if="dialer.call && dialer.call.customParameters && dialer.call.customParameters.ContactName">{{ dialer.call.customParameters.ContactName | truncate(15) }}</span>
        <span v-else-if="dialer.parkedCall && dialer.parkedCall.contact">{{ dialer.parkedCall.contact.name | truncate(15) }}</span>
        <q-skeleton type="text"
                    v-else>
        </q-skeleton>
      </q-item-label>
      <q-item-label class="call-status">
        <template v-if="phoneStatus">
          <span>{{ phoneStatus }}</span>
        </template>
        <template v-else>
          <span v-if="dialer.communication">{{ dialer.communication.lead_number | fixPhone }}</span>
          <span v-else-if="dialer.currentNumber">{{ dialer.currentNumber | fixPhone }}</span>
          <span v-else-if="dialer.parkedCall">{{ dialer.parkedCall.lead_number | fixPhone }}</span>
          <span v-else-if="dialer.call">{{ dialer.call.from | fixPhone }}</span>
          <span class="ml-1 mr-1"
                v-if="dialer.timer || dialer.wrapUpTimer">
            ·
          </span>
          <span v-if="dialer.timer">{{ dialer.timer }}</span>
          <span v-else-if="dialer.wrapUpTimer">{{ dialer.wrapUpTimer }}</span>
        </template>
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <q-btn :disable="dialer.currentStatus === 'MAKING_CALL'"
             v-if="profile.agent_status !== AgentStatus.AGENT_STATUS_ON_WRAP_UP"
             icon="img:app-icons/dialer/hangup_btn.svg"
             size="22px"
             class="icon-btn auto-size height-22"
             padding="none"
             ripple
             rounded
             flat
             @click="hangupCall">
      </q-btn>
      <q-btn :disable="dialer.currentStatus !== 'WRAP_UP'"
             v-else
             icon="img:app-icons/dialer/end_wrap_up.svg"
             size="22px"
             class="icon-btn auto-size height-22"
             padding="none"
             ripple
             rounded
             flat
             @click="endWrapUp">
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapState } from 'vuex'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as AgentStatus from 'src/constants/agent-status'

export default {
  name: 'active-call',

  data () {
    return {
      AgentStatus
    }
  },

  computed: {
    ...mapState('auth', ['profile']),
    ...mapState(['dialer']),

    phoneStatus () {
      if (!this.dialer.communication) {
        return ''
      }

      if (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
        return 'Wrapping Up'
      }

      switch (this.dialer.communication.current_status2) {
        case CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW:
          return 'Calling...'
        default:
          return ''
      }
    }
  },

  methods: {
    hangupCall ($event) {
      $event.stopPropagation()
      $event.preventDefault()
      this.$VueEvent.fire('hangupCall')
    },

    endWrapUp ($event) {
      $event.stopPropagation()
      $event.preventDefault()
      this.$VueEvent.fire('endWrapUp')
    },

    togglePhone () {
      if (this.$route.name !== 'Power Dialer') {
        this.$VueEvent.fire('togglePhone')
      }
      // this.$VueEvent.fire('togglePhone')
    }
  }
}
</script>
