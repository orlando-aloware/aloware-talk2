<template>
    <div>
      <phone is_widget/>
    </div>
</template>

<script>
import Phone from 'components/dialer/phone'

export default {
  components: { Phone },

  props: {
    carrier_name: {
      required: true,
      type: String
    },

    is_widget: {
      default: false,
      type: Boolean,
      required: false
    }
  },

  data () {
    return {}
  },
  mounted () {
    this.$VueEvent.fire('showLoadingPhone')
  }
}
</script>
