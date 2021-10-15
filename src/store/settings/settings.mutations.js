export default {
  SET_ITEMS: (state, items) => {
    state.items = items
  },
  SET_USER: (state, user) => {
    state.user = user
  },
  SET_USER_CLONE: (state, user) => {
    state.userClone = { ...state.userClone, ...user }
  },
  UPDATE_CHANGED_USER_PROPERTIES: (state, { name, value }) => {
    if (state.userClone[name] !== value) {
      let prop = state.changedUserProperties.find(item => item.property === name)
      if (prop) {
        prop.value = value
      } else {
        state.changedUserProperties.push({ property: name, value: value })
      }
    } else {
      let changedProp = [...state.changedUserProperties]
      state.changedUserProperties = changedProp.filter(item => item.property !== name)
    }
  },
  RESET_CHANGED_USER_PROPERTIES: (state) => {
    state.changedUserProperties = []
  },

  SET_FORM_VALIDITY: (state, isValid) => {
    state.formIsValid = isValid
  }
}
