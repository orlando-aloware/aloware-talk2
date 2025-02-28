import { getField } from 'vuex-map-fields'

export default {
  getField,
  getLists: (state) => state.lists,
  getListsCount: (state) => state.listsCount
}
