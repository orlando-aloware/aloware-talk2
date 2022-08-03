<template>
  <div class="mobile-parked-call d-flex phone-padding"
       v-if="hasCommunication">
    <div class="parked-call-content truncated-text">
      <div class="d-flex align-items-center">
        <park-call-icon width="19.38"
                        height="20.31"/>
      </div>
      <div class="truncated-text pr-2"
           v-if="communication.contact">
        {{ communication.contact.name }}
      </div>
      <!--q-item-label class="call-status d-flex justify-content-between">
        <span>{{ phoneStatus }}</span>
        <span>{{ dialer.parkedCallTimer }}</span>
      </q-item-label-->
    </div>
    <q-btn class="icon-btn auto-size text-size-lg-2 border-half-rounded"
           padding="none"
           ripple
           outline
           no-caps
           :loading="loadingUnpark"
           :disabled="loadingUnpark"
           @click="unparkCall">
      Unpark
    </q-btn>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import ParkCallIcon from 'components/icons/park-call-icon'

export default {
  name: 'mobile-parked-call',
  components: { ParkCallIcon },

  props: {
    communication: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      loadingUnpark: false
    }
  },

  computed: {
    ...mapState(['dialer']),

    hasCommunication () {
      return !_.isEmpty(this.communication)
    },

    phoneStatus () {
      if (!this.communication) {
        return ''
      }

      return 'Unpark Call'
    }
  },

  methods: {
    unparkCall () {
      if (!this.hasCommunication || this.dialer.call || this.loadingUnpark) {
        return false
      }

      this.loadingUnpark = true
      this.$VueEvent.fire('unparkCall', {
        id: this.communication.id,
        campaign_id: this.communication.campaign_id,
        contact: this.communication.contact,
        contact_id: this.communication.contact ? this.communication.contact.id : null
      })
    }
  }
}
</script>
