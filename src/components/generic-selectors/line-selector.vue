<template>
  <div>
    <generic-multi-select :label="`${label}-dsadsa`"
                          :buttonText="buttonText"
                          :values="campaignId"
                          :options="campaignOptions"
                          :disable="disable"
                          :canEdit="hasPermissionTo(['list campaign', 'view campaign'])"
                          v-if="genericMultiselect"
                          @valuesUpdated="updateLines">
    </generic-multi-select>
    <q-select v-else
              ref="lineSelect"
              options-selected-class="text-primary"
              color="primary"
              option-value="id"
              option-label="name"
              input-debounce="0"
              style="word-break: break-all;"
              use-input
              emit-value
              map-options
              outlined
              dense
              :options="campaignOptions"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '']"
              :multiple="multiple"
              :use-chips="useChips"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              v-model="campaignId"
              @popup-show="onShowMenu"
              @input="updateLines"
              @filter="filterFn">
      <template v-slot:prepend
                v-if="prepend">
        <span class="text-size-xs text-grey-80">{{ prepend }}</span>
      </template>
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
      default: true
    },
    genericStyling: {
      type: Boolean,
      default: true
    },
    useChips: {
      type: Boolean,
      default: false
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    }
  },

  data () {
    return {
      campaignId: this.value,
      campaignOptions: [],
      selectWidth: 0
    }
  },

  computed: {
    ...mapState(['currentCompany', 'campaigns']),

    placeholder () {
      switch (true) {
        case this.multiple && this.campaignId.length < 1:
          return 'Select Lines'
        case !this.multiple && !this.campaignId:
          return 'Select Line'
        case this.multiple && this.campaignId.length > 0:
        case !this.multiple && this.campaignId:
        default:
          return ''
      }
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
    onShowMenu () {
      this.selectWidth = this.$refs.lineSelect.$el.offsetWidth
    },
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
