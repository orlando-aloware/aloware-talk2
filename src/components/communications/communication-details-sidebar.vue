<template>
  <b-sidebar right
             shadow
             no-header
             class="position-relative communication-details-sidebar"
             bg-variant="white"
             v-model="show">
    <communication-details verbose
                           mobile-view
                           :communication="communication" />

    <span class="position-absolute cursor-pointer"
          style="top: 16px; right: 16px;"
          @click="show = false">
      <close-icon icon-color="#62666E" />
      <q-tooltip>
        Close
      </q-tooltip>
    </span>
  </b-sidebar>
</template>

<script>
import CommunicationDetails from 'components/communication-details.vue'
import CloseIcon from 'components/icons/close-icon.vue'

export default {
  name: 'communications-details-sidebar',

  components: {
    CloseIcon,
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
