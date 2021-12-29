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

    <MoveDialog
      :is-contact-module-type="false" />
    <CreateDialog />
    <ColumnHeaders />
    <RemoveListModal />
    <RemoveListConfirmation/>
    <RemoveContact />
    <RemoveContactConfirmation />
    <RemoveFolderDialog
      :is-contact-module-type="false" />

  </div>
</template>

<script>

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import PowerDialerSidebar from 'src/components/power-dialer/power-dialer-sidebar'
import MoveDialog from 'components/move-dialog'
import CreateDialog from 'components/power-dialer/custom/create-dialog'
import RemoveFolderDialog from 'components/remove-folder'
import RemoveListModal from 'components/remove-list'
import RemoveListConfirmation from 'components/remove-list-confirmation'
import RemoveContact from 'components/remove-contact'
import RemoveContactConfirmation from 'components/remove-contact-confirmation'
import ColumnHeaders from 'components/column-headers'
import powermixin from 'src/plugins/mixins/power-dialer'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import { isEmpty } from 'lodash'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import { DEFAULT_LIST_ITEMS } from 'src/constants/power-dialer/default-list-items'

export default {
  name: 'PowerDialer',
  components: {
    PowerDialerSidebar,
    MoveDialog,
    CreateDialog,
    RemoveListModal,
    ColumnHeaders,
    RemoveListConfirmation,
    RemoveContact,
    RemoveContactConfirmation,
    RemoveFolderDialog
  },
  mixins: [powermixin, contactsMixins],
  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapGetters('powerDialer', [
      'isStartingDial',
      'flaggedCreateExisting'
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
    this.START_DIAL_TOGGLE(false)
    await this.initialize()
  },
  beforeRouteUpdate (to, from, next) {
    if (to.meta !== 'Power Dialer Session') {
      this.START_DIAL_TOGGLE(false)
    } else {
      this.START_DIAL_TOGGLE(true)
    }
    next()
  },
  data () {
    return {
      id: ''
    }
  },
  methods: {
    ...mapActions('contacts', [
      'contactsLoaded'
    ]),
    ...mapMutations('powerDialer', [
      'START_DIAL_TOGGLE',
      'TOGGLE_TABLE_LOADER',
      'SET_ACTIVE_FILTER'
    ]),
    async fetchContacts () {
      this.TOGGLE_TABLE_LOADER(true)
      let params = {
        // 'page': 1,
        // 'per_page': 25,
        // 'order': 'desc',
        // 'sort': 'last_engagement_at'
      }
      if (this.listItems[this.id] === undefined) {
        if (isEmpty(this.id)) {
          await this.fetchApi(params)
        } else {
          this.contactsLoaded({
            id: this.tempId,
            ...DEFAULT_LIST_ITEMS
          })
          await this.fetchApi(params)
        }
      } else {
        await this.fetchApi(params)
      }

      this.TOGGLE_TABLE_LOADER(false)
    },
    async fetchApi (params) {
      switch (this.$route.meta.id) {
        case 'power-dialer':
          this.processFetch(params, false, true)
          break
        case 'power-dialer-list':
          this.processFetch(params, false, false)
          break
        default:
          this.processFetch(params, false, false, this.id)
      }
    },
    async initialize () {
      let route = this.$route.params
      if (this.$route.name !== 'Power Dialer Session') {
        this.START_DIAL_TOGGLE(false)
      }
      if (!route.id && this.$route.name === 'Power Dialer') {
        route.id = 'in-queue'
        this.id = 'in-queue'
      } else if (route.id && this.$route.name === 'Power Dialer') {
        this.id = route.id
      }
      await this.fetchContacts()
    },
    resetValues () {
      // this.RESET_LIST()
      this.START_DIAL_TOGGLE(false)
      // this.SET_POWER_DIALER_LIST([])
    }
  },
  watch: {
    '$route.params.filter': function (id) {
      if (id) {
        if (this.$route.meta.title === 'Power Dialer' ||
          (
            this.$route.meta.title === 'Power Dialer Filter' ||
            this.$route.meta.title === 'Power Dialer Individual Advance'
          )
        ) {
          this.SET_ACTIVE_FILTER(this.$route.params.id)
        } else {
          if (this.$route.params.filter) {
            this.SET_ACTIVE_FILTER(this.$route.params.filter)
          } else {
            this.SET_ACTIVE_FILTER('in-queue')
          }
        }
      }
    },
    '$route.params': async function (params) {
      if (this.$route.name === 'Power Dialer') {
        await this.initialize()
        if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
          this.SET_ACTIVE_FILTER(this.id)
        } else {
          if (params.filter) {
            this.SET_ACTIVE_FILTER(params.filter)
          } else {
            this.SET_ACTIVE_FILTER('in-queue')
          }
        }
      }
    }
  }
}
</script>
