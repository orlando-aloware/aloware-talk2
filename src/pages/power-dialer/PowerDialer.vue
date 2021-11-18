<template>
  <div
    v-if="authenticated"
    class="row mx-0 content-row d-flex overflow-hidden h-100">

    <div
      v-show="!isStartingDial"
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
    <RemoveFolderDialog
      :is-contact-module-type="false" />

  </div>
</template>

<script>

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import PowerDialerSidebar from 'src/components/power-dialer/power-dialer-sidebar'
import MoveDialog from 'components/power-dialer/custom/move-dialog'
import CreateListDialog from 'components/power-dialer/custom/create-dialog'
import RemoveListModal from 'components/power-dialer/custom/remove-list'
import RemoveFolderDialog from 'components/remove-folder.vue'
import powermixin from 'src/plugins/mixins/power-dialer'
import { isEmpty } from 'lodash'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import { DEFAULT_LIST_ITEMS } from 'src/constants/power-dialer/default-list-items'

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
      'currentList'
    ]),
    ...mapGetters('contacts', [
      'listItems',
      'lists'
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
    } else {
      this.START_DIAL_TOGGLE(true)
    }
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
        'order': 'desc',
        'sort': 'last_engagement_at'
      }

      if (this.isFilterKey) {
        await this.getPowerDialerListItem(this.id)
      }

      if (this.listItems[this.id] === undefined) {
        if (isEmpty(this.id)) {
          await this.processFetch(params)
        } else {
          this.contactsLoaded({
            id: this.tempId,
            ...DEFAULT_LIST_ITEMS
          })
          await this.processFetch(params)
        }
      } else {
        await this.processFetch(params)
      }

      this.TOGGLE_TABLE_LOADER(false)
    },
    async initialize () {
      let route = this.$route.params
      if (this.$route.name !== 'Power Dialer Session') {
        this.START_DIAL_TOGGLE(false)
      }
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
