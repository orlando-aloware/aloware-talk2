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
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', highlighted ? highlightedClass : '']"
            :use-chips="useChips"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            @popup-show="onShowMenu"
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

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label v-html="$options.filters.fixPhone(scope.opt.phone_number)"/>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'

export default {
  name: 'incoming-number-selector',

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
      selectWidth: 0
    }
  },

  computed: {
    ...mapState(['users', 'campaigns']),
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
        let numbers = _.clone(this.campaign.incoming_numbers)

        return numbers.sort((a, b) => {
          let textA = a.phone_number.toString()
          let textB = b.phone_number.toString()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      // in dashboard and reports
      if (this.campaigns && this.campaigns.length > 0) {
        let campaigns = _.clone(this.campaigns)
        let numbers = []
        numbers = campaigns.map(campaign => (campaign.incoming_numbers && campaign.incoming_numbers.length > 0) ? campaign.incoming_numbers : null).filter(o => o !== null)

        if (numbers.length > 0) {
          numbers = _.flatten(numbers)
          return numbers.sort((a, b) => {
            let textA = a.phone_number.toString()
            let textB = b.phone_number.toString()
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
    }
  },

  created () {
    this.phoneNumberOptions = this.incomingNumbers
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
