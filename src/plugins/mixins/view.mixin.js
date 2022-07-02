import { mapActions, mapState } from 'vuex'
import moment from 'moment'
import _ from 'lodash'
import { COUNT_FIELDS } from 'src/constants/count-fields-default'

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
    ...mapState('contacts', ['isAllContactsSelected']),
    ...mapState(['users']),
    checked () {
      return _.get(this.selectedContacts, this.id, [])
    },
    computedStyle () {
      return { width: `${this.width}px`, height: `${this.height}px`, ...this.avatarStyle() }
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

      if (this.$route.name !== 'Power Dialer') {
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
    showPopover: _.debounce(function (title, id, index, colName, e) {
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
      this.hoverPopover.data = this.fixedContactsData.data[index][colName].slice(0, 10)
      this.hoverPopover.dataLength = this.fixedContactsData.data[index][colName].length
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
    getStatusColor (taskStatusName) {
      if (!taskStatusName) {
        return taskStatusName
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
    getStatusName (taskStatus) {
      const integerTaskStatus = taskStatus ? parseInt(taskStatus) : taskStatus

      if (!integerTaskStatus) {
        return ''
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
    }
  }
}
