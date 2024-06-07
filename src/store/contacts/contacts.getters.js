import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import _ from 'lodash'

export default {
  opened: (state) => new Set(state.opened),
  isRemoveFolderOpen: (state) => !!state.removeFolder,
  folderToRemove: (state) => state.removeFolder || {},
  isRemoveListOpen: (state) => !!state.removeList,
  listToRemove: (state) => state.removeList || {},
  isRemoveContactOpen: (state) => !!state.removeContact,
  contactToRemove: (state) => state.removeContact,
  removeContactActionType: (state) => state.removeContactActionType,
  pinnedCounts: (state) => state.pinnedCounts,
  pinned: (state) => state.pinned,
  folders: (state) => state.folders,
  columnsUpdating: (state) => state.columnsUpdating,
  lists: (state) => state.lists,
  listItems: (state) => state.listItems,
  columns: (state) => state.columns,
  moveDialog: (state) => state.moveDialog,
  createDialog: (state) => state.createDialog,
  selectedList: (state) => state.selectedList,
  selectedStaticList: (state) => state.selectedStaticList,
  createList: (state) => state.createList,
  selectList: (state) => state.selectList,
  filters: (state) => state.filters,
  isFiltersOpen: (state) => state.isFiltersOpen,
  isBulkDelete: (state) => state.isBulkDelete,
  search: (state) => state.search,
  pinnedLists: (state) => {
    return Object.values(DEFAULT_PINNED_LIST)
      .map((item) => {
        return {
          ...item,
          to: item.id === 'all' ? '/contacts' : `/contacts/list/${item.id}`
        }
      })
      .concat(state.pinned.map((item) => {
        const list = state.lists[item] || {}
        const id = !_.isEmpty(list) ? list.id : item
        return { ...list, to: `/contacts/list/${id}` }
      }))
      .map((item) => {
        return {
          ...item,
          count: state.pinnedCounts[item.id] || 0
        }
      })
  },
  currentListFilters: (state) => state.currentListFilters,
  contact: (state) => state.contact,
  contactClone: (state) => state.contactClone,
  lines: (state) => state.lines,
  ringGroups: (state) => state.ringGroups,
  contactAttributes: (state) => state.contactAttributes,
  contactPhoneNumbers: (state) => state.contactPhoneNumbers,
  conflictedContactPhoneNumbers: (state) => state.conflictedContactPhoneNumbers,
  contactRingGroups: (state) => state.contactRingGroups,
  isSidebarCollapsed: (state) => state.isSidebarCollapsed,
  isContactNameEditOpen: (state) => state.isContactNameEditOpen,
  contactSelectedPhone: (state) => state.contactSelectedPhone,
  selectedLine: (state) => state.selectedLine,
  messageComposer: (state) => state.messageComposer,
  isScheduleMessageOpen: (state) => state.isScheduleMessageOpen,
  isScheduledMessageListOpen: (state) => state.isScheduledMessageListOpen,
  isAddAppointmentOpen: (state) => state.isAddAppointmentOpen,
  isAppointmentSubmitted: (state) => state.isAppointmentSubmitted,
  isAddPowerDialerOpen: (state) => state.isAddPowerDialerOpen,
  isEnrollSequenceOpen: (state) => state.isEnrollSequenceOpen,
  isAddReminderOpen: (state) => state.isAddReminderOpen,
  changingSelectedContact: (state) => state.changingSelectedContact,
  smsTemplateModal: (state) => state.smsTemplateModal,
  searchedPdItem: (state) => state.searchedPdItem,
  unsavedList: (state) => state.unsavedList,
  activeFolder: (state) => state.activeFolder,
  removedFolder: (state) => state.removedFolder,
  clearList: (state) => state.clearList,
  isAllContactsSelected: (state) => state.isAllContactsSelected,
  isOptoutActive: (state) => state.isOptoutActive,
  optoutText: (state) => state.optoutText,
  messageBodyWithOptout: (state) => {
    const optoutText = state.optoutText
    const messageBody = state.messageComposer.sms.body
    const isOptoutActive = state.isOptoutActive

    if (!isOptoutActive) {
      return messageBody
    }

    return `${messageBody}${optoutText}`
  },
  isContactSaveBarVisible: (state) => {
    const hasChanges = (state.changedContactProperties.length > 0 || state.changedContactAttributes.length > 0)

    return state.contact?.id === state.contactClone.id &&
      hasChanges && !state.changingSelectedContact
  }
}
