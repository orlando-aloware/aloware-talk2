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
    }
  },

  computed: {
    ...mapState(['campaigns']),

    campaign () {
      return this.campaigns.find(campaign => campaign.id === this.campaignId) || {}
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
