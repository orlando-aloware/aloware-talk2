<template>
  <div data-testid="line-row">
    <span v-if="isAgent && value">
      {{ campaign.name || '-' }}
    </span>
    <a target='_blank'
       :href="getCampaignActivityURL(value)"
       v-else-if="value">
      {{ campaign.name || '-' }}

      <q-tooltip>
        Click to see line's activity
      </q-tooltip>
    </a>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { aclMixin, classicMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'

export default {
  name: 'Lines',

  mixins: [
    aclMixin,
    classicMixin
  ],

  props: {
    value: {
      type: Number,
      required: false
    }
  },

  computed: {
    ...mapState(['campaigns']),

    campaign () {
      return this.campaigns.find(campaign => campaign.id === this.value) || {}
    }
  }
}
</script>
