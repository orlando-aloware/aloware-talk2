export default {
  toggleFolder: ({ commit }, id) => {
    commit('TOGGLE_FOLDER', id)
  },
  openFolder: ({ commit }, id) => {
    commit('OPEN_FOLDER', id)
  },
  closeFolder: ({ commit }, id) => {
    commit('CLOSE_FOLDER', id)
  },
  removeListOpen: ({ commit }, list) => {
    commit('REMOVE_LIST_OPEN', list)
  },
  removeFolderOpen: ({ commit }, folder) => {
    commit('REMOVE_FOLDER_OPEN', folder)
  },
  removeContactOpen: ({ commit }, contact) => {
    commit('REMOVE_CONTACT_OPEN', contact)
  },
  removeListClose: ({ commit }) => {
    commit('REMOVE_LIST_CLOSE')
  },
  removeFolderClose: ({ commit }) => {
    commit('REMOVE_FOLDER_CLOSE')
  },
  removeContactClose: ({ commit }) => {
    commit('REMOVE_CONTACT_CLOSE')
  },
  openFilters: ({ commit }) => {
    commit('FILTERS_OPEN')
  },
  closeFilters: ({ commit }) => {
    commit('FILTERS_CLOSE')
  },
  pinnedCountLoaded: ({ commit }, payload) => {
    commit('PINNED_COUNT_LOADED', payload)
  },
  foldersLoaded: ({ commit }, payload) => {
    commit('FOLDERS_LOADED', payload)
  },
  removeFolderItem: ({ commit }, folder) => {
    commit('REMOVE_FOLDER_ITEM', folder)
  },
  resetRemovedFolders: ({ commit }) => {
    commit('RESET_REMOVED_FOLDERS')
  },
  pinnedLoaded: ({ commit }, payload) => {
    commit('PINNED_LOADED', payload)
  },
  listLoaded: ({ commit }, payload) => {
    commit('LIST_LOADED', payload)
  },
  updateContactsList: ({ commit }, payload) => {
    commit('UPDATE_LIST', payload)
  },
  updateContactsListFilter: ({ commit }, payload) => {
    commit('UPDATE_LIST_FILTER', payload)
  },
  columnsOpen: ({ commit }, payload) => {
    commit('COLUMNS_OPEN', payload)
  },
  columnsClose: ({ commit }) => {
    commit('COLUMNS_CLOSE')
  },
  columnsReordered: ({ commit }, payload) => {
    commit('COLUMNS_REORDERED', payload)
  },
  columnsUpdated: ({ commit }, payload) => {
    commit('COLUMNS_UPDATED', payload)
  },
  listPinToggled: ({ commit }, { id, isPinned }) => {
    commit(isPinned ? 'LIST_PINNED' : 'LIST_UNPINNED', id)
  },
  openMoveDialog: ({ commit }, payload) => {
    commit('MOVE_DIALOG_OPEN', payload)
  },
  closeMoveDialog: ({ commit }) => {
    commit('MOVE_DIALOG_CLOSE')
  },
  setMoveDialogTarget: ({ commit }, payload) => {
    commit('MOVE_DIALOG_TARGET', payload)
  },
  setContactRemoveActionType: ({ commit }, payload) => {
    commit('SET_CONTACT_REMOVE_ACTION_TYPE', payload)
  },
  setBulkDelete: ({ commit }, payload) => {
    commit('SET_BULK_DELETE', payload)
  },
  setListSelectedContacts: ({ commit }, payload) => {
    commit('SET_LIST_SELECTED_CONTACTS', payload)
  },
  setSelectedList: ({ commit }, payload) => {
    commit('SET_SELECTED_LIST', payload)
    // commit('powerDialer/SET_SELECTED_PD_LIST', payload, { root: true })
  },

  setSelectedListContactCount: ({ commit }, count) => {
    commit('SET_SELECTED_LIST_CONTACT_COUNT', count)
  },
  setShouldUpdateSelectedListContactCount: ({ commit }, shouldUpdate) => {
    commit('SET_SHOULD_UPDATE_SELECTED_LIST_CONTACT_COUNT', shouldUpdate)
  },

  setSelectedStaticList: ({ commit }, payload) => {
    commit('SET_SELECTED_STATIC_LIST', payload)
  },
  createListOpen: ({ commit }, payload) => {
    commit('CREATE_LIST_OPEN', payload)
  },
  createPdListOpen: ({ commit }, payload) => {
    commit('CREATE_DIALOG_OPEN', payload)
  },
  createPdListClose: ({ commit }) => {
    commit('CREATE_DIALOG_CLOSE')
  },
  createListClose: ({ commit }) => {
    commit('CREATE_LIST_CLOSE')
  },

  selectListOpen: ({ commit }, payload) => {
    commit('SELECT_LIST_OPEN', payload)
  },
  selectListClose: ({ commit }) => {
    commit('SELECT_LIST_CLOSE')
  },

  setSelectListSearchValue: ({ commit }, value) => {
    commit('SET_SELECT_LIST_SEARCH_VALUE', value)
  },

  setFilters: ({ commit }, filters) => {
    commit('SET_FILTERS', filters)
  },
  setCurrentListFilters: ({ commit }, filters) => {
    commit('SET_CURRENT_LIST_FILTERS', filters)
  },

  setContact: ({ commit }, contact) => {
    commit('SET_CONTACT', contact)
  },
  setContactClone: ({ commit }, contact) => {
    commit('SET_CONTACT_CLONE', contact)
  },
  setLines: ({ commit }, lines) => {
    commit('SET_LINES', lines)
  },
  setRingGroups: ({ commit }, ringGroups) => {
    commit('SET_RING_GROUPS', ringGroups)
  },
  setCommunicationSummary: ({ commit }, summary) => {
    commit('SET_COMMUNICATION_SUMMARY', summary)
  },
  setContactPhoneNumbers: ({ commit }, phoneNumbers) => {
    commit('SET_CONTACT_PHONE_NUMBERS', phoneNumbers)
  },
  setContactRingGroups: ({ commit }, ringGroups) => {
    commit('SET_CONTACT_RING_GROUPS', ringGroups)
  },
  setContactAttributes: ({ commit }, attributes) => {
    commit('SET_CONTACT_ATTRIBUTES', attributes)
  },
  addContactPhoneNumber: ({ commit }, phoneNumber) => {
    commit('ADD_CONTACT_PHONE_NUMBER', phoneNumber)
  },
  removeContactPhoneNumber: ({ commit }, phoneNumber) => {
    commit('REMOVE_CONTACT_PHONE_NUMBER', phoneNumber)
  },
  setSidebarCollapsed: ({ commit }, isCollapsed) => {
    commit('SET_SIDEBAR_COLLAPSED', isCollapsed)
  },
  setContactNameEditOpen: ({ commit }, isOpen) => {
    commit('SET_CONTACT_NAME_EDIT_OPEN', isOpen)
  },
  setContactTags: ({ commit }, tags) => {
    commit('SET_CONTACT_TAGS', tags)
  },
  setContactLines: ({ commit }, lines) => {
    commit('SET_CONTACT_LINES', lines)
  },
  setContactSelectedPhone: ({ commit }, phone) => {
    commit('SET_CONTACT_SELECTED_PHONE', phone)
  },
  updateContactSelectedPhone: ({ commit }, phone) => {
    commit('UPDATE_CONTACT_SELECTED_PHONE', phone)
  },
  setSelectedLine: ({ commit }, line) => {
    commit('SET_SELECTED_LINE', line)
  },
  setMessageComposerMode: ({ commit }, mode) => {
    commit('SET_MESSAGE_COMPOSER_MODE', mode)
  },
  setMessageComposerSmsPhoneNumber: ({ commit }, phoneNumber) => {
    commit('SET_MESSAGE_COMPOSER_PHONE_SMS_NUMBER', phoneNumber)
  },
  setMessageComposerSmsBody: ({ commit }, body) => {
    commit('SET_MESSAGE_COMPOSER_SMS_BODY', body)
  },
  setMessageComposerSmsGif: ({ commit }, gif) => {
    commit('SET_MESSAGE_COMPOSER_SMS_GIF', gif)
  },
  setMessageComposerAttachments: ({ commit }, attachments) => {
    commit('SET_MESSAGE_COMPOSER_ATTACHMENTS', attachments)
  },
  setMessageComposerFaxFilename: ({ commit }, filename) => {
    commit('SET_MESSAGE_COMPOSER_FAX_FILENAME', filename)
  },
  appendMessageComposerSmsAttachments: ({ commit }, attachments) => {
    commit('APPEND_MESSAGE_COMPOSER_SMS_ATTACHMENTS', attachments)
  },
  removeMessageComposerSmsAttachment: ({ commit }, attachment) => {
    commit('REMOVE_MESSAGE_COMPOSER_SMS_ATTACHMENT', attachment)
  },
  resetMessageComposerSms: ({ commit }) => {
    commit('RESET_MESSAGE_COMPOSER_SMS')
  },
  resetMessageComposerFax: ({ commit }) => {
    commit('RESET_MESSAGE_COMPOSER_FAX')
  },

  resetMessageComposerEmail: ({ commit }) => {
    commit('RESET_MESSAGE_COMPOSER_EMAIL')
  },

  setMessageComposerEmailBody: ({ commit }, body) => {
    commit('SET_MESSAGE_COMPOSER_EMAIL_BODY', body)
  },

  resetMessageComposerNote: ({ commit }) => {
    commit('RESET_MESSAGE_COMPOSER_NOTE')
  },

  setMessageComposerNoteBody: ({ commit }, body) => {
    commit('SET_MESSAGE_COMPOSER_NOTE_BODY', body)
  },

  scheduleMessageOpen: ({ commit }, isOpen) => {
    commit('SCHEDULE_MESSAGE_OPEN', isOpen)
  },
  scheduledMessageListOpen: ({ commit }, isOpen) => {
    commit('SCHEDULE_MESSAGE_LIST_OPEN', isOpen)
  },
  addAppointmentOpen: ({ commit }, isOpen) => {
    commit('ADD_APPOINTMENT_OPEN', isOpen)
  },

  appointmentSubmit: ({ commit }, isOpen) => {
    commit('ADD_APPOINTMENT_OPEN', isOpen)
  },

  addPowerDialerOpen: ({ commit }, isOpen) => {
    commit('ADD_POWER_DIALER_OPEN', isOpen)
  },

  enrollSequenceOpen: ({ commit }, isOpen) => {
    commit('ENROLL_SEQUENCE_OPEN', isOpen)
  },
  addReminderOpen: ({ commit }, isOpen) => {
    commit('ADD_REMINDER_OPEN', isOpen)
  },
  selectedContactChanging: ({ commit }, isChanging) => {
    commit('CHANGING_SELECTED_CONTACT', isChanging)
  },
  setSmsTemplateModal: ({ commit }, params) => {
    commit('SMS_TEMPLATE_MODAL', params)
  },
  setSearch: ({ commit }, value) => {
    commit('SET_SEARCH', value)
  },
  resetSearch: ({ commit }, value) => {
    commit('RESET_SEARCH', value)
  },
  updateChangedContactProperties: ({ commit }, params) => {
    commit('UPDATE_CHANGED_CONTACT_PROPERTIES', params)
  },
  updateChangedContactAttributes: ({ commit }, params) => {
    commit('UPDATE_CHANGED_CONTACT_ATTRIBUTES', params)
  },
  setChangedContactProperties: ({ commit }, payload) => {
    commit('SET_CHANGED_CONTACT_PROPERTIES', payload)
  },
  resetChangedContactProperties: ({ commit }) => {
    commit('RESET_CHANGED_CONTACT_PROPERTIES')
  },
  resetChangedContactAttributes: ({ commit }) => {
    commit('RESET_CHANGED_CONTACT_ATTRIBUTES')
  },
  updateContacts: ({ commit }, payload) => {
    commit('UPDATE_CONTACTS', payload)
  },
  setContacts: ({ commit }, payload) => {
    commit('SET_CONTACTS', payload)
  },
  setCreateDialogTarget: ({ commit }, payload) => {
    commit('CREATE_DIALOG_TARGET', payload)
  },
  setShowContactsHeader: ({ commit }, value) => {
    commit('SET_SHOW_CONTACTS_HEADER', value)
  },
  setShowContactsListSidebar: ({ commit }, value) => {
    commit('SET_SHOW_CONTACTS_LIST_SIDEBAR', value)
  },
  setShowMyContacts: ({ commit }, value) => {
    commit('SET_SHOW_MY_CONTACTS', value)
  },
  setAddViewShowMyContacts: ({ commit }, value) => {
    commit('SET_ADD_VIEW_SHOW_MY_CONTACTS', value)
  },
  setUnsavedList: ({ commit }, data) => {
    commit('SET_UNSAVED_LIST', data)
  },
  setUnsavedListName: ({ commit }, name) => {
    commit('SET_UNSAVED_LIST_NAME', name)
  },
  setActiveFolder: ({ commit }, value) => {
    commit('SET_ACTIVE_FOLDER', value)
  },
  clearList: ({ commit }) => {
    commit('CLEAR_LIST')
  },
  setPinnedListsLoaded: ({ commit }, value) => {
    commit('SET_PINNED_LISTS_LOADED', value)
  },
  setPublicListsLoaded: ({ commit }, value) => {
    commit('SET_PUBLIC_LISTS_LOADED', value)
  },
  setMyListsLoaded: ({ commit }, value) => {
    commit('SET_MY_LISTS_LOADED', value)
  },
  setListContactsLoaded: ({ commit }, value) => {
    commit('SET_LIST_CONTACTS_LOADED', value)
  },
  setListContactOwner: ({ commit }, ownerId) => {
    commit('SET_LIST_CONTACT_OWNER', ownerId)
  },
  setAllContactsSelected: ({ commit }, selected) => {
    commit('SET_ALL_CONTACTS_SELECTED', selected)
  },
  setPreviousListFilters: ({ commit }, payload) => {
    commit('SET_PREVIOUS_LIST_FILTERS', payload)
  },
  setPreviouslySavedListId: ({ commit }, id) => {
    commit('SET_PREVIOUSLY_SAVED_LIST_ID', id)
  },
  setPreviousListId: ({ commit }, id) => {
    commit('SET_PREVIOUS_LIST_ID', id)
  },
  setSequenceInfo: ({ commit }, payload) => {
    commit('SET_SEQUENCE_INFO', payload)
  },
  setSequenceInfoLoading: ({ commit }, value) => {
    commit('SET_SEQUENCE_INFO_LOADING', value)
  },
  setLineIncomingNumber: ({ commit }, payload) => {
    commit('SET_LINE_INCOMING_NUMBER', payload)
  },
  setLineIncomingNumberLoading: ({ commit }, value) => {
    commit('SET_LINE_INCOMING_NUMBER_LOADING', value)
  },
  setIsContactMixinUsed: ({ commit }, value) => {
    commit('SET_IS_CONTACT_MIXIN_USED', value)
  },
  setIsShortenedUrlRemembered: ({ commit }, value) => {
    commit('SET_IS_SHORTENED_URL_REMEMBERED', value)
  },
  setDefaultIsShortenedUrlRemembered: ({ commit }) => {
    commit('SET_DEFAULT_IS_SHORTENED_URL_REMEMBERED')
  },
  setShowContactResourceUnavailable: ({ commit }, value) => {
    commit('SET_SHOW_CONTACT_RESOURCE_UNAVAILABLE', value)
  },
  addAxiosUniqueId ({ commit }, value) {
    commit('ADD_AXIOS_UNIQUE_ID', value)
  },
  removeAxiosUniqueId ({ commit }, value) {
    commit('REMOVE_AXIOS_UNIQUE_ID', value)
  }
}
