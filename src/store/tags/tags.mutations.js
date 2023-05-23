export default {
  SET_SELECTED_TAG_CATEGORY: (state, category) => {
    state.selectedTagCategory = category
  },

  SET_SELECTED_TAG_IDS: (state, tagIds) => {
    // empty/clear all
    if (tagIds.length < 1) {
      state.selectedTagIds = []
      return
    }

    // keep it unique at all times
    state.selectedTagIds = [...new Set([...tagIds])]
  }
}
