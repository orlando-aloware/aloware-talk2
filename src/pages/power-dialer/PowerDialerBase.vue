<template>
  <PowerDialerView
    :id="this.id"
    :name="name" />
</template>

<script>

import PowerDialerView from 'src/components/power-dialer/power-dialer-view'

export default {
  name: 'PowerDialerBase',
  components: {
    PowerDialerView
  },
  computed: {
    objId () {
      return this.$route
    },
    id () {
      if (this.$route.params.id) {
        if (this.$route.meta === 'Power Dialer' || this.$route.meta === 'Power Dialer Base Filter') {
          return this.$route.params.id
        } else {
          if (this.$route.params.filter) {
            return this.$route.params.filter
          }
          return 'in-queue'
        }
      }
      return 'in-queue'
    }
  },
  data () {
    return {
      name: 'Power Dialer X'
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
