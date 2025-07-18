/**
 * Campaigns helper functions
 */

import { CALL_ROUTER_BEHAVIOR_MODE_DEAD_END, CALL_ROUTER_BEHAVIOR_MODE_IVR } from 'src/constants/campaign-call-router-behaviors'
import talk2TeamInboxApi from 'src/plugins/api/teamInboxApi'

/**
 * Generic function to fetch campaign data
 * @param {Object} context - Vue component context with access to Vuex actions
 * @param {Object} options - Options for the function
 * @param {Function} options.setAction - Vuex action to set the campaigns data
 * @param {Function} options.setLoadingAction - Vuex action to set the loading state
 * @param {Boolean} options.loadingFlag - Reference to the loading flag in the component
 * @param {Object} options.params - Additional parameters for the API call
 * @returns {Promise} - Promise that resolves when campaigns are loaded
 */
export const getCampaignsData = function (context, options = {}) {
  const {
    setAction = 'setCampaigns',
    setLoadingAction = 'setCampaignsIsLoading',
    loadingFlag = 'loadingCampaigns',
    params = { is_lite: true }
  } = options

  // Fixing it in case the default value is overridden
  params.is_lite = true

  if (!context.hasPermissionTo('list campaign')) {
    return Promise.resolve()
  }

  if (context[loadingFlag]) {
    // Avoid duplicate requests
    return Promise.resolve()
  }

  // Set loading state
  if (typeof context[setLoadingAction] === 'function') {
    context[setLoadingAction](true)
  } else {
    setCampaignsIsLoading(context, true)
  }

  return context.$axios
    .get('/api/v1/campaign', {
      mode: 'no-cors',
      params
    })
    .then((res) => {
      if (typeof context[setAction] === 'function') {
        context[setAction](res.data)
      }

      return Promise.resolve()
    })
    .catch((err) => {
      console.log(err)
      return Promise.reject()
    })
    .finally(() => {
      // Reset loading state
      if (typeof context[setLoadingAction] === 'function') {
        context[setLoadingAction](false)
      } else {
        setCampaignsIsLoading(context, false)
      }
    })
}

/**
 * Fetches campaigns data
 * @param {Object} context - Vue component context with access to Vuex actions
 * @returns {Promise} - Promise that resolves when campaigns are loaded
 */
export const getCampaigns = function (context) {
  return getCampaignsData(context, {
    setAction: 'setCampaigns',
    setLoadingAction: 'setCampaignsIsLoading',
    loadingFlag: 'loadingCampaigns'
  })
}

/**
 * Fetches team inbox campaign data
 * @param {Object} context - Vue component context with access to Vuex actions
 * @returns {Promise} - Promise that resolves when team inbox campaigns are loaded
 */
export const getTeamInboxCampaigns = function (context) {
  if (!context.hasPermissionTo('list campaign')) {
    return Promise.resolve()
  }

  context.loadingTeamInboxCampaigns = true
  if (typeof context.setCampaignsIsLoading === 'function') {
    context.setCampaignsIsLoading(true)
  }

  // Use Team Inbox V3 API - no from_team_inbox flag needed
  return talk2TeamInboxApi.campaigns.index({
    is_lite: true
  })
    .then((res) => {
      if (typeof context.setTeamInboxCampaigns === 'function') {
        context.setTeamInboxCampaigns(res.data)
      }
      context.loadingTeamInboxCampaigns = false
      if (typeof context.setCampaignsIsLoading === 'function') {
        context.setCampaignsIsLoading(false)
      }

      return Promise.resolve()
    })
    .catch((err) => {
      console.log(err)
      context.loadingTeamInboxCampaigns = false
      if (typeof context.setCampaignsIsLoading === 'function') {
        context.setCampaignsIsLoading(false)
      }

      return Promise.reject()
    })
}

/**
 * Sets the loading state for campaigns
 * @param {Object} context - Vue component context with access to Vuex actions
 * @param {Boolean} value - Loading state value
 */
export const setCampaignsIsLoading = function (context, value) {
  if (typeof context.setCampaignsIsLoading === 'function') {
    context.setCampaignsIsLoading(value)
  }
}

/**
 * Callback function to check if a campaign is available for an agent
 *
 * @param {Object} campaign - Campaign object
 * @param {Number} userId - User ID
 * @returns {Boolean} - True if the campaign is available for the agent, false otherwise
 */
export function agentAvailableCampaignsCallback (campaign, userId) {
  if (!campaign || !userId) {
    return false
  }

  return campaign.user_id === userId ||
    campaign.has_direct_ring_group_access ||
    campaign.has_team_membership_access ||
    campaign.has_direct_watching_access ||
    campaign.has_team_watching_access ||
    isIvrOrDeadEndCampaign(campaign)
}

/**
 * Checks if a campaign is an IVR or dead end campaign
 *
 * @param {Object} campaign - Campaign object
 * @returns {Boolean} - True if the campaign is an IVR or dead end campaign, false otherwise
 */
export function isIvrOrDeadEndCampaign (campaign) {
  return [CALL_ROUTER_BEHAVIOR_MODE_DEAD_END, CALL_ROUTER_BEHAVIOR_MODE_IVR]
    .includes(campaign?.call_router_behavior)
}
