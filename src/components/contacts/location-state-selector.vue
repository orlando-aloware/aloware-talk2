<template>
  <div>
    <q-select class="inline-select q-basic-selector"
              ref="stateSelect"
              use-input
              clearable
              v-model="contact.cnam_state"
              :options="options"
              :loading="isBusy"
              :disable="disabled"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              data-testid="location-state-selector"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @popup-show="onShowMenu"
              @filter="filterFn"/>
  </div>
</template>

<script>
import _ from 'lodash'
import { selectorMixin } from 'src/plugins/mixins'
export default {
  name: 'location-state-selector',
  mixins: [
    selectorMixin
  ],
  props: {
    contact: {
      type: Object,
      required: false,
      default: function () {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    isUSorCA () {
      return ['US', 'CA'].includes(this.contact.cnam_country)
    },
    states () {
      if (this.isUSorCA) {
        return this.contact.cnam_country === 'US' ? this.country_states.US : this.country_states.CA
      }
      return []
    },
    placeholder () {
      return ''
    }
  },
  data () {
    return {
      isBusy: false,
      country_states: {
        US: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
        CA: ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
      },
      options: this.states,
      selectedId: _.get(this.contact, 'cnam_state', null),
      compareProperty: null,
      reference: 'stateSelect',
      emitEvent: 'select',
      emitChange: true,
      fullOptionsProperty: 'states'
    }
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.states
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.states.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    }
  },
  watch: {
    'contact.cnam_state': function (value) {
      this.selectedId = value
      this.showInputPlaceholder()
    },
    states (value) {
      this.options = value
    }
  }
}
</script>
