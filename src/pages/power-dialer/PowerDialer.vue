<template>
  <div
    v-if="authenticated"
    class="contacts mx-0 content-row d-flex overflow-hidden h-100">

    <div
      v-show="!hasSessions"
      class="pt-0 pl-0 pr-0 mb-0 h-100 bordered-right contacts-left-sidebar">
      <PowerDialerSidebar />
    </div>
    <div
      class="px-0 mb-0 main flex-1"
      :class="mainClass">
      <!-- Router Here -->
      <router-view
        :list="list"
        :is-loading-disabled="isLoadingDisabled"
        :is-start-state="isStartState"
        :is-editable="isEditable"
        :search="search"
        :is-my-contacts-view="isMyContactsView"
        :is-loading="isLoading"
        :columns="columns"
        :is-empty="isEmpty"
        :is-loading-more="isLoadingMore"
        :filters-count="filtersCount"
        :selected-list-id="filteredId"
        :onFetch="fetch"
        @search="onSearch"
        @checkboxChanged="onFetchMyContacts"
        @sort="onSortByField"
        @paginated="onPaginate"
        @loadMore="beforeOnLoadMore(selectedList)"
        @onFiltersCount="getFiltersCount"
        @on-list-update="updateList"
        @on-my-queue-list="myQueueList">
      </router-view>
    </div>

    <template v-if="!hasSessions">
      <MoveDialog
        :is-contact-module-type="false" />
      <CreateDialog />
      <ColumnHeaders
        :predefined-id="myQueueId"
        :previousRelations="previousRelations"
        v-if="isActive" />
      <RemoveListModal
        @on-clear-list="onClear"
        v-if="isActive" />
      <RemoveListConfirmation v-if="isActive" />
      <RemoveContact
        @on-remove="onRemove"
        :is-contact-module-type="false"
        v-if="isActive" />
      <RemoveContactConfirmation
        @contactsRemoved="updateList"
        v-if="isActive" />
      <RemoveFolderDialog
        :is-contact-module-type="false" />
      <CreateListModal :is-default="false" />
    </template>

  </div>
</template>

<script>

import { mapFields } from 'vuex-map-fields'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import PowerDialerSidebar from 'src/components/power-dialer/power-dialer-sidebar'
import MoveDialog from 'components/move-dialog'
import CreateDialog from 'components/power-dialer/custom/create-dialog'
import CreateListModal from 'components/create-list-modal'
import RemoveFolderDialog from 'components/remove-folder'
import RemoveListModal from 'components/remove-list'
import RemoveListConfirmation from 'components/remove-list-confirmation'
import RemoveContact from 'components/remove-contact'
import RemoveContactConfirmation from 'components/remove-contact-confirmation'
import ColumnHeaders from 'components/column-headers'
import powermixin from 'src/plugins/mixins/power-dialer'
import ContactsMixins from 'src/plugins/mixins/contacts.mixin'
import pdMixin from 'src/plugins/mixins/power-dialer-init.mixin'
import sessionsMixins from 'src/plugins/mixins/sessions-engine'
import * as ContactsListRemoveFromTypes from 'src/constants/contacts-list-remove-from-types'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
// import { get } from 'lodash'

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
    RemoveFolderDialog,
    CreateListModal
  },
  mixins: [
    powermixin,
    ContactsMixins,
    pdMixin,
    sessionsMixins
  ],
  provide () {
    return {
      contactsData: this.powerDialerActiveList
    }
  },
  computed: {
    ...mapState(['isMobile']),
    ...mapFields('powerDialer', [
      'activeMetrics',
      'powerDialerActiveList'
    ]),
    ...mapGetters('auth', ['authenticated']),
    ...mapGetters('powerDialer', [
      'isStartingDial',
      'flaggedCreateExisting'
    ]),
    ...mapGetters('contacts', [
      'listItems',
      'lists',
      'selectedList',
      'contactToRemove',
      'isBulkDelete',
      'selectedContacts',
      'removeContactActionType'
    ]),
    ...mapState(['currentRoute']),
    mainClass () {
      if (this.$route.name === 'Contact') {
        return 'w-100'
      }

      if (this.$route.meta.id === 'power-dialer-session') {
        return 'w-100'
      }

      if (!this.$q.screen.lt.md) {
        return ''
      }

      return !this.showContactsListSidebar ? 'w-100 no-min-max-width' : 'w-0'
    },
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
    },
    isActive () {
      return this.$route.name === 'Power Dialer'
    },
    hasSessions () {
      return this.$route.meta.id === 'power-dialer-session'
    },
    filteredId () {
      if (isNaN(this?.id)) {
        return this.myQueue?.id || ''
      }
      return this.id
    },
    listId () {
      return this.selectedList.name === 'My Queue' ? 'my-queue' : this.selectedList.id
    }
  },
  async mounted () {
    this.START_DIAL_TOGGLE(false)
    // // await this.initialize()
    await this.myQueueList()
    await this.setFilterParams(this.$route.params)

    this.$VueEvent.listen('metric_sessions_update', (sessionMetrics) => {
      // console.log(` %c PUSHER caught: metric_sessions_update `, 'background:black;color:yellow;', sessionMetrics)
      this.activeMetrics = sessionMetrics.session_metrics_calculations
    })
    this.$VueEvent.listen('contact_list_item_created', async (task) => {
      // console.log(` %c PUSHER caught: contact_list_item_created `, 'background:black;color:yellow;', task)
      // console.log(' %c TASK was CREATED : ', 'background: green; color: #000;', task)
      if (this.hasSessions) {
        await this.fetchInQueueTasks(task)
      }
    })
    this.$VueEvent.listen('contact_list_item_updated', (task) => {
      // console.log(` %c PUSHER caught: contact_list_item_updated `, 'background:black;color:yellow;', task)
      if (this.hasSessions) {
        this.updateTaskStatus(task)
      }
    })
    this.$VueEvent.listen('contact_list_item_deleting', (task) => {
      // console.log(` %c PUSHER caught: contact_list_item_deleting `, 'background:black;color:yellow;', task)
      // console.log(' %c TASK was DELETED : ', 'background: green; color: #000;', task)
    })
    this.$VueEvent.listen('contact_list_bulk_created', (task) => {
      // console.log(` %c PUSHER caught: contact_list_bulk_created `, 'background:black;color:yellow;', task)
      // console.log(' %c BULK TASK was CREATED : ', 'background: green; color: #000;', task)
    })
  },
  methods: {
    ...mapActions('powerDialer', [
      'getMyQueueList'
    ]),
    ...mapActions('contacts', [
      'listLoaded',
      'clearList',
      'setListSelectedContacts'
    ]),
    ...mapMutations('powerDialer', [
      'START_DIAL_TOGGLE',
      'TOGGLE_TABLE_LOADER',
      'SET_ACTIVE_FILTER'
    ]),
    async myQueueList () {
      let response = await this.getMyQueueList()
      if (response.status === 200) {
        this.listLoaded({ ...response.data, id: 'my-queue' })
      } else {
        this.$generalNotification('My Queue list not found! Please contact administrator.', 'error')
      }
    },
    handleBulkDeletion () {
      const url = { data: null }
      switch (this.removeContactActionType) {
        case ContactsListRemoveFromTypes.REMOVE_FROM_LIST_ONLY:
          url.data = `/api/v2/power-dialer-list-items/bulk/${this.selectedList.id}`
          break
        case ContactsListRemoveFromTypes.REMOVE_FROM_CONTACTS:
          url.data = `/api/v2/contacts/bulk-delete`
          break
      }
      this.isBusy = true
      const ids = this.selectedContacts[this.listId].map(contact => contact.contact_list_item_id)
      const params = { contact_list_items: ids }
      return this.$axios
        .delete(url.data, { params: params })
        .then(() => {
          this.updateList(this.selectedList)
          this.$generalNotification('Contacts was successfully removed.')
        })
        .catch((_err) => {
          this.$generalNotification('Unable to remove contacts please try again.', 'error')
        }).finally(() => {
          this.contactsToDelete = null
          this.isBusy = false
          this.removeContactClose()
        })
    },
    onRemove () {
      if (Object.keys(this.selectedContacts).length !== 0 && this.selectedContacts[this.selectedList.id].constructor !== Object && this.isBulkDelete) {
        this.handleBulkDeletion()
      }
    },
    async prepareData () {
      this.TOGGLE_TABLE_LOADER(true)
      this.TOGGLE_TABLE_LOADER(false)
    },
    async initialize () {
      if (this.$route.name !== 'Power Dialer Sessions') {
        this.START_DIAL_TOGGLE(false)
      }
      await this.prepareData()
    },
    setFilters (id) {
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
    async setFilterParams (params) {
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
    },
    beforeOnLoadMore (selectedList) {
      this.onLoadMore(selectedList)
    },
    forcedCheckAllItems () {
      const elem = document.querySelector('.data-table-check-all')
      if (elem.checked) {
        this.setListSelectedContacts({ id: this.tempId, contacts: this.contactsData.data })
      }
    },
    async updateList (data) {
      await this.loadList(data.id)
    },
    onClear () {
      this.powerDialerActiveList.data = []
      this.clearList()
    }
  },

  data () {
    return {
      ContactsListRemoveFromTypes
    }
  },

  watch: {
    '$route.params.filter': function (id) {
      this.setFilters(id)
    },
    '$route.params': async function (params) {
      this.$VueEvent.fire('clearContacts')
      await this.setFilterParams(params)
    },
    '$route': {
      handler (val) {
        this.isLoading = true
      },
      deep: true
    },
    powerDialerActiveList (newObj) {
      this.contactsData = newObj
    }
  },

  beforeRouteUpdate (to, from, next) {
    if (to.meta !== 'Power Dialer Sessions') {
      this.START_DIAL_TOGGLE(true)
    } else {
      this.START_DIAL_TOGGLE(false)
    }
    next()
  },

  beforeRouteLeave (to, from, next) {
    this.stopEvents()
    setTimeout(() => {
      next()
    }, 100)
  }
}
</script>
