// import { DEFAULT_SETTING_VALUES } from 'src/constants/power-dialer/forms'
import { updateField } from 'vuex-map-fields'
import _ from 'lodash'

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
      all: []
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
    state.ongoingSession = _.merge(state.ongoingSession, data)
  }
}
