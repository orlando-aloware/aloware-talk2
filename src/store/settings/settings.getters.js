import { getField } from 'vuex-map-fields'

export default {
  getField,
  user: (state) => state.user,
  changedUserProperties: (state) => state.changedUserProperties
}
