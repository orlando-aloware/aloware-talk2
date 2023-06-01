import * as TagsDefault from 'src/constants/tags-default'

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
  },

  SET_SELECTED_TAGS_CONTACTS_COUNT: (state, count) => {
    state.selectedTagsContactsCount = +count
  },

  ADD_SELECTED_TAGS_CONTACTS_COUNT: (state, count) => {
    state.selectedTagsContactsCount += +count
  },

  SUBTRACT_SELECTED_TAGS_CONTACTS_COUNT: (state, count) => {
    state.selectedTagsContactsCount -= +count
  },

  RESET_VUEX (state) {
    state = Object.assign({}, TagsDefault.DEFAULT_STATE)
  }
}
