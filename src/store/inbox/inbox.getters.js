export default {
  selectedFilter: (state) => state.selectedFilter,
  hasMoreContacts: (state) => state.hasMoreContacts,
  hasMoreCommunications: (state) => state.hasMoreCommunications,
  getOpenTaskCount: (state) => state.taskCounts.open,
  allFilters: (state) => [...state.personalFilters, ...state.companyFilters]
}
