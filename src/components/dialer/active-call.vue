<template>
  <q-item class="mr-3 pl-2 pr-2 active-call"
          v-if="dialer && ['MAKING_CALL', 'CALL_CONNECTED', 'HANGING_UP_CALL', 'CALL_DISCONNECTED'].includes(dialer.currentStatus)">
    <q-item-section>
      <q-item-label class="_600">
        <span v-if="dialer.contact">{{ dialer.contact.name | truncate(15) }}</span>
        <span v-else-if="dialer.call && dialer.call.customParameters && dialer.call.customParameters.ContactName">{{ dialer.call.customParameters.ContactName | truncate(15) }}</span>
        <span v-else-if="dialer.onHoldCall && dialer.onHoldCall.contact">{{ dialer.onHoldCall.contact.name | truncate(15) }}</span>
        <q-skeleton type="text"
                    v-else>
        </q-skeleton>
      </q-item-label>
      <q-item-label class="call-status">
        <template v-if="dialer.currentStatus !== 'MAKING_CALL'">
          <span v-if="dialer.communication">{{ dialer.communication.lead_number | fixPhone }}</span>
          <span v-else-if="dialer.currentNumber">{{ dialer.currentNumber | fixPhone }}</span>
          <span v-else-if="dialer.onHoldCall">{{ dialer.onHoldCall.lead_number | fixPhone }}</span>
          <span v-else-if="dialer.call">{{ dialer.call.from | fixPhone }}</span>
          <span class="ml-1 mr-1"
                v-if="dialer.timer || dialer.wrapUpTimer">
            ·
          </span>
          <span v-if="dialer.timer">{{ dialer.timer }}</span>
          <span v-else-if="dialer.wrapUpTimer">{{ dialer.wrapUpTimer }}</span>
        </template>
        <template v-else>
          <span>Dialing...</span>
        </template>
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <q-btn :disable="dialer.currentStatus === 'MAKING_CALL'"
             icon="img:app-icons/dialer/hangup_btn.svg"
             size="22px"
             class="icon-btn auto-size height-22"
             padding="none"
             ripple
             rounded
             flat
             @click="hangupCall">
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'active-call',

  computed: {
    ...mapState(['dialer'])
  },

  methods: {
    hangupCall () {
      this.$VueEvent.fire('hangupCall')
    }
  }
}
</script>
