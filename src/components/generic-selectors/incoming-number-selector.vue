<template>
  <q-select ref="incomingNumberSelect"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="phone_number"
            input-debounce="0"
            style="word-break: break-all;"
            use-input
            emit-value
            map-options
            outlined
            dense
            v-model="phoneNumber"
            :options="phoneNumberOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable || loadingCampaigns"
            :class="[ prepend ? 'with-prepend' : '', highlighted ? highlightedClass : '']"
            :use-chips="useChips"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            :loading="loadingCampaigns"
            data-testid="incoming-number-selector-select"
            @popup-show="onShowMenu"
            @filter="filterFn">
    <template v-slot:prepend
              v-if="prepend">
      <span class="text-size-xs text-grey-80">{{ prepend }}</span>
    </template>

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey" data-testid="incoming-number-selector-select-no-results">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps"
              v-on="scope.itemEvents"
              data-testid="incoming-number-selector-select-item">
        <q-item-section>
          <q-item-label v-html="$options.filters.fixPhone(scope.opt.phone_number)"/>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:selected-item="scope">
      <q-chip
        dense
        :tabindex="scope.tabindex"
        color="white"
        class="tag-selected-chip"
        text-color="secondary"
        data-testid="incoming-number-selector-select-chip"
      >
        <i class="fa fa-circle position-absolute"
           :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`"></i>
        <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.phone_number }}</span>
        <div role="button" class="custom__remove d-flex align-items-center position-absolute r-0"
             data-testid="incoming-number-selector-remove-btn"
             @click="scope.removeAtIndex(scope.index)">
          <remove-tag-icon class="ml-1 remove-tag-icon" data-testid="incoming-number-selector-select-remove-tag-icon">
          </remove-tag-icon>
        </div>
      </q-chip>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { aclMixin } from 'src/boot/mixins'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'

export default {
  name: 'incoming-number-selector',
  components: { RemoveTagIcon },
  mixins: [aclMixin],
  props: {
    campaign_id: {
      required: false
    },

    value: {
      required: false
    },

    multiple: {
      type: Boolean,
      default: false,
      required: false
    },

    useChips: {
      type: Boolean,
      default: false,
      required: false
    },

    hideExtensions: {
      required: false,
      default: false,
      type: Boolean
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

    genericStyling: {
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
    }
  },

  data () {
    return {
      phoneNumber: this.value,
      phoneNumberOptions: [],
      selectWidth: 0,
      loadingCampaigns: false,
      campaigns: []
    }
  },

  computed: {
    ...mapState(['users']),
    placeholder () {
      switch (true) {
        case this.multiple && this.phoneNumber.length < 1:
          return 'Select Line Phone Numbers'
        case !this.multiple && !this.phoneNumber:
          return 'Select Line Phone Number'
        case this.multiple && this.phoneNumber.length > 0:
        case !this.multiple && this.phoneNumber:
        default:
          return ''
      }
    },
    campaign () {
      if (!this.campaign_id) {
        return null
      }
      if (this.campaigns) {
        return this.campaigns.find(item => {
          return item.id === this.campaign_id
        })
      }

      return null
    },

    incomingNumbers () {
      // in line activity
      if (this.campaign && this.campaign.incoming_numbers && this.campaign.incoming_numbers.length > 0) {
        return _.clone(this.campaign.incoming_numbers).sort((a, b) => {
          const textA = a.phone_number.toString()
          const textB = b.phone_number.toString()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      // in dashboard and reports
      if (this.campaigns && this.campaigns.length > 0) {
        const campaigns = _.clone(this.campaigns)
        const numbers = campaigns.map(campaign => (campaign.incoming_numbers && campaign.incoming_numbers.length > 0) ? campaign.incoming_numbers : null).filter(o => o !== null)

        if (numbers.length > 0) {
          return _.flatten(numbers).sort((a, b) => {
            const textA = a.phone_number.toString()
            const textB = b.phone_number.toString()
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
          })
        }
      }

      return []
    }
  },

  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.incomingNumberSelect.$el.offsetWidth
    },
    filterFn (val, update) {
      if (this.userId && val === this.userId) {
        update(() => {
          this.phoneNumberOptions = this.incomingNumbers.filter(user => user.id === this.userId)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.phoneNumberOptions = this.incomingNumbers
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.phoneNumberOptions = this.incomingNumbers.filter((number) =>
          number.phone_number.toLowerCase().indexOf(needle) > -1
        )
      })
    },
    getCampaigns () {
      if (this.hasPermissionTo('list campaign')) {
        this.loadingCampaigns = true
        return this.$axios
          .get('/api/v1/campaign', {
            mode: 'no-cors'
          })
          .then((res) => {
            this.campaigns = res.data
            this.phoneNumberOptions = this.incomingNumbers
            this.loadingCampaigns = false
          })
          .catch((err) => {
            console.log(err)
            this.loadingCampaigns = false
          })
      }
    }
  },

  created () {
    this.phoneNumberOptions = this.incomingNumbers
    this.getCampaigns()
  },

  watch: {
    value () {
      this.phoneNumber = this.value
    },

    phoneNumber (val) {
      if (this.phoneNumber !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
