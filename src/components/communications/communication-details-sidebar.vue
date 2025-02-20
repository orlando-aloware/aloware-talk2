<template>
  <b-sidebar right
             shadow
             no-header
             class="position-relative communication-details-sidebar"
             bg-variant="white"
             v-model="show">
    <communication-details closable
                           comm-type-as-header
                           verbose
                           mobile-view
                           :communication="communication"
                           @close="show = false" />
  </b-sidebar>
</template>

<script>
import CommunicationDetails from 'components/communication-details.vue'

export default {
  name: 'communications-details-sidebar',

  components: {
    CommunicationDetails
  },

  props: {
    value: {
      type: Boolean,
      default: false
    },

    communication: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      show: this.value
    }
  },

  watch: {
    value (val) {
      this.show = val
    },

    show (val) {
      this.$emit('input', val)
    }
  }
}
</script>
