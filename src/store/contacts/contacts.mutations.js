import Vue from 'vue'
import _ from 'lodash'
import * as ContactsListDefaultList from 'src/constants/default-lists'
import * as ContactsDefault from 'src/constants/contacts-default'
import { DEFAULT_CONTACT_LIST_ITEMS } from 'src/constants/contacts-list-item-default'
import { OPERATORS } from 'src/constants/contacts-filter-operators'

export default {
  TOGGLE_FOLDER: (state, id) => {
    const opened = new Set(state.opened)
    if (opened.has(id)) {
      opened.delete(id)
    } else {
      opened.add(id)
    }
    state.opened = Array.from(opened)
  },
  OPEN_FOLDER: (state, id) => {
    const opened = new Set(state.opened).add(id)
    state.opened = Array.from(opened)
  },
  CLOSE_FOLDER: (state, id) => {
    const opened = new Set(state.opened).delete(id)
    state.opened = Array.from(opened)
  },
  REMOVE_FOLDER_OPEN: (state, folder) => {
    state.removeFolder = folder
  },
  REMOVE_LIST_OPEN: (state, list) => {
    state.removeList = list
  },
  REMOVE_CONTACT_OPEN: (state, contact) => {
    state.removeContact = contact
  },
  REMOVE_FOLDER_CLOSE: (state) => {
    state.removeFolder = null
  },
  REMOVE_LIST_CLOSE: (state) => {
    state.removeList = null
  },
  REMOVE_CONTACT_CLOSE: (state) => {
    state.removeContact = null
  },
  FILTERS_CLOSE: (state) => {
    state.isFiltersOpen = false
  },
  FILTERS_OPEN: (state) => {
    state.isFiltersOpen = true
  },
  PINNED_COUNT_LOADED: (state, payload) => {
    Vue.set(state.pinnedCounts, payload.id, payload.count)
  },
  FOLDERS_LOADED: (state, folders) => {
    state.folders = folders
  },
  REMOVE_FOLDER_ITEM: (state, folder) => {
    state.removedFolder = folder
  },
  RESET_REMOVED_FOLDERS: (state) => {
    state.removedFolder = null
  },
  LIST_LOADED: (state, list) => {
    state.lists = {
      ...state.lists,
      [String(list.id)]: {
        ...(state.lists[String[list.id]] || {}),
        ...list
      }
    }
  },
  UPDATE_LIST: (state, list) => {
    Vue.set(state.lists, `${list.id}`, list)
  },
  UPDATE_LIST_FILTER: (state, payload) => {
    if (typeof state.lists[payload.id] !== 'undefined') {
      Vue.set(state.lists[payload.id], 'filters', payload.filters)
    }
  },
  PINNED_LOADED: (state, pinned) => {
    state.pinned = pinned
  },
  COLUMNS_OPEN: (state, payload) => {
    state.columns = payload
  },
  COLUMNS_CLOSE: (state) => {
    state.columns = null
  },
  COLUMNS_REORDERED: (state, { id, headers }) => {
    state.lists = {
      ...state.lists,
      [String(id)]: {
        ...(state.lists[String(id)] || {}),
        headers
      }
    }
  },
  COLUMNS_UPDATED: (state, { id, ...rest }) => {
    state.lists = {
      ...state.lists,
      [String(id)]: {
        ...(state.lists[String(id)] || {}),
        ...rest
      }
    }
  },
  LIST_UNPINNED: (state, id) => {
    state.pinned = state.pinned.filter((v) => v !== id)
  },
  LIST_PINNED: (state, id) => {
    state.pinned = [...new Set(state.pinned.concat(id))]
  },
  MOVE_DIALOG_OPEN: (state, { id, type }) => {
    state.moveDialog = { open: true, id, type }
  },
  MOVE_DIALOG_CLOSE: (state) => {
    state.moveDialog = { open: false }
  },
  MOVE_DIALOG_TARGET: (state, { target }) => {
    state.moveDialog = {
      ...state.moveDialog,
      target: target === state.moveDialog.target ? null : target
    }
  },
  CREATE_DIALOG_TARGET: (state, { target, name }) => {
    state.createDialog = {
      ...state.createDialog,
      name: name || '',
      target: target === state.createDialog.target ? null : target
    }
  },
  SET_CONTACT_REMOVE_ACTION_TYPE: (state, type) => {
    state.removeContactActionType = type
  },
  SET_BULK_DELETE: (state, payload) => {
    state.isBulkDelete = payload
  },
  SET_LIST_SELECTED_CONTACTS: (state, payload) => {
    state.selectedContacts = {
      ...state.selectedContacts,
      [payload.id]: payload.contacts
    }
  },
  SET_ALL_CONTACTS_SELECTED: (state, isSelected) => {
    state.isAllContactsSelected = isSelected
  },
  SET_SELECTED_LIST: (state, payload) => {
    state.selectedList = { ...state.selectedList, ...payload }
  },

  SET_SELECTED_LIST_CONTACT_COUNT: (state, count) => {
    state.selectedList = { ...state.selectedList, contactCount: count }
  },

  SET_SHOULD_UPDATE_SELECTED_LIST_CONTACT_COUNT: (state, shouldUpdate = false) => {
    state.shouldUpdateSelectedListContactCount = shouldUpdate
  },

  SET_SELECTED_STATIC_LIST: (state, payload) => {
    state.selectedStaticList = { ...state.selectedStaticList, ...payload }
  },
  CREATE_LIST_OPEN: (state, payload) => {
    state.createList = { ...state.createList, ...payload, open: true }
  },
  CREATE_DIALOG_OPEN: (state, { id, type }) => {
    state.createDialog = { open: true, id, type }
  },
  CREATE_DIALOG_CLOSE: (state) => {
    state.createDialog = { open: false }
  },
  CREATE_LIST_CLOSE: (state) => {
    state.createList = { folderId: null, open: false, mode: '', type: 1, contact_folder_id: null, name: '', filters: [] }
  },

  SELECT_LIST_OPEN: (state, payload) => {
    state.selectList = { ...state.selectList, ...payload, open: true }
  },
  SELECT_LIST_CLOSE: (state) => {
    state.selectList = { contact_list_id: null, open: false, search_value: '' }
  },

  SET_SELECT_LIST_SEARCH_VALUE: (state, value) => {
    state.selectList = { ...state.selectList, search_value: value }
  },

  SET_FILTERS: (state, filters) => {
    state.filters = filters
  },
  SET_CURRENT_LIST_FILTERS: (state, filters) => {
    state.currentListFilters = filters
  },
  SET_CONTACT: (state, contact) => {
    state.contact = contact
  },
  SET_CONTACT_CLONE: (state, contact) => {
    state.contactClone = { ...contact }
  },
  SET_LINES: (state, lines) => {
    state.lines = lines
  },
  SET_RING_GROUPS: (state, ringGroups) => {
    state.ringGroups = ringGroups
  },
  SET_CONTACT_RING_GROUPS: (state, ringGroups) => {
    state.contactRingGroups = ringGroups
  },
  SET_CONTACT_ATTRIBUTES: (state, attributes) => {
    state.contactAttributes = attributes
  },
  SET_COMMUNICATION_SUMMARY: (state, summary) => {
    state.communicationsSummary = summary
  },
  SET_CONTACT_PHONE_NUMBERS: (state, phoneNumbers) => {
    state.contactPhoneNumbers = phoneNumbers
  },
  ADD_CONTACT_PHONE_NUMBER: (state, phoneNumber) => {
    state.contactPhoneNumbers = [...state.contactPhoneNumbers, phoneNumber]
  },
  REMOVE_CONTACT_PHONE_NUMBER: (state, phoneNumber) => {
    const index = state.contactPhoneNumbers.findIndex(phone => phone.id === phoneNumber.id)

    state.contactPhoneNumbers.splice(index, 1)
  },
  SET_SIDEBAR_COLLAPSED: (state, isCollapsed) => {
    state.isSidebarCollapsed = isCollapsed
  },
  SET_CONTACT_NAME_EDIT_OPEN: (state, isOpen) => {
    state.isContactNameEditOpen = isOpen
  },
  SET_CONTACT_TAGS: (state, tags) => {
    state.contact.tags = tags
  },
  SET_CONTACT_LINES: (state, lines) => {
    state.contact.campaign_ids = lines
  },
  PUSH_CONTACT_LINE: (state, lineId) => {
    state.contact.campaign_ids = [...state.contact.campaign_ids, lineId]
  },
  SET_CONTACT_SELECTED_PHONE: (state, phone) => {
    state.contactSelectedPhone = phone
  },
  UPDATE_CONTACT_SELECTED_PHONE: (state, phone) => {
    state.contactPhoneNumbers = state.contactPhoneNumbers.map(item => item.id === phone.id
      ? {
        ...item,
        ...{
          phone_number: phone.phone_number,
          title: phone.title,
          is_opted_out: phone.is_opted_out
        }
      } : item)
  },
  SET_SELECTED_LINE: (state, line) => {
    state.selectedLine = line
  },

  SET_MESSAGE_COMPOSER_MODE: (state, mode = 'sms') => {
    state.messageComposer.mode = mode
  },

  SET_MESSAGE_COMPOSER_PHONE_SMS_NUMBER: (state, phoneNumber) => {
    state.messageComposer.sms = { ...state.messageComposer.sms, phone_number: phoneNumber }
  },
  SET_MESSAGE_COMPOSER_SMS_BODY: (state, body) => {
    state.messageComposer.sms = { ...state.messageComposer.sms, body: body.trim() }
  },
  SET_MESSAGE_COMPOSER_SMS_GIF: (state, gif) => {
    state.messageComposer.sms = { ...state.messageComposer.sms, gif_url: gif }
  },
  SET_MESSAGE_COMPOSER_ATTACHMENTS: (state, attachments) => {
    state.messageComposer.sms.attachments = attachments
  },
  APPEND_MESSAGE_COMPOSER_SMS_ATTACHMENTS: (state, attachments) => {
    state.messageComposer.sms.attachments.push(attachments)
  },

  REMOVE_MESSAGE_COMPOSER_SMS_ATTACHMENT: (state, attachment) => {
    const found = state.messageComposer.sms.attachments.find(item => item.id === attachment.id)
    if (found) {
      state.messageComposer.sms.attachments.splice(state.messageComposer.sms.attachments.indexOf(found), 1)
    }
  },
  RESET_MESSAGE_COMPOSER_SMS: (state) => {
    state.messageComposer.sms = { ...state.messageComposer.sms, body: '', attachments: [], gif_url: '' }
  },

  SET_MESSAGE_COMPOSER_FAX_FILENAME: (state, filename) => {
    state.messageComposer.fax.filename = filename
  },
  RESET_MESSAGE_COMPOSER_FAX: (state) => {
    state.messageComposer.fax = { ...state.messageComposer.fax, filename: '' }
  },

  SET_MESSAGE_COMPOSER_EMAIL_BODY: (state, body) => {
    state.messageComposer.email.body = body
  },
  RESET_MESSAGE_COMPOSER_EMAIL: (state) => {
    state.messageComposer.email = { ...state.messageComposer.email, body: '', subject: '' }
  },

  RESET_MESSAGE_COMPOSER_NOTE: (state) => {
    state.messageComposer.note = { ...state.messageComposer.note, body: '', date: null, time: null, timezone: null }
  },
  SET_MESSAGE_COMPOSER_NOTE_BODY: (state, body) => {
    state.messageComposer.note.body = body
  },
  SCHEDULE_MESSAGE_OPEN: (state, isOpen) => {
    state.isScheduleMessageOpen = isOpen
  },
  SCHEDULE_MESSAGE_LIST_OPEN: (state, isOpen) => {
    state.isScheduledMessageListOpen = isOpen
  },
  ADD_APPOINTMENT_OPEN: (state, isOpen) => {
    state.isAddAppointmentOpen = isOpen
  },
  APPOINTMENT_SUBMITTED: (state, isSubmitted) => {
    state.isAppointmentSubmitted = isSubmitted
  },
  ADD_POWER_DIALER_OPEN: (state, isOpen) => {
    state.isAddPowerDialerOpen = isOpen
  },
  ENROLL_SEQUENCE_OPEN: (state, isOpen) => {
    state.isEnrollSequenceOpen = isOpen
  },
  ADD_REMINDER_OPEN: (state, isOpen) => {
    state.isAddReminderOpen = isOpen
  },
  SMS_TEMPLATE_MODAL: (state, { isOpen, scope = 'user', template }) => {
    state.smsTemplateModal = { ...state.smsTemplateModal, open: isOpen, scope: scope, template: template }
  },
  CHANGING_SELECTED_CONTACT: (state, isChanging) => {
    state.changingSelectedContact = isChanging
  },
  SET_SEARCH: (state, value) => {
    state.search = value
  },
  RESET_SEARCH: (state) => {
    state.search = ''
  },
  UPDATE_CHANGED_CONTACT_PROPERTIES: (state, { name, value }) => {
    const found = { data: null }
    if (state.contactClone[name] !== value) {
      found.data = state.changedContactProperties.find(item => item.property === name)
      found.data = found.data ? state.changedContactProperties.indexOf(found.data) : null

      if (found.data !== -1 && found.data !== null) {
        Vue.set(state.changedContactProperties[found.data], 'value', value)
        return
      }

      state.changedContactProperties.push({ property: name, value: value })
    } else {
      found.data = [...state.changedContactProperties]
      state.changedContactProperties = found.data.filter(item => item.property !== name)
    }
  },

  UPDATE_CHANGED_CONTACT_ATTRIBUTES: (state, { name, value }) => {
    const attr = state.contactAttributes.find(item => item.name === name)
    // need to get in sync with contact attribute values
    if (attr.value === null && typeof value === 'string' && value.trim().length === 0) {
      value = null
    }

    if (attr && attr.value !== value) {
      const index = state.changedContactAttributes.findIndex(item => item.field === name)
      if (index >= 0) {
        state.changedContactAttributes[index].value = value
      } else {
        state.changedContactAttributes.push({ field: name, value: value })
      }
    } else {
      state.changedContactAttributes = state.changedContactAttributes.filter(item => item.name === name)
    }
  },
  SET_CHANGED_CONTACT_PROPERTIES: (state, payload) => {
    state.changedContactProperties = payload
  },
  RESET_CHANGED_CONTACT_PROPERTIES: (state) => {
    state.changedContactProperties = []
  },
  RESET_CHANGED_CONTACT_ATTRIBUTES: (state) => {
    state.changedContactAttributes = []
  },
  UPDATE_CONTACTS: (state, payload) => {
    // sanity check
    if (!state.listItems[state.selectedList.id]?.data) {
      return
    }

    const found = { data: state.listItems[state.selectedList.id].data.find(contact => contact.id === payload.id) }
    found.data = found.data ? state.listItems[state.selectedList.id].data.indexOf(found.data) : null

    if (found.data !== -1 && found.data !== null) {
      Vue.set(state.listItems[state.selectedList.id].data, found.data, payload)
    }
  },
  SET_CONTACTS: (state, payload) => {
    state.listItems[state.selectedList.id].data = payload
  },
  ON_SEARCH_PD_ITEM: (state, value) => {
    state.searchedPdItem = value
  },
  SET_SHOW_CONTACTS_HEADER: (state, value) => {
    state.showContactsHeader = value
  },
  SET_SHOW_CONTACTS_LIST_SIDEBAR: (state, value) => {
    state.showContactsListSidebar = value
  },
  SET_SHOW_MY_CONTACTS: (state, value) => {
    state.showMyContacts = value
  },
  SET_ADD_VIEW_SHOW_MY_CONTACTS: (state, value) => {
    state.showAddViewMyContacts = value
  },
  SET_UNSAVED_LIST: (state, data) => {
    state.unsavedList = data
  },
  SET_UNSAVED_LIST_NAME: (state, name) => {
    Vue.set(state.unsavedList, 'name', name)
    Vue.set(state.unsavedList.params, 'name', name)
  },
  SET_ACTIVE_FOLDER: (state, value) => {
    state.activeFolder = value
  },
  CLEAR_LIST: (state) => {
    state.clearList = !state.clearList
  },

  RESET_VUEX (state, value) {
    if (!_.isArray(value) || _.isEmpty(value)) {
      return
    }

    state.search = ''
    state.currentListFilters = {}
    state.contact = {}

    const contactsListDefaultListState = Object.assign({}, ContactsListDefaultList.DEFAULT_STATE.lists)
    const item = { index: null }
    for (item.index in state.lists) {
      if (typeof contactsListDefaultListState[item.index] === 'undefined') {
        Vue.delete(state.lists, item.index)
        continue
      }

      if (value.includes('non-cache')) {
        // delete contactsListDefaultListState[item.index].filters
        delete contactsListDefaultListState[item.index].headers
      }

      Vue.set(state.lists, `${item.index}`, Object.assign(state.lists[item.index], contactsListDefaultListState[item.index]))
    }

    // cached state
    const contactsDefaultState = Object.assign({}, ContactsDefault.DEFAULT_STATE)
    if (value.includes('non-cache')) {
      delete contactsDefaultState.lists
      delete contactsDefaultState.showMyContacts
      delete contactsDefaultState.isShortenedUrlRemembered
    }

    state = Object.assign(state, contactsDefaultState)

    if (value.includes('non-cache')) {
      for (item.index in state.listItems) {
        state.listItems[item.index] = DEFAULT_CONTACT_LIST_ITEMS
      }
    }

    if (!value.includes('all')) {
      return
    }

    // else, perform state reset
    state = Object.assign({}, ContactsDefault.DEFAULT_STATE)
  },
  SET_PINNED_LISTS_LOADED (state, value) {
    state.pinnedListsLoaded = value
  },
  SET_PUBLIC_LISTS_LOADED (state, value) {
    state.publicListsLoaded = value
  },
  SET_MY_LISTS_LOADED (state, value) {
    state.myListsLoaded = value
  },
  SET_LIST_CONTACTS_LOADED (state, value) {
    state.listContactsLoaded = value
  },
  SET_LIST_CONTACT_OWNER (state, ownerId) {
    Vue.set(state.lists, `my-contacts`, Object.assign(state.lists['my-contacts'], { filters: {
      0: {
        filters: {
          contact_owner: [
            {
              operator: OPERATORS.IS_ANY_OF,
              value: [ownerId]
            }
          ]
        },
        is_conjunction: true
      }
    } }))
  },
  SET_PREVIOUS_LIST_FILTERS (state, payload) {
    state.previousListFilters = payload
  },
  SET_PREVIOUSLY_SAVED_LIST_ID (state, id) {
    state.previouslySavedListId = id
  },
  SET_PREVIOUS_LIST_ID (state, id) {
    state.previousListId = id
  },
  SET_SEQUENCE_INFO (state, payload) {
    Vue.set(state.sequenceInfo, 'sequence', payload.sequence)
    Vue.set(state.sequenceInfo, 'workflow', payload.workflow)
  },
  SET_SEQUENCE_INFO_LOADING (state, value) {
    state.sequenceInfoLoading = value
  },
  SET_LINE_INCOMING_NUMBER (state, payload) {
    state.lineIncomingNumber = payload
  },
  SET_LINE_INCOMING_NUMBER_LOADING (state, value) {
    state.lineIncomingNumberLoading = value
  },
  SET_IS_CONTACT_MIXIN_USED (state, value) {
    state.isContactMixinUsed = value
  },
  SET_IS_SHORTENED_URL_REMEMBERED (state, value) {
    state.isShortenedUrlRemembered = value
  },
  SET_DEFAULT_IS_SHORTENED_URL_REMEMBERED (state) {
    state.isShortenedUrlRemembered = false
  },
  SET_SHOW_CONTACT_RESOURCE_UNAVAILABLE (state, value) {
    state.showContactResourceUnavailable = value
  },
  ADD_AXIOS_UNIQUE_ID (state, value) {
    state.inProgressAxiosUniqueIds.push(value)
  },
  REMOVE_AXIOS_UNIQUE_ID (state, value) {
    const index = state.inProgressAxiosUniqueIds.findIndex(item => item === value)

    if (index !== -1) {
      state.inProgressAxiosUniqueIds.splice(index, 1)
    }
  }
}
