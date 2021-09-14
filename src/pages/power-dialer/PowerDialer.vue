<template>
  <div class="row mx-0 content-row d-flex overflow-hidden h-100"
       v-if="authenticated">
    <div class="col-2 pt-0 pl-0 pr-0 mb-0 h-100 bordered-right">
      <PowerDialerSidebar />
    </div>
    <div class="col-10 px-0 pr-1 mb-0 main">
      <!-- Router Here -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import PowerDialerSidebar from 'src/components/power-dialer/power-dialer-sidebar'

export default {
  name: 'PowerDialer',
  components: {
    PowerDialerSidebar
  },
  computed: {
    ...mapGetters('auth', ['authenticated'])
  },
  methods: {
    ...mapActions('power-dialer', [
      'getPowerDialerList'
    ]),
    async fetchAutoDialer () {
      await this.getPowerDialerList()
    }
  }
}
</script>
