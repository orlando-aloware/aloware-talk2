import { mapActions, mapGetters, mapState } from 'vuex'
import moment from 'moment'
import { get, debounce, isEmpty } from 'lodash'
import { COUNT_FIELDS } from 'src/constants/count-fields-default'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import { POWER_DIALER_DEFAULT_COLUMNS } from 'src/constants/contacts-columns'
import talk2Api from 'src/plugins/api/api'
import { mapFields } from 'vuex-map-fields'

export default {
  inject: [
    'contactsData',
    'selectedContacts'
  ],

  data () {
    return {
      moment,
      datatableTarget: null,
      hoverPopover: {
        key: 0,
        title: '',
        target: '',
        show: false,
        data: [],
        dataLength: 0
      },
      countFields: COUNT_FIELDS,
      clicked: false,
      isSelectedAll: false,
      pdViewListeners: {},
      bulkViewListeners: {}
    }
  },

  computed: {
    ...mapState('contacts', [
      'isAllContactsSelected',
      'showMyContacts',
      'lists'
    ]),

    ...mapState([
      'users',
      'campaigns',
      'isDatatableSelectedAll',
      'isDatatableCountLoading'
    ]),

    ...mapState('powerDialer', [
      'myQueue'
    ]),

    ...mapFields('powerDialer', [
      'powerDialerActiveList'
    ]),

    ...mapGetters('contacts', [
      'selectedList'
    ]),

    ...mapGetters('powerDialer', [
      'myQueueId'
    ]),

    isMainView () {
      const isListPages = this.isContacts || this.isPowerDialer

      return isListPages && this.$route.path && !this.$route.path.includes('/add')
    },

    isPowerDialer () {
      return this.$route.name === 'Power Dialer'
    },

    isContacts () {
      return this.$route.name === 'Contacts'
    },

    checked () {
      return get(this.selectedContacts, this.id, [])
    },

    computedStyle () {
      return { width: `${this.width}px`, height: `${this.height}px`, ...this.avatarStyle() }
    },

    pdColumns () {
      return POWER_DIALER_DEFAULT_COLUMNS
    },

    filteredColumns () {
      if (!isEmpty(this.columns)) {
        return this.columns
      }

      if (this.$route.name === 'Power Dialer') {
        return this.pdColumns
      }
    },

    filteredSelectedListId () {
      let route = this.$route.meta.id

      return route === 'power-dialer-queue-filter' ? this.myQueue?.id : this.selectedListId
    },

    currentTotalListCount () {
      const list = this.powerDialerActiveList

      switch (this.filter) {
        case 'in-queue':
          return list.total_queued
        case 'called':
          return list.total_called
        case 'failed':
          return list.total_failed
        case 'scheduled':
          return list.total_scheduled
        default:
          return list.total_items
      }
    },

    id () {
      if (this.$route.name === 'Power Dialer') {
        return this.filteredSelectedListId
      }

      return this.$route.params.id
    },

    totalRows () {
      if (this.$route?.path && this.$route.path.includes('/add')) {
        return parseInt(this.contactCount)
      }

      if (this.isPowerDialer) {
        return this.currentTotalListCount
      }

      return parseInt(this.selectedList.contactCount)
    },

    selectedAllCount () {
      if (this.isSelectedAll && this.contactDCNCount > 0) {
        return this.totalRows - this.contactDCNCount
      }

      if (this.isSelectedAll && this.checked.length < this.fixedContactsData.data.length) {
        return this.totalRows - (this.fixedContactsData.data.length - this.checked.length)
      }

      if (this.isSelectedAll) {
        return this.totalRows
      }

      return this.checked.length
    },

    contactsCountText () {
      const postfix = this.contactCount > 1 ? 's' : ''

      return `${this.$options.filters.numFormat(this.contactCount)} Contact${postfix}`
    },

    filtersText () {
      return this.filtersCount > 1 ? 'Filters' : 'Filter'
    },

    listItemsTotalContacts () {
      const data = get(this.fixedContactsData, `data`, null)
      return data.length || 0
    }
  },

  created () {
    this.bulkViewListeners.contactListBulkCreated = (event) => {
      if (typeof this.onFetch !== 'function') {
        return
      }

      const eventListId = this.getCleanedListId(event.contact_list_id)
      const cleanedListId = this.getCleanedListId(this.$route?.params?.id)

      if (cleanedListId && eventListId && cleanedListId === eventListId) {
        if (this.isMainView) {
          this.$VueEvent.fire('addContactsProgress', {
            id: null,
            loading: false
          })
        }

        let params = typeof this.currentListFilters === 'string'
          ? {}
          : this.$jsonClone(this.currentListFilters)
        params.event = {
          name: 'bulk-created',
          count: event.items_count
        }
        this.onFetch(params, false, true)
      }
    }

    this.bulkViewListeners.contactListBulkDeleted = (event) => {
      if (typeof this.onFetch !== 'function') {
        return
      }

      const eventListId = this.getCleanedListId(event.contact_list_id)
      const cleanedListId = this.getCleanedListId(this.$route?.params?.id)

      if (cleanedListId && eventListId && cleanedListId === eventListId) {
        if (this.isMainView) {
          this.$VueEvent.fire('deleteContactsProgress', {
            id: null,
            loading: false
          })
        }

        let params = typeof this.currentListFilters === 'string' ? {} : this.$jsonClone(this.currentListFilters)
        params.event = {
          name: 'bulk-deleted',
          count: event.count
        }
        this.onFetch(params, false, true)
      }
    }

    if (this.isMainView) {
      this.$VueEvent.stop('contact_list_bulk_created', this.bulkViewListeners.contactListBulkCreated)
      this.$VueEvent.stop('contact_list_bulk_deleted', this.bulkViewListeners.contactListBulkDeleted)
      this.$VueEvent.listen('contact_list_bulk_created', this.bulkViewListeners.contactListBulkCreated)
      this.$VueEvent.listen('contact_list_bulk_deleted', this.bulkViewListeners.contactListBulkDeleted)
    }

    if (this.$route.name === 'Contacts') {
      this.$VueEvent.stop('contacts_bulk_deleted', this.bulkViewListeners.contactListBulkDeleted)
      this.$VueEvent.listen('contacts_bulk_deleted', this.bulkViewListeners.contactListBulkDeleted)
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setAllContactsSelected'
    ]),

    onCheckerClicked (contact) {
      let items = []
      const found = this.checked.find(item => item.id === contact.id)

      if (found) {
        items = this.checked.filter(item => item.id !== contact.id)
      } else {
        items = [...this.checked]
        items.push(contact)
      }

      this.clearSelectAll()
      document.querySelector('.data-table-check-all').checked = false
      this.onCheckedRows(items)
    },

    onCheckedRows (checked) {
      this.setAllContactsSelected(false)
      this.$VueEvent.fire('setListSelectedContacts', { id: this.id, contacts: checked })
    },

    generateRoute (contactId) {
      const routeData = {
        path: `/contacts/${contactId}`
      }

      if (this.$route.name === 'Power Dialer') {
        routeData.query = {
          previousPage: this.$route.name
        }
      }

      return routeData
    },

    datatableOnMouseMove (e) {
      if (e.target.closest('.popover-items') !== null) {
        this.datatableTarget = e.target.closest('.popover-items').getAttribute('id')
      } else {
        this.datatableTarget = null
      }

      if (this.hoverPopover.target !== this.datatableTarget) {
        this.hoverPopover.target = null
        this.hoverPopover.show = false
        return false
      }
    },

    showPopover: debounce(function (title, id, index, colName, e) {
      if (this.datatableTarget !== id) {
        this.hoverPopover.target = null
        this.hoverPopover.show = false
        return
      }

      if (this.datatableTarget !== e.target.id) {
        return
      }

      if (!this.fixedContactsData?.data?.[index]?.[colName]) {
        return
      }

      this.hoverPopover.key = (this.hoverPopover.key + 1)
      this.hoverPopover.title = title
      this.hoverPopover.target = id

      const data = this.fixedContactsData.data[index][colName]
      this.hoverPopover.data = data ? data.slice(0, 10) : ''
      this.hoverPopover.dataLength = data.length
      this.hoverPopover.show = true
    }, 200),

    onMouseOverPopover (title, id, index, colName, e) {
      this.showPopover(title, id, index, colName, e)
    },

    onMouseLeavePopover (e) {
      this.hoverPopover.target = null
      this.hoverPopover.title = ''
      this.hoverPopover.show = false
      this.hoverPopover.data = []
      this.hoverPopover.dataLength = 0
    },

    getStatusColor (taskStatusName, module = null) {
      if (!taskStatusName) {
        return taskStatusName
      }

      if (module === 'contacts') {
        switch (taskStatusName) {
          case 'Pending':
            return 'grey-90'
          case 'Closed':
            return 'success'
          case 'New':
            return 'secondary'
          default:
            return 'primary'
        }
      }

      switch (taskStatusName) {
        case 'Queued':
          return 'grey-90'
        case 'Completed':
          return 'success'
        case 'Failed':
          return 'red'
        default:
          return 'primary'
      }
    },

    getStatusName (taskStatus, module = null) {
      const integerTaskStatus = taskStatus ? parseInt(taskStatus) : taskStatus

      if (!integerTaskStatus) {
        return ''
      }

      if (module === 'contacts') {
        switch (integerTaskStatus) {
          case ContactTaskStatus.STATUS_PENDING:
            return 'Pending'
          case ContactTaskStatus.STATUS_CLOSED:
            return 'Closed'
          case ContactTaskStatus.STATUS_NEW:
            return 'New'
          case ContactTaskStatus.STATUS_OPEN:
          default:
            return 'Open'
        }
      }

      switch (integerTaskStatus) {
        case 1:
          return 'Queued'
        case 2:
          return 'In-Progress'
        case 3:
          return 'Completed'
        case 4:
          return 'Failed'
        default:
          return 'Scheduled'
      }
    },

    getUserName (userId) {
      const user = this.users.find(item => item.id === userId)
      return user ? user.name : '-'
    },

    getLineName (id) {
      const found = this.campaigns.find(campaign => campaign.id === id)
      return found ? found.name : '-'
    },

    isCountField (columnName) {
      return this.countFields.includes(columnName)
    },

    processExportAsCsv () {
      let id = null
      let module = null

      if (this.$route.name === 'Contacts') {
        id = this.list.id
        module = 'contacts'
      }

      if (this.$route.name === 'Power Dialer') {
        id = this.selectedList.id
        module = 'powerDialer'
      }

      if (id === null) {
        this.$generalNotification('Failed to export. Missing id.', 'error')
        return
      }

      const headers = this.filteredColumns.map((item) => {
        return {
          name: item.name,
          label: item.label
        }
      })
        .filter(item => !['checkbox', 'actions'].includes(item.name))

      talk2Api.V2[module].listExport(id, {
        headers: JSON.stringify(headers),
        filters: JSON.stringify(this.currentListFilters),
        search: this.search,
        my_contacts: +this.showMyContacts
      })
        .catch(() => {
          this.$generalNotification('Unable to process export request! Please try again later.', 'error')
        })
    },

    exportAsCsv () {
      this.$bvModal.msgBoxConfirm('Do you want to proceed with the export?', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'Cancel',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.processExportAsCsv()
        }
      })
    },

    isColumnArrayValueEmpty (columnValue) {
      const isEmptyArray = columnValue instanceof Array && !columnValue.length
      return columnValue === '' ||
        columnValue === null ||
        columnValue === 'NULL' ||
        isEmptyArray
    },

    isColumnArrayValueNotEmpty (columnValue) {
      return columnValue &&
        columnValue instanceof Array &&
        columnValue.length
    },

    isColumnObjectValueEmpty (columnValue) {
      return columnValue && columnValue instanceof Object && !Object.keys(columnValue).length
    },

    isColumnObjectValueNotEmpty (columnValue) {
      return columnValue &&
        columnValue instanceof Object &&
        Object.keys(columnValue).length
    },

    getColumnValue (value) {
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No'
      }

      if (typeof value !== 'undefined' && value !== 0) {
        return value.toString()
      }

      return value === null
        ? '-'
        : value
    },

    getColumnClass (name, draggable) {
      const textAlignmentClass = this.isCountField(name) ? 'text-center' : 'text-left'
      const draggableClass = draggable ? 'col-indented' : ''

      return [
        textAlignmentClass,
        draggableClass
      ]
    },

    clearSelectAll () {
      this.setAllContactsSelected(false)
    },

    async onMovedContacts () {
      await this.onFetch({}, false)
      this.clearSelectAll()
    },

    onSelectedAll (value) {
      this.isSelectedAll = value
      this.$emit('onSelectedAll', value)

      if (!value) {
        this.clearSelectAll()
        this.$VueEvent.fire('setListSelectedContacts', { id: this.id, contacts: [] })
      }
    },

    stopEvents () {
      this.$VueEvent.stop('contact_list_item_deleting', this.pdViewListeners.contactListItemDeleting)
      this.$VueEvent.stop('contact_list_bulk_created', this.bulkViewListeners.contactListBulkCreated)
      this.$VueEvent.stop('contact_list_bulk_deleted', this.bulkViewListeners.contactListBulkDeleted)
      this.$VueEvent.stop('contacts_bulk_deleted', this.bulkViewListeners.contactListBulkDeleted)
    },

    getCleanedListId (id) {
      let cleanedId = this.$isNumeric(id) ? parseInt(id) : id

      return cleanedId === 'in-queue' ? this.myQueueId : cleanedId
    }
  },

  watch: {
    selectedAllCount (value) {
      this.$emit('onSelectedCountChange', value)
    }
  },

  beforeDestroy () {
    this.stopEvents()
  }
}
