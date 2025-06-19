import _ from 'lodash'
import * as SettingsDefault from 'src/constants/settings-default'
import { updateField } from 'vuex-map-fields'

export default {
  updateField,
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
    const hasChanges = { data: !1 }
    switch (true) {
      case [ typeof value, typeof state.userClone[name] ].includes('object'):
        if (name === 'reminders_options') {
          hasChanges.data = JSON.stringify(state.userClone[name].sort()) !== JSON.stringify(value.sort())
        } else {
          hasChanges.data = JSON.stringify(state.userClone[name]) !== JSON.stringify(value)
        }

        break
      case name === 'missed_calls_settings.missed_call_handling_mode':
        hasChanges.data = state.userClone.missed_calls_settings['missed_call_handling_mode'] !== value
        break
      case name === 'myCalls':
        hasChanges.data = (state.userClone['calls_inapp_notifs'] ||
        state.userClone['calls_desktop_notifs'] ||
        state.userClone['calls_push_notifs'] ||
        state.userClone['calls_email_notifs'] ||
        state.userClone['calls_text_notifs']) !== value
        break
      case name === 'myTexts':
        hasChanges.data = (state.userClone['texts_inapp_notifs'] ||
          state.userClone['texts_desktop_notifs'] ||
          state.userClone['texts_push_notifs'] ||
          state.userClone['texts_email_notifs'] ||
          state.userClone['texts_text_notifs']) !== value
        break
      case name === 'myVoicemails':
        hasChanges.data = (state.userClone['voicemails_inapp_notifs'] ||
          state.userClone['voicemails_desktop_notifs'] ||
          state.userClone['voicemails_push_notifs'] ||
          state.userClone['voicemails_email_notifs'] ||
          state.userClone['voicemails_text_notifs']) !== value
        break
      case name === 'myAppointments':
        hasChanges.data = (state.userClone['appointments_inapp_notifs'] ||
          state.userClone['appointments_desktop_notifs'] ||
          state.userClone['appointments_push_notifs'] ||
          state.userClone['appointments_email_notifs']) !== value
        break
      case name === 'myReminders':
        hasChanges.data = (state.userClone['reminders_inapp_notifs'] ||
          state.userClone['reminders_desktop_notifs'] ||
          state.userClone['reminders_push_notifs'] ||
          state.userClone['reminders_email_notifs']) !== value
        break
      case name === 'myContacts':
        hasChanges.data = (state.userClone['contacts_inapp_notifs'] ||
          state.userClone['contacts_desktop_notifs'] ||
          state.userClone['contacts_push_notifs'] ||
          state.userClone['contacts_email_notifs'] ||
          state.userClone['contacts_text_notifs']) !== value
        break
      case name === 'myFaxes':
        hasChanges.data = (state.userClone['faxes_inapp_notifs'] ||
          state.userClone['faxes_desktop_notifs'] ||
          state.userClone['faxes_push_notifs'] ||
          state.userClone['faxes_email_notifs'] ||
          state.userClone['faxes_text_notifs']) !== value
        break
      case name === 'myMentions':
        hasChanges.data = (state.userClone['mentions_inapp_notifs'] ||
          state.userClone['mentions_desktop_notifs'] ||
          state.userClone['mentions_push_notifs'] ||
          state.userClone['mentions_email_notifs'] ||
          state.userClone['mentions_text_notifs']) !== value
        break
      case name === 'inAppNotifications':
        hasChanges.data = (state.userClone['calls_inapp_notifs'] ||
          state.userClone['texts_inapp_notifs'] ||
          state.userClone['voicemails_inapp_notifs'] ||
          state.userClone['contacts_inapp_notifs'] ||
          state.userClone['appointments_inapp_notifs'] ||
          state.userClone['reminders_inapp_notifs'] ||
          state.userClone['faxes_inapp_notifs'] ||
          state.userClone['mentions_inapp_notifs']) !== value
        break
      case name === 'desktopNotifications':
        hasChanges.data = (state.userClone['calls_desktop_notifs'] ||
          state.userClone['texts_desktop_notifs'] ||
          state.userClone['voicemails_desktop_notifs'] ||
          state.userClone['contacts_desktop_notifs'] ||
          state.userClone['appointments_desktop_notifs'] ||
          state.userClone['reminders_desktop_notifs'] ||
          state.userClone['faxes_desktop_notifs'] ||
          state.userClone['mentions_desktop_notifs']) !== value
        break
      case name === 'mobileNotifications':
        hasChanges.data = (state.userClone['calls_push_notifs'] ||
          state.userClone['texts_push_notifs'] ||
          state.userClone['voicemails_push_notifs'] ||
          state.userClone['contacts_push_notifs'] ||
          state.userClone['appointments_push_notifs'] ||
          state.userClone['reminders_push_notifs'] ||
          state.userClone['faxes_push_notifs'] ||
          state.userClone['mentions_push_notifs']) !== value
        break
      case name === 'emailNotifications':
        hasChanges.data = (state.userClone['calls_email_notifs'] ||
          state.userClone['texts_email_notifs'] ||
          state.userClone['voicemails_email_notifs'] ||
          state.userClone['contacts_email_notifs'] ||
          state.userClone['appointments_email_notifs'] ||
          state.userClone['reminders_email_notifs'] ||
          state.userClone['faxes_email_notifs'] ||
          state.userClone['mentions_email_notifs']) !== value
        break
      case name === 'textNotifications':
        hasChanges.data = (state.userClone['calls_text_notifs'] ||
          state.userClone['texts_text_notifs'] ||
          state.userClone['voicemails_text_notifs'] ||
          state.userClone['contacts_text_notifs'] ||
          state.userClone['faxes_text_notifs'] ||
          state.userClone['mentions_text_notifs']) !== value
        break
      default:
        hasChanges.data = state.userClone[name] !== value
    }

    if (hasChanges.data) {
      const prop = state.changedUserProperties.find(item => item.property === name)
      if (prop) {
        prop.value = value
      } else {
        state.changedUserProperties.push({ property: name, value: value })
      }
    } else {
      const changedProp = [...state.changedUserProperties]
      state.changedUserProperties = changedProp.filter(item => item.property !== name)
    }
  },
  RESET_CHANGED_USER_PROPERTIES: (state) => {
    state.changedUserProperties = []
  },

  SET_FORM_VALIDITY: (state, isValid) => {
    state.formIsValid = isValid
  },

  RESET_VUEX (state) {
    state = Object.assign({}, SettingsDefault.DEFAULT_STATE)
  }
}
