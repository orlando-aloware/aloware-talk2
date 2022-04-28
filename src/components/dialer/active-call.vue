<template>
  <q-item :class="[ sessionPaused ? 'bg-grey-7' : '', profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP ? 'wrap-up' : '' ]"
          class="mr-3 pl-2 pr-2 active-call cursor-pointer no-select"
          v-if="dialer && profile && ['MAKING_CALL', 'CALL_CONNECTED', 'HANGING_UP_CALL', 'CALL_DISCONNECTED', 'WRAP_UP'].includes(dialer.currentStatus)"
          clickable
          v-ripple
          :disabled="sessionPaused"
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
          <span>{{ activeCallPhoneNumber }}</span>
          <span class="ml-1 mr-1"
                v-if="activeCallPhoneNumber && (dialer.timer || dialer.wrapUpTimer)">
            ·
          </span>
          <span v-if="dialer.timer">{{ dialer.timer }}</span>
          <span v-else-if="dialer.wrapUpTimer">{{ dialer.wrapUpTimer }}</span>
        </template>
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <q-btn :disable="dialer.currentStatus === 'MAKING_CALL' || isHangingUp"
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

import { mapFields } from 'vuex-map-fields'
import { mapState } from 'vuex'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as AgentStatus from 'src/constants/agent-status'

export default {
  name: 'active-call',

  data () {
    return {
      isHangingUp: false,
      AgentStatus
    }
  },

  computed: {
    ...mapState('auth', ['profile']),
    ...mapState(['dialer']),
    ...mapFields('powerDialer', [
      'sessionPaused',
      'activeTask'
    ]),
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
    },
    dialerCurrentNumber () {
      if (this.dialer.currentNumber.includes('power_dialer')) {
        return this.activeTask.phone_number
      }
      return this.dialer.currentNumber
    },
    activeCallPhoneNumber () {
      if (this.dialer.communication) {
        return this.$options.filters.fixPhone(this.dialer.communication.lead_number)
      }

      if (this.dialer.currentNumber) {
        return this.$options.filters.fixPhone(this.dialerCurrentNumber)
      }

      if (this.dialer.parkedCall) {
        return this.$options.filters.fixPhone(this.dialer.parkedCall.lead_number)
      }

      if (this.dialer.call) {
        return this.$options.filters.fixPhone(this.dialer.call.from)
      }

      return ''
    }
  },

  methods: {
    hangupCall ($event) {
      this.isHangingUp = true
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
      if (this.$route.meta.id !== 'power-dialer-session') {
        this.$VueEvent.fire('togglePhone')
      }
      // this.$VueEvent.fire('togglePhone')
    }
  },
  watch: {
    'dialer.currentStatus': function (value) {
      if (value === 'MAKING_CALL') {
        this.isHangingUp = false
      }
    },
    'profile.agent_status': function (value) {
      if (value === AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
        this.isHangingUp = false
      }
    }
  }
}
</script>
