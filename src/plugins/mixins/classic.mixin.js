export default {
  methods: {
    getCampaignURL (campaignId) {
      return process.env.API_URL + `/lines/${campaignId}/settings`
    },

    getRingGroupURL (ringGroupId) {
      return process.env.API_URL + `/ring-groups/dialog/${ringGroupId}`
    },

    getUserURL (userId) {
      return process.env.API_URL + `/users/dialog/${userId}`
    },

    getUserActivityURL (userId) {
      return process.env.API_URL + `/users/${userId}/activity`
    },

    getWorkflowURL (workflowId) {
      return process.env.API_URL + `/sequences2/manager/${workflowId}`
    },

    getBroadcastSettingURL () {
      return process.env.API_URL + '/account?tab=settings#broadcasts_business_hours'
    }
  }
}
