export default {
  setSelectedTagCategory: ({ commit }, category) => {
    commit('SET_SELECTED_TAG_CATEGORY', category)
  },

  setSelectedTagIds: ({ commit }, tagIds) => {
    commit('SET_SELECTED_TAG_IDS', tagIds)
  },

  setSelectedTagsContactsCount: ({ commit }, count) => {
    commit('SET_SELECTED_TAGS_CONTACTS_COUNT', count)
  },

  addSelectedTagsContactsCount: ({ commit }, count) => {
    commit('ADD_SELECTED_TAGS_CONTACTS_COUNT', count)
  },

  subtractSelectedTagsContactsCount: ({ commit }, count) => {
    commit('SUBTRACT_SELECTED_TAGS_CONTACTS_COUNT', count)
  }
}
