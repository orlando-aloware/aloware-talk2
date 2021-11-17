<template>
  <PowerDialerView
    :id="id"
    :name="name" />
</template>

<script>

import PowerDialerView from 'src/components/power-dialer/power-dialer-view'
import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'PowerDialerBase',
  components: {
    PowerDialerView
  },
  computed: {
    ...mapGetters('powerDialer', [
      'activeFilter'
    ]),
    objId () {
      return this.$route
    },
    id () {
      return this.$route.params.id || 'all'
    }
  },
  async mounted () {
    await this.getMyQueueList()
  },
  data () {
    return {
      name: 'Power Dialer X'
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getMyQueueList'
    ]),
    ...mapMutations('powerDialer', [
      'SET_ACTIVE_FILTER'
    ])
  },
  watch: {
    '$route.params.id': function (id) {
      if (id) {
        if (this.$route.meta.title === 'Power Dialer' || (this.$route.meta.title === 'Power Dialer Base Filter' || this.$route.meta.title === 'Power Dialer Individual Advance')) {
          this.SET_ACTIVE_FILTER(this.$route.params.id)
        } else {
          if (this.$route.params.filter) {
            this.SET_ACTIVE_FILTER(this.$route.params.filter)
          } else {
            this.SET_ACTIVE_FILTER('in-queue')
          }
        }
      }
      // this.SET_ACTIVE_FILTER(this.$route.params.id)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
