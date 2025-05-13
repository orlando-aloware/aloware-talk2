/**
 * Campaigns helper functions
 */

/**
 * Generic function to fetch campaign data
 * @param {Object} context - Vue component context with access to Vuex actions
 * @param {Object} options - Options for the function
 * @param {Function} options.setAction - Vuex action to set the campaigns data
 * @param {Function} options.setLoadingAction - Vuex action to set the loading state
 * @param {Boolean} options.loadingFlag - Reference to the loading flag in the component
 * @param {Object} options.params - Additional parameters for the API call
 * @param {Boolean} fromTeamInbox - Whether the campaigns are being fetched from a team inbox
 * @returns {Promise} - Promise that resolves when campaigns are loaded
 */
export const getCampaignsData = function (context, options = {}, fromTeamInbox = false) {
  const {
    setAction = 'setCampaigns',
    setLoadingAction = 'setCampaignsIsLoading',
    loadingFlag = 'loadingCampaigns',
    params = { is_lite: true }
  } = options

  if (fromTeamInbox) {
    params.from_team_inbox = true
  }

  if (!context.hasPermissionTo('list campaign')) {
    return Promise.resolve()
  }

  context[loadingFlag] = true
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
      context[loadingFlag] = false
      // Reset loading state
      if (typeof context[setLoadingAction] === 'function') {
        context[setLoadingAction](false)
      } else {
        setCampaignsIsLoading(context, false)
      }

      return Promise.resolve()
    })
    .catch((err) => {
      console.log(err)
      context[loadingFlag] = false
      // Reset loading state on error
      if (typeof context[setLoadingAction] === 'function') {
        context[setLoadingAction](false)
      } else {
        setCampaignsIsLoading(context, false)
      }

      return Promise.reject()
    })
}

/**
 * Fetches regular campaign data
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
  return getCampaignsData(context, {
    setAction: 'setTeamInboxCampaigns',
    setLoadingAction: 'setCampaignsIsLoading',
    loadingFlag: 'loadingTeamInboxCampaigns'
  }, true)
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
