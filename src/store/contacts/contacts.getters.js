export default {
  opened: (state) => new Set(state.opened),
  isRemoveFolderOpen: (state) => !!state.removeFolder,
  folderToRemove: (state) => state.removeFolder || {},
  isRemoveListOpen: (state) => !!state.removeList,
  listToRemove: (state) => state.removeList || {},
  isRemoveContactOpen: (state) => !!state.removeContact,
  contactToRemove: (state) => state.removeContact || {},
  allcontacts: (state) => state.lists.allcontacts,
  mycontacts: (state) => state.lists.mycontacts,
  unassigned: (state) => state.lists.unassigned,
  newleads: (state) => state.lists.newleads,
  unanswered: (state) => state.lists.unanswered,
  pinnedCounts: (state) => state.pinnedCounts,
  folders: (state) => state.folders,
  columnHeaders: (state) => state.columnHeaders
}
