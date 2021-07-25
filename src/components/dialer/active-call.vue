<template>
  <q-item class="mr-3 pl-2 pr-2 active-call"
          v-if="dialer && dialer.call && ['CALL_CONNECTED', 'CALL_DISCONNECTED'].includes(dialer.currentStatus)">
    <q-item-section>
      <q-item-label class="_600">
        <span v-if="dialer.contact">{{ dialer.contact.name | truncate(15) }}</span>
        <span v-else-if="dialer.onHoldCall && dialer.onHoldCall.contact">{{ dialer.onHoldCall.contact.name | truncate(15) }}</span>
      </q-item-label>
      <q-item-label class="call-status">
        <span v-if="dialer.communication">{{ dialer.communication.lead_number | fixPhone }}</span>
        <span v-else-if="dialer.currentNumber">{{ dialer.currentNumber | fixPhone }}</span>
        <span v-else-if="dialer.onHoldCall">{{ dialer.onHoldCall.lead_number | fixPhone }}</span>
        <span v-else>{{ dialer.call.from | fixPhone }}</span>
        <span>·</span>
        <span v-if="dialer.timer">{{ dialer.timer }}</span>
        <span v-if="dialer.wrapUpTimer">{{ dialer.wrapUpTimer }}</span>
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <cancel-call-icon role="button"
                        @click="hangupCall">
      </cancel-call-icon>
    </q-item-section>
  </q-item>
</template>

<script>
import CancelCallIcon from 'components/icons/cancel-call-icon'
import { mapState } from 'vuex'

export default {
  name: 'active-call',

  components: { CancelCallIcon },

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
