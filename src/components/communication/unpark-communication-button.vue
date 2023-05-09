<template>
  <span class="cursor-pointer"
        v-if="canUnparkCommunication(communication)"
        @click="unpark">
    <check-o-icon height="22"
                  width="22"/>
    <q-tooltip>
      Unpark
    </q-tooltip>
  </span>
</template>

<script>
import CheckOIcon from 'src/components/icons/check-o-icon.vue'
import { aclMixin, agentMixin, communicationMixin } from 'src/plugins/mixins'

export default {
  name: 'unpark-communication-button',

  mixins: [
    aclMixin,
    agentMixin,
    communicationMixin
  ],

  components: {
    CheckOIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
    }
  },

  methods: {
    unpark () {
      this.$VueEvent.fire('make_new_call', {
        phone_number: 'unhold:' + this.communication.id
      })
    }
  }
}
</script>
