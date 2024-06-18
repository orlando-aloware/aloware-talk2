<template>
  <div>
    <phone :is_widget='isWidget' />
    <dialer />
  </div>
</template>

<script>
import Phone from 'components/dialer/phone'
import Dialer from 'components/dialer/dialer'

export default {
  components: { Phone, Dialer },

  props: {
    carrierName: {
      required: true,
      type: String
    },

    isWidget: {
      default: false,
      type: Boolean,
      required: false
    }
  },

  mounted () {
    this.$VueEvent.fire('showLoadingPhone')
  }
}
</script>
