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

    <MoveDialog />
    <CreateListDialog />
    <RemoveListModal />
    <RemoveFolderDialog />

  </div>
</template>

<script>

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import PowerDialerSidebar from 'src/components/power-dialer/power-dialer-sidebar'
import MoveDialog from 'components/power-dialer/custom/move-dialog'
import CreateListDialog from 'components/power-dialer/custom/create-dialog'
import RemoveListModal from 'components/power-dialer/custom/remove-list'
import RemoveFolderDialog from 'components/power-dialer/custom/remove-folder'

export default {
  name: 'PowerDialer',
  components: {
    PowerDialerSidebar,
    MoveDialog,
    CreateListDialog,
    RemoveListModal,
    RemoveFolderDialog
  },
  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapGetters('powerDialer', ['isStartingDial']),
    ...mapState(['currentRoute'])
  },
  mounted () {
    this.START_DIAL_TOGGLE(false)
    // console.log('666 :>> ', this.isStartingDial)
  },
  beforeRouteUpdate (to, from, next) {
    console.log('445 :>> ', 445)
    if (to.meta !== 'Power Dialer Session') {
      this.START_DIAL_TOGGLE(false)
    }
    this.START_DIAL_TOGGLE(false)
    next()
  },
  watch: {
    'currentRoute': {
      handler () {
        console.log('object :>> ', this.currentRoute.name)
        if (this.currentRoute.name === 'Power Dialer') {
          this.RESET_LIST()
          this.START_DIAL_TOGGLE(false)
          this.SET_POWER_DIALER_LIST([])
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapActions('power-dialer', [
      'getPowerDialerList'
    ]),
    ...mapMutations('powerDialer', [
      'START_DIAL_TOGGLE',
      'SET_POWER_DIALER_LIST',
      'RESET_LIST'
    ]),
    async fetchAutoDialer () {
      await this.getPowerDialerList()
    }
  }
}
</script>
