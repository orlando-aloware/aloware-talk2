// import { DEFAULT_SETTING_VALUES } from 'src/constants/power-dialer/forms'
import { updateField } from 'vuex-map-fields'
import { isArray, isEmpty, merge } from 'lodash'
import * as PowerDialerDefault from 'src/constants/power-dialer-default'
import { mergeObjectsAndAddValues } from 'src/plugins/helpers/functions'

export default {
  updateField,

  SET_MY_QUEUE_LIST: (state, data) => {
    state.myQueue = data
  },

  SET_MY_QUEUE_LIST_FILTERS: (state, data) => {
    state.myQueueListFilters = data
  },

  SET_MY_QUEUE_LIST_DATA: (state, data) => {
    if (state.myQueue) {
      state.myQueue.items = data
    }
  },

  SET_CONTACT_RESOURCES: (state, data) => {
    state.contacts = data
  },

  RESET_LIST: (state) => {
    // state.opened = []
    state.lists = []
  },

  SET_LIST_SELECTED_CONTACTS: (state, data) => {
    state.selectedContacts = {
      ...state.selectedContacts,
      [data.id]: data.contacts
    }
  },

  /**
   * GENERAL MUTATIONS
   */
  SET_SEARCH: (state, value) => {
    state.search = value
  },

  RESET_SEARCH: (state) => {
    state.search = ''
  },

  SET_PD_LIST_CANCEL_TOKEN (state, token) {
    state.pdViewCancelToken = token
  },

  SET_PD_LIST_SOURCE (state, source) {
    state.pdViewSource = source
  },

  /**
   * MOVE &
   * CREATE MODAL for LISTS
   */
  START_DIAL_TOGGLE: (state, value) => {
    state.isStartingDial = value
  },

  TOGGLE_TABLE_LOADER: (state, value) => {
    state.datatableLoader = value
  },

  /**
   * DATATABLE ACTIONS
   */
  COLUMNS_REORDERED: (state, { id, headers }) => {
    state.lists = {
      ...state.lists,
      [String(id)]: {
        ...(state.lists[String(id)] || {}),
        headers
      }
    }
  },

  /**
   * SESSIONS
   */
  TOGGLE_SESSION_LOADER: (state, value) => {
    state.sessionLoader = value
  },

  TOGGLE_SESSION_SIDEBAR: (state) => {
    state.sessionSidebarExpanded = !state.sessionSidebarExpanded
  },

  CHANGING_SELECTED_CONTACT: (state, isChanging) => {
    state.changingSelectedContact = isChanging
  },

  SET_ACTIVE_TASK: (state, payload) => {
    state.activeTask = payload
  },

  SET_CONTACTS: (state, payload) => {
    state.listItems[state.selectedPdList.id].data = payload
  },

  SET_ACTIVE_FILTER: (state, filter) => {
    state.activeFilter = filter
  },

  SET_FILTERED_ENDPOINT: (state, endpoint) => {
    state.filteredEndpoint = endpoint
  },

  SET_SESSION_SETTING_GROUPS: (state, data) => {
    state.sessionSettingGroups.personal = data.personal
    state.sessionSettingGroups.company = data.company
  },

  SET_DIALER_SESSION_SETTINGS: (state, data) => {
    let personal = []
    let company = []
    data.forEach(d => {
      if (d.is_company_scope === 0) {
        personal.push(d)
      } else {
        company.push(d)
      }
    })
    state.dialerSessionSettings = data
    state.sessionSettingGroups.personal = personal
    state.sessionSettingGroups.company = company
  },

  RESET_POWER_DIALER_TASKS: (state) => {
    state.powerDialerTasks = {
      in_queue: [],
      called: [],
      failed: [],
      scheduled: [],
      all: [],
      redialed: []
    }
  },

  SET_SESSION_SETTINGS: (state, data) => {
    state.sessionSettings = data
  },

  ADD_NEW_SESSION_SETTING: (state, data) => {
    state.sessionSettings.push(data)
  },

  SET_DEFAULT_SETTING: (state, data) => {
    state.defaultSettings = data
    // state.sessionSettings = {}
  },

  CLEAR_SESSION_SETTING: (state) => {
    state.sessionSettings = {}
  },

  SET_WARMUP_DURATIONS: (state, data) => {
    state.warmupDurations = data
  },

  SET_SELECTED_PD_LIST: (state, data) => {
    state.selectedPdList = data
  },

  SET_FINISHED_PD_SESSION: (state, data) => {
    state.ongoingSession.finishedPdSession = data
  },

  UPDATE_SESSION_TIMER: (state, data) => {
    state.ongoingSession.totalSeconds = data
  },

  UPDATE_COUNTDOWN_TIMER: (state, data) => {
    state.countdownTimer = data
  },

  UPDATE_ONGOING_SESSION: (state, data) => {
    state.ongoingSession = merge(state.ongoingSession, data)
  },

  ADD_REDIALED_TASK: (state, taskId) => {
    if (!state.redialed.includes(taskId)) {
      state.redialed.push(taskId)
    }
  },

  CLEAR_REDIALED_TASKS: (state) => {
    state.redialed = []
  },

  RESET_VUEX (state, value) {
    if (!isArray(value) || isEmpty(value)) {
      return
    }

    const powerDialerDefaultState = Object.assign({}, PowerDialerDefault.DEFAULT_STATE)

    // exclude cached state properties(s) for non-cache reset
    // by removing them from our default state
    if (value.includes('non-cache')) {
      delete powerDialerDefaultState.sessionSettings
      delete powerDialerDefaultState.ongoingSession
      delete powerDialerDefaultState.sessionCallStatuses
      delete powerDialerDefaultState.countdownTimer
      delete powerDialerDefaultState.isSessionRunning
      delete powerDialerDefaultState.redialed
    }

    state = Object.assign(state, powerDialerDefaultState)

    if (!value.includes('all')) {
      return
    }

    // else, perform state reset
    state = Object.assign({}, PowerDialerDefault.DEFAULT_STATE)
  },

  REMOVE_FIRST_IN_QUEUE_TASK (state) {
    state.powerDialerTasks.in_queue.shift()
  },

  REQUEUE_POWER_DIALER_TASK (state, payload) {
    const task = payload.task
    const taskId = payload.id
    const index = state.powerDialerTasks.in_queue.findIndex(pdTask => pdTask.contact_list_item_id === taskId)

    // if task is found, remove it and re-add it again in the queue
    // (we're just moving it to the end of the queue)
    if (index !== -1) {
      const removed = state.powerDialerTasks.in_queue.splice(index, 1)
      state.powerDialerTasks.in_queue.push(removed[0])
      return
    }

    // add the task to the end of the queue
    state.powerDialerTasks.in_queue.push(task)
  },

  STORE_BULK_ACTION_NOTIFICATION (state, value) {
    if (isEmpty(state.bulkAddContactsNotification?.[value.contact_list_id])) {
      state.bulkAddContactsNotification[value.contact_list_id] = value
      console.log('value: ', value)
      console.log('state.bulkAddContactsNotification: ', JSON.parse(JSON.stringify(state.bulkAddContactsNotification)))

      return
    }

    state.bulkAddContactsNotification[value.contact_list_id] = mergeObjectsAndAddValues(
      state.bulkAddContactsNotification[value.contact_list_id],
      value
    )
    console.log('value: ', value)
    console.log('state.bulkAddContactsNotification: ', JSON.parse(JSON.stringify(state.bulkAddContactsNotification)))
  },

  CLEAR_BULK_ACTION_NOTIFICATION (state, contactListId) {
    delete state.bulkAddContactsNotification[contactListId]
  }
}
