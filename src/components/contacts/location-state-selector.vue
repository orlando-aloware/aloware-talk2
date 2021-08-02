<template>
  <div>
    <q-select class="inline-select"
              use-input
              clearable
              v-model="contact.cnam_state"
              :options="options"
              :loading="isBusy"
              :disable="disabled"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterFn"/>
  </div>
</template>

<script>
export default {
  name: 'location-state-selector',
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
    selectedState: {
      get () {
        return this.state
      },
      set (state) {
        return state
      }
    }
  },
  data () {
    return {
      isBusy: false,
      country_states: {
        US: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
        CA: ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
      },
      options: this.states
    }
  },
  methods: {
    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.inline-select .q-field__input').placeholder = this.selectedState ? this.selectedState : 'Select state'
      this.$el.querySelector('.inline-select .q-field__native span').style.display = 'none'
    },
    onBlur () {
      this.isFocused = false
      this.$el.querySelector('.inline-select .q-field__input').placeholder = ''
      this.$el.querySelector('.inline-select .q-field__native span').style.display = ''
    },
    onInput () {
      this.$el.querySelector('.inline-select .q-field__input').blur()
    },
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
    'contact.cnam_state': function (val) {
      this.$emit('select', { val })
    }
  }
}
</script>
