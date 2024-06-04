<template>
  <div>
    <phone :is_widget='isWidget' />
  </div>
</template>

<script>
import Phone from 'components/dialer/phone'

export default {
  components: { Phone },

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
