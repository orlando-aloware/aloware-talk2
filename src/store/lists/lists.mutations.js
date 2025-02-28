import { updateField } from 'vuex-map-fields'

export default {
  updateField,

  SET_LISTS (state, lists) {
    state.lists = lists
  },

  SET_LISTS_COUNT (state, count) {
    state.listsCount = count
  },

  SET_LISTS_LOADING (state, payload) {
    state.isListsLoading = payload
  },

  SET_SEARCH (state, search) {
    state.search = search
  }
}
