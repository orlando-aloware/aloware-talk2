<template>
  <q-item :clickable="canUnparkCall"
          :disabled="dialer.call || isAgentOnCall"
          v-if="dialer && dialer.parkedCall"
          class="mr-3 pl-2 pr-2 parked-call cursor-pointer no-select"
          v-ripple
          @click="unparkCall">
    <q-item-section>
      <q-item-label class="_600">
        <span v-if="dialer.parkedCall.contact">{{ dialer.parkedCall.contact.name | truncate(15) }}</span>
        <q-skeleton type="text"
                    v-else>
        </q-skeleton>
      </q-item-label>
      <q-item-label class="call-status d-flex justify-content-between">
        <span>{{ phoneStatus }}</span>
        <span>{{ dialer.parkedCallTimer }}</span>
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <q-btn icon="img:app-icons/dialer/park-call.svg"
             size="22px"
             class="icon-btn auto-size height-22"
             padding="none"
             ripple
             rounded
             flat>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapState } from 'vuex'
import { agentMixin } from 'src/plugins/mixins'
import { AGENT_STATUS_ON_CALL } from 'src/constants/agent-status'

export default {
  name: 'parked-call',

  mixins: [
    agentMixin
  ],

  data () {
    return {
      AGENT_STATUS_ON_CALL
    }
  },

  computed: {
    ...mapState(['dialer']),

    phoneStatus () {
      if (!this.dialer.parkedCall) {
        return ''
      }

      return 'Unpark Call'
    },

    canUnparkCall () {
      return this.dialer?.parkedCall && !this.dialer.call && !this.isAgentOnCall
    }
  },

  methods: {
    unparkCall () {
      if (this.dialer.call) {
        return false
      }

      this.$VueEvent.fire('unparkCall')
    }
  }
}
</script>
