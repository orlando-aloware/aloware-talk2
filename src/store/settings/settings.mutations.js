import _ from 'lodash'

export default {
  SET_ITEMS: (state, items) => {
    state.items = items
  },
  SET_USER: (state, user) => {
    state.user = user
  },
  SET_USER_CLONE: (state, user) => {
    state.userClone = _.cloneDeep(user)
  },
  UPDATE_CHANGED_USER_PROPERTIES: (state, { name, value }) => {
    let hasChanges = !1

    if ([ typeof value, typeof state.userClone[name] ].includes('object')) {
      hasChanges = JSON.stringify(state.userClone[name]) !== JSON.stringify(value)
    } else if (name === 'missed_calls_settings.missed_call_handling_mode') {
      hasChanges = state.userClone.missed_calls_settings['missed_call_handling_mode'] !== value
    } else {
      hasChanges = state.userClone[name] !== value
    }

    if (hasChanges) {
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
