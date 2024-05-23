export default {
  selectedFilter: (state) => state.selectedFilter,
  hasMoreContacts: (state) => state.hasMoreContacts,
  hasMoreCommunications: (state) => state.hasMoreCommunications,
  isContactStatusControlEnabled: (state) => state?.currentCompany?.contact_status_control_enabled
}
