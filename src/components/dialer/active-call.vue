<template>
  <q-item class="mr-3 pl-2 pr-2 active-call cursor-pointer no-select"
          clickable
          v-ripple
          :class="activeCallClass"
          :disabled="sessionPaused"
          v-if="showActiveCall"
          @click="togglePhone">
    <q-item-section>
      <q-item-label class="_600">
        <span v-if="dialer.contact">
          {{ getContactName(dialer.contact.name) }}
        </span>
        <span v-else-if="hasCustomParametersContactName">
          {{ getContactName(dialer.call.customParameters.ContactName) }}
        </span>
        <span v-else-if="hasCustomParametersNullContactName">
          No Name
        </span>
        <span v-else-if="hasParkedCallContact">
          {{ getContactName(dialer.parkedCall.contact.name) }}
        </span>
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
      <q-btn icon="img:app-icons/dialer/hangup_btn.svg"
             size="22px"
             class="icon-btn auto-size height-22"
             padding="none"
             ripple
             rounded
             flat
             :disable="isDisabledHangUpCallBtn"
             v-if="dialer.currentStatus !== 'WRAP_UP'"
             @click="hangupCall">
      </q-btn>
      <q-btn icon="img:app-icons/dialer/end_wrap_up.svg"
             size="22px"
             class="icon-btn auto-size height-22"
             padding="none"
             ripple
             rounded
             flat
             :disable="isDisabledEndWrapUpBtn"
             v-else
             @click="endWrapUp">
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script>
import { isEmpty } from 'lodash'
import { mapFields } from 'vuex-map-fields'
import { mapState } from 'vuex'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as AgentStatus from 'src/constants/agent-status'
import { dialerWrapUpMixin } from 'src/plugins/mixins'

export default {
  name: 'active-call',

  mixins: [dialerWrapUpMixin],

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

      if (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP ||
        this.dialer.currentStatus === 'WRAP_UP') {
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
      const number = this.dialer.currentNumber.includes('power_dialer') ? this.activeTask.phone_number : this.dialer.currentNumber

      if (/unhold:|barge:|whisper:|call:|hs:/.test(number)) {
        return ''
      }

      return number
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
    },

    hasCustomParametersContactName () {
      return this.dialer.call &&
        this.dialer.call.customParameters &&
        this.dialer.call.customParameters.ContactName &&
        this.dialer.call.customParameters.ContactName !== 'null null'
    },

    hasCustomParametersNullContactName () {
      return this.dialer.call &&
        this.dialer.call.customParameters &&
        this.dialer.call.customParameters.ContactName &&
        this.dialer.call.customParameters.ContactName === 'null null'
    },

    hasParkedCallContact () {
      return this.dialer.parkedCall &&
        this.dialer.parkedCall.contact
    },

    activeCallClass () {
      return [
        (this.sessionPaused ? 'bg-grey-7' : ''),
        (this.dialer.currentStatus === 'WRAP_UP' ? 'wrap-up' : '')
      ]
    },

    showActiveCall () {
      const statuses = [
        'MAKING_CALL',
        'CALL_CONNECTED',
        'HANGING_UP_CALL',
        'CALL_DISCONNECTED',
        'WRAP_UP'
      ]

      return this.dialer &&
        this.profile &&
        statuses.includes(this.dialer.currentStatus)
    },

    isDisabledHangUpCallBtn () {
      return this.dialer.currentStatus === 'MAKING_CALL' || this.isHangingUp
    },

    isDisabledEndWrapUpBtn () {
      return this.dialer.currentStatus !== 'WRAP_UP' || this.wrapUpPaused
    }
  },

  methods: {
    hangupCall ($event) {
      this.isHangingUp = true
      $event.stopPropagation()
      $event.preventDefault()

      alert('handup Call')
      console.log('########### Calling hangup call', this.dialer.currentStatus)
      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('endWrapUp')
      }

      console.log('hangupCall')
      this.$VueEvent.fire('hangupCall')
    },

    endWrapUp ($event) {
      $event.stopPropagation()
      $event.preventDefault()
      this.$VueEvent.fire('endWrapUp')
      this.$VueEvent.fire('endWrapUpPDSession')
    },

    togglePhone () {
      this.$VueEvent.fire('togglePhone')
    },

    getContactName (contactName) {
      if (!isEmpty(contactName.trim())) {
        return this.$options.filters.truncate(contactName, 15)
      }

      return 'No Name'
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
