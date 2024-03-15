import { mapActions, mapState } from 'vuex'
import moment from 'moment'
import { get, debounce, isEmpty } from 'lodash'
import { COUNT_FIELDS } from 'src/constants/count-fields-default'
import { POWER_DIALER_DEFAULT_COLUMNS } from 'src/constants/contacts-columns'
import talk2Api from 'src/plugins/api/api'

export default {
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
      countFields: COUNT_FIELDS
    }
  },

  computed: {
    ...mapState('contacts', ['isAllContactsSelected', 'showMyContacts']),
    ...mapState([
      'users',
      'campaigns'
    ]),

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
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setListSelectedContacts',
      'setAllContactsSelected'
    ]),

    onCheckerClicked (contact) {
      const items = { data: [] }
      const found = this.checked.find(item => item.id === contact.id)

      if (found) {
        items.data = this.checked.filter(item => item.id !== contact.id)
      } else {
        items.data = [...this.checked]
        items.data.push(contact)
      }

      this.setAllContactsSelected(false)
      this.onCheckedRows(items.data)
    },

    onCheckedRows (checked) {
      this.setAllContactsSelected(false)
      this.setListSelectedContacts({ id: this.id, contacts: checked })
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
        return this.$options.filters.fixTaskStatusName(integerTaskStatus)
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

    exportAsCsv () {
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
    }
  }
}
