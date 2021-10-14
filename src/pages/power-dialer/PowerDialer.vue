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
import powermixin from 'src/plugins/mixins/power-dialer'
// import { get } from 'lodash'

export default {
  name: 'PowerDialer',
  components: {
    PowerDialerSidebar,
    MoveDialog,
    CreateListDialog,
    RemoveListModal,
    RemoveFolderDialog
  },
  mixins: [powermixin],
  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapGetters('powerDialer', ['isStartingDial']),
    ...mapState(['currentRoute'])
  },
  async mounted () {
    this.RESET_LIST()
    this.START_DIAL_TOGGLE(false)
    // this.SET_POWER_DIALER_LIST([])
    await this.fetchContacts()
  },
  beforeRouteUpdate (to, from, next) {
    if (to.meta !== 'Power Dialer Session') {
      this.START_DIAL_TOGGLE(false)
    }
    this.START_DIAL_TOGGLE(false)
    next()
  },
  watch: {
    '$route.params': async function (route) {
      if (!route.id && this.$route.name === 'Power Dialer') {
        console.log('101 :>> ', 101)
        route.id = 'in-queue'
        this.id = 'in-queue'
        await this.fetchContacts()
      } else if (route.id && this.$route.name === 'Power Dialer') {
        console.log('102 :>> ', 102)
        this.id = route.id
        // this.setData(id)
        await this.fetchContacts()
      }
    }
  },
  data () {
    return {
      id: ''
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getPowerDialerList',
      'getContactResources'
    ]),
    ...mapMutations('powerDialer', [
      'START_DIAL_TOGGLE',
      'SET_POWER_DIALER_LIST',
      'RESET_LIST'
    ]),
    async fetchContacts () {
      let params = {
        'page': 1,
        'per_page': 25,
        'filter_groups[0][filters][contact_lists][value][0]': this.$route.params.id,
        'filter_groups[0][filters][contact_lists][operator]': 1,
        'filter_groups[0][is_conjunction]': true,
        'order': 'desc'
      }

      await this.getPowerDialerList()
      await this.processFetch(params)
      // await this.getContactResources({
      //   'page': 1,
      //   'per_page': 25,
      //   'filter_groups[0][filters][contact_lists][value][0]': this.$route.params.id,
      //   'filter_groups[0][filters][contact_lists][operator]': 1,
      //   'filter_groups[0][is_conjunction]': true,
      //   'order': 'desc'
      // })
    },
    resetValues () {
      // this.RESET_LIST()
      this.START_DIAL_TOGGLE(false)
      // this.SET_POWER_DIALER_LIST([])
    }
  }
}
</script>
