import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import * as Default from '../constants/default'
// import createPersistedState from 'vuex-persistedstate'
import auth from './auth'
import contacts from './contacts'

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
      contacts
    },
    state: {
      filter: {},
      tags: [],
      campaigns: [],
      users: [],
      ring_groups: [],
      workflows: [],
      changelogs: [],
      disposition_statuses: [],
      call_dispositions: [],
      filters: [],
      first_login: false,
      user_status: false,
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
        timer: '',
        wrapUpTimer: '',
        duration: 0,
        wrapUpDuration: '',
        onHoldCall: null,
        dealId: null
      },
      warnings: [],
      shouldIntroduce: false,
      addedParty: null,
      keyboard: {
        scroll: null,
        resizeMode: null
      },
      // cached states
      sidebar_folded: false,
      current_company: null
    },

    actions: {
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

      setDialerCurrentNumber ({ commit }, currentNumber) {
        commit('SET_DIALER_CURRENT_NUMBER', currentNumber)
      },

      setDialerOnSpeaker ({ commit }, status) {
        commit('SET_DIALER_ON_SPEAKER', status)
      },

      setDialerIsMuted ({ commit }, status) {
        commit('SET_DIALER_IS_MUTED', status)
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

      setDialerOnHoldCall ({ commit }, communication) {
        commit('SET_DIALER_ON_HOLD_CALL', communication)
      },

      setOldAgentStatus ({ commit }, status) {
        commit('SET_OLD_AGENT_STATUS', status)
      },

      setKeyboardScroll ({ commit }, status) {
        commit('SET_KEYBOARD_SCROLL', status)
      },

      setKeyboardResizeMode ({ commit }, mode) {
        commit('SET_KEYBOARD_RESIZE_MODE', mode)
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

      newTag ({ commit }, tag) {
        commit('NEW_TAG', tag)
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

      deleteCurrentCompany ({ commit }) {
        commit('DELETE_CURRENT_COMPANY')
      },

      setCurrentCompany ({ commit }, currentCompany) {
        commit('SET_CURRENT_COMPANY', currentCompany)
      },

      resetVuex ({ commit }) {
        commit('RESET_VUEX')
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

      deleteUser ({ commit }, user) {
        commit('DELETE_USER', user)
      },

      setWarnings ({ commit }, warnings) {
        commit('SET_WARNINGS', warnings)
      },

      setShouldIntroduce ({ commit }, status) {
        commit('SET_SHOULD_INTRODUCE', status)
      },

      setAddedParty ({ commit }, addedParty) {
        commit('SET_ADDED_PARTY', addedParty)
      }
    },

    mutations: {
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
        state.dialer.communication = communication
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

      SET_DIALER_CURRENT_NUMBER (state, currentNumber) {
        state.dialer.currentNumber = currentNumber
      },

      SET_DIALER_ON_SPEAKER (state, status) {
        state.dialer.onSpeaker = status
      },

      SET_DIALER_IS_MUTED (state, status) {
        state.dialer.isMuted = status
        if (state.dialer.call && state.dialer.call.isMuted !== undefined) {
          state.dialer.call.isMuted = status
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

      SET_DIALER_ON_HOLD_CALL (state, communication) {
        state.dialer.onHoldCall = communication
        if (communication) {
          state.dialer.call = null
        }
      },

      SET_OLD_AGENT_STATUS (state, status) {
        state.oldAgentStatus = status
      },

      SET_KEYBOARD_SCROLL (state, status) {
        if (
          state.keyboard.scroll !== null ||
          state.keyboard.scroll !== status
        ) {
          state.keyboard.scroll = status
          window.Keyboard.disableScroll(!status)
        }
      },

      SET_KEYBOARD_RESIZE_MODE (state, mode) {
        if (
          state.keyboard.resizeMode !== null ||
          state.keyboard.resizeMode !== mode
        ) {
          state.keyboard.resizeMode = mode
          window.Keyboard.setResizeMode(mode)
        }
      },

      SET_USER_STATUS (state, status) {
        state.user_status = status
      },

      NEW_CAMPAIGN (state, campaign) {
        if (resourceExists(state.campaigns, campaign)) {
          return
        }
        state.campaigns.push(campaign)
      },

      UPDATE_CAMPAIGN (state, campaign) {
        let found = state.campaigns.find((cmp) => cmp.id === campaign.id)
        let updatedCampaign = _.extend(found, campaign)
        if (found) {
          Vue.set(
            state.campaigns,
            state.campaigns.indexOf(found),
            updatedCampaign
          )
        }
      },

      DELETE_CAMPAIGN (state, campaign) {
        let found = state.campaigns.find((cmp) => cmp.id === campaign.id)
        if (found) {
          state.campaigns.splice(state.campaigns.indexOf(found), 1)
        }
      },

      SET_CAMPAIGNS (state, campaigns) {
        state.campaigns = campaigns
      },

      NEW_DISPOSITION_STATUS (state, dispositionStatus) {
        if (resourceExists(state.disposition_statuses, dispositionStatus)) {
          return
        }
        state.disposition_statuses.push(dispositionStatus)
      },

      UPDATE_DISPOSITION_STATUS (state, dispositionStatus) {
        let found = state.disposition_statuses.find(
          (o) => o.id === dispositionStatus.id
        )
        if (found) {
          let updatedDispositionStatus = _.extend(found, dispositionStatus)
          Vue.set(
            state.disposition_statuses,
            state.disposition_statuses.indexOf(found),
            updatedDispositionStatus
          )
        }
      },

      DELETE_DISPOSITION_STATUS (state, dispositionStatus) {
        let found = state.disposition_statuses.find(
          (o) => o.id === dispositionStatus.id
        )
        if (found) {
          state.disposition_statuses.splice(
            state.disposition_statuses.indexOf(found),
            1
          )
        }
      },

      SET_DISPOSITION_STATUSES (state, dispositionStatuses) {
        state.disposition_statuses = dispositionStatuses
      },

      NEW_BULK_CALL_DISPOSITION (state, callDispositions) {
        if (callDispositions.length === 0) {
          return
        }
        state.call_dispositions = _.union(
          state.call_dispositions,
          callDispositions
        )
      },

      NEW_CALL_DISPOSITION (state, callDisposition) {
        if (resourceExists(state.call_dispositions, callDisposition)) {
          return
        }
        state.call_dispositions.push(callDisposition)
      },

      UPDATE_CALL_DISPOSITION (state, callDisposition) {
        let found = state.call_dispositions.find(
          (o) => o.id === callDisposition.id
        )
        if (found) {
          let updatedCallDisposition = _.extend(found, callDisposition)
          Vue.set(
            state.call_dispositions,
            state.call_dispositions.indexOf(found),
            updatedCallDisposition
          )
        }
      },

      DELETE_CALL_DISPOSITION (state, callDisposition) {
        let found = state.call_dispositions.find(
          (o) => o.id === callDisposition.id
        )
        if (found) {
          state.call_dispositions.splice(
            state.call_dispositions.indexOf(found),
            1
          )
        }
      },

      SET_CALL_DISPOSITIONS (state, callDispositions) {
        state.call_dispositions = callDispositions
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
        let found = state.filters.find((o) => o.id === filter.id)
        if (found) {
          Vue.set(state.filters, state.filters.indexOf(found), filter)
        }
      },

      DELETE_FILTER (state, filter) {
        let found = state.filters.find((o) => o.id === filter.id)
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
        let found = state.tags.find((o) => o.id === tag.id)
        if (found) {
          Vue.set(state.tags, state.tags.indexOf(found), tag)
        }
      },

      DELETE_TAG (state, tag) {
        let found = state.tags.find((o) => o.id === tag.id)
        if (found) {
          state.tags.splice(state.tags.indexOf(found), 1)
        }
      },

      SET_TAGS (state, tags) {
        state.tags = tags
      },

      NEW_RING_GROUP (state, ringGroup) {
        if (resourceExists(state.ring_groups, ringGroup)) {
          return
        }
        state.ring_groups.push(ringGroup)
      },

      UPDATE_RING_GROUP (state, ringGroup) {
        let found = state.ring_groups.find((o) => o.id === ringGroup.id)
        let updatedRingGroup = _.extend(found, ringGroup)
        if (found) {
          Vue.set(
            state.ring_groups,
            state.ring_groups.indexOf(found),
            updatedRingGroup
          )
        }
      },

      DELETE_RING_GROUP (state, ringGroup) {
        let found = state.ring_groups.find((o) => o.id === ringGroup.id)
        if (found) {
          state.ring_groups.splice(state.ring_groups.indexOf(found), 1)
        }
      },

      SET_RING_GROUPS (state, ringGroups) {
        state.ring_groups = ringGroups
      },

      DELETE_CURRENT_COMPANY (state) {
        state.current_company = null
      },

      SET_CURRENT_COMPANY (state, currentCompany) {
        state.current_company = currentCompany
      },

      RESET_VUEX (state) {
        state = Object.assign(state, Default.DEFAULT_STATE)
      },

      RESET_FILTERS (state) {
        state.filter = Object.assign(state.filter, Default.DEFAULT_STATE.filter)
      },

      SET_USAGE (state, usage) {
        state.usage = usage
      },

      SET_FIRST_LOGIN (state, firstLogin) {
        state.first_login = firstLogin
      },

      SET_SIDEBAR_FOLDED (state, status) {
        state.sidebar_folded = status
      },

      SET_COMM_TABLE_FIELDS (state, fields) {
        state.comm_table_fields = fields
      },

      SET_CURRENT_COMPANY_DEFAULT_FILTER_ID (state, filterId) {
        state.current_company.default_filter_id = filterId
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
        let found = state.workflows.find((wf) => wf.id === workflow.id)
        if (found) {
          Vue.set(state.workflows, state.workflows.indexOf(found), workflow)
        }
      },

      DELETE_WORKFLOW (state, workflow) {
        let found = state.workflows.find((wf) => wf.id === workflow.id)
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
        let found = state.users.find((u) => u.id === user.id)
        if (found) {
          Vue.set(state.users, state.users.indexOf(found), user)
        }
      },

      DELETE_USER (state, user) {
        let found = state.users.find((wf) => wf.id === user.id)
        if (found) {
          state.users.splice(state.users.indexOf(found), 1)
        }
      },

      SET_WARNINGS (state, warnings) {
        state.warnings = warnings
      },

      SET_SHOULD_INTRODUCE (state, status) {
        state.shouldIntroduce = status
      },

      SET_ADDED_PARTY (state, addedParty) {
        state.addedParty = addedParty
      }
    },
    plugins: [
      // createPersistedState({
      //   key: 'AloWare_vuex'
      // })
    ]
  })

  return Store
}
