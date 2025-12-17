<template>
  <div class="campaign">
    <span v-if="displayCampaign && displayCampaign.name" :class="{ 'deleted-campaign': isDeleted }">
      {{ displayName }}
    </span>
    <q-skeleton type="text"
                width="100%"
                height="12px"
                v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { teamInboxPropsMixin } from 'src/plugins/mixins'

export default {
  mixins: [teamInboxPropsMixin],

  props: {
    campaignId: {
      type: [String, Number],
      required: false,
      default: null
    },
    campaign: {
      type: Object,
      default: null
    }
  },

  computed: {
    ...mapState(['campaigns']),

    displayCampaign () {
      // Use campaign prop if available (for deleted campaigns)
      if (this.campaign) {
        return this.campaign
      }

      // Otherwise look in store
      if (this.campaignId) {
        return this.campaigns.find(campaign => campaign.id === this.campaignId)
      }

      return null
    },

    displayName () {
      if (!this.displayCampaign?.name) return ''

      // Remove "_deleted_TIMESTAMP" suffix
      const deletedPattern = /_deleted_\d+$/
      return this.displayCampaign.name.replace(deletedPattern, '')
    },

    isDeleted () {
      return this.displayCampaign?.deleted_at !== null && this.displayCampaign?.deleted_at !== undefined
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

.deleted-campaign {
  opacity: 0.6;
  font-style: italic;
}
</style>
