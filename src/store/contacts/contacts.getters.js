import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'

export default {
  opened: (state) => new Set(state.opened),
  isRemoveFolderOpen: (state) => !!state.removeFolder,
  folderToRemove: (state) => state.removeFolder || {},
  isRemoveListOpen: (state) => !!state.removeList,
  listToRemove: (state) => state.removeList || {},
  removeListActionType: (state) => state.removeListActionType,
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
  selectedContacts: (state) => state.selectedContacts,
  selectedList: (state) => state.selectedList,
  selectedStaticList: (state) => state.selectedStaticList,
  createList: (state) => state.createList,
  selectList: (state) => state.selectList,
  filters: (state) => state.filters,
  isFiltersOpen: (state) => state.isFiltersOpen,
  isBulkDelete: (state) => state.isBulkDelete,
  pinnedLists: (state) => {
    const pinnedLists = Object.values(DEFAULT_PINNED_LIST)
      .map((item) => {
        return {
          ...item,
          to: item.id === 'all' ? '/contacts' : `/contacts/list/${item.id}`
        }
      })
      .concat(state.pinned.map((item) => {
        const list = state.lists[item] || {}
        return { ...list, to: `/contacts/list/${list.id}` }
      }))
      .map((item) => {
        return {
          ...item,
          count: state.pinnedCounts[item.id] || 0
        }
      })

    return pinnedLists
  },
  currentListFilters: (state) => state.currentListFilters,
  contact: (state) => state.contact,
  contactClone: (state) => state.contactClone,
  lines: (state) => state.lines,
  ringGroups: (state) => state.ringGroups,
  contactAttributes: (state) => state.contactAttributes,
  contactPhoneNumbers: (state) => state.contactPhoneNumbers,
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
  isEnrollSequenceOpen: (state) => state.isEnrollSequenceOpen,
  isAddReminderOpen: (state) => state.isAddReminderOpen,
  changingSelectedContact: (state) => state.changingSelectedContact,
  smsTemplateModal: (state) => state.smsTemplateModal
}
