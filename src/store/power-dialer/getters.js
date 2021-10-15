import { TEST_DATA } from 'src/constants/power-dialer/power-dialer-list'

export default {
  opened: (state) => new Set(state.opened),
  filters: (state) => state.filters,
  moveDialog: (state) => state.moveDialog,
  createDialog: (state) => state.createDialog,
  createList: (state) => state.createList,
  isRemoveListOpen: (state) => !!state.removeList,
  pinned: (state) => state.pinned,
  selectedContacts: (state) => state.selectedContacts,
  isStartingDial: (state) => state.isStartingDial,
  folderToRemove: (state) => state.removeFolder || {},
  listToRemove: (state) => state.removeList || {},
  isRemoveFolderOpen: (state) => !!state.removeFolder,
  folders: (state) => state.folders,
  listItems: (state) => state.listItems,
  currentListFilters: (state) => state.currentListFilters,
  powerDialerLists: (state) => state.powerDialerLists,
  powerDialerList: (state) => {
    /**
     * TEMPORARY VALUES
     */
    return state.lists
  },
  contactResources: (state) => {
    return TEST_DATA
  },
  contactResources2: (state) => state.contactResources,
  contacts: (state) => state.contacts,
  searchedListItem: (state) => state.searchedListItem,
  datatableLoader: (state) => state.datatableLoader
}
