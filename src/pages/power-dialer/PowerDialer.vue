<template>
  <div
    v-if="authenticated"
    class="row mx-0 content-row d-flex overflow-hidden h-100">
    <div
      v-if="!isStartingDial"
      class="col-2 pt-0 pl-0 pr-0 mb-0 h-100 bordered-right">
      <PowerDialerSidebar />
    </div>
    <div :class="`${isStartingDial ? 'col-12' : 'col-10 main'} px-0 pr-1 mb-0`">
      <!-- Router Here -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'
import PowerDialerSidebar from 'src/components/power-dialer/power-dialer-sidebar'

export default {
  name: 'PowerDialer',
  components: {
    PowerDialerSidebar
  },
  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapGetters('powerDialer', ['isStartingDial'])
  },
  mounted () {
    this.START_DIAL_TOGGLE(false)
  },
  beforeRouteUpdate (to, from, next) {
    console.log('to :>> ', to)
    console.log('from :>> ', from)
    if (to.meta !== 'Power Dialer Session') {
      this.START_DIAL_TOGGLE(false)
    }
    next()
  },
  methods: {
    ...mapActions('power-dialer', [
      'getPowerDialerList'
    ]),
    ...mapMutations('powerDialer', [
      'START_DIAL_TOGGLE'
    ]),
    async fetchAutoDialer () {
      await this.getPowerDialerList()
    }
  }
}
</script>
