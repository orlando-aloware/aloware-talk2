export default {
  selectedFilter: (state) => state.selectedFilter,
  hasMoreContacts: (state) => state.hasMoreContacts,
  hasMoreCommunications: (state) => state.hasMoreCommunications,
  getOpenTaskCount: (state) => state.taskCounts.open,
  allInboxFilters: (state) => [...state.inboxPersonalFilters, ...state.inboxCompanyFilters],
  isNewInboxEnabled: state => state.newInboxEnabled,
  getNavListItems: state => state.newInboxEnabled ? [state.navListItems[0]] : state.navListItems
}
