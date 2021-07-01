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
  SET_REMOVE_LIST_ACTION_TYPE: (state, type) => {
    state.removeListActionType = type
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
  CONTACTS_LOADED: (state, { id, append, data, ...rest }) => {
    if (append) {
      state.listItems =
      state.listItems = {
        ...state.listItems,
        [String(id)]: {
          ...state.listItems[String(id)],
          ...rest,
          data: state.listItems[String(id)].data.concat(data)
        }
      }
    } else {
      state.listItems = { ...state.listItems, [String(id)]: { data, ...rest } }
    }
  },
  PINNED_COUNT_LOADED: (state, payload) => {
    state.pinnedCounts[payload.id] = payload.count
  },
  FOLDERS_LOADED: (state, folders) => {
    state.folders = folders
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
  SET_SELECTED_LIST: (state, payload) => {
    state.selectedList = { ...state.selectedList, ...payload }
  },

  SET_SELECTED_STATIC_LIST: (state, payload) => {
    state.selectedStaticList = { ...state.selectedStaticList, ...payload }
  },
  CREATE_LIST_OPEN: (state, payload) => {
    state.createList = { ...state.createList, ...payload, open: true }
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
  SET_LINES: (state, lines) => {
    state.lines = lines
  },
  SET_RING_GROUPS: (state, ringGroups) => {
    state.ring_groups = ringGroups
  },
  SET_CONTACT_RING_GROUPS: (state, ringGroups) => {
    state.contact_ring_groups = ringGroups
  },
  SET_CONTACT_ATTRIBUTES: (state, attributes) => {
    state.contact_attributes = attributes
  },
  SET_CONTACT_PHONE_NUMBERS: (state, phoneNumbers) => {
    state.contact_phone_numbers = phoneNumbers
  },
  ADD_CONTACT_PHONE_NUMBER: (state, phoneNumber) => {
    state.contact_phone_numbers = [...state.contact_phone_numbers, phoneNumber]
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
    state.contact_selected_phone = phone
  },
  UPDATE_CONTACT_SELECTED_PHONE: (state, phone) => {
    state.contact_phone_numbers = state.contact_phone_numbers.map(item => item.id === phone.id ? { ...item, ...{ phone_number: phone.phone_number, title: phone.title } } : item)
  },
  SET_SELECTED_LINE: (state, line) => {
    state.selected_line = line
  },
  SET_MESSAGE_COMPOSER_PHONE_SMS_NUMBER: (state, phoneNumber) => {
    state.message_composer.sms = { ...state.message_composer.sms, phone_number: phoneNumber }
  },
  SET_MESSAGE_COMPOSER_SMS_BODY: (state, body) => {
    state.message_composer.sms = { ...state.message_composer.sms, body: body }
  },
  SET_MESSAGE_COMPOSER_SMS_GIF: (state, gif) => {
    state.message_composer.sms = { ...state.message_composer.sms, gif_url: gif }
  },
  SET_MESSAGE_COMPOSER_ATTACHMENTS: (state, attachments) => {
    state.message_composer.sms.attachments = attachments
  },
  APPEND_MESSAGE_COMPOSER_SMS_ATTACHMENTS: (state, attachment) => {
    state.message_composer.sms.attachments.push(attachment)
  },

  REMOVE_MESSAGE_COMPOSER_SMS_ATTACHMENT: (state, attachment) => {
    let found = state.message_composer.sms.attachments.find(item => item.id === attachment.id)
    if (found) {
      state.message_composer.sms.attachments.splice(state.message_composer.sms.attachments.indexOf(found), 1)
    }
  },
  RESET_MESSAGE_COMPOSER_SMS: (state) => {
    state.message_composer.sms = { ...state.message_composer.sms, body: '', attachments: [], gif_url: '' }
  },

  SET_MESSAGE_COMPOSER_FAX_FILENAME: (state, filename) => {
    state.message_composer.fax.filename = filename
  },
  RESET_MESSAGE_COMPOSER_FAX: (state) => {
    state.message_composer.fax = { ...state.message_composer.fax, filename: '' }
  },

  SET_MESSAGE_COMPOSER_EMAIL_BODY: (state, body) => {
    state.message_composer.email.body = body
  },
  RESET_MESSAGE_COMPOSER_EMAIL: (state) => {
    state.message_composer.email = { ...state.message_composer.email, body: '', subject: '' }
  },

  RESET_MESSAGE_COMPOSER_NOTE: (state) => {
    state.message_composer.note = { ...state.message_composer.note, body: '', date: null, time: null, timezone: null }
  },
  SET_MESSAGE_COMPOSER_NOTE_BODY: (state, body) => {
    state.message_composer.note.body = body
  }
}
