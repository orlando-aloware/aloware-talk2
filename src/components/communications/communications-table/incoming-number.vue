<template>
  <div class="d-flex flex-column"
       data-testid="line-row">
    <a target='_blank'
       href="#"
       v-if="campaignId"
       :class="{ 'deleted': !campaignName }"
       :id="`comm-number-${_uid}`"
       @click.prevent="filter">
      {{ campaignName }}

      <b-tooltip custom-class="talk-table__tooltip"
                 :target="`comm-number-${_uid}`">
        Click to filter by this line
      </b-tooltip>
    </a>
    <span v-else>
      -
    </span>
    <span>
      {{ row.incoming_number | fixPhone('NATIONAL', true) }}
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { removeDeletedSuffix } from 'src/plugins/helpers/deleted-entities'

export default {
  name: 'IncomingNumber',

  props: {
    row: {
      type: Object,
      required: true
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
    },

    campaignName () {
      if (this.campaign.id && !this.campaign.name) {
        return 'Deleted Line'
      }
      return removeDeletedSuffix(this.campaign.name)
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
