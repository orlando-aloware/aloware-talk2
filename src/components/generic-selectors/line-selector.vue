<template>
  <div>
    <generic-multi-select :label="`${label}`"
                          :buttonText="buttonText"
                          :values="campaignId"
                          :options="campaignsAlphabeticalOrder"
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
              emit-value
              map-options
              outlined
              dense
              :loading="campaignsIsLoading"
              :use-input="useInput"
              :error="hasError"
              :options="campaignOptions"
              :placeholder="placeholder"
              :disable="disable || campaignsIsLoading"
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

      <template v-if="multiple"
                v-slot:selected-item="scope">
        <q-chip
          dense
          :tabindex="scope.tabindex"
          color="white"
          class="tag-selected-chip"
          text-color="secondary"
        >
          <i class="fa fa-circle position-absolute"
             :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`"></i>
          <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
          <div role="button" class="custom__remove d-flex align-items-center position-absolute r-0"
               @click="scope.removeAtIndex(scope.index)">
            <remove-tag-icon class="ml-1 remove-tag-icon">
            </remove-tag-icon>
          </div>
        </q-chip>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import GenericMultiSelect from 'components/generic-selectors/generic-multi-select'
import { aclMixin } from 'src/plugins/mixins'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'

export default {
  name: 'line-selector',

  mixins: [aclMixin],

  components: {
    RemoveTagIcon,
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
    useInput: {
      type: Boolean,
      default: true
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },
    hasError: {
      type: Boolean,
      default: false
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
    ...mapState(['campaigns', 'campaignsIsLoading']),

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
        return _.clone(this.campaigns).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    activeCampaignsAlphabeticalOrder () {
      if (this.campaignsAlphabeticalOrder.length) {
        return _.clone(this.campaignsAlphabeticalOrder)
          .filter(campaign => campaign.active === true)
      }

      return []
    },

    pausedCampaignsAlphabeticalOrder () {
      if (this.campaignsAlphabeticalOrder.length) {
        return _.clone(this.campaignsAlphabeticalOrder)
          .filter(campaign => campaign.active === false)
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
    },

    campaignsIsLoading (val) {
      if (val) {
        return
      }

      this.campaignOptions = this.campaignsAlphabeticalOrder
      if (typeof this.$refs.lineSelect !== 'undefined') {
        this.$refs.lineSelect.refresh()
      }
    }
  }
}
</script>
