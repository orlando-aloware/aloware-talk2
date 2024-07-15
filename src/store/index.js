import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import * as Default from '../constants/default'
import * as ActionNotificationsDefault from '../constants/action-notifications-default'
import createPersistedState from 'vuex-persistedstate'
import { getField, updateField } from 'vuex-map-fields'
import auth from './auth'
import cache from './cache'
import contacts from './contacts'
import inbox from './inbox'
import stats from './stats'
import powerDialer from './power-dialer'
import settings from './settings'
import broadcast from './broadcast'
import wallboard from './wallboard'
import tagsModule from './tags'
import accountRegistration from './account-registration'
import API from '../plugins/api/api'
import * as storage from '../plugins/helpers/storage'
import * as DefaultCachePaths from 'src/constants/default-cache'

Vue.use(Vuex)

function resourceExists (arr, resource) {
  return !!arr.find((item) => item.id === resource.id)
}

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      auth,
      contacts,
      inbox,
      stats,
      powerDialer,
      settings,
      broadcast,
      wallboard,
      cache,
      tagsModule,
      accountRegistration
    },

    state: {
      isWidget: false,
      showMenu: false,
      filter: {},
      tags: [],
      campaigns: [],
      campaignsIsLoading: false,
      users: [],
      usersIsLoading: false,
      ringGroups: [],
      workflows: [],
      changelogs: [],
      broadcasts: [],
      dispositionStatuses: [],
      callDispositions: [],
      activityTypes: [],
      templates: [],
      filters: [],
      firstLogin: false,
      userStatus: false,
      oldAgentStatus: false,
      dialer: {
        token: null,
        call: null,
        isReady: false,
        currentStatus: null,
        currentNumber: null,
        communication: null,
        contact: null,
        onSpeaker: false,
        isMuted: false,
        isHeld: false,
        recordingStatus: 'in-progress',
        timer: '',
        wrapUpTimer: '',
        parkedCallTimer: '',
        duration: 0,
        wrapUpDuration: '',
        parkedCallDuration: 0,
        parkedCall: null,
        dealId: null,
        callFishing: {
          communication: null,
          contact: null
        },
        error: {
          message: '',
          code: null
        }
      },
      warnings: [],
      shouldIntroduce: false,
      addedParty: null,
      keyboard: {
        scroll: null,
        resizeMode: null
      },
      currentInputDevice: 'default',
      inputDevices: [],
      currentOutputDevice: 'default',
      outputDevices: [],
      notifications: {
        system: {
          title: '',
          message: '',
          messageIcon: null,
          dateTime: null,
          contactId: '',
          communicationId: '',
          campaignId: '',
          campaignName: '',
          ringGroupName: '',
          phoneNumber: '',
          communication: null,
          contact: null,
          queue: null
        },
        sms: {
          title: '',
          message: '',
          messageIcon: null,
          dateTime: null,
          contactId: '',
          communicationId: '',
          campaignId: '',
          campaignName: '',
          ringGroupName: '',
          phoneNumber: '',
          communication: null,
          contact: null,
          queue: null
        },
        call: {
          title: '',
          message: '',
          messageIcon: null,
          dateTime: null,
          contactId: '',
          communicationId: '',
          campaignId: '',
          campaignName: '',
          ringGroupName: '',
          phoneNumber: '',
          communication: null,
          contact: null,
          queue: null
        },
        callVoicemail: {
          title: '',
          message: '',
          messageIcon: null,
          dateTime: null,
          contactId: '',
          communicationId: '',
          campaignId: '',
          campaignName: '',
          ringGroupName: '',
          phoneNumber: '',
          communication: null,
          contact: null,
          queue: null
        },
        voicemail: {
          title: '',
          message: '',
          messageIcon: null,
          dateTime: null,
          contactId: '',
          communicationId: '',
          campaignId: '',
          campaignName: '',
          ringGroupName: '',
          phoneNumber: '',
          communication: null,
          contact: null,
          queue: null
        },
        mention: {
          title: '',
          message: '',
          messageIcon: null,
          dateTime: null,
          contactId: '',
          communicationId: '',
          campaignId: '',
          campaignName: '',
          ringGroupName: '',
          phoneNumber: '',
          communication: null,
          contact: null,
          queue: null
        },
        incomingCall: {
          title: '',
          message: '',
          messageIcon: null,
          dateTime: null,
          contactId: '',
          communicationId: '',
          campaignId: '',
          campaignName: '',
          ringGroupName: '',
          phoneNumber: '',
          communication: null,
          contact: null,
          queue: null
        },
        callFishing: {
          title: '',
          message: '',
          messageIcon: null,
          dateTime: null,
          contactId: '',
          communicationId: '',
          campaignId: '',
          campaignName: '',
          ringGroupName: '',
          phoneNumber: '',
          communication: null,
          contact: null,
          queue: null
        }
      },
      showIncomingCallNotification: false,
      // cached states
      sidebarFolded: false,
      tagOptions: {
        isReset: false
      },
      tagsFullyLoaded: false,
      prevRoute: null,
      currentRoute: null,
      breadcrumbs: {
        crumbs: '',
        name: ''
      },
      dialerFormStatus: false,
      isMobile: false,
      isTabletOrMobile: false,
      contactDetailsDrawer: false,
      showPhone: false,
      enableAudio: false,
      callFishingQueue: [],
      communicationNotifiedDesktop: [],
      voicemailNotifiedDesktop: [],
      contactNotifiedDesktop: [],
      appointmentNotifiedDesktop: [],
      reminderNotifiedDesktop: [],
      defaultDateFilter: null,
      sessionPhoneExpansion: '',
      notificationAudio: null,
      fishingModeNotificationAudio: null,
      loadingParkedCalls: false,
      parkedCalls: [],
      suspended: false,
      showProFeatureDialog: false,
      leadSources: [],
      isPresignup: true,
      contactsLists: [],
      statics: {
        domain: null,
        favicon: null,
        host: null,
        logo: null,
        logo_inverse: null,
        logo_square: null,
        logo_square_inverse: null,
        name: null,
        path: null,
        referer: null,
        whitelabel: false,
        xmas_enabled: false
      },
      staticsLoaded: false,
      isWhiteLabel: false,
      isCallDisposed: false,
      isContactDisposed: false,
      isIntroVideoVisible: false,
      showedKycDialog: false,
      integrationPDImportSummaries: {},
      isDatatableSelectedAll: false,
      isDatatableCountLoading: false,
      showedKycReloadDialog: false,
      isTrialBannerVisible: false,
      currentTimezone: null
    },

    getters: {
      notifications: (state) => state.notifications,
      breadcrumbs: (state) => state.breadcrumbs,
      contactsLists: (state) => state.contactsLists,
      getField
    },

    actions: {
      setIsWidget ({ commit }, value) {
        commit('SET_IS_WIDGET', value)
      },

      setDialerToken ({ commit }, token) {
        commit('SET_DIALER_TOKEN', token)
      },

      setDialerCall ({ commit }, call) {
        commit('SET_DIALER_CALL', call)
      },

      setDialerIsReady ({ commit }, status) {
        commit('SET_DIALER_IS_READY', status)
      },

      setDialerCurrentStatus ({ commit }, status) {
        commit('SET_DIALER_CURRENT_STATUS', status)
      },

      setDialerCommunication ({ commit }, communication) {
        commit('SET_DIALER_COMMUNICATION', communication)
      },

      setDialerDeal ({ commit }, dealId) {
        commit('SET_DIALER_DEAL', dealId)
      },

      setDialerContact ({ commit }, contact) {
        commit('SET_DIALER_CONTACT', contact)
      },

      setDialerContactTags ({ commit }, tags) {
        commit('SET_DIALER_CONTACT_TAGS', tags)
      },

      setDialerCurrentNumber ({ commit }, currentNumber) {
        commit('SET_DIALER_CURRENT_NUMBER', currentNumber)
      },

      setDialerIsMuted ({ commit }, status) {
        commit('SET_DIALER_IS_MUTED', status)
      },

      setDialerIsHeld ({ commit }, status) {
        commit('SET_DIALER_IS_HELD', status)
      },

      setDialerRecordingStatus ({ commit }, status) {
        commit('SET_DIALER_RECORDING_STATUS', status)
      },

      setDialerDuration ({ commit }, duration) {
        commit('SET_DIALER_DURATION', duration)
      },

      setDialerTimer ({ commit }, timer) {
        commit('SET_DIALER_TIMER', timer)
      },

      setDialerWrapUpDuration ({ commit }, duration) {
        commit('SET_DIALER_WRAP_UP_DURATION', duration)
      },

      setDialerWrapUpTimer ({ commit }, timer) {
        commit('SET_DIALER_WRAP_UP_TIMER', timer)
      },

      setDialerParkedCallDuration ({ commit }, duration) {
        commit('SET_DIALER_PARKED_CALL_DURATION', duration)
      },

      setDialerParkedCallTimer ({ commit }, timer) {
        commit('SET_DIALER_PARKED_CALL_TIMER', timer)
      },

      setDialerParkedCall ({ commit }, communication) {
        commit('SET_DIALER_PARKED_CALL', communication)
      },

      setDialerErrorDefault ({ commit }) {
        commit('SET_DIALER_ERROR_DEFAULT')
      },

      setDialerError ({ commit }, error) {
        commit('SET_DIALER_ERROR', error)
      },

      setOldAgentStatus ({ commit }, status) {
        commit('SET_OLD_AGENT_STATUS', status)
      },

      setUserStatus ({ commit }, status) {
        commit('SET_USER_STATUS', status)
      },

      newCampaign ({ commit }, campaign) {
        commit('NEW_CAMPAIGN', campaign)
      },

      updateCampaign ({ commit }, campaign) {
        commit('UPDATE_CAMPAIGN', campaign)
      },

      deleteCampaign ({ commit }, campaign) {
        commit('DELETE_CAMPAIGN', campaign)
      },

      newFilter ({ commit }, filter) {
        commit('NEW_FILTER', filter)
      },

      setFilters ({ commit }, filters) {
        commit('SET_FILTERS', filters)
      },

      setFilter ({ commit }, filter) {
        commit('SET_FILTER', filter)
      },

      updateFilter ({ commit }, filter) {
        commit('UPDATE_FILTER', filter)
      },

      deleteFilter ({ commit }, filter) {
        commit('DELETE_FILTER', filter)
      },

      setCampaigns ({ commit }, campaigns) {
        commit('SET_CAMPAIGNS', campaigns)
      },

      setCampaignsIsLoading ({ commit }, value) {
        commit('SET_CAMPAIGNS_IS_LOADING', value)
      },

      newDispositionStatus ({ commit }, dispositionStatus) {
        commit('NEW_DISPOSITION_STATUS', dispositionStatus)
      },

      updateDispositionStatus ({ commit }, dispositionStatus) {
        commit('UPDATE_DISPOSITION_STATUS', dispositionStatus)
      },

      deleteDispositionStatus ({ commit }, dispositionStatus) {
        commit('DELETE_DISPOSITION_STATUS', dispositionStatus)
      },

      setDispositionStatuses ({ commit }, dispositionStatuses) {
        commit('SET_DISPOSITION_STATUSES', dispositionStatuses)
      },

      newBulkCallDisposition ({ commit }, callDispositions) {
        commit('NEW_BULK_CALL_DISPOSITION', callDispositions)
      },

      newCallDisposition ({ commit }, callDisposition) {
        commit('NEW_CALL_DISPOSITION', callDisposition)
      },

      updateCallDisposition ({ commit }, callDisposition) {
        commit('UPDATE_CALL_DISPOSITION', callDisposition)
      },

      deleteCallDisposition ({ commit }, callDisposition) {
        commit('DELETE_CALL_DISPOSITION', callDisposition)
      },

      setCallDispositions ({ commit }, callDispositions) {
        commit('SET_CALL_DISPOSITIONS', callDispositions)
      },

      setActivityTypes ({ commit }, activityTypes) {
        commit('SET_ACTIVITY_TYPES', activityTypes)
      },

      newActivityType ({ commit }, activityType) {
        commit('NEW_ACTIVITY_TYPE', activityType)
      },

      deleteActivityType ({ commit }, activityType) {
        commit('DELETE_ACTIVITY_TYPE', activityType)
      },

      setBroadcasts ({ commit }, broadcasts) {
        commit('SET_BROADCASTS', broadcasts)
      },

      setTemplates ({ commit }, templates) {
        commit('SET_TEMPLATES', templates)
      },

      newTag ({ commit }, tag) {
        commit('NEW_TAG', tag)
      },

      updateTag ({ commit }, tag) {
        commit('UPDATE_TAG', tag)
      },

      deleteTag ({ commit }, tag) {
        commit('DELETE_TAG', tag)
      },

      setTags ({ commit }, tags) {
        commit('SET_TAGS', tags)
      },

      newRingGroup ({ commit }, ringGroup) {
        commit('NEW_RING_GROUP', ringGroup)
      },

      updateRingGroup ({ commit }, ringGroup) {
        commit('UPDATE_RING_GROUP', ringGroup)
      },

      deleteRingGroup ({ commit }, ringGroup) {
        commit('DELETE_RING_GROUP', ringGroup)
      },

      setRingGroups ({ commit }, ringGroups) {
        commit('SET_RING_GROUPS', ringGroups)
      },

      resetVuex ({ commit }, value) {
        if (['contacts', 'all'].some(item => value.includes(item)) || (value.length === 1 && value.includes('non-cache'))) {
          commit('contacts/RESET_VUEX', value, { root: true })

          if (!['non-cache', 'all'].some(item => value.includes(item))) {
            return
          }
        }

        if (['inbox', 'all'].some(item => value.includes(item)) || (value.length === 1 && value.includes('non-cache'))) {
          commit('inbox/RESET_VUEX', value, { root: true })

          if (!['non-cache', 'all'].some(item => value.includes(item))) {
            return
          }
        }

        if (['stats', 'all'].some(item => value.includes(item)) || (value.length === 1 && value.includes('non-cache'))) {
          commit('stats/RESET_VUEX', value, { root: true })

          if (!['non-cache', 'all'].some(item => value.includes(item))) {
            return
          }
        }

        if (['power-dialer', 'all'].some(item => value.includes(item)) || (value.length === 1 && value.includes('non-cache'))) {
          commit('powerDialer/RESET_VUEX', value, { root: true })

          if (!['non-cache', 'all'].some(item => value.includes(item))) {
            return
          }
        }

        if (['root', 'all'].some(item => value.includes(item)) || (value.length === 1 && value.includes('non-cache'))) {
          commit('RESET_VUEX', value)

          if (!['non-cache', 'all'].some(item => value.includes(item))) {
            return
          }
        }

        if (value.includes('non-cache')) {
          // do other things for non-cached state and modules
        }

        // reset all others
        if (value.includes('all')) {
          commit('settings/RESET_VUEX', null, { root: true })
          commit('cache/RESET_VUEX', null, { root: true })
          commit('wallboard/RESET_VUEX', null, { root: true })
          commit('tagsModule/RESET_VUEX', null, { root: true })
          commit('broadcast/RESET_VUEX', null, { root: true })
        }
      },

      resetFilters ({ commit }) {
        commit('RESET_FILTERS')
      },

      setUsage ({ commit }, usage) {
        commit('SET_USAGE', usage)
      },

      setFirstLogin ({ commit }, firstLogin) {
        commit('SET_FIRST_LOGIN', firstLogin)
      },

      setSidebarFolded ({ commit }, status) {
        commit('SET_SIDEBAR_FOLDED', status)
      },

      newWorkflow ({ commit }, workflow) {
        commit('NEW_WORKFLOW', workflow)
      },

      setWorkflows ({ commit }, workflows) {
        commit('SET_WORKFLOWS', workflows)
      },

      updateWorkflow ({ commit }, workflow) {
        commit('UPDATE_WORKFLOW', workflow)
      },

      deleteWorkflow ({ commit }, workflow) {
        commit('DELETE_WORKFLOW', workflow)
      },

      setChangelogs ({ commit }, changelogs) {
        commit('SET_CHANGELOGS', changelogs)
      },

      setCommTableFields ({ commit }, fields) {
        commit('SET_COMM_TABLE_FIELDS', fields)
      },

      newUser ({ commit }, user) {
        commit('NEW_USER', user)
      },

      setUsers ({ commit }, users) {
        commit('SET_USERS', users)
      },

      updateUser ({ commit }, user) {
        commit('UPDATE_USER', user)
      },

      updateUserStatus ({ commit }, event) {
        commit('UPDATE_USER_STATUS', event)
      },

      deleteUser ({ commit }, user) {
        commit('DELETE_USER', user)
      },

      setUsersIsLoading ({ commit }, value) {
        commit('SET_USERS_IS_LOADING', value)
      },

      setWarnings ({ commit }, warnings) {
        commit('SET_WARNINGS', warnings)
      },

      setShouldIntroduce ({ commit }, status) {
        commit('SET_SHOULD_INTRODUCE', status)
      },

      setAddedParty ({ commit }, addedParty) {
        commit('SET_ADDED_PARTY', addedParty)
      },

      setCurrentInputDevice ({ commit }, inputDevice) {
        commit('SET_CURRENT_INPUT_DEVICE', inputDevice)
      },

      setInputDevices ({ commit }, inputDevices) {
        commit('SET_INPUT_DEVICES', inputDevices)
      },

      setCurrentOutputDevice ({ commit }, outputDevice) {
        commit('SET_CURRENT_OUTPUT_DEVICE', outputDevice)
      },

      setOutputDevices ({ commit }, outputDevices) {
        commit('SET_OUTPUT_DEVICES', outputDevices)
      },

      deleteTemplate ({ commit }, smsTemplate) {
        commit('DELETE_TEMPLATE', smsTemplate)
      },

      setTagsFullyLoaded ({ commit }, tagsFullyLoaded) {
        commit('SET_TAGS_FULLY_LOADED', tagsFullyLoaded)
      },

      setNotifications ({ commit }, payload) {
        commit('SET_NOTIFICATIONS', payload)
      },

      resetNotifications ({ commit }) {
        commit('RESET_NOTIFICATIONS')
      },

      setShowIncomingCallNotification ({ commit }, value) {
        commit('SET_SHOW_INCOMING_CALL_NOTIFICATION', value)
      },

      setDialerFormStatus ({ commit }, value) {
        commit('SET_DIALER_FORM_STATUS', value)
      },

      setDialerCallFishing ({ commit }, payload) {
        commit('SET_DIALER_CALL_FISHING', payload)
      },

      setIsMobile ({ commit }, value) {
        commit('SET_IS_MOBILE', value)
      },

      setIsTabletOrMobile ({ commit }, value) {
        commit('SET_IS_TABLET_OR_MOBILE', value)
      },

      setContactDetailsDrawer ({ commit }, value) {
        commit('SET_CONTACT_DETAILS_DRAWER', value)
      },

      setShowPhone ({ commit }, value) {
        commit('SET_SHOW_PHONE', value)
      },

      setEnableAudio ({ commit }, value) {
        commit('SET_ENABLE_AUDIO', value)
      },

      removeFromCallFishingNotificationQueue ({ commit }, value) {
        commit('REMOVE_FROM_CALL_FISHING_NOTIFICATION_QUEUE', value)
      },

      addToCallFishingQueue ({ commit }, payload) {
        commit('ADD_TO_CALL_FISHING_QUEUE', payload)
      },

      removeFromCallFishingQueue ({ commit }, value) {
        commit('REMOVE_FROM_CALL_FISHING_QUEUE', value)
      },

      clearCallFishingQueue ({ commit }) {
        commit('CLEAR_CALL_FISHING_QUEUE')
      },

      addCommunicationNotifiedDesktop ({ commit }, payload) {
        commit('ADD_COMMUNICATION_NOTIFIED_DESKTOP', payload)
      },

      addVoicemailNotifiedDesktop ({ commit }, payload) {
        commit('ADD_VOICEMAIL_NOTIFIED_DESKTOP', payload)
      },

      addContactNotifiedDesktop  ({ commit }, payload) {
        commit('ADD_CONTACT_NOTIFIED_DESKTOP', payload)
      },

      addAppointmentNotifiedDesktop ({ commit }, payload) {
        commit('ADD_APPOINTMENT_NOTIFIED_DESKTOP', payload)
      },

      addReminderNotifiedDesktop ({ commit }, payload) {
        commit('ADD_REMINDER_NOTIFIED_DESKTOP', payload)
      },

      removeCommunicationNotifiedDesktop ({ commit }, value) {
        commit('REMOVE_COMMUNICATION_NOTIFIED_DESKTOP', value)
      },

      removeVoicemailNotifiedDesktop ({ commit }, value) {
        commit('REMOVE_VOICEMAIL_NOTIFIED_DESKTOP', value)
      },

      removeContactNotifiedDesktop  ({ commit }, value) {
        commit('REMOVE_CONTACT_NOTIFIED_DESKTOP', value)
      },

      removeAppointmentNotifiedDesktop ({ commit }, value) {
        commit('REMOVE_APPOINTMENT_NOTIFIED_DESKTOP', value)
      },

      removeReminderNotifiedDesktop ({ commit }, value) {
        commit('REMOVE_REMINDER_NOTIFIED_DESKTOP', value)
      },

      setDefaultDateFilter ({ commit }, value) {
        commit('SET_DEFAULT_DATE_FILTER', value)
      },

      setNotificationAudio ({ commit }) {
        commit('SET_NOTIFICATION_AUDIO')
      },

      setFishingModeNotificationAudio ({ commit }) {
        commit('SET_FISHING_MODE_NOTIFICATION_AUDIO')
      },

      setLoadingParkedCalls ({ commit }, value) {
        commit('SET_LOADING_PARKED_CALLS', value)
      },

      setParkedCalls ({ commit }, communications) {
        commit('SET_PARKED_CALLS', communications)
      },

      addParkedCall ({ commit }, communication) {
        commit('ADD_PARKED_CALL', communication)
      },

      removeParkedCall ({ commit }, communicationId) {
        commit('REMOVE_PARKED_CALL', communicationId)
      },

      setSuspended ({ commit }, value) {
        commit('SET_SUSPENDED', value)
      },

      toggleProFeatureDialog ({ commit }, value) {
        commit('TOGGLE_PRO_FEATURE_DIALOG', value)
      },

      setLeadSources ({ commit }, leadSources) {
        commit('SET_LEAD_SOURCES', leadSources)
      },

      setStatics ({ commit }, statics) {
        commit('SET_STATICS', statics)
      },

      setStaticsLoaded ({ commit }, value) {
        commit('SET_STATICS_LOADED', value)
      },

      setIsWhiteLabel ({ commit }, value) {
        commit('SET_IS_WHITE_LABEL', value)
      },

      setIsCallDisposed ({ commit }, value) {
        commit('SET_IS_CALL_DISPOSED', value)
      },

      setIsContactDisposed ({ commit }, value) {
        commit('SET_IS_CONTACT_DISPOSED', value)
      },

      setIsDatatableSelectedAll ({ commit }, value) {
        commit('SET_IS_DATATABLE_SELECTED_ALL', value)
      },

      setIsDatatableCountLoading ({ commit }, value) {
        commit('SET_IS_DATATABLE_COUNT_LOADING', value)
      },

      async fetchContactsLists ({ commit }) {
        const lists = []
        let res = null
        let page = 1

        do {
          res = await API.V2.contactList.get({ visible_only: true, size: 100, page })

          lists.push(...res.data.data)
          page++
        } while (res.data.next_page_url)

        commit('SET_CONTACTS_LISTS', lists)

        return Promise.resolve()
      },

      setIsIntroVideoVisible ({ commit }, value) {
        commit('SET_IS_INTRO_VIDEO_VISIBLE', value)
      },

      setShowedKycDialog ({ commit }, value) {
        commit('SET_SHOWED_KYC_DIALOG', value)
      },

      addIntegrationPDImportSummary ({ commit }, payload) {
        commit('ADD_INTEGRATION_PD_IMPORT_SUMMARY', payload)
      },

      removeIntegrationPDImportSummary ({ commit }, id) {
        commit('REMOVE_INTEGRATION_PD_IMPORT_SUMMARY', id)
      },

      setShowedKycReloadDialog ({ commit }, value) {
        commit('SET_SHOWED_KYC_RELOAD_DIALOG', value)
      },

      setIsTrialBannerVisible ({ commit }, value) {
        commit('SET_IS_TRIAL_BANNER_VISIBLE', value)
      },

      setCurrentTimezone ({ commit }, timezone) {
        commit('SET_CURRENT_TIMEZONE', timezone)
      }
    },

    mutations: {
      SET_IS_WIDGET (state, value) {
        state.isWidget = value
      },

      SET_DIALER_TOKEN (state, token) {
        state.dialer.token = token
      },

      SET_DIALER_CALL (state, call) {
        state.dialer.call = call
      },

      SET_DIALER_IS_READY (state, status) {
        state.dialer.isReady = status
      },

      SET_DIALER_CURRENT_STATUS (state, status) {
        state.dialer.currentStatus = status
      },

      SET_DIALER_COMMUNICATION (state, communication) {
        if (communication && communication.tags) {
          communication.tag_ids = communication.tags.map((a) => a.id)
        } else if (communication && !communication.tags) {
          communication.tag_ids = []
        }

        Vue.set(state.dialer, 'communication', communication)
      },

      SET_DIALER_DEAL (state, dealId) {
        state.dialer.dealId = dealId
      },

      SET_DIALER_CONTACT (state, contact) {
        if (contact && contact.tags) {
          contact.tag_ids = contact.tags.map((a) => a.id)
        } else if (contact && !contact.tags) {
          contact.tag_ids = []
        }
        state.dialer.contact = contact
      },

      SET_DIALER_CONTACT_TAGS: (state, tags) => {
        state.dialer.contact.tags = tags
        state.dialer.contact.tag_ids = tags.map((a) => a.id)
      },

      SET_DIALER_CURRENT_NUMBER (state, currentNumber) {
        state.dialer.currentNumber = currentNumber
      },

      SET_DIALER_IS_MUTED (state, status) {
        state.dialer.isMuted = status
        if (state.dialer.call && state.dialer.call.isMuted !== undefined) {
          state.dialer.call.isMuted = status
        }
      },

      SET_DIALER_IS_HELD (state, status) {
        state.dialer.isHeld = status
        if (state.dialer.call && state.dialer.call.isHeld !== undefined) {
          state.dialer.call.isHeld = status
        }
      },

      SET_DIALER_RECORDING_STATUS (state, status) {
        state.dialer.recordingStatus = status
        if (state.dialer.call && state.dialer.call.recordingStatus !== undefined) {
          state.dialer.call.recordingStatus = status
        }
      },

      SET_DIALER_DURATION (state, duration) {
        state.dialer.duration = duration
      },

      SET_DIALER_TIMER (state, timer) {
        state.dialer.timer = timer
      },

      SET_DIALER_WRAP_UP_DURATION (state, duration) {
        state.dialer.wrapUpDuration = duration
      },

      SET_DIALER_WRAP_UP_TIMER (state, timer) {
        state.dialer.wrapUpTimer = timer
      },

      SET_DIALER_PARKED_CALL_DURATION (state, duration) {
        state.dialer.parkedCallDuration = duration
      },

      SET_DIALER_PARKED_CALL_TIMER (state, timer) {
        state.dialer.parkedCallTimer = timer
      },

      SET_DIALER_PARKED_CALL (state, communication) {
        state.dialer.parkedCall = communication
        if (communication && state.dialer.communication && communication.id === state.dialer.communication.id) {
          state.dialer.call = null
        }
      },

      SET_DIALER_ERROR_DEFAULT (state) {
        state.dialer.error.message = ''
        state.dialer.error.code = null
      },

      SET_DIALER_ERROR (state, error) {
        state.dialer.error.message = error.message
        state.dialer.error.code = error.code
      },

      SET_OLD_AGENT_STATUS (state, status) {
        state.oldAgentStatus = status
      },

      SET_USER_STATUS (state, status) {
        state.userStatus = status
      },

      NEW_CAMPAIGN (state, campaign) {
        if (resourceExists(state.campaigns, campaign)) {
          return
        }
        state.campaigns.push(campaign)
      },

      UPDATE_CAMPAIGN (state, campaign) {
        const found = state.campaigns.find((cmp) => cmp.id === campaign.id)
        const updatedCampaign = _.extend(found, campaign)
        if (found) {
          Vue.set(
            state.campaigns,
            state.campaigns.indexOf(found),
            updatedCampaign
          )
        }
      },

      DELETE_CAMPAIGN (state, campaign) {
        const found = state.campaigns.find((cmp) => cmp.id === campaign.id)
        if (found) {
          state.campaigns.splice(state.campaigns.indexOf(found), 1)
        }
      },

      SET_CAMPAIGNS (state, campaigns) {
        state.campaigns = campaigns
      },

      SET_CAMPAIGNS_IS_LOADING (state, value) {
        state.campaignsIsLoading = value
      },

      NEW_DISPOSITION_STATUS (state, dispositionStatus) {
        if (resourceExists(state.dispositionStatuses, dispositionStatus)) {
          return
        }
        state.dispositionStatuses.push(dispositionStatus)
      },

      UPDATE_DISPOSITION_STATUS (state, dispositionStatus) {
        const found = state.dispositionStatuses.find(
          (o) => o.id === dispositionStatus.id
        )
        if (found) {
          const updatedDispositionStatus = _.extend(found, dispositionStatus)
          Vue.set(
            state.dispositionStatuses,
            state.dispositionStatuses.indexOf(found),
            updatedDispositionStatus
          )
        }
      },

      DELETE_DISPOSITION_STATUS (state, dispositionStatus) {
        const found = state.dispositionStatuses.find(
          (o) => o.id === dispositionStatus.id
        )
        if (found) {
          state.dispositionStatuses.splice(
            state.dispositionStatuses.indexOf(found),
            1
          )
        }
      },

      SET_DISPOSITION_STATUSES (state, dispositionStatuses) {
        state.dispositionStatuses = dispositionStatuses
      },

      NEW_BULK_CALL_DISPOSITION (state, callDispositions) {
        if (callDispositions.length === 0) {
          return
        }
        state.callDispositions = _.union(
          state.callDispositions,
          callDispositions
        )
      },

      NEW_CALL_DISPOSITION (state, callDisposition) {
        if (resourceExists(state.callDispositions, callDisposition)) {
          return
        }
        state.callDispositions.push(callDisposition)
      },

      UPDATE_CALL_DISPOSITION (state, callDisposition) {
        const found = state.callDispositions.find(
          (o) => o.id === callDisposition.id
        )
        if (found) {
          const updatedCallDisposition = _.extend(found, callDisposition)
          Vue.set(
            state.callDispositions,
            state.callDispositions.indexOf(found),
            updatedCallDisposition
          )
        }
      },

      DELETE_CALL_DISPOSITION (state, callDisposition) {
        const found = state.callDispositions.find(
          (o) => o.id === callDisposition.id
        )
        if (found) {
          state.callDispositions.splice(
            state.callDispositions.indexOf(found),
            1
          )
        }
      },

      SET_CALL_DISPOSITIONS (state, callDispositions) {
        state.callDispositions = callDispositions
      },

      NEW_ACTIVITY_TYPE (state, activityType) {
        if (state.activityTypes.find(item => item === activityType)) {
          return
        }
        state.activityTypes.push(activityType)
      },

      DELETE_ACTIVITY_TYPE (state, activityType) {
        const found = state.activityTypes.find(o => o === activityType)
        if (found) {
          state.activityTypes.splice(
            state.activityTypes.indexOf(found),
            1
          )
        }
      },

      SET_ACTIVITY_TYPES (state, activityTypes) {
        state.activityTypes = activityTypes
      },

      SET_TEMPLATES (state, templates) {
        state.templates = templates
      },

      DELETE_TEMPLATE (state, template) {
        const found = state.templates.find(item => item.id === template.id)
        if (found) {
          state.templates.splice(state.templates.indexOf(found), 1)
        }
      },

      SET_BROADCASTS (state, broadcasts) {
        state.broadcasts = broadcasts
      },

      NEW_FILTER (state, filter) {
        if (resourceExists(state.filters, filter)) {
          return
        }
        state.filters.push(filter)
      },

      SET_FILTERS (state, filters) {
        state.filters = filters
      },

      SET_FILTER (state, filter) {
        filter.page = 1
        state.filter = _.extend(state.filter, filter, {
          timezone: window.timezone
        })
      },

      UPDATE_FILTER (state, filter) {
        const found = state.filters.find((o) => o.id === filter.id)
        if (found) {
          Vue.set(state.filters, state.filters.indexOf(found), filter)
        }
      },

      DELETE_FILTER (state, filter) {
        const found = state.filters.find((o) => o.id === filter.id)
        if (found) {
          state.filters.splice(state.filters.indexOf(found), 1)
        }
      },

      NEW_TAG (state, tag) {
        if (resourceExists(state.tags, tag)) {
          return
        }
        state.tags.push(tag)
      },

      UPDATE_TAG (state, tag) {
        const found = state.tags.find((o) => o.id === tag.id)
        if (found) {
          Vue.set(state.tags, state.tags.indexOf(found), tag)
        }
      },

      DELETE_TAG (state, tag) {
        const found = state.tags.find((o) => o.id === tag.id)
        if (found) {
          state.tags.splice(state.tags.indexOf(found), 1)
        }
      },

      SET_TAGS (state, tags) {
        state.tags = tags
      },

      NEW_RING_GROUP (state, ringGroup) {
        if (resourceExists(state.ringGroups, ringGroup)) {
          return
        }
        state.ringGroups.push(ringGroup)
      },

      UPDATE_RING_GROUP (state, ringGroup) {
        const found = state.ringGroups.find((o) => o.id === ringGroup.id)
        const updatedRingGroup = _.extend(found, ringGroup)
        if (found) {
          Vue.set(
            state.ringGroups,
            state.ringGroups.indexOf(found),
            updatedRingGroup
          )
        }
      },

      DELETE_RING_GROUP (state, ringGroup) {
        const found = state.ringGroups.find((o) => o.id === ringGroup.id)
        if (found) {
          state.ringGroups.splice(state.ringGroups.indexOf(found), 1)
        }
      },

      SET_RING_GROUPS (state, ringGroups) {
        state.ringGroups = ringGroups
      },

      RESET_VUEX ({ state }) {
        state = Object.assign({}, Default.DEFAULT_STATE)
      },

      RESET_FILTERS (state) {
        state.filter = Object.assign(state.filter, Default.DEFAULT_STATE.filter)
      },

      SET_USAGE (state, usage) {
        state.usage = usage
      },

      SET_FIRST_LOGIN (state, firstLogin) {
        state.firstLogin = firstLogin
      },

      SET_SIDEBAR_FOLDED (state, status) {
        state.sidebarFolded = status
      },

      SET_COMM_TABLE_FIELDS (state, fields) {
        state.comm_table_fields = fields
      },

      NEW_WORKFLOW (state, workflow) {
        if (resourceExists(state.workflows, workflow)) {
          return
        }
        state.workflows.push(workflow)
      },

      SET_WORKFLOWS (state, workflows) {
        state.workflows = workflows
      },

      UPDATE_WORKFLOW (state, workflow) {
        const found = state.workflows.find((wf) => wf.id === workflow.id)
        if (found) {
          Vue.set(state.workflows, state.workflows.indexOf(found), workflow)
        }
      },

      DELETE_WORKFLOW (state, workflow) {
        const found = state.workflows.find((wf) => wf.id === workflow.id)
        if (found) {
          state.workflows.splice(state.workflows.indexOf(found), 1)
        }
      },

      SET_CHANGELOGS (state, changelogs) {
        state.changelogs = changelogs
      },

      NEW_USER (state, user) {
        if (resourceExists(state.users, user)) {
          return
        }
        state.users.push(user)
      },

      SET_USERS (state, users) {
        state.users = users
      },

      UPDATE_USER (state, user) {
        const found = state.users.find((u) => u.id === user.id)
        if (found) {
          Vue.set(state.users, state.users.indexOf(found), user)
        }
      },

      UPDATE_USER_STATUS (state, event) {
        const found = state.users.find(u => u.id === event.user_id)
        if (found) {
          const index = state.users.indexOf(found)
          Vue.set(state.users[index], 'agent_status', event.agent_status)
          Vue.set(state.users[index], 'last_agent_status_change', event.last_agent_status_change)
          Vue.set(state.users[index], 'updated_at', event.last_agent_status_change)
        }
      },

      DELETE_USER (state, user) {
        const found = state.users.find((wf) => wf.id === user.id)
        if (found) {
          state.users.splice(state.users.indexOf(found), 1)
        }
      },

      SET_USERS_IS_LOADING (state, value) {
        state.usersIsLoading = value
      },

      SET_WARNINGS (state, warnings) {
        state.warnings = warnings
      },

      SET_SHOULD_INTRODUCE (state, status) {
        state.shouldIntroduce = status
      },

      SET_ADDED_PARTY (state, addedParty) {
        state.addedParty = addedParty
      },

      SET_CURRENT_INPUT_DEVICE (state, inputDevice) {
        state.currentInputDevice = inputDevice
      },

      SET_INPUT_DEVICES (state, inputDevices) {
        state.inputDevices = inputDevices
      },

      SET_CURRENT_OUTPUT_DEVICE (state, outputDevice) {
        state.currentOutputDevice = outputDevice
      },

      SET_OUTPUT_DEVICES (state, outputDevices) {
        state.outputDevices = outputDevices
      },

      SET_TAGS_FULLY_LOADED (state, tagsFullyLoaded) {
        state.tagsFullyLoaded = tagsFullyLoaded
      },

      SET_NOTIFICATIONS (state, payload) {
        const index = { data: null }
        for (index.data in payload.data) {
          Vue.set(state.notifications[payload.type], `${index.data}`, payload.data[index.data])
        }
      },

      SET_SHOW_INCOMING_CALL_NOTIFICATION (state, value) {
        state.showIncomingCallNotification = value
      },

      RESET_NOTIFICATIONS (state) {
        state.notifications = Object.assign(state.notifications, ActionNotificationsDefault.DEFAULT_STATE)
      },

      SET_PREV_ROUTE (state, data) {
        state.prevRoute = data
      },

      SET_CURRENT_ROUTE (state, data) {
        state.currentRoute = data
      },

      SET_BREADCRUMBS: (state, data) => {
        state.breadcrumbs = {
          crumbs: data.crumbs,
          name: data.name
        }
      },

      SET_DIALER_FORM_STATUS (state, value) {
        state.dialerFormStatus = value
      },

      SET_DIALER_CALL_FISHING (state, payload) {
        state.dialer.callFishing = payload
      },

      SET_IS_MOBILE (state, value) {
        state.isMobile = value
      },

      SET_IS_TABLET_OR_MOBILE (state, value) {
        state.isTabletOrMobile = value
      },

      SET_CONTACT_DETAILS_DRAWER (state, value) {
        state.contactDetailsDrawer = value
      },

      SET_SHOW_PHONE (state, value) {
        state.showPhone = value
      },

      SET_ENABLE_AUDIO (state, value) {
        state.enableAudio = value
      },

      REMOVE_FROM_CALL_FISHING_NOTIFICATION_QUEUE (state, value) {
        if (!state.notifications.callFishing.queue) {
          return
        }

        const found = state.notifications.callFishing.queue.find(queue => queue.communicationId === value)

        if (found) {
          state.notifications.callFishing.queue.splice(state.notifications.callFishing.queue.indexOf(found), 1)
        }
      },

      ADD_TO_CALL_FISHING_QUEUE (state, payload) {
        state.callFishingQueue.push(payload)
      },

      REMOVE_FROM_CALL_FISHING_QUEUE (state, value) {
        if (state.callFishingQueue.length === 0) {
          return
        }

        const found = state.callFishingQueue.find(queue => _.get(queue, 'communicationId', null) === value)

        if (found) {
          state.callFishingQueue.splice(state.callFishingQueue.indexOf(found), 1)
        }
      },

      CLEAR_CALL_FISHING_QUEUE (state) {
        state.callFishingQueue = []
      },

      ADD_COMMUNICATION_NOTIFIED_DESKTOP (state, payload) {
        state.communicationNotifiedDesktop.push(payload)
      },

      ADD_VOICEMAIL_NOTIFIED_DESKTOP (state, payload) {
        state.voicemailNotifiedDesktop.push(payload)
      },

      ADD_CONTACT_NOTIFIED_DESKTOP (state, payload) {
        state.contactNotifiedDesktop.push(payload)
      },

      ADD_APPOINTMENT_NOTIFIED_DESKTOP (state, payload) {
        state.appointmentNotifiedDesktop.push(payload)
      },

      ADD_REMINDER_NOTIFIED_DESKTOP (state, payload) {
        state.reminderNotifiedDesktop.push(payload)
      },

      REMOVE_COMMUNICATION_NOTIFIED_DESKTOP (state, value) {
        if (state.communicationNotifiedDesktop.length === 0) {
          return
        }

        const found = state.communicationNotifiedDesktop.find(item => item.id === value)

        if (!found) {
          return
        }

        state.communicationNotifiedDesktop.splice(state.communicationNotifiedDesktop.indexOf(found), 1)
      },

      REMOVE_VOICEMAIL_NOTIFIED_DESKTOP (state, value) {
        if (state.voicemailNotifiedDesktop.length === 0) {
          return
        }

        const found = state.voicemailNotifiedDesktop.find(item => item.id === value)

        if (!found) {
          return
        }

        state.voicemailNotifiedDesktop.splice(state.voicemailNotifiedDesktop.indexOf(found), 1)
      },

      REMOVE_CONTACT_NOTIFIED_DESKTOP (state, value) {
        if (state.contactNotifiedDesktop.length === 0) {
          return
        }

        const found = state.contactNotifiedDesktop.find(item => item.id === value)

        if (!found) {
          return
        }

        state.contactNotifiedDesktop.splice(state.contactNotifiedDesktop.indexOf(found), 1)
      },

      REMOVE_APPOINTMENT_NOTIFIED_DESKTOP (state, value) {
        if (state.appointmentNotifiedDesktop.length === 0) {
          return
        }

        const found = state.appointmentNotifiedDesktop.find(item => item.id === value)

        if (!found) {
          return
        }

        state.appointmentNotifiedDesktop.splice(state.appointmentNotifiedDesktop.indexOf(found), 1)
      },

      REMOVE_REMINDER_NOTIFIED_DESKTOP (state, value) {
        if (state.reminderNotifiedDesktop.length === 0) {
          return
        }

        const found = state.reminderNotifiedDesktop.find(item => item.id === value)

        if (!found) {
          return
        }

        state.reminderNotifiedDesktop.splice(state.reminderNotifiedDesktop.indexOf(found), 1)
      },

      SET_DEFAULT_DATE_FILTER (state, value) {
        state.defaultDateFilter = value
      },

      SET_NOTIFICATION_AUDIO (state) {
        state.notificationAudio = new Audio(process.env.API_URL + '/static/ivr/default-communication-notification.mp3')
      },

      SET_FISHING_MODE_NOTIFICATION_AUDIO (state) {
        state.fishingModeNotificationAudio = new Audio(process.env.API_URL + '/static/ivr/incoming.mp3')
        state.fishingModeNotificationAudio.loop = true
      },

      SET_LOADING_PARKED_CALLS (state, value) {
        state.loadingParkedCalls = value
      },

      SET_PARKED_CALLS (state, communications) {
        state.parkedCalls = communications
      },

      ADD_PARKED_CALL (state, communication) {
        const found = state.parkedCalls.find(parkedCall => parkedCall.id === communication.id)

        if (found) {
          return
        }

        state.parkedCalls.push(communication)
      },

      REMOVE_PARKED_CALL (state, communicationId) {
        const found = state.parkedCalls.find(parkedCall => parkedCall.id === communicationId)

        if (!found) {
          return
        }

        state.parkedCalls.splice(state.parkedCalls.indexOf(found), 1)
      },

      SET_SUSPENDED (state, value) {
        state.suspended = value
      },

      TOGGLE_PRO_FEATURE_DIALOG (state, value) {
        state.showProFeatureDialog = value
      },

      SET_LEAD_SOURCES (state, leadSources) {
        state.leadSources = leadSources
      },

      SET_STATICS (state, statics) {
        state.statics = statics
      },

      SET_STATICS_LOADED (state, value) {
        state.staticsLoaded = value
      },

      SET_IS_WHITE_LABEL (state, value) {
        state.isWhiteLabel = value
      },

      SET_IS_CALL_DISPOSED (state, value) {
        state.isCallDisposed = value
      },

      SET_IS_CONTACT_DISPOSED (state, value) {
        state.isContactDisposed = value
      },

      SET_IS_DATATABLE_SELECTED_ALL (state, value) {
        state.isDatatableSelectedAll = value
      },

      SET_IS_DATATABLE_COUNT_LOADING (state, value) {
        state.isDatatableCountLoading = value
      },

      SET_CONTACTS_LISTS (state, lists) {
        state.contactsLists = lists
      },

      SET_IS_INTRO_VIDEO_VISIBLE (state, value) {
        state.isIntroVideoVisible = value
      },

      SET_SHOWED_KYC_DIALOG (state, value) {
        state.showedKycDialog = value
      },

      ADD_INTEGRATION_PD_IMPORT_SUMMARY (state, payload) {
        state.integrationPDImportSummaries[payload.id] = payload.summary
      },

      REMOVE_INTEGRATION_PD_IMPORT_SUMMARY (state, id) {
        if (!state.integrationPDImportSummaries?.[id]) {
          return
        }
        delete state.integrationPDImportSummaries[id]
      },

      SET_SHOWED_KYC_RELOAD_DIALOG (state, value) {
        state.showedKycReloadDialog = value
      },

      SET_IS_TRIAL_BANNER_VISIBLE (state, value) {
        state.isTrialBannerVisible = value
      },

      SET_CURRENT_TIMEZONE (state, timezone) {
        state.currentTimezone = timezone
      },

      updateField
    },

    plugins: [
      createPersistedState({
        key: 'AloWare_vuex',
        paths: DefaultCachePaths.DEFAULT_STATE.paths,
        storage: {
          getItem: (key) => storage.local.getItem(key),
          setItem: (key, value) => storage.local.setItem(key, value),
          removeItem: (key) => storage.local.removeItem(key)
        }
      })
    ]
  })

  return Store
}
