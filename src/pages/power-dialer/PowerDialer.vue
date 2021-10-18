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
import { isEmpty } from 'lodash'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'

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
    ...mapGetters('powerDialer', [
      'isStartingDial',
      'powerDialerListItems',
      'currentList'
    ]),
    ...mapState(['currentRoute']),
    filterKeys () {
      let filterKeys = []
      let keys = DEFAULT_FILTER_LIST
      Object.keys(keys).forEach(f => {
        filterKeys.push(keys[f].id)
      })
      return filterKeys
    },
    isFilterKey () {
      if (this.filterKeys.includes(this.id)) {
        return false
      }
      return true
    }
  },
  async mounted () {
    this.RESET_LIST()
    this.START_DIAL_TOGGLE(false)
    // this.SET_POWER_DIALER_LIST([])
    await this.getPowerDialerLists()
    await this.initialize()
    // await this.fetchContacts()
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
      await this.initialize()
    }
  },
  data () {
    return {
      id: ''
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getPowerDialerLists',
      'getPowerDialerListItem'
    ]),
    ...mapMutations('powerDialer', [
      'START_DIAL_TOGGLE',
      'SET_POWER_DIALER_LIST',
      'RESET_LIST',
      'TOGGLE_TABLE_LOADER'
    ]),
    async fetchContacts () {
      this.TOGGLE_TABLE_LOADER(true)
      let params = {
        'page': 1,
        'per_page': 25,
        // 'filter_groups[0][filters][contact_lists][value][0]': this.$route.params.id,
        // 'filter_groups[0][filters][contact_lists][operator]': 1,
        // 'filter_groups[0][is_conjunction]': true,
        'order': 'desc'
      }
      console.log('this.id :>> ', this.id)
      console.log('this.powerDialerListItems :>> ', this.powerDialerListItems)
      console.log('this.powerDialerListItems[this.id] :>> ', this.powerDialerListItems[this.id])

      if (this.isFilterKey) {
        await this.getPowerDialerListItem(this.id)
      }

      if (this.powerDialerListItems[this.id] === undefined) {
        if (isEmpty(this.id)) {
          console.log('401 :>> ', 401)
          await this.processFetch(params)
        } else {
          console.log('402 :>> ', 402)
          console.log('ELSE is now an option...')
          await this.processFetch(params)
        }
        console.log('this.currentList :>> ', this.currentList)
      } else {
        console.log('403 :>> ', 403)
        await this.processFetch(params)
      }

      this.TOGGLE_TABLE_LOADER(false)
    },
    async initialize () {
      let route = this.$route.params
      if (!route.id && this.$route.name === 'Power Dialer') {
        route.id = 'in-queue'
        this.id = 'in-queue'
        await this.fetchContacts()
      } else if (route.id && this.$route.name === 'Power Dialer') {
        this.id = route.id
        // this.setData(id)
        await this.fetchContacts()
      }
    },
    resetValues () {
      // this.RESET_LIST()
      this.START_DIAL_TOGGLE(false)
      // this.SET_POWER_DIALER_LIST([])
    }
  }
}
</script>
