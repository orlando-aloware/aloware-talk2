import { getField } from 'vuex-map-fields'

export default {
  getField,
  myQueue: (state) => state.myQueue,
  myQueueId: (state) => state.myQueue?.id,
  flaggedCreateExisting: (state) => state.flaggedCreateExisting,
  opened: (state) => new Set(state.opened),
  filters: (state) => state.filters,
  moveDialog: (state) => state.moveDialog,
  createDialog: (state) => state.createDialog,
  createList: (state) => state.createList,
  isRemoveListOpen: (state) => !!state.removeList,
  pinned: (state) => state.pinned,
  isStartingDial: (state) => state.isStartingDial,
  folderToRemove: (state) => state.removeFolder || {},
  listToRemove: (state) => state.removeList || {},
  isRemoveFolderOpen: (state) => !!state.removeFolder,
  folders: (state) => state.folders,
  listItems: (state) => state.listItems,
  selectedPdList: (state) => state.selectedPdList,
  currentListFilters: (state) => state.currentListFilters,
  powerDialerLists: (state) => state.powerDialerLists,
  // powerDialerListItems: (state) => state.powerDialerListItems,
  powerDialerDirectoryList: (state) => {
    /**
     * TEMPORARY VALUES
     */
    return state.lists
  },
  contactResources: (state) => {
    return []
  },
  // contact: (state) => state.contact,
  contactResources2: (state) => state.contactResources,
  // contacts: (state) => state.contacts,
  searchedListItem: (state) => state.searchedListItem,
  datatableLoader: (state) => state.datatableLoader,
  search: (state) => state.search,
  sessionLoader: (state) => state.sessionLoader,
  sessionSidebarExpanded: (state) => state.sessionSidebarExpanded,
  changingSelectedContact: (state) => state.changingSelectedContact,
  activeFilter: (state) => {
    if (state.activeFilter) {
      return state.activeFilter
    }
    return 'in-queue'
  },
  filteredEndpoint: (state) => state.filteredEndpoint,
  sessionSettings: (state) => state.sessionSettings,
  defaultSettings: (state) => state.defaultSettings,
  personalSessionSettings: (state) => state.sessionSettingGroups.personal,
  companySessionSettings: (state) => state.sessionSettingGroups.company,
  sessionSettingGroups: (state) => state.sessionSettingGroups,
  warmupDurations: (state) => state.warmupDurations,
  bulkAddNotifications: (state) => (listId) => {
    return state.bulkAddContactsNotification[listId]
  }
}
