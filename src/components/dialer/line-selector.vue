<template>
  <q-select :options="campaignOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            v-model="campaignId"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            use-input
            emit-value
            map-options
            outlined
            dense
            @filter="filterFn">
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label v-html="scope.opt.name"/>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import { aclMixin } from '../../boot/mixins'
import _ from 'lodash'

export default {
  name: 'line-selector',

  mixins: [aclMixin],

  props: {
    value: {
      required: false
    },

    multiple: {
      type: Boolean,
      default: false,
      required: false
    }
  },

  data () {
    return {
      campaignId: this.value,
      campaignOptions: []
    }
  },

  computed: {
    ...mapState(['currentCompany', 'campaigns']),

    placeholder () {
      if (this.campaignId) {
        return ''
      }

      if (this.multiple) {
        return 'Select lines'
      }

      return 'Select a line'
    },

    campaignsAlphabeticalOrder () {
      if (this.campaigns) {
        let campaigns = _.clone(this.campaigns)
        return campaigns.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    activeCampaignsAlphabeticalOrder () {
      if (this.campaignsAlphabeticalOrder.length) {
        let campaigns = _.clone(this.campaignsAlphabeticalOrder)
        return campaigns.filter(campaign => campaign.active === true)
      }

      return []
    },

    pausedCampaignsAlphabeticalOrder () {
      if (this.campaignsAlphabeticalOrder.length) {
        let campaigns = _.clone(this.campaignsAlphabeticalOrder)
        return campaigns.filter(campaign => campaign.active === false)
      }

      return []
    }
  },

  created () {
    this.campaignOptions = this.campaignsAlphabeticalOrder
  },

  methods: {
    filterFn (val, update) {
      if (this.campaignId && val === this.campaignId) {
        update(() => {
          this.campaignOptions = this.campaignsAlphabeticalOrder.filter(campaign => campaign.id === this.campaignId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.campaignOptions = this.campaignsAlphabeticalOrder
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.campaignOptions = this.campaignsAlphabeticalOrder.filter(campaign => campaign.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.campaignId = this.value
    },

    campaignId (val) {
      if (this.value !== undefined && this.campaignId !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
