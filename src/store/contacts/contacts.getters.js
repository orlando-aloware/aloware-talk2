export default {
  opened: (state) => new Set(state.opened),
  isRemoveFolderOpen: (state) => !!state.removeFolder,
  folderToRemove: (state) => state.removeFolder || {},
  isRemoveListOpen: (state) => !!state.removeList,
  listToRemove: (state) => state.removeList || {},
  pinnedLists: (state) => state.pinned,
  allContacts: (state) => state.lists.contacts,
  pinnedCounts: (state) => state.pinnedCounts,
  folders: (state) => state.folders
}
