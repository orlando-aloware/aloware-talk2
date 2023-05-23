export default {
  setSelectedTagCategory: ({ commit }, category) => {
    commit('SET_SELECTED_TAG_CATEGORY', category)
  },

  setSelectedTagIds: ({ commit }, tagIds) => {
    commit('SET_SELECTED_TAG_IDS', tagIds)
  }
}
