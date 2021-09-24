import { TEST_DATA } from 'src/constants/power-dialer/power-dialer-list'

export default {
  opened: (state) => new Set(state.opened),
  filters: (state) => state.filters,
  moveDialog: (state) => state.moveDialog,
  createList: (state) => state.createList,
  isRemoveListOpen: (state) => !!state.removeList,
  pinned: (state) => state.pinned,
  selectedContacts: (state) => state.selectedContacts,
  isStartingDial: (state) => state.isStartingDial,
  folderToRemove: (state) => state.removeFolder || {},
  listToRemove: (state) => state.removeList || {},
  isRemoveFolderOpen: (state) => !!state.removeFolder,
  folders: (state) => state.folders,
  powerDialerList: (state) => {
    /**
     * TEMPORARY VALUES
     */
    return state.lists
  },
  contactResources: (state) => {
    // return state.contactResources
    return TEST_DATA
  }
}
