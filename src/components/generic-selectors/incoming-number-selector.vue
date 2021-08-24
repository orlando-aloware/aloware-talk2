<template>
  <q-select :options="phoneNumberOptions"
            :multiple="multiple"
            :placeholder="placeholder"
            :disable="disable"
            ::class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '']"
            v-model="phoneNumber"
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="phone_number"
            input-debounce="0"
            use-input
            :use-chips="useChips"
            emit-value
            map-options
            outlined
            dense
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

    placeholder: {
      type: String,
      required: false,
      default: 'Select number'
    },

    genericStyling: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      phoneNumber: this.value,
      phoneNumberOptions: []
    }
  },

  computed: {
    ...mapState(['currentCompany', 'users', 'campaigns']),

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
