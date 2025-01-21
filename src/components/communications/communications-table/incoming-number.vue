<template>
  <div class="d-flex flex-column"
       data-testid="line-row">
    <span v-if="isAgent && campaignId">
      {{ campaign.name || '-' }}
    </span>
    <a target='_blank'
       :href="getCampaignActivityURL(campaignId)"
       v-else-if="campaignId">
      {{ campaign.name || '-' }}

      <q-tooltip>
        Click to see line's activity
      </q-tooltip>
    </a>
    <span v-else>
      -
    </span>
    <span>
      {{ value | fixPhone('NATIONAL', true) }}
    </span>
  </div>
</template>

<script>
import { aclMixin, classicMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'

export default {
  name: 'IncomingNumber',

  mixins: [
    aclMixin,
    classicMixin
  ],

  props: {
    value: {
      type: String,
      required: false
    },

    campaignId: {
      type: Number,
      required: false
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
