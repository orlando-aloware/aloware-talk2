<template>
  <div class="d-flex flex-column"
       data-testid="line-row">
    <a target='_blank'
       href="#"
       v-if="campaignId"
       :id="`comm-number-${_uid}`"
       @click.prevent="filter">
      {{ campaign.name || '-' }}

      <b-tooltip custom-class="communication-logs-table__tooltip"
                 :target="`comm-number-${_uid}`">
        Click to filter by this line
      </b-tooltip>
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
import { mapState } from 'vuex'

export default {
  name: 'IncomingNumber',

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
  },

  methods: {
    filter () {
      this.$emit('on-filter', {
        type: 'campaigns',
        value: [this.campaignId]
      })
    }
  }
}
</script>
