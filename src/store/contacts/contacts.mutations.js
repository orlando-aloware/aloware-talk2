export default {
  SET_CONTACTS (state, contacts) {
    state.contacts = contacts
  },
  SET_COUNTS (state, payload) {
    state.newLeadsCount = payload['new_leads_count']
    state.totalContactCount = payload['total_contact_count']
    state.unreadsCount = payload['unreads_count']
  },
  SET_LOADING (state, loading) {
    state.loading = loading
  }
}
