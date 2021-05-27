export default {
  opened: (state) => new Set(state.opened),
  isRemoveFolderOpen: (state) => !!state.removeFolder,
  folderToRemove: (state) => state.removeFolder || {},
  isRemoveListOpen: (state) => !!state.removeList,
  listToRemove: (state) => state.removeList || {},
  isRemoveContactOpen: (state) => !!state.removeContact,
  contactToRemove: (state) => state.removeContact || {},
  pinnedLists: (state) => state.pinned,
  pinnedCounts: (state) => state.pinnedCounts,
  folders: (state) => state.folders,
  columnsUpdating: (state) => state.columnsUpdating,
  lists: (state) => state.lists,
  listItems: (state) => state.listItems,
  columns: (state) => state.columns,
  moveDialog: (state) => state.moveDialog,
  createList: (state) => state.createList
}
