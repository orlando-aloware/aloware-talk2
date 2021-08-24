<template>
  <div>
    <generic-multi-select :label="label"
                          :buttonText="buttonText"
                          :values="campaignId"
                          :options="campaignOptions"
                          :disable="disable"
                          :canEdit="hasPermissionTo(['list campaign', 'view campaign'])"
                          v-if="genericMultiselect"
                          @valuesUpdated="updateLines">
    </generic-multi-select>
    <q-select v-else
              :options="campaignOptions"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '']"
              v-model="campaignId"
              :multiple="multiple"
              :use-chips="useChips"
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
              @input="updateLines"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>

    </q-select>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import GenericMultiSelect from 'components/generic-selectors/generic-multi-select'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'line-selector',

  mixins: [aclMixin],

  components: {
    GenericMultiSelect
  },

  props: {
    value: {
      required: false
    },

    multiple: {
      type: Boolean,
      default: false,
      required: false
    },

    disable: {
      type: Boolean,
      default: false,
      required: false
    },

    prepend: {
      type: String,
      required: false
    },
    label: {
      type: String,
      default: 'Lines',
      required: false
    },
    buttonText: {
      type: String,
      default: 'Modify Lines',
      required: false
    },
    genericMultiselect: {
      type: Boolean,
      default: false
    },
    genericStyling: {
      type: Boolean,
      default: true
    },
    useChips: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Select Lines',
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
    },
    updateLines (val) {
      this.$emit('change', val)
    }
  },

  watch: {
    value () {
      this.campaignId = this.value
    },

    campaignId (val) {
      if (this.campaignId !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
