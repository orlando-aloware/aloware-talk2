<template>
  <PowerDialerView
    :id="this.id"
    :name="name" />
</template>

<script>

import PowerDialerView from 'src/components/power-dialer/power-dialer-view'

export default {
  name: 'PowerDialerViewAll',
  components: {
    PowerDialerView
  },
  computed: {
    objId () {
      return this.$route
    },
    id () {
      if (this.$route.params.id) {
        return this.$route.params.id
      }
      return 'in-queue'
    }
  },
  data () {
    return {
      name: 'Power Dialer X'
    }
  },
  watch: {
    '$route.params.id': function (id) {
      if (!id && this.$route.name === 'Power Dialer') {
        id = 'in-queue'
      }
      if (id && this.$route.name === 'Power Dialer') {
        // console.log('id :>> ', id)
        // this.setData(id)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
