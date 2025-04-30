<template>
  <div class="campaign">
    <span v-if="campaign.name">
      {{ campaign.name }}
    </span>
    <q-skeleton type="text"
                width="100%"
                height="12px"
                v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    campaignId: {
      type: [String, Number],
      required: true
    },

    isTeamInbox: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapState(['campaigns', 'teamInboxCampaigns']),

    campaign () {
      return this.isTeamInbox ? this.teamInboxCampaigns.find(campaign => campaign.id === this.campaignId) : this.campaigns.find(campaign => campaign.id === this.campaignId) || {}
    }
  }
}
</script>

<style scoped>
.campaign {
  font-size: 10px;
  font-weight: 400;
  color: #828282;
}
</style>
