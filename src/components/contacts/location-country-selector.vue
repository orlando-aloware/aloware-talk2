<template>
  <div>
    <q-select class="inline-select"
              ref="countrySelect"
              use-input
              clearable
              input-debounce="0"
              map-options
              emit-value
              option-value="code"
              option-label="name"
              behavior="menu"
              v-model="contact.cnam_country"
              :options="options"
              :disable="disabled"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @popup-show="onShowMenu"
              @filter="filterFn"/>
  </div>
</template>

<script>
import * as Countries from 'src/constants/countries'
export default {
  name: 'location-country-selector',
  props: {
    contact: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      countries: Countries.COUNTRIES,
      options: Countries.COUNTRIES,
      selectWidth: 0
    }
  },
  computed: {
    selectedCountryObject () {
      return this.countries.find(country => country.code === this.contact.cnam_country)
    }
  },
  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.countrySelect.$el.offsetWidth
    },
    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.inline-select .q-field__input').placeholder = this.selectedCountryObject ? this.selectedCountryObject.name : 'Select country'
      this.$el.querySelector('.inline-select .q-field__native span').style.display = 'none'
    },
    onBlur () {
      this.isFocused = false
      this.$el.querySelector('.inline-select .q-field__input').placeholder = ''
      this.$el.querySelector('.inline-select .q-field__native span').style.display = ''
    },
    onInput (val) {
      this.$el.querySelector('.inline-select .q-field__input').blur()
      this.$emit('select', val)
    },
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.countries
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.countries.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  }
}
</script>
