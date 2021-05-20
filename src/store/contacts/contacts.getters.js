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
  allContacts: (state) => state.listItems.allContacts,
  myContacts: (state) => state.listItems.myContacts,
  unassigned: (state) => state.listItems.unassigned,
  newleads: (state) => state.listItems.newleads,
  unanswered: (state) => state.listItems.unanswered
}
