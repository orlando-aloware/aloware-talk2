<template>
  <PowerDialerAddList
    :id="id"
    :name="name"
    :power-dialer-list="powerDialerList" />
</template>

<script>

import { mapGetters } from 'vuex'
import PowerDialerAddList from 'src/components/power-dialer/power-dialer-add-list-items'

export default {
  name: 'PowerDialerAddView',
  components: {
    PowerDialerAddList
  },
  computed: {
    ...mapGetters('powerDialer', ['powerDialerListItems']),
    powerDialerList () {
      return this.powerDialerListItems[String(this.$route.params.id)]
    },
    id () {
      return this.$route.params.id || 'all'
    },
    filter () {
      if (this.$route.params.id) {
        if (this.$route.meta === 'Power Dialer' || (this.$route.meta === 'Power Dialer Base Filter' || this.$route.meta === 'Power Dialer Individual Advance')) {
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
