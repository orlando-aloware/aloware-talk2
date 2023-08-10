<template>
  <div v-if="authenticated"
       class="contacts mx-0 content-row d-flex overflow-hidden h-100">
    <div v-show="!hasSessions"
         class="pt-0 pl-0 pr-0 mb-0 h-100 bordered-right contacts-left-sidebar">
      <power-dialer-sidebar @fetchMyQueueData="onFetchMyQueueData" />
    </div>
    <div class="px-0 mb-0 main flex-1 h-100"
         :class="mainClass">
      <!-- Router Here -->
      <router-view :list="list"
                   :is-loading-disabled="isLoadingDisabled"
                   :is-start-state="isStartState"
                   :is-editable="isEditable"
                   :search="search"
                   :is-my-contacts-view="isMyContactsView"
                   :is-loading="isComponentLoading"
                   :columns="columns"
                   :is-empty="isEmpty"
                   :is-loading-more="isLoadingMore"
                   :filters-count="filtersCount"
                   :selected-list-id="filteredId"
                   :on-fetch="fetch"
                   v-if="!isPowerDialerSession"
                   @search="onSearch"
                   @checkboxChanged="onFetchMyContacts"
                   @sort="onSortByField"
                   @paginated="onPaginate"
                   @loadMore="beforeOnLoadMore(selectedList)"
                   @on-list-update="updateList"
                   @on-my-queue-list="myQueueList"
                   @onSelectedCountChange="onSelectedCountChange">
      </router-view>
      <router-view v-if="isPowerDialerSession">
      </router-view>
    </div>

    <template v-if="!hasSessions">
      <move-dialog :is-contact-module-type="false" />
      <create-dialog />
      <column-headers :predefined-id="myQueueId"
                     :previousRelations="previousRelations"
                     v-if="isActive" />
      <remove-list-modal v-if="isActive"
                       @on-clear-list="onClear" />
      <remove-list-confirmation v-if="isActive" />
      <remove-contact :is-contact-module-type="false"
                      :selected-count="selectedContactsCount"
                      v-if="isActive"
                     @on-remove="onRemove"/>
      <remove-contact-confirmation :selected-count="selectedContactsCount"
                                   v-if="isActive"
                                   @contactsRemoved="updateList" />
      <remove-folder-dialog :is-contact-module-type="false" />
      <create-list-modal :is-default="false" />
    </template>
  </div>
</template>

<script>
import { debounce, get } from 'lodash'
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
import {
  powerDialerMixin,
  contactsMixins,
  contactV2AttributesMixin,
  powerDialerInitMixin,
  sessionsEngineMixin,
  aclMixin,
  visibilityMixin,
  contactListCountMixin,
  mainViewMixin
} from 'src/plugins/mixins'
import * as ContactsListRemoveFromTypes from 'src/constants/contacts-list-remove-from-types'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import qs from 'qs'

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
    powerDialerMixin,
    contactsMixins,
    contactV2AttributesMixin,
    powerDialerInitMixin,
    sessionsEngineMixin,
    aclMixin,
    visibilityMixin,
    contactListCountMixin,
    mainViewMixin
  ],

  data () {
    return {
      powerDialerListeners: {},
      ContactsListRemoveFromTypes
    }
  },

  computed: {
    ...mapState(['isMobile']),

    ...mapFields('powerDialer', [
      'activeMetrics',
      'powerDialerActiveList',
      'powerDialerTasks',
      'reRouteModal'
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
      'removeContactActionType',
      'currentListFilters'
    ]),

    ...mapState(['currentRoute']),

    ...mapState('auth', ['profile']),

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
      return !this.filterKeys.includes(this.id)
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
    },

    hasQueuedTaskLists () {
      return this.powerDialerTasks.in_queue.length > 0
    },

    isPowerDialerSession () {
      const routeMetaTitle = get(this.$route, 'meta.title', '')

      return routeMetaTitle === 'Power Dialer Sessions'
    }
  },

  created () {
    // check if user has access and redirect to inbox in case it doesnt
    if (!this.profile.auto_dialer_enabled) {
      this.$router.push({ name: 'Inbox' })
    }
  },

  async mounted () {
    this.START_DIAL_TOGGLE(false)
    // // await this.initialize()
    // await this.myQueueList()
    await this.setFilterParams(this.$route.params)

    this.stopPDEvents()

    this.powerDialerListeners.metricSessionsUpdate = (sessionMetrics) => {
      // console.log(` %c PUSHER caught: metric_sessions_update `, 'background:black;color:yellow;', sessionMetrics)
      this.activeMetrics = sessionMetrics.session_metrics_calculations
    }

    this.powerDialerListeners.contactListItemCreated = async (task) => {
      // console.log(` %c PUSHER caught: contact_list_item_created `, 'background:black;color:yellow;', task)
      // console.log(' %c TASK was CREATED : ', 'background: green; color: #000;', task)
      if (this.hasSessions) {
        await this.fetchInQueueTasks(task)
      }
    }

    this.powerDialerListeners.contactListItemUpdated = (task) => {
      // console.log(` %c PUSHER caught: contact_list_item_updated `, 'background:black;color:yellow;', task)
      if (this.hasSessions) {
        this.updateTaskStatus(task)
      }
    }

    this.powerDialerListeners.callSessionsEnded = () => {
      this.resetSelectedTaskAndContact()
    }

    this.$VueEvent.listen('metric_sessions_update', this.powerDialerListeners.metricSessionsUpdate)
    this.$VueEvent.listen('contact_list_item_created', this.powerDialerListeners.contactListItemCreated)
    this.$VueEvent.listen('contact_list_item_updated', this.powerDialerListeners.contactListItemUpdated)
    this.$VueEvent.listen('call_sessions_ended', this.powerDialerListeners.callSessionsEnded)
  },

  methods: {
    ...mapActions('powerDialer', [
      'getMyQueueList',
      'updateMyQueueListData'
    ]),

    ...mapActions('contacts', [
      'listLoaded',
      'clearList'
    ]),

    ...mapMutations('powerDialer', [
      'START_DIAL_TOGGLE',
      'TOGGLE_TABLE_LOADER',
      'SET_ACTIVE_FILTER'
    ]),

    myQueueList: debounce(async function () {
      let response = await this.getMyQueueList()

      if (response.status === 200) {
        this.listLoaded({ ...response.data, id: 'my-queue' })

        return
      }

      this.$generalNotification('My Queue list not found! Please contact administrator.', 'error')
    }, 100),

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
          this.listAddRemoveContactsProgress = {
            id: null,
            loading: false
          }

          const params = typeof this.currentListFilters === 'string'
            ? {}
            : this.$jsonClone(this.currentListFilters)
          this.fetch(params, false, true)
          this.$generalNotification('Contacts was successfully removed.')
        })
        .catch((_err) => {
          this.$generalNotification('Unable to remove contacts please try again.', 'error')
        }).finally(() => {
          this.contactsToDelete = null
          this.isBusy = false
        })
    },

    onRemove () {
      if (Object.keys(this.selectedContacts).length !== 0 &&
        this.selectedContacts[this.selectedList.id].constructor !== Object &&
        this.isBulkDelete) {
        this.listAddRemoveContactsProgress = {
          id: this.getCleanedListId(this.$route?.params?.id),
          loading: true
        }

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

    setFilters (id = null) {
      // id is numeric and starts at 0 so we must exclude it
      // when checking for emptiness
      if (!id && id !== 0) {
        return
      }

      const isOtherPowerDialerRoutes = this.$route.meta.title === 'Power Dialer Filter' ||
        this.$route.meta.title === 'Power Dialer Individual Advance'

      if (this.$route.meta.title === 'Power Dialer' || isOtherPowerDialerRoutes) {
        this.SET_ACTIVE_FILTER(this.$route.params.id)
        return
      }

      if (this.$route.params.filter) {
        this.SET_ACTIVE_FILTER(this.$route.params.filter)
        return
      }

      this.SET_ACTIVE_FILTER('in-queue')
    },

    async setFilterParams (params) {
      if (this.$route.name === 'Power Dialer') {
        await this.initialize()

        if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
          this.SET_ACTIVE_FILTER(this.id)
          return
        }

        if (params.filter) {
          this.SET_ACTIVE_FILTER(params.filter)
          return
        }

        this.SET_ACTIVE_FILTER('in-queue')
      }
    },

    beforeOnLoadMore (selectedList) {
      this.onLoadMore(selectedList)
    },

    async updateList (data) {
      await this.loadList(data.id)
    },

    onClear () {
      this.powerDialerActiveList.data = []
      this.clearList()
    },

    onFetchMyQueueData () {
      this.myQueueList()

      this.$axios
        .get(this.apiEndpoint(true), {
          params: this.buildQueryString({}, false),
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data)
        .then((data) => {
          this.updateMyQueueListData(data)
        })
    },

    stopPDEvents () {
      this.$VueEvent.stop('metric_sessions_update', this.powerDialerListeners.metricSessionsUpdate)
      this.$VueEvent.stop('contact_list_item_created', this.powerDialerListeners.contactListItemCreated)
      this.$VueEvent.stop('contact_list_item_updated', this.powerDialerListeners.contactListItemUpdated)
      this.$VueEvent.stop('call_sessions_ended', this.powerDialerListeners.callSessionsEnded)
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
        this.setAllContactsSelected(false)
        this.setIsDatatableSelectedAll(false)
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
    this.stopPDEvents()
    this.stopMainViewEvents()

    setTimeout(() => {
      next()
    }, 100)
  }
}
</script>
